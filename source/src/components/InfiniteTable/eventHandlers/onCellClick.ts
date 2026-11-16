import type { MouseEvent } from '../../types/FrameworkTypes';
import { isTargetInput } from '../../../utils/isTargetInput';
import { CellSelectionState } from '../../DataSource/CellSelectionState';
import { RowSelectionState } from '../../DataSource/RowSelectionState';
import { cloneTreeSelection } from '../../DataSource/TreeApi';
import { TreeSelectionState } from '../../DataSource/TreeSelectionState';
import { cloneRowSelection } from '../api/getRowSelectionApi';
import { SelectionCheckboxCls } from '../components/cell.css';
import {
  InfiniteTableApi,
  InfiniteTablePropOnCellDoubleClickResult,
} from '../types/InfiniteTableProps';

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
  event: MouseEvent<Element> & { key: string },
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
  event: MouseEvent<Element> & { key: string },
) {
  if (isTargetInput(event.target)) {
    return;
  }
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

/**
 * Resolves the `multiRowSelectionWith` prop: `'checkbox'` only applies while
 * a visible column renders a selection checkbox.
 */
export function getMultiRowSelectionWith<T>(
  context: Pick<InfiniteTableEventHandlerAbstractContext<T>, 'getComputed'> & {
    getState: () => { multiRowSelectionWith?: 'click' | 'checkbox' };
  },
): 'click' | 'checkbox' {
  return context.getState().multiRowSelectionWith !== 'click' &&
    context.getComputed().renderSelectionCheckBox
    ? 'checkbox'
    : 'click';
}

function isSelectionNeutralTarget(target: EventTarget | null | undefined) {
  if (!target) {
    return false;
  }
  if (isTargetInput(target)) {
    return true;
  }
  const closest = (target as HTMLElement).closest;
  if (typeof closest !== 'function') {
    return false;
  }
  return !!(target as HTMLElement).closest(
    `.${SelectionCheckboxCls}, [data-name="expand-collapse-icon"]`,
  );
}

/**
 * `'click'` is a click on a row, `'keyboard'` is the spacebar on the active row,
 * `'checkbox'` is a change of a row selection checkbox.
 */
export type RowSelectionGesture = 'click' | 'keyboard' | 'checkbox';

export function updateRowSelectionOnCellClick<T>(
  context: InfiniteTableEventHandlerAbstractContext<T> & {
    rowIndex: number;
  },

  event: SimpleClickEvent & { target?: EventTarget | null },
  gesture: RowSelectionGesture = event.key ? 'keyboard' : 'click',
) {
  const {
    rowIndex,
    getDataSourceState,
    getComputed,
    dataSourceActions,
    dataSourceApi,
    api,
    cloneRowSelection,
    cloneTreeSelection,
  } = context;

  const { multiRowSelector } = getComputed();
  const dataSourceState = getDataSourceState();

  const { selectionMode, dataArray, isTree } = dataSourceState;

  if (gesture === 'click' && isSelectionNeutralTarget(event.target)) {
    return false;
  }

  const rowInfo = dataArray[rowIndex];

  if (!rowInfo || rowInfo.rowDisabled) {
    return false;
  }

  if (isTree) {
    if (!rowInfo.isTreeNode || !rowInfo.nodePath) {
      return false;
    }
    const { isNodeSelectable } = dataSourceState;
    if (isNodeSelectable && !isNodeSelectable(rowInfo as any)) {
      return false;
    }
  }

  if (selectionMode === 'multi-row') {
    const selectWith = getMultiRowSelectionWith(context);

    if (gesture === 'click' && selectWith === 'checkbox') {
      return false;
    }
    const toggles =
      gesture === 'checkbox' ||
      (gesture === 'keyboard' && selectWith === 'checkbox');

    const applyGesture = () => {
      if (event.shiftKey) {
        multiRowSelector.multiSelectClick(rowIndex);
      } else if (toggles || event.metaKey || event.ctrlKey) {
        multiRowSelector.singleAddClick(rowIndex);
      } else {
        multiRowSelector.resetClick(rowIndex);
      }
    };

    if (isTree) {
      const { treeSelectionState: currentTreeSelection } = dataSourceState;
      if (!(currentTreeSelection instanceof TreeSelectionState)) {
        return false;
      }
      const treeSelectionState = cloneTreeSelection(currentTreeSelection);

      multiRowSelector.treeSelectionState = treeSelectionState;
      applyGesture();
      multiRowSelector.treeSelectionState = undefined;

      const singleNodeChanged =
        !event.shiftKey && (toggles || event.metaKey || event.ctrlKey);
      if (dataSourceState.lastSelectionUpdatedNodePathRef) {
        dataSourceState.lastSelectionUpdatedNodePathRef.current =
          singleNodeChanged
            ? {
                nodePath: rowInfo.nodePath!,
                selected: !!treeSelectionState.isNodeSelected(
                  rowInfo.nodePath!,
                ),
              }
            : null;
      }

      dataSourceActions.treeSelection = treeSelectionState;
      return true;
    }

    let { rowSelection: rowSelectionState } = dataSourceState;

    if (!rowSelectionState || typeof rowSelectionState !== 'object') {
      return false;
    }
    // clone the row selection
    rowSelectionState = cloneRowSelection(
      rowSelectionState as RowSelectionState<T>,
    );

    multiRowSelector.rowSelectionState = rowSelectionState;

    applyGesture();

    // so we can give actions a new instance of rowSelection
    dataSourceActions.rowSelection = rowSelectionState;

    return true;
  } else if (selectionMode === 'single-row') {
    if (rowInfo.isGroupRow) {
      return false;
    }
    const toggles = event.metaKey || event.ctrlKey || gesture !== 'click';
    if (isTree) {
      const { treeApi } = dataSourceApi;
      if (toggles) {
        treeApi.toggleNodeSelection(rowInfo.nodePath!);
      } else {
        treeApi.selectNode(rowInfo.nodePath!);
      }
      return true;
    }
    const id = rowInfo.id;
    if (toggles) {
      api.rowSelectionApi.toggleRowSelection(id);
    } else {
      api.rowSelectionApi.selectRow(id);
    }
    return true;
  }
  return false;
}

/**
 * Called when a row selection checkbox changes - toggles the row (or group),
 * or selects a range when shift was pressed while clicking the checkbox.
 */
export function updateRowSelectionOnCheckboxChange<T>(
  api: InfiniteTableApi<T>,
  rowIndex: number,
) {
  // the api implementation exposes these, but they're not part of the public api type
  const { getComputed, dataSourceActions, dataSourceApi } =
    api as InfiniteTableApi<T> &
      Pick<
        InfiniteTableEventHandlerAbstractContext<T>,
        'getComputed' | 'dataSourceActions' | 'dataSourceApi'
      >;
  const multiRowSelector = getComputed().multiRowSelector;
  const pointerDown = multiRowSelector.lastPointerDown;
  multiRowSelector.lastPointerDown = undefined;

  const getDataSourceState = api.getDataSourceState;

  return updateRowSelectionOnCellClick(
    {
      rowIndex,
      api,
      getComputed,
      getState: api.getState,
      getDataSourceState,
      dataSourceActions,
      dataSourceApi,
      cloneRowSelection: (rowSelection: RowSelectionState<T>) =>
        cloneRowSelection<T>(rowSelection, getDataSourceState),
      cloneTreeSelection: (treeSelection: TreeSelectionState<T>) =>
        cloneTreeSelection<T>(treeSelection, getDataSourceState),
    } as unknown as InfiniteTableEventHandlerAbstractContext<T> & {
      rowIndex: number;
    },
    {
      key: '',
      metaKey: false,
      ctrlKey: false,
      shiftKey: pointerDown?.rowIndex === rowIndex && pointerDown.shiftKey,
      preventDefault: () => {},
    },
    'checkbox',
  );
}
