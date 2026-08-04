/**
 * @jest-environment jsdom
 *
 * Phase 3d validation: column resizing + row hover for the Vue table.
 *
 * - resizable header cells render the resize handle; dragging it (pointer
 *   events) updates columnSizing in state through the shared
 *   computeColumnResizeForDiff logic
 * - resizable: false columns render no handle
 * - hovering a cell adds the hover classnames to all cells in that row
 *   (through the shared headless renderer's cellHoverClassNames) and
 *   mouseleave removes them; onRowMouseEnter/onRowMouseLeave callbacks fire
 * - showHoverRows: false disables the hover classnames
 */
import { createApp, defineComponent, h, nextTick } from 'vue';
import type { App } from 'vue';

import { DataSource } from '../DataSource/DataSourceForVue.vue';
import { InfiniteTable } from './InfiniteTableForVue.vue';
import { InfiniteTableColumnCellClassName } from './components/InfiniteTableRow/InfiniteTableColumnCellClassNames';

type Person = {
  id: number;
  name: string;
  age: number;
};

const people: Person[] = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  name: `person-${i}`,
  age: 20 + i,
}));

const VIEWPORT = { width: 400, height: 300 };

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

describe('Vue InfiniteTable column resize + row hover', () => {
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
                    name: { field: 'name', header: 'Name', defaultWidth: 150 },
                    age: { field: 'age', header: 'Age', defaultWidth: 100 },
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

  const headerCell = (columnId: string) =>
    container.querySelector(
      `[data-name="HeaderCell"][data-column-id="${columnId}"]`,
    ) as HTMLElement | null;

  const resizeHandle = (columnId: string) =>
    headerCell(columnId)?.querySelector(
      '.InfiniteHeaderCell_ResizeHandle',
    ) as HTMLElement | null;

  const cellsForRowId = (rowId: string) =>
    Array.from(
      container.querySelectorAll(
        `.${InfiniteTableColumnCellClassName}[data-row-id="${rowId}"]`,
      ),
    ) as HTMLElement[];

  const dragHandle = async (handle: HTMLElement, diff: number) => {
    handle.dispatchEvent(
      new MouseEvent('pointerdown', {
        bubbles: true,
        clientX: 100,
      }),
    );
    await flush(5);
    handle.dispatchEvent(
      new MouseEvent('pointermove', {
        bubbles: true,
        clientX: 100 + diff,
      }),
    );
    await flush(5);
    handle.dispatchEvent(
      new MouseEvent('pointerup', {
        bubbles: true,
        clientX: 100 + diff,
      }),
    );
    await flush();
  };

  test('resizable header cells render the resize handle', async () => {
    await mount();

    expect(resizeHandle('name')).not.toBeNull();
    expect(resizeHandle('age')).not.toBeNull();
  });

  test('resizable: false columns render no handle', async () => {
    await mount({
      columns: {
        name: { field: 'name', defaultWidth: 150, resizable: false },
        age: { field: 'age', defaultWidth: 100 },
      },
    });

    expect(resizeHandle('name')).toBeNull();
    expect(resizeHandle('age')).not.toBeNull();
  });

  test('dragging the resize handle updates columnSizing in state', async () => {
    const { getState } = await mount();

    expect(getState().columnSizing.name?.width).toBeUndefined();

    await dragHandle(resizeHandle('name')!, 40);

    expect(getState().columnSizing.name?.width).toBe(190);

    // dragging again accumulates from the new width
    await dragHandle(resizeHandle('name')!, -20);
    expect(getState().columnSizing.name?.width).toBe(170);

    // the other column is untouched (no shared space without shift)
    expect(getState().columnSizing.age?.width).toBeUndefined();
  });

  test('shift+dragging shares space with the next column', async () => {
    const { getState } = await mount();

    const handle = resizeHandle('name')!;
    handle.dispatchEvent(
      new MouseEvent('pointerdown', {
        bubbles: true,
        clientX: 100,
        shiftKey: true,
      }),
    );
    await flush(5);
    handle.dispatchEvent(
      new MouseEvent('pointermove', { bubbles: true, clientX: 130 }),
    );
    await flush(5);
    handle.dispatchEvent(
      new MouseEvent('pointerup', { bubbles: true, clientX: 130 }),
    );
    await flush();

    expect(getState().columnSizing.name?.width).toBe(180);
    expect(getState().columnSizing.age?.width).toBe(70);
  });

  test('hovering a cell adds hover classnames to all cells in the row', async () => {
    await mount();

    const rowCells = cellsForRowId('3');
    expect(rowCells.length).toBe(2);

    rowCells[0].dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
    await flush();

    const hoveredCls = `${InfiniteTableColumnCellClassName}--hovered`;
    for (const cell of cellsForRowId('3')) {
      expect(cell.classList.contains(hoveredCls)).toBe(true);
    }
    // other rows are not hovered
    for (const cell of cellsForRowId('4')) {
      expect(cell.classList.contains(hoveredCls)).toBe(false);
    }

    rowCells[0].dispatchEvent(new MouseEvent('mouseleave', { bubbles: false }));
    await flush();

    for (const cell of cellsForRowId('3')) {
      expect(cell.classList.contains(hoveredCls)).toBe(false);
    }
  });

  test('onRowMouseEnter/onRowMouseLeave callbacks fire with the row context', async () => {
    const entered: number[] = [];
    const left: number[] = [];

    await mount({
      onRowMouseEnter: (rowContext: any) => {
        entered.push(rowContext.rowIndex);
      },
      onRowMouseLeave: (rowContext: any) => {
        left.push(rowContext.rowIndex);
      },
    });

    const rowCells = cellsForRowId('5');
    rowCells[0].dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
    rowCells[0].dispatchEvent(new MouseEvent('mouseleave', { bubbles: false }));
    await flush();

    expect(entered).toEqual([5]);
    expect(left).toEqual([5]);
  });

  test('showHoverRows: false disables the hover classnames', async () => {
    await mount({ showHoverRows: false });

    const rowCells = cellsForRowId('3');
    rowCells[0].dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
    await flush();

    const hoveredCls = `${InfiniteTableColumnCellClassName}--hovered`;
    for (const cell of cellsForRowId('3')) {
      expect(cell.classList.contains(hoveredCls)).toBe(false);
    }
  });
});
