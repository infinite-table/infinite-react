import { clamp } from '../../utils/clamp';
import { InfiniteTableKeyboardEventHandlerContext } from './eventHandlerTypes';

export function handleRowNavigation<T>(
  options: InfiniteTableKeyboardEventHandlerContext<T>,
  event: {
    key: string;
  },
) {
  const { getState, getDataSourceState, actions, api } = options;
  const { key } = event;
  const dataArray = getDataSourceState().dataArray;
  const arrLength = dataArray.length;
  const state = getState();

  const { brain } = state;
  let { activeRowIndex } = state;

  if (activeRowIndex == null) {
    return false;
  }

  const {
    start: [startRow],
    end: [endRow],
  } = brain.getRenderRange();

  const renderRowCount = endRow - startRow - 1;

  const min = 0;
  const max = arrLength - 1;
  const KeyToFunction = {
    ArrowDown: () => {
      activeRowIndex = clamp(activeRowIndex! + 1, min, max);
    },
    ArrowUp: () => {
      activeRowIndex = clamp(activeRowIndex! - 1, min, max);
    },
    ArrowLeft: () => {
      const rowInfo = dataArray[activeRowIndex!];
      if (rowInfo && rowInfo.isGroupRow) {
        return api.collapseGroupRow(rowInfo.groupKeys);
      }
      return false;
    },
    ArrowRight: () => {
      const rowInfo = dataArray[activeRowIndex!];
      if (rowInfo && rowInfo.isGroupRow) {
        return api.expandGroupRow(rowInfo.groupKeys);
      }
      return false;
    },
    Enter: () => {
      const rowInfo = dataArray[activeRowIndex!];
      if (rowInfo && rowInfo.isGroupRow) {
        return api.toggleGroupRow(rowInfo.groupKeys);
      }
      return false;
    },
    PageDown: () => {
      activeRowIndex = Math.min(
        activeRowIndex! + renderRowCount,
        arrLength - 1,
      );
    },
    PageUp: () => {
      activeRowIndex = Math.max(activeRowIndex! - renderRowCount, min);
    },
    End: () => {
      activeRowIndex = max;
    },
    Home: () => {
      activeRowIndex = min;
    },
  };

  const Fn = KeyToFunction[key as keyof typeof KeyToFunction];

  if (!Fn) {
    return false;
  }

  Fn();

  actions.activeRowIndex = activeRowIndex;

  return true;
}

export function handleCellNavigation<T>(
  options: InfiniteTableKeyboardEventHandlerContext<T>,
  event: { key: string; shiftKey: boolean },
) {
  const {
    api,

    getState,
    getComputed,
    getDataSourceState,
    actions,
  } = options;
  const { key, shiftKey } = event;

  const dataArray = getDataSourceState().dataArray;
  const state = getState();
  const { activeCellIndex, brain } = state;
  if (!activeCellIndex) {
    return false;
  }

  let [rowIndex, colIndex] = activeCellIndex;

  const {
    start: [startRow, startCol],
    end: [endRow, endCol],
  } = brain.getRenderRange();

  const renderRowCount = endRow - startRow - 1;
  const renderColCount = endCol - startCol - 1;

  const maxRow = getDataSourceState().dataArray.length - 1;
  const maxCol = getComputed().computedVisibleColumns.length - 1;

  const minRow = 0;
  const minCol = 0;

  rowIndex = clamp(rowIndex, 0, maxRow);
  colIndex = clamp(colIndex, 0, maxCol);

  actions.activeCellIndex = [rowIndex, colIndex];

  const KeyToFunction = {
    ArrowDown: () => {
      rowIndex = clamp(rowIndex + 1, minRow, maxRow);
    },
    ArrowUp: () => {
      rowIndex = clamp(rowIndex - 1, minRow, maxRow);
    },
    ArrowLeft: () => {
      colIndex = clamp(colIndex - 1, minCol, maxCol);
    },
    ArrowRight: () => {
      colIndex = clamp(colIndex + 1, minCol, maxCol);
    },
    Enter: () => {
      const rowInfo = dataArray[rowIndex];
      if (rowInfo && rowInfo.isGroupRow) {
        return api.toggleGroupRow(rowInfo.groupKeys);
      }
      return false;
    },
    PageDown: () => {
      if (!shiftKey) {
        rowIndex = Math.min(rowIndex + renderRowCount, maxRow);
      } else {
        colIndex = Math.min(colIndex + renderColCount, maxCol);
      }
    },
    PageUp: () => {
      if (!shiftKey) {
        rowIndex = Math.max(rowIndex - renderRowCount, minRow);
      } else {
        colIndex = Math.max(colIndex - renderColCount, minCol);
      }
    },
    End: () => {
      if (!shiftKey) {
        rowIndex = maxRow;
      } else {
        colIndex = maxCol;
      }
    },
    Home: () => {
      if (!shiftKey) {
        rowIndex = minRow;
      } else {
        colIndex = minCol;
      }
    },
  };
  const Fn = KeyToFunction[key as keyof typeof KeyToFunction];

  if (!Fn) {
    return false;
  }

  Fn();

  actions.activeCellIndex = [rowIndex, colIndex];

  return true;
}

const validKeys: Record<string, boolean> = {
  ArrowUp: true,
  ArrowDown: true,
  ArrowLeft: true,
  ArrowRight: true,
  PageUp: true,
  PageDown: true,
  Home: true,
  End: true,
  Enter: true,
  ' ': true,
};

export function handleKeyboardNavigation<T>(
  options: InfiniteTableKeyboardEventHandlerContext<T>,
  event: {
    key: string;
    shiftKey: boolean;
  },
) {
  const { key } = event;
  const { getState } = options;
  const state = getState();

  const { activeRowIndex, activeCellIndex, keyboardNavigation } = state;

  if (!validKeys[key]) {
    return false;
  }
  if (activeRowIndex != null && keyboardNavigation === 'row') {
    return handleRowNavigation(options, event);
  }

  if (activeCellIndex != null && keyboardNavigation === 'cell') {
    return handleCellNavigation(options, event);
  }

  return false;
}
