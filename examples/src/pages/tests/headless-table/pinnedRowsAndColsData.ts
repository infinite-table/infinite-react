/**
 * A HeadlessTable used on its own (no InfiniteTable around it), with rows
 * and columns pinned at both ends.
 *
 * Rows and columns have different sizes, so a cell that ends up in the
 * slot of another one is caught by the size checks too.
 */
export const ROWS = 400;
export const COLS = 40;

export const FIXED = {
  fixedRowsStart: 2,
  fixedRowsEnd: 2,
  fixedColsStart: 2,
  fixedColsEnd: 2,
};

export const colWidth = (colIndex: number) => 70 + (colIndex % 4) * 20;
export const rowHeight = (rowIndex: number) => 24 + (rowIndex % 3) * 6;

export const GRID = { width: 800, height: 400 };

export type CellKind = 'corner' | 'pinned-row' | 'pinned-col' | 'normal';

export function getCellKind(rowIndex: number, colIndex: number): CellKind {
  const rowPinned =
    rowIndex < FIXED.fixedRowsStart || rowIndex >= ROWS - FIXED.fixedRowsEnd;
  const colPinned =
    colIndex < FIXED.fixedColsStart || colIndex >= COLS - FIXED.fixedColsEnd;

  return rowPinned && colPinned
    ? 'corner'
    : rowPinned
    ? 'pinned-row'
    : colPinned
    ? 'pinned-col'
    : 'normal';
}

export const CELL_BACKGROUND: Record<CellKind, string> = {
  corner: '#fbbf24',
  'pinned-row': '#fde68a',
  'pinned-col': '#bfdbfe',
  normal: '#ffffff',
};
