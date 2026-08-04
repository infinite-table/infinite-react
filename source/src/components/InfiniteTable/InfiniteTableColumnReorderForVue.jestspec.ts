/**
 * @jest-environment jsdom
 *
 * Phase 3d validation: column drag-to-reorder for the Vue table.
 *
 * - createColumnPointerDownHandler (Vue sibling of useColumnPointerEvents)
 *   wires pointerdown on header cells to the shared reorderColumnsOnDrag
 * - dragging a header cell past another column's breakpoint reorders the
 *   columns (actions.columnOrder via adjustColumnOrderForAllColumns)
 * - while dragging, columnReorderDragColumnId is set and the drag proxy is
 *   teleported into the portal
 * - a plain click (no movement) still toggles sorting
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

// jsdom always returns zero-size rects - the reorder logic needs the table,
// body and header rects to know the drop is inside the table
const rect = {
  x: 0,
  y: 0,
  top: 0,
  left: 0,
  right: VIEWPORT.width,
  bottom: VIEWPORT.height,
  width: VIEWPORT.width,
  height: VIEWPORT.height,
  toJSON: () => {},
} as DOMRect;
Element.prototype.getBoundingClientRect = () => rect;

async function flush(ms = 30) {
  await nextTick();
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, ms));
  await nextTick();
}

describe('Vue InfiniteTable column drag-to-reorder', () => {
  let container: HTMLElement;
  let app: App | null = null;

  const mount = async (tableProps: Record<string, any> = {}) => {
    container = document.createElement('div');
    document.body.appendChild(container);

    const Root = defineComponent({
      setup() {
        return () =>
          h(DataSource, { primaryKey: 'id', data: people } as any, {
            default: () =>
              h(InfiniteTable, {
                columns: {
                  name: { field: 'name', header: 'Name', defaultWidth: 150 },
                  age: { field: 'age', header: 'Age', defaultWidth: 100 },
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

  const headerCell = (columnId: string) =>
    container.querySelector(
      `[data-name="HeaderCell"][data-column-id="${columnId}"]`,
    ) as HTMLElement | null;

  const pointerEvent = (
    type: string,
    { clientX, clientY = 10 }: { clientX: number; clientY?: number },
  ) =>
    new MouseEvent(type, {
      bubbles: true,
      clientX,
      clientY,
    });

  const visibleColumnIds = () =>
    (globalThis as any).infiniteApi
      .getComputed()
      .computedVisibleColumns.map((c: any) => c.id);

  test('dragging a header cell past the next column reorders the columns', async () => {
    const { getState } = await mount();

    expect(visibleColumnIds()).toEqual(['name', 'age']);

    const nameHeader = headerCell('name')!;

    // name spans 0-150 (breakpoint for age is at 150 + 100/2 = 200)
    nameHeader.dispatchEvent(pointerEvent('pointerdown', { clientX: 50 }));
    await flush(5);

    nameHeader.dispatchEvent(pointerEvent('pointermove', { clientX: 230 }));
    await flush(5);

    // while dragging, the reorder state + proxy are active
    expect(getState().columnReorderDragColumnId).toBe('name');
    const proxy = document.body.querySelector(
      `.${InfiniteTableHeaderCellClassName}Proxy`,
    );
    expect(proxy).not.toBeNull();

    nameHeader.dispatchEvent(pointerEvent('pointerup', { clientX: 230 }));
    await flush();

    expect(getState().columnReorderDragColumnId).toBe(false);
    expect(getState().columnOrder).toEqual(['age', 'name']);
    expect(visibleColumnIds()).toEqual(['age', 'name']);

    // proxy is gone
    expect(
      document.body.querySelector(`.${InfiniteTableHeaderCellClassName}Proxy`),
    ).toBeNull();
  });

  test('a small drag (before any breakpoint) keeps the column order', async () => {
    const { getState } = await mount();

    const nameHeader = headerCell('name')!;

    nameHeader.dispatchEvent(pointerEvent('pointerdown', { clientX: 50 }));
    await flush(5);
    nameHeader.dispatchEvent(pointerEvent('pointermove', { clientX: 70 }));
    await flush(5);
    nameHeader.dispatchEvent(pointerEvent('pointerup', { clientX: 70 }));
    await flush();

    expect(getState().columnReorderDragColumnId).toBe(false);
    expect(visibleColumnIds()).toEqual(['name', 'age']);
    // a real drag happened, so no sorting was toggled
    expect((globalThis as any).getDataSourceState().sortInfo).toEqual([]);
  });

  test('columnOrder as a controlled-like default is respected after reorder', async () => {
    const onColumnOrderChange = jest.fn();
    await mount({
      defaultColumnOrder: ['age', 'name'],
      onColumnOrderChange,
    });

    expect(visibleColumnIds()).toEqual(['age', 'name']);

    const ageHeader = headerCell('age')!;

    // age spans 0-100, name spans 100-250 (breakpoint at 100 + 150/2 = 175)
    ageHeader.dispatchEvent(pointerEvent('pointerdown', { clientX: 50 }));
    await flush(5);
    ageHeader.dispatchEvent(pointerEvent('pointermove', { clientX: 200 }));
    await flush(5);
    ageHeader.dispatchEvent(pointerEvent('pointerup', { clientX: 200 }));
    await flush();

    expect(visibleColumnIds()).toEqual(['name', 'age']);
    expect(onColumnOrderChange).toHaveBeenCalledWith(['name', 'age']);
  });

  test('plain click (no movement) still toggles sorting', async () => {
    await mount();

    const ageHeader = headerCell('age')!;
    ageHeader.dispatchEvent(pointerEvent('pointerdown', { clientX: 200 }));
    await flush(5);
    ageHeader.dispatchEvent(pointerEvent('pointerup', { clientX: 200 }));
    await flush();

    expect(headerCell('age')!.getAttribute('data-sort')).toBe('asc');
    expect(visibleColumnIds()).toEqual(['name', 'age']);
  });
});
