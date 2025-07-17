export type CellPositionByIndex = {
  rowIndex: number;
  colIndex: number;
};

export type MultiSelectRangeOptions =
  | {
      horizontalLayout: false;
    }
  | {
      horizontalLayout: true;
      rowsPerPage: number;
      columnsPerSet: number;
    };

export function ensureMinMaxCellPositionByIndex(
  start: CellPositionByIndex,
  end: CellPositionByIndex,
) {
  let { rowIndex: startRowIndex, colIndex: startColIndex } = start;
  let { rowIndex: endRowIndex, colIndex: endColIndex } = end;

  const [colStart, colEnd] =
    startColIndex > endColIndex
      ? [endColIndex, startColIndex]
      : [startColIndex, endColIndex];

  const [rowStart, rowEnd] =
    startRowIndex > endRowIndex
      ? [endRowIndex, startRowIndex]
      : [startRowIndex, endRowIndex];

  return [
    { rowIndex: rowStart, colIndex: colStart },
    { rowIndex: rowEnd, colIndex: colEnd },
  ];
}

export function isSamePage(
  startPosition: CellPositionByIndex,
  endPosition: CellPositionByIndex,
  options: { rowsPerPage: number; columnsPerSet: number },
) {
  const { rowsPerPage } = options;

  return !rowsPerPage
    ? true
    : Math.floor(startPosition.rowIndex / rowsPerPage) ===
        Math.floor(endPosition.rowIndex / rowsPerPage);
}

export function getPositionsArrayForRangeInHorizontaLLayout(
  startPosition: CellPositionByIndex,
  endPosition: CellPositionByIndex,
  options: { rowsPerPage: number; columnsPerSet: number },
) {
  if (isSamePage(startPosition, endPosition, options)) {
    throw 'You should not call this when the positions are in the same page';
  }
  const { rowsPerPage, columnsPerSet } = options;

  if (rowsPerPage === 0) {
    throw 'rowsPerPage cannot be 0';
  }

  let start = startPosition;
  let end = endPosition;

  // if the end is in a page prev to the start
  // swap the two
  if (
    Math.floor(startPosition.rowIndex / rowsPerPage) >
    Math.floor(endPosition.rowIndex / rowsPerPage)
  ) {
    start = endPosition;
    end = startPosition;
  }

  let { rowIndex: startRowIndex, colIndex: startColIndex } = start;
  let { rowIndex: endRowIndex, colIndex: endColIndex } = end;

  const pageForStartRowIndex = Math.floor(startRowIndex / rowsPerPage);
  const pageForEndRowIndex = Math.floor(endRowIndex / rowsPerPage);

  const offsetForStartRowIndex = startRowIndex % rowsPerPage;
  const offsetForEndRowIndex = endRowIndex % rowsPerPage;

  const minOffset = Math.min(offsetForStartRowIndex, offsetForEndRowIndex);
  const maxOffset = Math.max(offsetForStartRowIndex, offsetForEndRowIndex);

  const positions: CellPositionByIndex[] = [];

  for (let page = pageForStartRowIndex; page <= pageForEndRowIndex; page++) {
    for (let offset = minOffset; offset <= maxOffset; offset++) {
      const rowIndex = page * rowsPerPage + offset;

      if (page === pageForStartRowIndex) {
        for (
          let colIndex = startColIndex;
          colIndex < columnsPerSet;
          colIndex++
        ) {
          positions.push({ rowIndex, colIndex });
        }
      } else if (page === pageForEndRowIndex) {
        for (let colIndex = 0; colIndex <= endColIndex; colIndex++) {
          positions.push({ rowIndex, colIndex });
        }
      } else {
        for (let colIndex = 0; colIndex < columnsPerSet; colIndex++) {
          positions.push({ rowIndex, colIndex });
        }
      }
    }
  }

  return positions;
}
