/**
 * @jest-environment jsdom
 *
 * Phase 3d validation: column header filters for the Vue table.
 *
 * - when showColumnFilters is on (via defaultFilterValue), each header cell
 *   renders the filter row: operator switch + filter editor (string/number)
 * - typing in the string/number editors filters the rows (through
 *   api.setColumnFilter and the shared DataSource filtering)
 * - the operator switch opens the filter operator menu (Close/Reset + one
 *   item per operator); choosing an operator updates the filterValue and
 *   Reset clears the column filter
 * - domProps (className/style/data attrs) are merged onto the root element
 */
import { createApp, defineComponent, h, nextTick } from 'vue';
import type { App } from 'vue';

import { DataSource } from '../DataSource/DataSourceForVue.vue';
import { InfiniteTable } from './InfiniteTableForVue.vue';
import { rootClassName } from './internalProps';
import { InfiniteTableColumnHeaderFilterClassName } from './components/InfiniteTableHeader/headerFilterClassNames';

type Person = {
  id: number;
  name: string;
  age: number;
  dept: string;
};

const people: Person[] = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  name: `person-${i}`,
  age: 20 + i,
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

describe('Vue InfiniteTable header filters', () => {
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
            {
              primaryKey: 'id',
              data: people,
              defaultFilterValue: [],
              filterDelay: 0,
              ...dataSourceProps,
            } as any,
            {
              default: () =>
                h(InfiniteTable, {
                  columns: {
                    name: { field: 'name', header: 'Name' },
                    age: { field: 'age', header: 'Age', type: 'number' },
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

  const filterRow = (columnId: string) =>
    headerCell(columnId)?.querySelector(
      `.${InfiniteTableColumnHeaderFilterClassName}`,
    ) as HTMLElement | null;

  const filterInput = (columnId: string) =>
    filterRow(columnId)?.querySelector(
      `.${InfiniteTableColumnHeaderFilterClassName}__input`,
    ) as HTMLInputElement | null;

  const operatorSwitch = (columnId: string) =>
    filterRow(columnId)?.querySelector(
      '[data-name="filter-operator"]',
    ) as HTMLElement | null;

  const visibleMenu = () =>
    container.querySelector(
      '.InfiniteMenu[data-menu-id]',
    ) as HTMLElement | null;

  const menuItem = (key: string) =>
    container.querySelector(
      `[data-menu-item-key="${key}"]`,
    ) as HTMLElement | null;

  const typeInFilter = async (columnId: string, value: string) => {
    const input = filterInput(columnId)!;
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await flush();
  };

  test('header cells render the filter row with editor and operator switch', async () => {
    await mount();

    for (const columnId of ['name', 'age']) {
      expect(filterRow(columnId)).not.toBeNull();
      expect(filterInput(columnId)).not.toBeNull();
      expect(operatorSwitch(columnId)).not.toBeNull();
    }

    // string column gets a text input, number column a number input
    expect(filterInput('name')!.type).toBe('text');
    expect(filterInput('age')!.type).toBe('number');
  });

  test('no filter row is rendered when column filters are off', async () => {
    await mount({}, { defaultFilterValue: undefined });

    expect(filterRow('name')).toBeNull();
    expect(filterRow('age')).toBeNull();
  });

  test('showColumnFilters=false hides the filter row even with a filterValue', async () => {
    await mount({ showColumnFilters: false });

    expect(filterRow('name')).toBeNull();
    expect(filterRow('age')).toBeNull();
  });

  test('typing in the string filter editor filters the rows', async () => {
    await mount();

    expect(getDataArray().length).toBe(20);

    // "person-1" matches person-1 and person-10..19 via the default
    // `includes` operator
    await typeInFilter('name', 'person-1');

    expect(getDataArray().length).toBe(11);

    await typeInFilter('name', 'person-19');
    expect(getDataArray().length).toBe(1);
    expect(getDataArray()[0].data.name).toBe('person-19');

    // clearing the value brings all rows back
    await typeInFilter('name', '');
    expect(getDataArray().length).toBe(20);
  });

  test('typing in the number filter editor filters the rows', async () => {
    await mount();

    // default number operator is `eq`
    await typeInFilter('age', '25');

    expect(getDataArray().length).toBe(1);
    expect(getDataArray()[0].data.age).toBe(25);
  });

  test('the operator switch opens the operator menu and changes the operator', async () => {
    const { getState } = await mount();

    operatorSwitch('name')!.dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true }),
    );
    await flush();

    expect(getState().filterOperatorMenuVisibleForColumnId).toBe('name');
    const menu = visibleMenu();
    expect(menu).not.toBeNull();

    // default items: close + reset + the string operators
    for (const key of ['close', 'reset', 'includes', 'eq', 'startsWith']) {
      expect(menuItem(key)).not.toBeNull();
    }

    menuItem('startsWith')!.dispatchEvent(
      new MouseEvent('click', { bubbles: true }),
    );
    await flush();

    const filterValue = (globalThis as any).getDataSourceState().filterValue;
    const nameFilter = filterValue.find(
      (fv: any) => fv.field === 'name' || fv.id === 'name',
    );
    expect(nameFilter.filter.operator).toBe('startsWith');

    // with startsWith, "erson" matches nothing but "person-1" matches 11 rows
    await typeInFilter('name', 'erson');
    expect(getDataArray().length).toBe(0);

    await typeInFilter('name', 'person-1');
    expect(getDataArray().length).toBe(11);
  });

  test('the Reset menu item clears the column filter', async () => {
    await mount();

    await typeInFilter('name', 'person-19');
    expect(getDataArray().length).toBe(1);

    operatorSwitch('name')!.dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true }),
    );
    await flush();

    menuItem('reset')!.dispatchEvent(
      new MouseEvent('click', { bubbles: true }),
    );
    await flush();

    expect(getDataArray().length).toBe(20);
    expect(filterInput('name')!.value).toBe('');
  });

  test('domProps are merged onto the root element', async () => {
    await mount({
      domProps: {
        className: 'my-custom-class',
        style: { outline: '1px solid red' },
        'data-custom': 'yes',
      },
    });

    const root = container.querySelector(
      `.${rootClassName}`,
    ) as HTMLElement | null;
    expect(root).not.toBeNull();
    expect(root!.classList.contains('my-custom-class')).toBe(true);
    expect(root!.getAttribute('data-custom')).toBe('yes');
    expect(root!.style.outline).toBe('1px solid red');
  });
});
