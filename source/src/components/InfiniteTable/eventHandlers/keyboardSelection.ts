import { RowSelectionState } from '../../DataSource';
import { rowSelectionStateConfigGetter } from '../api/getSelectionApi';
import { InfiniteTableKeyboardEventHandlerContext } from './eventHandlerTypes';
import { updateRowSelectionOnCellClick } from './onCellClick';

const validKeys: Record<string, boolean> = {
  Enter: true,
  ' ': true,
  a: true,
};

export function handleKeyboardSelection<T>(
  context: InfiniteTableKeyboardEventHandlerContext<T>,
) {
  const {
    getState,
    getDataSourceState,
    dataSourceActions,
    api: imperativeApi,
    key,
    ctrlKey,
    metaKey,
  } = context;

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
    const rowSelectionState = new RowSelectionState(
      rowSelection as RowSelectionState<string>,
      rowSelectionStateConfigGetter(getDataSourceState),
    );

    rowSelectionState.selectAll();

    dataSourceActions.rowSelection = rowSelectionState;
    return true;
  }

  if (key === ' ') {
    if (groupBy.length) {
      if (rowInfo.isGroupRow) {
        imperativeApi.selectionApi.toggleGroupRowSelection(rowInfo.groupKeys);
      } else {
        imperativeApi.selectionApi.toggleRowSelection(rowInfo.id);
      }
      return true;
    } else {
      // no grouping, but space should be treated like a mouse click

      const event = { ...context };
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
