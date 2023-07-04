import { InfiniteTableContextValue } from '../types';

export function realignColumnContextMenu<T = any>(param: {
  getComputed: InfiniteTableContextValue<T>['getComputed'];
  getState: InfiniteTableContextValue<T>['getState'];
  actions: InfiniteTableContextValue<T>['actions'];
}) {
  const { getComputed, getState, actions } = param;

  const columnMenuVisibleForColumnId = getState().columnMenuVisibleForColumnId;

  if (!columnMenuVisibleForColumnId) {
    return;
  }
  const computed = getComputed();
  const visibleCols = computed.computedVisibleColumnsMap;
  const order = computed.computedColumnOrder;

  if (visibleCols.has(columnMenuVisibleForColumnId)) {
    // column is still visible
    // but might have changed position
    // so let's adjust the key for the menu
    // in order to reposition it
    actions.columnMenuVisibleKey = Date.now();
    return;
  }

  function tryCol(diff: number, sign: number) {
    const colId = order[index + diff * sign];
    if (visibleCols.has(colId)) {
      return colId;
    }
    return;
  }

  const index = order.indexOf(columnMenuVisibleForColumnId);

  // we now go left and right to search for the closest visible column
  let diff = 0;
  let sign: number = -1;

  let colId: string | undefined;
  while (!colId && diff < order.length) {
    diff++;
    colId = tryCol(diff, sign);
    if (!colId) {
      sign *= -1;
      colId = tryCol(diff, sign);
    }
    if (colId) {
      break;
    }
  }

  if (colId) {
    // makes the menu be displayed for the new column
    actions.columnMenuVisibleForColumnId = colId;
  }
  return colId;
}
