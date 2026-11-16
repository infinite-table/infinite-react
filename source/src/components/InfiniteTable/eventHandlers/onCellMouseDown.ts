import type { MouseEvent } from '../../types/FrameworkTypes';
import {
  InfiniteTableCellClickEventHandlerContext,
  InfiniteTableEventHandlerAbstractContext,
  InfiniteTableKeyboardEventHandlerContext,
} from './eventHandlerTypes';

export type OnCellMouseDownContext<T> =
  InfiniteTableCellClickEventHandlerContext<T> &
    InfiniteTableKeyboardEventHandlerContext<T>;

export function onCellMouseDown<T>(
  context: OnCellMouseDownContext<T>,
  event: MouseEvent<Element>,
) {
  context.getComputed().multiRowSelector.lastPointerDown = {
    rowIndex: context.rowIndex,
    shiftKey: !!event.shiftKey,
  };
  if (event.detail === 2) {
    return;
  }

  updateCellSelectionOnCellMouseDown(context);
}

export function updateCellSelectionOnCellMouseDown<T>(
  _context: InfiniteTableEventHandlerAbstractContext<T> & {
    rowIndex: number;
    colIndex: number;
  },
) {
  // const { getDataSourceState, getComputed, rowIndex, colIndex, dataSourceApi } =
  //   context;
  // const { computedVisibleColumns } = getComputed();
  // const dataSourceState = getDataSourceState();
  // const { selectionMode } = dataSourceState;
  // if (selectionMode !== 'multi-cell') {
  //   return;
  // }
  // // //@ts-ignore
  // // const _column = computedVisibleColumns[colIndex];
  // // //@ts-ignore
  // // const _rowId = dataSourceApi.getPrimaryKeyByIndex(rowIndex);
}
