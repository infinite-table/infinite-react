/**
 * @jest-environment jsdom
 *
 * Phase 3d validation: master-detail (row details) for the Vue table.
 *
 * - defaultRowDetailState with expandedRows renders the detail row div
 * - the row height fed to the brain includes the expanded detail height
 * - rowDetailApi collapse/expand toggles the details
 * - a nested (detail) DataSource registers with the master and receives
 *   masterRowInfo in its data params
 */
import { createApp, defineComponent, h, nextTick } from 'vue';
import type { App } from 'vue';

import { DataSource } from '../DataSource/DataSourceForVue.vue';
import { InfiniteTable } from './InfiniteTableForVue.vue';
import { InfiniteTableRowDetailsClassName } from './components/InfiniteTableRow/InfiniteTableDetailRowForVue.vue';

type Person = {
  id: number;
  name: string;
};

const VIEWPORT = { width: 400, height: 500 };
const ROW_HEIGHT = 40;
const DETAIL_HEIGHT = 100;

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

const people: Person[] = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  name: `person-${i}`,
}));

describe('Vue InfiniteTable master-detail', () => {
  let container: HTMLElement;
  let app: App | null = null;

  const mount = async (
    tableProps: Record<string, any> = {},
    dataSourceProps: Record<string, any> = {},
  ) => {
    container = document.createElement('div');
    document.body.appendChild(container);

    const Root = defineComponent({
      setup() {
        return () =>
          h(
            DataSource,
            { primaryKey: 'id', data: people, ...dataSourceProps } as any,
            {
              default: () =>
                h(InfiniteTable, {
                  columns: {
                    name: { field: 'name', header: 'Name' },
                  },
                  rowHeight: ROW_HEIGHT,
                  rowDetailHeight: DETAIL_HEIGHT,
                  ...tableProps,
                } as any),
            },
          );
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

  const infiniteApi = () => (globalThis as any).infiniteApi;

  const detailRows = () =>
    Array.from(
      container.querySelectorAll(`.${InfiniteTableRowDetailsClassName}`),
    ) as HTMLElement[];

  const visibleDetailRows = () =>
    detailRows().filter((el) => el.textContent && el.textContent.length > 0);

  test('defaultRowDetailState expandedRows renders detail rows with the configured height', async () => {
    const rowDetailRenderer = jest.fn((rowInfo: any) =>
      h('div', { class: 'my-detail' }, `detail for ${rowInfo.data.name}`),
    );

    const { getState } = await mount({
      defaultRowDetailState: { expandedRows: [1], collapsedRows: true },
      rowDetailRenderer,
    });
    await flush();

    const details = visibleDetailRows();
    expect(details.length).toBe(1);
    expect(details[0].textContent).toBe('detail for person-1');
    expect(details[0].style.height).toBe(`${DETAIL_HEIGHT}px`);
    expect(details[0].style.top).toBe(`${ROW_HEIGHT}px`);

    // the brain accounts for the expanded detail in the row height
    const brain = getState().brain;
    expect(brain.getRowHeight(1)).toBe(ROW_HEIGHT + DETAIL_HEIGHT);
    expect(brain.getRowHeight(0)).toBe(ROW_HEIGHT);
  });

  test('rowDetailApi expands and collapses row details', async () => {
    const rowDetailRenderer = (rowInfo: any) =>
      h('div', {}, `detail for ${rowInfo.data.name}`);

    const { getState } = await mount({
      defaultRowDetailState: { expandedRows: [], collapsedRows: true },
      rowDetailRenderer,
    });
    await flush();

    expect(visibleDetailRows().length).toBe(0);

    infiniteApi().rowDetailApi.expandRowDetail(2);
    await flush();

    expect(visibleDetailRows().length).toBe(1);
    expect(visibleDetailRows()[0].textContent).toBe('detail for person-2');
    expect(getState().brain.getRowHeight(2)).toBe(ROW_HEIGHT + DETAIL_HEIGHT);

    infiniteApi().rowDetailApi.collapseRowDetail(2);
    await flush();

    expect(visibleDetailRows().length).toBe(0);
    expect(getState().brain.getRowHeight(2)).toBe(ROW_HEIGHT);
  });

  test('a nested detail DataSource registers with the master and gets masterRowInfo', async () => {
    const detailData = jest.fn((params: any) => {
      const masterId = params.masterRowInfo?.data?.id;
      return Promise.resolve([
        { id: `${masterId}-a`, name: `child-of-${masterId}-a` },
        { id: `${masterId}-b`, name: `child-of-${masterId}-b` },
      ]);
    });

    const rowDetailRenderer = (rowInfo: any) =>
      h(
        DataSource,
        {
          primaryKey: 'id',
          data: detailData,
          key: rowInfo.id,
        } as any,
        {
          default: () =>
            h(InfiniteTable, {
              columns: { name: { field: 'name', header: 'Name' } },
            } as any),
        },
      );

    await mount({
      defaultRowDetailState: { expandedRows: [3], collapsedRows: true },
      rowDetailRenderer,
      // no caching complexity in this test
      rowDetailCache: false,
    });
    await flush(80);

    expect(detailData).toHaveBeenCalled();
    const params = detailData.mock.calls[0][0];
    expect(params.masterRowInfo?.data?.id).toBe(3);

    // the master's dev globals are not clobbered by the detail DataSource
    expect((globalThis as any).getDataSourceState().dataArray.length).toBe(
      people.length,
    );
  });
});
