/**
 * @jest-environment jsdom
 *
 * Phase 3 validation: the Vue InfiniteTable, end-to-end - Vue DataSource
 * (shared state machine + loading) -> Vue InfiniteTable (shared managed
 * state + getComputedColumns + brain wiring + imperative api) -> the Vue
 * column cell tree (InfiniteTableColumnCellForVue: shared rendering params,
 * shared styling controller, render bag) -> Vue rendering bridge
 * (HeadlessTable/RawTable/RenderSlot + Vue cell pools).
 *
 * The cells render the same DOM as React: data-column-id + data-row-id
 * attributes, InfiniteTableColumnCell/InfiniteTableCell classnames, a
 * Cell_content wrapper and root-level CSS vars for column widths.
 */
import { createApp, defineComponent, h, nextTick } from 'vue';
import type { App } from 'vue';

import { stripVar } from '../../utils/stripVar';
import { DataSource } from '../DataSource/DataSourceForVue.vue';
import { InternalVars } from './internalVars.css';
import { InfiniteTable } from './InfiniteTableForVue.vue';
import { InfiniteTableColumnCellClassName } from './components/InfiniteTableRow/InfiniteTableColumnCellClassNames';
import { InfiniteTableCellClassName } from './components/InfiniteTableRow/InfiniteTableCellClassNames';

type Person = { id: number; name: string; age: number };

const people: Person[] = Array.from({ length: 100 }, (_, i) => ({
  id: i,
  name: `person-${i}`,
  age: 20 + (i % 50),
}));

const ROW_HEIGHT = 40;
const VIEWPORT = { width: 400, height: 300 };

const columnWidthAtIndex = stripVar(InternalVars.columnWidthAtIndex);

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

