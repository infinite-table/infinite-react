/**
 * @jest-environment jsdom
 *
 * Phase 3d validation: lazy-load batching + livePagination for the Vue
 * DataSource.
 *
 * - lazyLoad + lazyLoadBatchSize: the data function is called per batch,
 *   driven by notifyRenderRangeChange (fired by the table render range)
 * - batches are deduped via lazyLoadCacheOfLoadedBatches
 * - livePagination: when the loaded rows don't fill the viewport (no
 *   vertical scrollbar), the cursor advances and the next page is appended
 *   (#useDataArrayLengthAsCursor)
 */
import { createApp, defineComponent, h, nextTick } from 'vue';
import type { App } from 'vue';

import { DataSource } from './DataSourceForVue.vue';
import { InfiniteTable } from '../InfiniteTable/InfiniteTableForVue.vue';

type Person = {
  id: number;
  name: string;
};

const VIEWPORT = { width: 400, height: 300 };

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as any).ResizeObserver = ResizeObserverMock;

async function flush(ms = 30) {
  await nextTick();
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, ms));
  await nextTick();
}

const makePerson = (i: number): Person => ({
  id: i,
  name: `person-${i}`,
});

describe('Vue DataSource lazy load + livePagination', () => {
  let container: HTMLElement;
  let app: App | null = null;

  const mount = async (
    dataSourceProps: Record<string, any>,
    tableProps: Record<string, any> = {},
  ) => {
    container = document.createElement('div');
    document.body.appendChild(container);

    const Root = defineComponent({
      setup() {
        return () =>
          h(DataSource, { primaryKey: 'id', ...dataSourceProps } as any, {
            default: () =>
              h(InfiniteTable, {
                columns: {
                  name: { field: 'name', header: 'Name' },
                },
                ...tableProps,
              } as any),
          });
      },
    });

    app = createApp(Root);
    app.mount(container);
    await flush();

    const getState = (globalThis as any).getState;
    const actions = (globalThis as any).componentActions;
    actions.bodySize = { ...VIEWPORT };
    getState().brain.update(VIEWPORT);
    await flush();

    return { getState, actions };
  };

  afterEach(async () => {
    app?.unmount();
    app = null;
    container.remove();
    await flush(10);
  });

  const getDataSourceState = () => (globalThis as any).getDataSourceState();

  test('lazyLoad with batchSize issues one remote call per visible batch', async () => {
    const TOTAL = 100;
    const BATCH = 10;

    const calls: any[] = [];
    const data = jest.fn((params: any) => {
      calls.push(params);
      const start = params.lazyLoadStartIndex ?? 0;
      const size = params.lazyLoadBatchSize ?? TOTAL;
      return Promise.resolve({
        data: Array.from({ length: Math.min(size, TOTAL - start) }, (_, i) =>
          makePerson(start + i),
        ),
        totalCount: TOTAL,
      });
    });

    await mount({
      data,
      lazyLoad: { batchSize: BATCH },
    });
    await flush(50);

    // total count is known and placeholder rows exist for the whole set
    expect(getDataSourceState().dataArray.length).toBe(TOTAL);

    // viewport is 300px tall -> only the first batches are loaded, not all 10
    const loadedStartIndexes = calls
      .map((c) => c.lazyLoadStartIndex ?? 0)
      .sort((a: number, b: number) => a - b);
    expect(loadedStartIndexes[0]).toBe(0);
    expect(loadedStartIndexes.length).toBeLessThan(TOTAL / BATCH);

    // the visible rows are loaded with real data
    expect(getDataSourceState().dataArray[0].data).toEqual(makePerson(0));

    // scrolling further (render range moves) loads the corresponding batch
    const callCountBefore = calls.length;
    getDataSourceState().notifyRenderRangeChange({
      renderStartIndex: 50,
      renderEndIndex: 55,
    });
    await flush(50);

    const newCalls = calls.slice(callCountBefore);
    expect(newCalls.some((c: any) => c.lazyLoadStartIndex === 50)).toBe(true);

    // re-notifying the same range does not re-issue the batch (cache)
    const callCountAfter = calls.length;
    getDataSourceState().notifyRenderRangeChange({
      renderStartIndex: 50,
      renderEndIndex: 55,
    });
    await flush(50);
    expect(calls.length).toBe(callCountAfter);
  });

  test('livePagination appends pages while rows do not fill the viewport', async () => {
    const PAGE_SIZE = 5;
    const MAX_ROWS = 15;

    // same pattern as the React live-pagination example: appended requests
    // continue from the already-loaded rows
    const data = jest.fn((params: any) => {
      const start = params.append ? params.originalDataArray.length : 0;
      const page = Array.from(
        { length: Math.max(Math.min(PAGE_SIZE, MAX_ROWS - start), 0) },
        (_, i) => makePerson(start + i),
      );
      return Promise.resolve({
        data: page,
        totalCount: MAX_ROWS,
      });
    });

    // viewport tall enough for all 15 rows - the cursor keeps advancing
    // (no vertical scrollbar) until the data runs out
    const TALL_VIEWPORT = { width: 400, height: 900 };

    container = document.createElement('div');
    document.body.appendChild(container);

    const Root = defineComponent({
      setup() {
        return () =>
          h(
            DataSource,
            { primaryKey: 'id', data, livePagination: true } as any,
            {
              default: () =>
                h(InfiniteTable, {
                  columns: { name: { field: 'name', header: 'Name' } },
                } as any),
            },
          );
      },
    });

    app = createApp(Root);
    app.mount(container);
    await flush();

    (globalThis as any).componentActions.bodySize = { ...TALL_VIEWPORT };
    (globalThis as any).getState().brain.update(TALL_VIEWPORT);

    // let the append loop run: each page load changes dataArray.length ->
    // cursorId advances -> next page is appended
    await flush(300);

    expect(getDataSourceState().dataArray.length).toBe(MAX_ROWS);
    expect(getDataSourceState().dataArray[14].data).toEqual(makePerson(14));

    // once the last page returned fewer rows, the cursor stabilizes - no
    // runaway requests
    const callCount = data.mock.calls.length;
    await flush(150);
    expect(data.mock.calls.length).toBe(callCount);
  });

  test('livePagination advances the cursor on scroll-to-bottom', async () => {
    const PAGE_SIZE = 5;
    const MAX_ROWS = 15;

    const data = jest.fn((params: any) => {
      const start = params.append ? params.originalDataArray.length : 0;
      const page = Array.from(
        { length: Math.max(Math.min(PAGE_SIZE, MAX_ROWS - start), 0) },
        (_, i) => makePerson(start + i),
      );
      return Promise.resolve({ data: page, totalCount: MAX_ROWS });
    });

    // small viewport: the auto-advance loop stops once rows overflow the
    // viewport (vertical scrollbar present)
    const { getState } = await mount(
      { data, livePagination: true },
      { scrollStopDelay: 10 },
    );
    await flush(200);

    const lengthBefore = getDataSourceState().dataArray.length;
    expect(lengthBefore).toBeGreaterThanOrEqual(PAGE_SIZE);
    expect(lengthBefore).toBeLessThan(MAX_ROWS);

    // scrolling to the bottom advances the cursor (wired in the Vue root
    // via brain.onScrollStop)
    const brain = getState().brain;
    brain.setScrollPosition({
      scrollTop: brain.scrollTopMax,
      scrollLeft: 0,
    });
    // wait for the scroll stop delay + the append load
    await flush(150);

    expect(getDataSourceState().dataArray.length).toBeGreaterThan(lengthBefore);
  });
});
