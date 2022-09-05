import { RowSelectionState } from '../../DataSource';
import { InfiniteTableEventHandlerAbstractContext } from './eventHandlerTypes';
import { updateRowSelectionOnCellClick } from './onCellClick';

const validKeys: Record<string, boolean> = {
  Enter: true,
  ' ': true,
  a: true,
};

export function handleKeyboardSelection<T>(
  context: InfiniteTableEventHandlerAbstractContext<T>,
  keyboardEvent: {
    key: string;
    metaKey: boolean;
    ctrlKey: boolean;
    shiftKey: boolean;
    preventDefault: VoidFunction;
  },
) {
  const {
    getState,
    getDataSourceState,
    dataSourceActions,
    api: imperativeApi,
    cloneRowSelection,
  } = context;
  const { key, ctrlKey, metaKey } = keyboardEvent;

  if (!validKeys[key]) {
    return false;
  }

  const state = getState();
  const dataSourceState = getDataSourceState();

  const {
    activeRowIndex,
    activeCellIndex,
    keyboardNavigation,
    keyboardSelection,
  } = state;

  const { selectionMode, groupBy, rowSelection } = dataSourceState;

  if (keyboardSelection === false) {
    return false;
  }

  const rowIndex =
    keyboardNavigation === 'row' && activeRowIndex != null
      ? activeRowIndex
      : keyboardNavigation === 'cell' && activeCellIndex != null
      ? activeCellIndex[0]
      : null;

  const rowInfo = rowIndex != null ? dataSourceState.dataArray[rowIndex] : null;

  if (!rowInfo || rowIndex == null) {
    return false;
  }

  if (selectionMode === 'single-row' && key === ' ') {
    imperativeApi.selectionApi.toggleRowSelection(rowInfo.id);
    return true;
  }

  if (selectionMode !== 'multi-row') {
    return false;
  }

  if (key === 'a' && (ctrlKey || metaKey)) {
    const rowSelectionState = cloneRowSelection(
      rowSelection as RowSelectionState<T>,
    );

    rowSelectionState.selectAll();

    dataSourceActions.rowSelection = rowSelectionState;
    return true;
  }

  if (key === ' ') {
    if (groupBy.length) {
      if (rowInfo.isGroupRow && rowInfo.groupKeys) {
        imperativeApi.selectionApi.toggleGroupRowSelection(rowInfo.groupKeys);
      } else {
        imperativeApi.selectionApi.toggleRowSelection(rowInfo.id);
      }
      return true;
    } else {
      // no grouping, but space should be treated like a mouse click

      const event = { ...keyboardEvent };
      const { renderSelectionCheckBox } = context.getComputed();

      // if we have a selection checkbox column, then we wont allow shift be used with the space key
      if (renderSelectionCheckBox) {
        // event.shiftKey = false;
        event.metaKey = false;
        // but rather make the selection only additive
        event.ctrlKey = true;
      }

      return updateRowSelectionOnCellClick({ ...context, rowIndex }, event);
    }
  }

  return false;
}