describe('Vue InfiniteTable (cell tree)', () => {
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
                    name: { field: 'name' },
                    age: { field: 'age' },
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

    // jsdom has no layout: push the viewport size in manually, both into
    // the managed state (drives column flexing/ready) and the brain
    // (drives virtualization) - in the browser the resize observers do this
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

  const cellForRow = (rowIndex: number, columnId: string) => {
    const rowInfo = getDataArray()[rowIndex];
    if (!rowInfo) {
      return null;
    }
    return container.querySelector(
      `[data-row-id="${rowInfo.id}"][data-column-id="${columnId}"]`,
    ) as HTMLElement | null;
  };

  const cellText = (rowIndex: number, columnId: string) => {
    const cell = cellForRow(rowIndex, columnId);
    return cell ? cell.textContent ?? '' : undefined;
  };

  test('renders a virtualized body with data from the Vue DataSource', async () => {
    await mount({});

    // first row rendered with values from both columns
    expect(cellText(0, 'name')).toBe('person-0');
    expect(cellText(0, 'age')).toBe('20');

    // the real cell classnames (same as React)
    const firstCell = cellForRow(0, 'name')!;
    expect(firstCell.className).toContain(InfiniteTableColumnCellClassName);
    expect(firstCell.className).toContain(InfiniteTableCellClassName);
    expect(firstCell.className).toContain(
      `${InfiniteTableColumnCellClassName}--unpinned`,
    );
    // value is wrapped in the Cell_content element
    expect(
      firstCell.querySelector(`.${InfiniteTableCellClassName}_content`),
    ).not.toBeNull();

    // virtualization: only the viewport rows (+ overscan) are rendered
    const renderedRows = new Set(
      Array.from(container.querySelectorAll('[data-row-id]')).map((el) =>
        el.getAttribute('data-row-id'),
      ),
    );
    expect(renderedRows.size).toBeGreaterThanOrEqual(
      Math.floor(VIEWPORT.height / ROW_HEIGHT),
    );
    expect(renderedRows.size).toBeLessThan(30);
    expect(renderedRows.has('99')).toBe(false);

    // columns are flexed by the shared pipeline; widths are published as
    // CSS vars on the root element (same contract as React's useDOMProps)
    const root = container.querySelector('.Infinite') as HTMLElement;
    const widthVar = root.style.getPropertyValue(`${columnWidthAtIndex}-0`);
    expect(parseInt(widthVar, 10)).toBeGreaterThan(0);
    // each cell references its width var (jsdom's CSSOM drops `var()`
    // values for width, so we can't assert cell.style.width here - the
    // browser-level check comes with the Playwright suite in Phase 4);
    // the row height is a px value and survives:
    expect(firstCell.style.height).toBe(`${ROW_HEIGHT}px`);
  });

  test('scrolling the scroller element brings new rows in', async () => {
    const { getState } = await mount({});

    const scroller = container.querySelector(
      '.InfiniteVirtualScrollContainer',
    ) as HTMLElement;
    expect(scroller).not.toBeNull();

    Object.defineProperty(scroller, 'scrollTop', {
      value: 20 * ROW_HEIGHT,
      writable: true,
    });
    scroller.dispatchEvent(new Event('scroll'));
    await flush();

    const [startRow] = getState().brain.getRenderRange().start;
    expect(startRow).toBeGreaterThanOrEqual(19);

    expect(cellText(startRow, 'name')).toBe(`person-${startRow}`);
    expect(cellText(0, 'name')).toBeUndefined();
  });

  test('sorting through the DataSource re-renders cells in the new order', async () => {
    await mount({});

    expect(cellText(0, 'name')).toBe('person-0');

    // sort by age descending - ages cycle 20..69, so the first row
    // after sorting has age 69
    (globalThis as any).dataSourceActions.sortInfo = [
      { field: 'age', dir: -1 },
    ];
    await flush();

    expect(cellText(0, 'age')).toBe('69');
    expect(getDataArray()[0].data.age).toBe(69);
  });

  test('changing controlled columnVisibility hides a column', async () => {
    // remount with controlled columnVisibility
    app?.unmount();
    container.remove();

    container = document.createElement('div');
    document.body.appendChild(container);

    let setVisibility: (visibility: Record<string, false>) => void;

    const Root = defineComponent({
      data: () => ({ columnVisibility: {} as Record<string, false> }),
      created() {
        setVisibility = (visibility) => {
          this.columnVisibility = visibility;
        };
      },
      render() {
        return h(DataSource, { primaryKey: 'id', data: people } as any, {
          default: () =>
            h(InfiniteTable, {
              columns: {
                name: { field: 'name' },
                age: { field: 'age' },
              },
              columnVisibility: this.columnVisibility,
            } as any),
        });
      },
    });

    app = createApp(Root);
    app.mount(container);
    await flush();

    (globalThis as any).componentActions.bodySize = { ...VIEWPORT };
    (globalThis as any).getState().brain.update(VIEWPORT);
    await flush();

    expect(cellText(0, 'age')).toBe('20');

    setVisibility!({ age: false });
    await flush();

    expect(cellText(0, 'name')).toBe('person-0');
    expect(cellText(0, 'age')).toBeUndefined();
  });

  test('column.renderValue gets the shared render params and renders vnodes', async () => {
    await mount({
      columns: {
        name: {
          field: 'name',
          renderValue: ({ value, rowInfo }: any) =>
            h(
              'b',
              { class: 'custom-render' },
              `${value}@${rowInfo.indexInAll}`,
            ),
        },
        age: { field: 'age' },
      },
    });

    const cell = cellForRow(0, 'name')!;
    const custom = cell.querySelector('.custom-render') as HTMLElement;
    expect(custom).not.toBeNull();
    expect(custom.tagName).toBe('B');
    expect(custom.textContent).toBe('person-0@0');
  });

  test('column.render overrides content and receives renderBag.all', async () => {
    await mount({
      columns: {
        name: {
          field: 'name',
          render: ({ renderBag }: any) =>
            h('span', { class: 'all-wrapper' }, [renderBag.all]),
        },
        age: { field: 'age' },
      },
    });

    const cell = cellForRow(0, 'name')!;
    const wrapper = cell.querySelector('.all-wrapper') as HTMLElement;
    expect(wrapper).not.toBeNull();
    expect(wrapper.textContent).toBe('person-0');
  });

  test('column.style + cellStyle styling fns run with the shared styling param', async () => {
    const seenParams: any[] = [];

    await mount({
      columns: {
        name: {
          field: 'name',
          style: (param: any) => {
            if (param.rowInfo.indexInAll === 0) {
              seenParams.push(param);
            }
            return { color: 'rgb(255, 0, 0)' };
          },
        },
        age: { field: 'age' },
      },
      rowClassName: ({ rowInfo }: any) =>
        rowInfo.indexInAll % 2 === 1 ? 'my-odd-row' : 'my-even-row',
    });

    const cell = cellForRow(0, 'name')!;
    expect(cell.style.color).toBe('rgb(255, 0, 0)');
    expect(cell.className).toContain('my-even-row');
    expect(cellForRow(1, 'name')!.className).toContain('my-odd-row');

    expect(seenParams.length).toBeGreaterThan(0);
    expect(seenParams[0].column.id).toBe('name');
    expect(seenParams[0].value).toBe('person-0');
  });

  test('selection checkbox renders for multi-row selection mode', async () => {
    await mount(
      {
        columns: {
          name: { field: 'name', renderSelectionCheckBox: true },
          age: { field: 'age' },
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

    const cell = cellForRow(0, 'name')!;
    const checkbox = cell.querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement;
    expect(checkbox).not.toBeNull();
    expect(checkbox.checked).toBe(false);

    // clicking the checkbox selects the row through the imperative api chain
    checkbox.dispatchEvent(new Event('change'));
    await flush();

    expect(getDataArray()[0].rowSelected).toBe(true);
    const checkboxAfter = cellForRow(0, 'name')!.querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement;
    expect(checkboxAfter.checked).toBe(true);
  });

  test('mousedown on a cell sets the active cell index (keyboardNavigation=cell)', async () => {
    const { getState } = await mount({ keyboardNavigation: 'cell' });

    const cell = cellForRow(2, 'age')!;
    cell.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    await flush();

    expect(getState().activeCellIndex).toEqual([2, 1]);
  });

  test('valueFormatter + valueGetter from the shared rendering pipeline', async () => {
    await mount({
      columns: {
        name: { field: 'name' },
        age: {
          field: 'age',
          valueGetter: ({ data }: any) => data.age * 2,
          valueFormatter: ({ value }: any) => `formatted-${value}`,
        },
      },
    });

    expect(cellText(0, 'age')).toBe('formatted-40');
  });
});
