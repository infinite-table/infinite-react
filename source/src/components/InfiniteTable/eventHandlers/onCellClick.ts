import { RowSelectionState } from '../../DataSource/RowSelectionState';

import {
  InfiniteTableCellClickEventHandlerContext,
  InfiniteTableEventHandlerAbstractContext,
  InfiniteTableKeyboardEventHandlerContext,
} from './eventHandlerTypes';

export type OnCellClickContext<T> =
  InfiniteTableCellClickEventHandlerContext<T> &
    InfiniteTableKeyboardEventHandlerContext<T>;

export type SimpleClickEvent = {
  key: string;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  preventDefault: VoidFunction;
};

export function onCellClick<T>(
  context: OnCellClickContext<T>,
  event: React.MouseEvent<Element> & { key: string },
) {
  updateRowSelectionOnCellClick(context, event);
  updateCellSelectionOnCellClick(context, event);

  if (event.detail === 2) {
    // double click
    onCellDoubleClick(context, event);
  }

  context.getState().onCellClick?.(context, event);
}

function onCellDoubleClick<T>(
  context: OnCellClickContext<T>,
  _event: React.MouseEvent<Element> & { key: string },
) {
  const computed = context.getComputed();
  const column = computed.computedVisibleColumns[context.colIndex];

  context.api.startEdit({
    rowIndex: context.rowIndex,
    columnId: column.id,
  });
}

export function updateCellSelectionOnCellClick<T>(
  context: InfiniteTableEventHandlerAbstractContext<T> & {
    rowIndex: number;
  },

  _event: SimpleClickEvent,
) {
  const { getDataSourceState } = context;

  // const { multiRowSelector, renderSelectionCheckBox } = getComputed();
  const dataSourceState = getDataSourceState();

  const { selectionMode } = dataSourceState;

  if (selectionMode === 'single-cell') {
  }
}

export function updateRowSelectionOnCellClick<T>(
  context: InfiniteTableEventHandlerAbstractContext<T> & {
    rowIndex: number;
  },

  event: SimpleClickEvent,
) {
  const {
    rowIndex,
    getDataSourceState,
    getComputed,
    dataSourceActions,
    api,
    cloneRowSelection,
  } = context;

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
    rowSelectionState = cloneRowSelection(
      rowSelectionState as RowSelectionState<T>,
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
