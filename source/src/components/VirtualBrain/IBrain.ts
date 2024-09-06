import { OnScrollFn, ScrollPosition } from '../types/ScrollPosition';
import { Size } from '../types/Size';

export type TableRenderRange = {
  start: [number, number];
  end: [number, number];
  rowFixed?: FixedPosition;
  colFixed?: FixedPosition;
};
export type FixedPosition = false | 'start' | 'end';

export type WhichDirection = { horizontal?: boolean; vertical?: boolean };

export const SORT_ASC = (a: number, b: number) => a - b;

export const ALL_DIRECTIONS: WhichDirection = {
  horizontal: true,
  vertical: true,
};

export type ItemSizeFunction = (index: number) => number;
export interface IBrain {
  getColCount: () => number;
  getRowCount: () => number;

  getFixedCellInfo: () => {
    fixedRowsStart: number;
    fixedColsStart: number;
    fixedRowsEnd: number;
    fixedColsEnd: number;
  };

  getRowspanParent: (rowIndex: number, colIndex: number) => number;
  getColspanParent: (rowIndex: number, colIndex: number) => number;

  getRowHeight: (rowIndex: number) => number;
  getColWidth: (colIndex: number) => number;

  getRowHeightWithSpan: (
    rowIndex: number,
    colIndex: number,
    rowspan: number,
  ) => number;

  getColWidthWithSpan: (
    rowIndex: number,
    colIndex: number,
    colspan: number,
  ) => number;

  isRowFixedStart: (rowIndex: number) => boolean;
  isRowFixedEnd: (rowIndex: number) => boolean;

  getScrollPosition: () => ScrollPosition;
  getItemOffsetFor: (
    itemIndex: number,
    direction: 'horizontal' | 'vertical',
  ) => number;

  getItemSize: (
    itemIndex: number,
    direction: 'horizontal' | 'vertical',
  ) => number;

  getItemAt: (
    scrollPos: number,
    direction: 'horizontal' | 'vertical',
  ) => number;

  getAvailableSize: () => Size;

  getFixedStartRowsHeight: () => number;
  getFixedEndRowsHeight: (options?: { skipScroll: boolean }) => number;

  getFixedStartColsWidth: () => number;
  getFixedEndColsWidth: (options?: { skipScroll: boolean }) => number;

  getFixedEndColsOffsets: (options?: { skipScroll: boolean }) => number[];
  getFixedEndRowsOffsets: (options?: { skipScroll: boolean }) => number[];

  isRowFixed: (rowIndex: number) => boolean;
  isColFixed: (colIndex: number) => boolean;

  getRenderRange: () => TableRenderRange;

  getExtraSpanCellsForRange: (options: {
    horizontal: { startIndex: number; endIndex: number };
    vertical: {
      startIndex: number;
      endIndex: number;
    };
  }) => [number, number][];

  getRowspan: (rowIndex: number, colIndex: number) => number;
  getColspan: (rowIndex: number, colIndex: number) => number;

  getCellOffset: (
    rowIndex: number,
    colIndex: number,
  ) => { x: number; y: number };

  name: string;
  onRenderRangeChange: (
    fn: (renderRange: TableRenderRange) => void,
  ) => VoidFunction;
  onScroll: (fn: OnScrollFn) => VoidFunction;
  onAvailableSizeChange: (fn: (size: Size) => void) => VoidFunction;
  onDestroy: (fn: VoidFunction) => void;
  onScrollStart: (fn: VoidFunction) => VoidFunction;
  onScrollStop: (fn: (scrollPos: ScrollPosition) => void) => VoidFunction;
}
