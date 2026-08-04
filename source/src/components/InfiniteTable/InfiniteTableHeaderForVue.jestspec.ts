/**
 * @jest-environment jsdom
 *
 * Phase 3c validation: the Vue header tree + sorting UI + grouping columns.
 *
 * - TableHeaderWrapperForVue renders the virtualized header through the Vue
 *   rendering bridge (state.headerRenderer over the header MatrixBrain)
 * - InfiniteTableHeaderCellForVue: same DOM contract as React (data-name,
 *   data-column-id, data-sort/data-sort-index attrs, sort icon, select-all
 *   checkbox) and click-to-sort via api.toggleSortingForColumn
 * - column groups render InfiniteTableHeaderGroupForVue cells
 * - grouping generates group columns via the shared getColumnsWhenGrouping +
 *   the Vue getColumnForGroupBy sibling (Vue group icons, shared structure)
 */
import { createApp, defineComponent, h, nextTick } from 'vue';
import type { App } from 'vue';

import { DataSource } from '../DataSource/DataSourceForVue.vue';
import { InfiniteTable } from './InfiniteTableForVue.vue';
import { InfiniteTableHeaderCellClassName } from './components/InfiniteTableHeader/headerClassName';

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
const COLUMN_HEADER_HEIGHT = 30;

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as any).ResizeObserver = ResizeObserverMock;

// jsdom has no pointer capture
HTMLElement.prototype.setPointerCapture =
  HTMLElement.prototype.setPointerCapture || (() => {});
HTMLElement.prototype.releasePointerCapture =
  HTMLElement.prototype.releasePointerCapture || (() => {});

async function flush(ms = 30) {
  await nextTick();
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, ms));
  await nextTick();
}

