import { CellSelectionState } from '../../DataSource/CellSelectionState';
import { RowSelectionState } from '../../DataSource/RowSelectionState';
import { InfiniteTablePropOnCellDoubleClickResult } from '../types/InfiniteTableProps';

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
  event: React.MouseEvent<Element> & { key: string },
) {
  const { onCellDoubleClick } = context.getState();
  let dblClickResult: Required<InfiniteTablePropOnCellDoubleClickResult> = {
    preventEdit: false,
  };

  if (onCellDoubleClick) {
    const result = onCellDoubleClick(context, event);
    if (result && typeof result === 'object') {
      dblClickResult = { ...dblClickResult, ...result };
    }
  }
  if (dblClickResult.preventEdit) {
    return;
  }
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
    colIndex: number;
  },

  event: SimpleClickEvent,
) {
  const {
    getDataSourceState,
    getState,
    getComputed,
    rowIndex,
    colIndex,
    dataSourceActions,
  } = context;

  // const { multiRowSelector, renderSelectionCheckBox } = getComputed();
  const dataSourceState = getDataSourceState();

  const { selectionMode, cellSelection: existingCellSelection } =
    dataSourceState;

  if (!existingCellSelection) {
    return;
  }

  if (selectionMode !== 'multi-cell') {
    return;
  }

  const { multiCellSelector, computedVisibleColumns } = getComputed();
  const { brain, debugId } = getState();
  const { rowsPerPage } = brain;
  const columnsPerSet = computedVisibleColumns.length;

  const cellSelection = new CellSelectionState(existingCellSelection);
  cellSelection.debugId = debugId ?? '';

  multiCellSelector.cellSelectionState = cellSelection;

  const position = {
    rowIndex,
    colIndex,
  };

  if (event.metaKey || event.ctrlKey) {
    multiCellSelector.singleAddClick(position);
  } else if (event.shiftKey) {
    const horizontalLayout = !!getState().wrapRowsHorizontally;
    multiCellSelector.multiSelectClick(
      position,
      horizontalLayout
        ? {
            horizontalLayout,
            rowsPerPage,
            columnsPerSet,
          }
        : {
            horizontalLayout,
          },
    );
  } else {
    multiCellSelector.resetClick(position);
  }

  dataSourceActions.cellSelection = cellSelection;
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

  const { selectionMode, groupBy, dataArray, isTree } = dataSourceState;

  if (groupBy.length) {
    // for now we don't support row selection via user clicks
    // with grouping when there is no checkbox column
    return false;
  }

  if (isTree) {
    return false;
  }

  const rowInfo = dataArray[rowIndex];

  if (rowInfo?.rowDisabled) {
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
    const rowInfo = dataArray[rowIndex];
    const id = rowInfo.id;
    if (event.metaKey || event.ctrlKey) {
      api.rowSelectionApi.toggleRowSelection(id);
    } else {
      api.rowSelectionApi.selectRow(id);
    }
  }
  return false;
}
