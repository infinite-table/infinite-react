/**
 * @jest-environment jsdom
 *
 * Phase 3d validation: menus + portals for the Vue table.
 *
 * - the header cell renders the menu icon; mousedown on it opens the column
 *   menu (through columnApi.toggleContextMenu -> onColumnMenuClick ->
 *   columnMenuVisibleForColumnId -> useColumnMenu overlay)
 * - the column menu renders the default items (sort/pin/columns/group-by),
 *   actions work (sorting), Escape and outside-mousedown close it
 * - the Columns submenu opens with per-column checkboxes that toggle column
 *   visibility
 * - cell context menu (getCellContextMenuItems) and table context menu
 *   (getContextMenuItems) open on contextmenu events, render through the
 *   portal div, and fire item actions
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

const people: Person[] = Array.from({ length: 20 }, (_, i) => ({
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

describe('Vue InfiniteTable menus + portals', () => {
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

  const headerCell = (columnId: string) =>
    container.querySelector(
      `[data-name="HeaderCell"][data-column-id="${columnId}"]`,
    ) as HTMLElement | null;

  const menuIconFor = (columnId: string) =>
    headerCell(columnId)?.querySelector(
      '[data-name="menu-icon"]',
    ) as HTMLElement | null;

  const visibleMenu = () =>
    container.querySelector(
      '.InfiniteMenu[data-menu-id]',
    ) as HTMLElement | null;

  const menuItem = (key: string, root: HTMLElement | null = container) =>
    root?.querySelector(`[data-menu-item-key="${key}"]`) as HTMLElement | null;

  const openColumnMenu = async (columnId: string) => {
    const icon = menuIconFor(columnId)!;
    expect(icon).not.toBeNull();
    icon.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    await flush();
  };

  test('header cells render the menu icon', async () => {
    await mount();

    expect(menuIconFor('name')).not.toBeNull();
    expect(menuIconFor('age')).not.toBeNull();
  });

  test('mousedown on the menu icon opens the column menu with default items', async () => {
    const { getState } = await mount();

    await openColumnMenu('age');

    expect(getState().columnMenuVisibleForColumnId).toBe('age');

    const menu = visibleMenu();
    expect(menu).not.toBeNull();

    // menus render inside the portal div (same structure as React)
    const portal = container.querySelector(`.${rootClassName}Portal`);
    expect(portal).not.toBeNull();
    expect(portal!.contains(menu)).toBe(true);

    for (const key of [
      'sort-asc',
      'sort-desc',
      'sort-none',
      'pin-start',
      'unpin',
      'columns',
      'group-by',
    ]) {
      expect(menuItem(key)).not.toBeNull();
    }

    expect(menuItem('sort-asc')!.textContent).toContain('Sort Ascending');
  });

  test('clicking the Sort Ascending item sorts the column', async () => {
    await mount();

    await openColumnMenu('age');

    menuItem('sort-asc')!.dispatchEvent(
      new MouseEvent('click', { bubbles: true }),
    );
    await flush();

    expect(headerCell('age')!.getAttribute('data-sort')).toBe('asc');
    const dataArray = getDataArray();
    expect(dataArray[dataArray.length - 1].data.age).toBe(29);
  });

  test('Escape and outside mousedown close the column menu', async () => {
    const { getState } = await mount();

    await openColumnMenu('age');
    expect(visibleMenu()).not.toBeNull();

    // Escape (keydown on the menu element) closes it
    visibleMenu()!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    await flush();

    expect(getState().columnMenuVisibleForColumnId).toBeNull();
    expect(visibleMenu()).toBeNull();

    // reopen, then mousedown outside closes it
    await openColumnMenu('age');
    expect(visibleMenu()).not.toBeNull();

    document.documentElement.dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true }),
    );
    await flush();

    expect(getState().columnMenuVisibleForColumnId).toBeNull();
    expect(visibleMenu()).toBeNull();
  });

  test('the Columns submenu toggles column visibility via checkboxes', async () => {
    const { getState } = await mount();

    await openColumnMenu('name');

    // clicking the `columns` item activates it, which spawns the submenu
    menuItem('columns')!.dispatchEvent(
      new MouseEvent('click', { bubbles: true }),
    );
    await flush(80);

    const menus = container.querySelectorAll('.InfiniteMenu[data-menu-id]');
    expect(menus.length).toBe(2);

    const submenu = menus[1] as HTMLElement;
    // one row per column, each with a checkbox
    const ageItemCells = submenu.querySelectorAll('[data-menu-item-key="age"]');
    expect(ageItemCells.length).toBeGreaterThan(0);

    const ageCheckbox = submenu
      .querySelector('[data-menu-item-key="age"]')!
      .parentElement!.querySelector(
        'input[type="checkbox"]',
      ) as HTMLInputElement;
    expect(ageCheckbox).not.toBeNull();
    expect(ageCheckbox.checked).toBe(true);

    ageCheckbox.dispatchEvent(new Event('change'));
    await flush(80);

    expect(getState().columnVisibility).toEqual({ age: false });
    expect(headerCell('age')).toBeNull();
  });

  test('cell context menu opens via getCellContextMenuItems and fires actions', async () => {
    const onAction = jest.fn();
    const { getState } = await mount({
      getCellContextMenuItems: (cellContext: any) => {
        return [
          {
            key: 'hello',
            label: `hello-${cellContext.column.id}-${cellContext.rowInfo.id}`,
            onAction,
          },
        ];
      },
    });

    const cell = container.querySelector(
      '[data-row-index="1"][data-col-index="0"]',
    ) as HTMLElement;
    expect(cell).not.toBeNull();

    cell.dispatchEvent(
      new MouseEvent('contextmenu', {
        bubbles: true,
        clientX: 50,
        clientY: 50,
      }),
    );
    await flush();

    expect(getState().cellContextMenuVisibleFor).toEqual(
      expect.objectContaining({ columnId: 'name', rowIndex: 1 }),
    );

    const item = menuItem('hello');
    expect(item).not.toBeNull();
    expect(item!.textContent).toContain('hello-name-1');

    item!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await flush();

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction.mock.calls[0][0].key).toBe('hello');
  });

  test('table context menu opens via getContextMenuItems outside cells', async () => {
    const onAction = jest.fn();
    const { getState } = await mount({
      getContextMenuItems: () => {
        return [{ key: 'table-item', label: 'Table item', onAction }];
      },
    });

    // dispatch on the body container itself (not on a cell)
    const body = container.querySelector(
      `.${rootClassName}Body`,
    ) as HTMLElement;
    expect(body).not.toBeNull();

    body.dispatchEvent(
      new MouseEvent('contextmenu', {
        bubbles: true,
        clientX: 60,
        clientY: 60,
      }),
    );
    await flush();

    expect(getState().contextMenuVisibleFor).not.toBeNull();

    const item = menuItem('table-item');
    expect(item).not.toBeNull();

    item!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await flush();

    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
