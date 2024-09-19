import { Renderable } from '../../../types/Renderable';
import { getColumnApiForColumn } from '../../api/getColumnApi';
import { GetImperativeApiParam } from '../../api/type';
import { InfiniteTableComputedColumn, InfiniteTableApi } from '../../types';

export function getColumnLabel<T>(
  colIdOrCol: string | InfiniteTableComputedColumn<T>,
  context: {
    api: InfiniteTableApi<T>;
  } & GetImperativeApiParam<T>,
) {
  const col =
    typeof colIdOrCol === 'string'
      ? context.getComputed().computedColumnsMap.get(colIdOrCol)!
      : colIdOrCol;

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

  let label: Renderable =
    col.header && typeof col.header !== 'function'
      ? col.header
      : col.name || col.id || '';

  if (typeof col.header === 'function') {
    const columnApi = getColumnApiForColumn(col.id, {
      ...context,
      actions,
      dataSourceActions,
      dataSourceApi,
    })!;
    label =
      col.header({
        horizontalLayoutPageIndex: null,
        column: col,
        columnApi,
        insideColumnMenu: true,
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
          header: label,
        },
      }) ?? null;
  }

  return label;
}
