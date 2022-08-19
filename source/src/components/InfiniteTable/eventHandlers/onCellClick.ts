import { RowSelectionState } from '../../DataSource/RowSelectionState';
import { rowSelectionStateConfigGetter } from '../api/getSelectionApi';
import {
  InfiniteTableCellClickEventHandlerContext,
  InfiniteTableEventHandlerContext,
  InfiniteTableKeyboardEventHandlerContext,
} from './eventHandlerTypes';

export function onCellClick<T>(
  context: InfiniteTableCellClickEventHandlerContext<T> &
    InfiniteTableKeyboardEventHandlerContext<T>,
  event: {
    key: string;
    metaKey: boolean;
    ctrlKey: boolean;
    shiftKey: boolean;
    preventDefault: VoidFunction;
  },
) {
  updateRowSelectionOnCellClick(context, event);
}

export function updateRowSelectionOnCellClick<T>(
  context: InfiniteTableEventHandlerContext<T> & {
    rowIndex: number;
  } & InfiniteTableKeyboardEventHandlerContext<T>,

  event: {
    key: string;
    metaKey: boolean;
    ctrlKey: boolean;
    shiftKey: boolean;
    preventDefault: VoidFunction;
  },
) {
  const { rowIndex, getDataSourceState, getComputed, dataSourceActions, api } =
    context;

  const { multiRowSelector, renderSelectionCheckBox } = getComputed();
  const dataSourceState = getDataSourceState();

  const { selectionMode, groupBy, dataArray } = dataSourceState;

  if (groupBy.length) {
    return false;
  }

  if (selectionMode === 'multi-row') {
    if (renderSelectionCheckBox && !event.key) {
      // we should not click-select when we have a checkbox column
      // but we only do this if there is no key
      // as key could  == ' ', and in this case we want
      // to let the selection logic happen, as it's the same function
      // but used by the keyboard selection
      return false;
    }
    let { rowSelection: rowSelectionState } = dataSourceState;
    // clone the row selection
    rowSelectionState = new RowSelectionState(
      rowSelectionState as RowSelectionState<string>,
      rowSelectionStateConfigGetter(getDataSourceState),
    );

    multiRowSelector.rowSelectionState = rowSelectionState;

    if (rowSelectionState && typeof rowSelectionState === 'object') {
      if (event.shiftKey) {
        multiRowSelector.multiSelectClick(rowIndex);
      } else if (event.metaKey || event.ctrlKey) {
        multiRowSelector.singleAddClick(rowIndex);
      } else {
        multiRowSelector.resetClick(rowIndex);
      }

      // so we can give actions a new instance of rowSelection
      dataSourceActions.rowSelection = rowSelectionState;

      return true;
    }
  } else if (selectionMode === 'single-row') {
    const id = dataArray[rowIndex].id;
    if (event.metaKey || event.ctrlKey) {
      api.selectionApi.toggleRowSelection(id);
    } else {
      api.selectionApi.selectRow(id);
    }
  }
  return false;
}
