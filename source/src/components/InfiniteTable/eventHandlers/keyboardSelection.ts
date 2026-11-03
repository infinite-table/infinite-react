import { RowSelectionState } from '../../DataSource';
import { TreeSelectionState } from '../../DataSource/TreeSelectionState';
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
    cloneRowSelection,
    cloneTreeSelection,
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

  const {
    selectionMode,
    rowSelection,
    treeSelectionState: treeSelection,
    isTree,
  } = dataSourceState;

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

  if (
    key === ' ' &&
    (selectionMode === 'single-row' || selectionMode === 'multi-row')
  ) {
    // space works like a click on the row - or like a click on its
    // selection checkbox, when selecting with checkboxes

    // explicit copy instead of a spread: native DOM events (Vue) keep
    // their props on the prototype, so a spread would lose them
    const event = {
      key: keyboardEvent.key,
      metaKey: keyboardEvent.metaKey,
      ctrlKey: keyboardEvent.ctrlKey,
      shiftKey: keyboardEvent.shiftKey,
      preventDefault: () => keyboardEvent.preventDefault(),
    };

    return updateRowSelectionOnCellClick(
      { ...context, rowIndex },
      event,
      'keyboard',
    );
  }

  if (selectionMode !== 'multi-row') {
    return false;
  }

  if (key === 'a' && (ctrlKey || metaKey)) {
    if (isTree && treeSelection) {
      const treeSelectionState = cloneTreeSelection(
        treeSelection as TreeSelectionState,
      );

      treeSelectionState.selectAll();
      dataSourceActions.treeSelection = treeSelectionState;
      return true;
    }
    const rowSelectionState = cloneRowSelection(
      rowSelection as RowSelectionState<T>,
    );

    rowSelectionState.selectAll();

    dataSourceActions.rowSelection = rowSelectionState;
    return true;
  }

  return false;
}