describe('Vue InfiniteTable header + sorting + grouping', () => {
  let container: HTMLElement;
  let app: App | null = null;

  const mount = async (
    tableProps: Record<string, any>,
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

  const headerCell = (columnId: string) =>
    container.querySelector(
      `[data-name="HeaderCell"][data-column-id="${columnId}"]`,
    ) as HTMLElement | null;

  test('renders the header wrapper with virtualized header cells', async () => {
    await mount({});

    const wrapper = container.querySelector('.InfiniteHeaderWrapper');
    expect(wrapper).not.toBeNull();
    expect((wrapper as HTMLElement).style.height).toBe(
      `${COLUMN_HEADER_HEIGHT}px`,
    );

    const nameHeader = headerCell('name')!;
    expect(nameHeader).not.toBeNull();
    expect(nameHeader.textContent).toContain('Name');
    expect(nameHeader.className).toContain(InfiniteTableHeaderCellClassName);
    expect(nameHeader.getAttribute('data-field')).toBe('name');
    expect(nameHeader.getAttribute('data-sort')).toBe('none');
    expect(nameHeader.getAttribute('data-sort-index')).toBe('-1');

    expect(headerCell('age')!.textContent).toContain('Age');
  });

  test('header={false} renders no header', async () => {
    await mount({ header: false });

    expect(container.querySelector('.InfiniteHeaderWrapper')).toBeNull();
    expect(headerCell('name')).toBeNull();
  });

  test('sorted column renders the sort icon and data-sort attribute', async () => {
    await mount({}, { defaultSortInfo: [{ field: 'age', dir: -1 }] });

    const ageHeader = headerCell('age')!;
    expect(ageHeader.getAttribute('data-sort')).toBe('desc');

    const sortIcon = ageHeader.querySelector('[data-name="sort-icon"]');
    expect(sortIcon).not.toBeNull();

    // the data was sorted by the shared reducer pipeline
    expect(getDataArray()[0].data.age).toBe(29);
  });

  // with drag-to-reorder wired (same as React), a plain click on a
  // draggable column toggles sorting on pointerup (no movement in between)
  const clickHeader = async (columnId: string) => {
    const cell = headerCell(columnId)!;
    cell.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    await flush(5);
    cell.dispatchEvent(new Event('pointerup', { bubbles: true }));
    await flush();
  };

  test('pointerdown on a header cell toggles sorting (asc, then desc)', async () => {
    await mount({});

    expect(getDataArray()[0].data.age).toBe(20);

    await clickHeader('age');

    expect(headerCell('age')!.getAttribute('data-sort')).toBe('asc');
    expect(getDataArray()[0].data.age).toBe(20);
    expect(getDataArray()[getDataArray().length - 1].data.age).toBe(29);

    await clickHeader('age');

    expect(headerCell('age')!.getAttribute('data-sort')).toBe('desc');
    expect(getDataArray()[0].data.age).toBe(29);
  });

  test('sortable={false} column does not sort on pointerdown', async () => {
    await mount({
      columns: {
        name: { field: 'name', header: 'Name', defaultSortable: false },
        age: { field: 'age', header: 'Age' },
      },
    });

    await clickHeader('name');

    expect(headerCell('name')!.getAttribute('data-sort')).toBe('none');
    expect((globalThis as any).getDataSourceState().sortInfo).toEqual([]);
  });

  test('column groups render header group cells and increase header height', async () => {
    await mount({
      columnGroups: {
        personal: { header: 'Personal info' },
      },
      columns: {
        name: { field: 'name', header: 'Name', columnGroup: 'personal' },
        age: { field: 'age', header: 'Age', columnGroup: 'personal' },
      },
    });

    // one group level: 1 (maxDepth 0) + 2 rows
    const wrapper = container.querySelector(
      '.InfiniteHeaderWrapper',
    ) as HTMLElement;
    expect(wrapper.style.height).toBe(`${2 * COLUMN_HEADER_HEIGHT}px`);

    const group = container.querySelector(
      '[data-group-id]',
    ) as HTMLElement | null;
    expect(group).not.toBeNull();
    expect(group!.textContent).toContain('Personal info');

    // the leaf header cells are still there
    expect(headerCell('name')).not.toBeNull();
    expect(headerCell('age')).not.toBeNull();
  });

  test('groupBy generates a group column (Vue group icons) and toggles collapse', async () => {
    await mount(
      {
        columns: {
          name: { field: 'name', header: 'Name' },
          age: { field: 'age', header: 'Age' },
        },
      },
      {
        groupBy: [{ field: 'dept' }],
      },
    );

    // the generated group column is prepended to the column order
    const groupHeader = headerCell('group-by-dept')!;
    expect(groupHeader).not.toBeNull();
    expect(groupHeader.textContent).toContain('Group by dept');

    // group rows are generated by the shared DataSource pipeline
    const dataArray = getDataArray();
    expect(dataArray[0].isGroupRow).toBe(true);
    expect(dataArray[0].groupKeys).toEqual(['it']);

    // the group row cell renders the Vue expand/collapse icon
    const groupRowCell = container.querySelector(
      `[data-row-id="${dataArray[0].id}"][data-column-id="group-by-dept"]`,
    ) as HTMLElement;
    expect(groupRowCell).not.toBeNull();

    const icon = groupRowCell.querySelector(
      '[data-name="expand-collapse-icon"]',
    ) as SVGElement;
    expect(icon).not.toBeNull();
    expect(icon.getAttribute('data-state')).toBe('expanded');

    const countBefore = dataArray.length;

    // clicking the icon collapses the group through toggleGroupRow -> api
    icon.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await flush();

    const dataAfter = getDataArray();
    expect(dataAfter.length).toBeLessThan(countBefore);
    expect(dataAfter[0].isGroupRow).toBe(true);
    expect(dataAfter[0].collapsed).toBe(true);

    const iconAfter = container
      .querySelector(
        `[data-row-id="${dataAfter[0].id}"][data-column-id="group-by-dept"]`,
      )!
      .querySelector('[data-name="expand-collapse-icon"]') as SVGElement;
    expect(iconAfter.getAttribute('data-state')).toBe('collapsed');
  });

  test('header select-all checkbox selects and deselects all rows', async () => {
    await mount(
      {
        columns: {
          name: {
            field: 'name',
            header: 'Name',
            renderSelectionCheckBox: true,
          },
          age: { field: 'age', header: 'Age' },
        },
      },
      {
        selectionMode: 'multi-row',
        defaultRowSelection: {
          selectedRows: [],
          deselectedRows: [],
          defaultSelection: false,
        },
      },
    );

    const nameHeader = headerCell('name')!;
    const checkbox = nameHeader.querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement;
    expect(checkbox).not.toBeNull();
    expect(checkbox.checked).toBe(false);

    checkbox.dispatchEvent(new Event('change'));
    await flush();

    expect(getDataArray()[0].rowSelected).toBe(true);
    expect((globalThis as any).getDataSourceState().allRowsSelected).toBe(true);

    const checkboxAfter = headerCell('name')!.querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement;
    expect(checkboxAfter.checked).toBe(true);

    checkboxAfter.dispatchEvent(new Event('change'));
    await flush();

    expect(getDataArray()[0].rowSelected).toBe(false);
  });
});
