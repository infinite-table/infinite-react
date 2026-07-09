/**
 * @jest-environment jsdom
 *
 * Phase 3d validation: shared DOM event handlers wired into the Vue root.
 *
 * - cell mousedown sets the active row/cell (Vue cell) and the root keydown
 *   subscription routes into the shared keyboard-navigation handlers
 * - ActiveRowIndicator/ActiveCellIndicator Vue siblings render with the same
 *   DOM contract as React (data-name attrs, wrapper cls)
 * - click-to-select rows goes through the shared updateRowSelectionOnCellClick
 *   (multi-row: reset/add/range clicks; keyboard selection via spacebar)
 * - LoadMask renders when the DataSource is loading
 */
import { createApp, defineComponent, h, nextTick } from 'vue';
import type { App } from 'vue';

import { DataSource } from '../DataSource/DataSourceForVue.vue';
import { InfiniteTable } from './InfiniteTableForVue.vue';
import { rootClassName } from './internalProps';

type Person = {
  id: number;
  name: string;
  age: number;
  dept: string;
};

const people: Person[] = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  name: `person-${i}`,
  age: 20 + (i % 10),
  dept: i % 2 === 0 ? 'it' : 'sales',
}));

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

describe('Vue InfiniteTable keyboard navigation + click selection', () => {
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
                    age: { field: 'age', header: 'Age' },
                  },
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

  const getDataArray = () => (globalThis as any).getDataSourceState().dataArray;

  const rootEl = () =>
    container.querySelector(`.${rootClassName}`) as HTMLElement;

  const cell = (rowId: number | string, columnId = 'name') =>
    container.querySelector(
      `[data-row-id="${rowId}"][data-column-id="${columnId}"]`,
    ) as HTMLElement | null;

  const keydown = (key: string, init: KeyboardEventInit = {}) => {
    rootEl().dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true, ...init }),
    );
  };

  test('mousedown activates the row and arrow keys navigate (row mode)', async () => {
    const { getState } = await mount({ keyboardNavigation: 'row' });

    expect(getState().activeRowIndex == null).toBe(true);
    expect(
      container.querySelector('[data-name="active-row-indicator"]'),
    ).toBeNull();

    cell(2)!.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    await flush();

    expect(getState().activeRowIndex).toBe(2);

    // the indicator tree matches React: [data-name=active-row] wrapper with
    // the [data-name=active-row-indicator] child
    const indicator = container.querySelector(
      '[data-name="active-row-indicator"]',
    ) as HTMLElement;
    expect(indicator).not.toBeNull();
    expect(indicator.parentElement!.getAttribute('data-name')).toBe(
      'active-row',
    );

    keydown('ArrowDown');
    await flush();
    expect(getState().activeRowIndex).toBe(3);

    keydown('ArrowUp');
    keydown('ArrowUp');
    await flush();
    expect(getState().activeRowIndex).toBe(1);

    keydown('End');
    await flush();
    expect(getState().activeRowIndex).toBe(people.length - 1);

    keydown('Home');
    await flush();
    expect(getState().activeRowIndex).toBe(0);
  });

  test('cell mode: mousedown activates the cell and arrows navigate in 2d', async () => {
    const { getState } = await mount({ keyboardNavigation: 'cell' });

    cell(1, 'name')!.dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true }),
    );
    await flush();

    expect(getState().activeCellIndex).toEqual([1, 0]);
    expect(
      container.querySelector('[data-name="active-cell-indicator"]'),
    ).not.toBeNull();

    keydown('ArrowRight');
    await flush();
    expect(getState().activeCellIndex).toEqual([1, 1]);

    keydown('ArrowDown');
    await flush();
    expect(getState().activeCellIndex).toEqual([2, 1]);

    keydown('ArrowLeft');
    await flush();
    expect(getState().activeCellIndex).toEqual([2, 0]);
  });

  test('defaultActiveRowIndex renders the indicator without interaction', async () => {
    await mount({ keyboardNavigation: 'row', defaultActiveRowIndex: 4 });

    const indicator = container.querySelector(
      '[data-name="active-row-indicator"]',
    ) as HTMLElement;
    expect(indicator).not.toBeNull();
  });

  test('click selects rows: reset, ctrl/meta add, shift range (multi-row)', async () => {
    await mount(
      {},
      {
        selectionMode: 'multi-row',
        defaultRowSelection: {
          selectedRows: [],
          deselectedRows: [],
          defaultSelection: false,
        },
      },
    );

    // plain click selects only the clicked row
    cell(1)!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await flush();

    let dataArray = getDataArray();
    expect(dataArray[1].rowSelected).toBe(true);
    expect(dataArray[0].rowSelected).toBe(false);

    // meta+click adds to the selection
    cell(3)!.dispatchEvent(
      new MouseEvent('click', { bubbles: true, metaKey: true }),
    );
    await flush();

    dataArray = getDataArray();
    expect(dataArray[1].rowSelected).toBe(true);
    expect(dataArray[3].rowSelected).toBe(true);

    // shift+click extends into a range (from the last click position)
    cell(6)!.dispatchEvent(
      new MouseEvent('click', { bubbles: true, shiftKey: true }),
    );
    await flush();

    dataArray = getDataArray();
    expect(dataArray[3].rowSelected).toBe(true);
    expect(dataArray[4].rowSelected).toBe(true);
    expect(dataArray[5].rowSelected).toBe(true);
    expect(dataArray[6].rowSelected).toBe(true);

    // plain click again resets to a single row
    cell(0)!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await flush();

    dataArray = getDataArray();
    expect(dataArray[0].rowSelected).toBe(true);
    expect(dataArray[6].rowSelected).toBe(false);
  });

  test('spacebar selects the active row, ctrl+a selects all (keyboard selection)', async () => {
    await mount(
      { keyboardNavigation: 'row', defaultActiveRowIndex: 2 },
      {
        selectionMode: 'multi-row',
        defaultRowSelection: {
          selectedRows: [],
          deselectedRows: [],
          defaultSelection: false,
        },
      },
    );

    expect(getDataArray()[2].rowSelected).toBe(false);

    // space acts like a mouse click on the active row (reset-click)
    keydown(' ');
    await flush();
    expect(getDataArray()[2].rowSelected).toBe(true);
    expect(getDataArray()[0].rowSelected).toBe(false);

    keydown('a', { ctrlKey: true });
    await flush();
    expect((globalThis as any).getDataSourceState().allRowsSelected).toBe(true);
  });

  test('LoadMask shows the loading text while the DataSource is loading', async () => {
    await mount({ loadingText: 'Fetching data' }, { loading: true });

    const mask = container.querySelector(
      `.${rootClassName}-LoadMask`,
    ) as HTMLElement;
    expect(mask).not.toBeNull();
    expect(mask.textContent).toContain('Fetching data');
  });
});
