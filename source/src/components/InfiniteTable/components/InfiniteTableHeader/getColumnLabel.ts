import { Renderable } from '../../../types/Renderable';
import { getColumnApiForColumn } from '../../api/getColumnApi';
import { GetImperativeApiParam } from '../../api/type';
import { InfiniteTableComputedColumn, InfiniteTableApi } from '../../types';
import type { InfiniteTableColumnHeaderParam } from '../../types/InfiniteTableColumn';

export type ColumnLabelRenderLocation =
  | 'grouping-toolbar'
  | 'column-menu'
  | 'column-filter';

export type ColumnLabelContext<T> = {
  api: InfiniteTableApi<T>;
} & GetImperativeApiParam<T>;

/**
 * Binds a column header (what `column.header` returned, or the header
 * itself when it isn't a function) to the header param it was computed
 * with - used by frameworks whose renderables need that param to render
 * (Angular templates and components get it as their context / inputs).
 */
export type ColumnLabelBinder<T, R> = (
  header: Renderable,
  param: InfiniteTableColumnHeaderParam<T>,
) => R;

/**
 * The header param a column's header is called with when it is rendered
 * outside a header cell (the Columns and Group by submenus, the column
 * filter, the grouping toolbar).
 */
export function getColumnLabelHeaderParam<T>(
  col: InfiniteTableComputedColumn<T>,
  context: ColumnLabelContext<T>,
  renderLocation: ColumnLabelRenderLocation,
): InfiniteTableColumnHeaderParam<T> {
  const {
    api,
    getComputed,
    getDataSourceState,
    actions,
    dataSourceActions,
    dataSourceApi,
  } = context;
  const dataSourceState = getDataSourceState();
  const { allRowsSelected, someRowsSelected, selectionMode } = dataSourceState;
  const computed = getComputed();

  const columnApi = getColumnApiForColumn(col.id, {
    ...context,
    actions,
    dataSourceActions,
    dataSourceApi,
  })!;

  return {
    horizontalLayoutPageIndex: null,
    column: col,
    columnApi,
    dataSourceApi,
    renderLocation,
    dragging: false,
    columnsMap: computed.computedColumnsMap,
    columnSortInfo: col.computedSortInfo,
    columnFilterValue: col.computedFilterValue,
    filtered: col.computedFiltered,
    allRowsSelected,
    someRowsSelected,
    selectionMode,
    api,
    renderBag: {
      header: col.name || col.id || '',
    },
  } as any as InfiniteTableColumnHeaderParam<T>;
}

/**
 * The label of a column: its header (called with the header param when
 * it's a function), or its name / id. With a `bind` function, a header is
 * bound to its header param (the name / id fallback is returned as is).
 */
export function getColumnLabel<T>(
  colIdOrCol: string | InfiniteTableComputedColumn<T>,
  context: ColumnLabelContext<T>,
  renderLocation: ColumnLabelRenderLocation,
): Renderable;
export function getColumnLabel<T, R>(
  colIdOrCol: string | InfiniteTableComputedColumn<T>,
  context: ColumnLabelContext<T>,
  renderLocation: ColumnLabelRenderLocation,
  bind: ColumnLabelBinder<T, R>,
): R | Renderable;
export function getColumnLabel<T, R>(
  colIdOrCol: string | InfiniteTableComputedColumn<T>,
  context: ColumnLabelContext<T>,
  renderLocation: ColumnLabelRenderLocation,
  bind?: ColumnLabelBinder<T, R>,
): R | Renderable {
  const col =
    typeof colIdOrCol === 'string'
      ? context.getComputed().computedColumnsMap.get(colIdOrCol)!
      : colIdOrCol;

  const header = col.header as unknown;

  if (typeof header === 'function') {
    const param = getColumnLabelHeaderParam(col, context, renderLocation);
    const label: Renderable = header(param) ?? null;
    return bind ? bind(label, param) : label;
  }

  if (header) {
    return bind
      ? bind(
          header as Renderable,
          getColumnLabelHeaderParam(col, context, renderLocation),
        )
      : (header as Renderable);
  }

  return col.name || col.id || '';
}
