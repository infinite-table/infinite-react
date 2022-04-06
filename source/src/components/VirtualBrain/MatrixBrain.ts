import { Logger } from '../../utils/debug';

import type { OnScrollFn, ScrollPosition } from '../types/ScrollPosition';
import type { Size } from '../types/Size';
import type { VoidFn } from '../types/VoidFn';

import binarySearch from 'binary-search';

export type SpanFunction = ({
  rowIndex,
  colIndex,
}: {
  rowIndex: number;
  colIndex: number;
}) => number;

type RenderRangeType = {
  startIndex: number;
  endIndex: number;
};

type ItemSizeFunction = (index: number) => number;

export type MatrixBrainOptions = {
  width: number;
  height: number;

  cols: number;
  rows: number;

  rowSize: number | ItemSizeFunction;
  colSize: number | ItemSizeFunction;

  rowspan?: SpanFunction;
  colspan?: SpanFunction;
};

export type TableRenderRange = [[number, number], [number, number]];

export const getRenderRangeCellCount = (range: TableRenderRange) => {
  const [start, end] = range;
  const [startRow, startCol] = start;
  const [endRow, endCol] = end;

  const rowCount = endRow - startRow;
  const colCount = endCol - startCol;

  return rowCount * colCount;
};

type WhichDirection = { horizontal?: boolean; vertical?: boolean };

const ALL_DIRECTIONS: WhichDirection = { horizontal: true, vertical: true };
const SORT_ASC = (a: number, b: number) => a - b;

const raf =
  typeof window !== 'undefined'
    ? requestAnimationFrame
    : (fn: () => void) => setTimeout(fn, 0);

export type FnOnRenderRangeChange = (
  range: [[number, number], [number, number]],
  extraCells: [number, number][],
) => void;

export type FnOnRenderCountChange = ({
  horizontal,
  vertical,
}: {
  horizontal: number;
  vertical: number;
}) => void;

export class MatrixBrain extends Logger {
  private width: MatrixBrainOptions['width'] = 0;
  private height: MatrixBrainOptions['height'] = 0;

  private cols: MatrixBrainOptions['cols'] = 0;
  private rows: MatrixBrainOptions['rows'] = 0;

  private rowSize: MatrixBrainOptions['rowSize'] = 0;
  private colSize: MatrixBrainOptions['colSize'] = 0;

  private rowspan: MatrixBrainOptions['rowspan'];
  private colspan: MatrixBrainOptions['colspan'];

  private rowspanParent!: Map<number, number[]>;
  private rowspanValue!: Map<number, number[]>;

  private rowSizeCache!: number[];
  private rowOffsetCache!: number[];

  private verticalTotalSize: number = 0;

  private colspanParent!: Map<number, number[]>;
  private colspanValue!: Map<number, number[]>;

  private colSizeCache!: number[];
  private colOffsetCache!: number[];
  private horizontalTotalSize: number = 0;

  private horizontalRenderCount: number = 0;
  private verticalRenderCount: number = 0;

  private horizontalRenderRange: RenderRangeType = {
    startIndex: 0,
    endIndex: 0,
  };

  private verticalRenderRange: RenderRangeType = { startIndex: 0, endIndex: 0 };

  private extraSpanCells: [number, number][] = [];

  private scrollPosition: ScrollPosition = { scrollLeft: 0, scrollTop: 0 };

  private onScrollFns: OnScrollFn[] = [];
  // private onTotalSizeChangeFns: OnSizeChangeFn[] = [];
  private onRenderRangeChangeFns: FnOnRenderRangeChange[] = [];
  private onDestroyFns: VoidFn[] = [];
  private destroyed: boolean = false;
  private onRenderCountChangeFns: FnOnRenderCountChange[] = [];

  constructor() {
    super(`MatrixBrain`);
    this.reset();
  }

  private reset() {
    this.rowspanParent = new Map();
    this.rowspanValue = new Map();
    this.rowSizeCache = [];
    this.rowOffsetCache = [0];
    this.verticalRenderCount = 0;

    this.colspanParent = new Map();
    this.colspanValue = new Map();
    this.colSizeCache = [];
    this.colOffsetCache = [0];
    this.horizontalRenderCount = 0;

    this.extraSpanCells = [];
  }

  public update = (options: Partial<MatrixBrainOptions>) => {
    const { rows, cols, rowSize, colSize, width, height } = options;

    const widthDefined = typeof width === 'number';
    const heightDefined = typeof height === 'number';

    const widthChanged = widthDefined && width !== this.width;
    const heightChanged = heightDefined && height !== this.height;

    if (widthDefined) {
      this.width = width;
    }
    if (heightDefined) {
      this.height = height;
    }

    const rowsDefined = typeof rows === 'number';
    const colsDefined = typeof cols === 'number';

    const rowsChanged = rowsDefined && rows !== this.rows;
    const colsChanged = colsDefined && cols !== this.cols;

    if (rowsDefined) {
      this.rows = rows;
    }
    if (colsDefined) {
      this.cols = cols;
    }

    const rowSizeDefined = rowSize != null;
    const colSizeDefined = colSize != null;

    const rowSizeChanged = rowSizeDefined && rowSize !== this.rowSize;
    const colSizeChanged = colSizeDefined && colSize !== this.colSize;

    if (rowSizeDefined) {
      this.rowSize = rowSize;
    }
    if (colSizeDefined) {
      this.colSize = colSize;
    }

    if (__DEV__) {
      if (widthChanged) {
        this.debug(
          'New available width %d (size is %d,%d)',
          this.width,
          this.width,
          this.height,
        );
      }
      if (heightChanged) {
        this.debug(
          'New available height %d (size is %d,%d)',
          this.height,
          this.width,
          this.height,
        );
      }

      if (rowsChanged) {
        this.debug('New rows count: %d', this.rows);
      }
      if (colsChanged) {
        this.debug('New cols count: %d', this.cols);
      }
      if (rowSizeChanged) {
        this.debug('New row size', this.rowSize);
      }
      if (colSizeChanged) {
        this.debug('New col size', this.colSize);
      }
    }

    if (options.rowspan && options.rowspan != this.rowspan) {
      this.rowspan = options.rowspan;
    }
    if (options.colspan && options.colspan != this.colspan) {
      this.colspan = options.colspan;
    }

    const horizontalChange = colsChanged || colSizeChanged || widthChanged;
    const verticalChange = rowsChanged || rowSizeChanged || heightChanged;

    if (horizontalChange || verticalChange) {
      this.updateRenderCount({
        horizontal: horizontalChange,
        vertical: verticalChange,
      });
    }
  };

  public setRowAndColumnSizes({
    rowSize,
    colSize,
  }: {
    rowSize: number | ItemSizeFunction;
    colSize: number | ItemSizeFunction;
  }) {
    const horizontalSame = colSize === this.colSize;
    const verticalSame = rowSize === this.rowSize;

    this.rowSize = rowSize;
    this.colSize = colSize;

    this.updateRenderCount({
      horizontal: !horizontalSame,
      vertical: !verticalSame,
    });
  }

  public setRowsAndCols = ({ rows, cols }: { rows: number; cols: number }) => {
    const rowsSame = rows === this.rows;
    const colsSame = cols === this.cols;

    this.rows = rows;
    this.cols = cols;

    this.updateRenderCount({
      horizontal: !colsSame,
      vertical: !rowsSame,
    });
  };

  public setAvailableSize(size: Size) {
    const widthSame = size.width === this.width;
    const heightSame = size.height === this.height;
    if (widthSame && heightSame) {
      return;
    }
    this.width = size.width;
    this.height = size.height;

    if (__DEV__) {
      this.debug(
        'New available size: width %d, height %d',
        this.width,
        this.height,
      );
    }

    this.updateRenderCount({ horizontal: !widthSame, vertical: !heightSame });
  }

  updateRenderCount(which: WhichDirection = ALL_DIRECTIONS) {
    if (!this.width || !this.height) {
      this.setRenderCount({ horizontal: 0, vertical: 0 });
    }

    this.setRenderCount(this.computeRenderCount(which));
  }

  public setScrollPosition = (scrollPosition: ScrollPosition) => {
    const changeHorizontal =
      scrollPosition.scrollLeft !== this.scrollPosition.scrollLeft;
    const changeVertical =
      scrollPosition.scrollTop !== this.scrollPosition.scrollTop;

    this.scrollPosition = scrollPosition;

    if (changeHorizontal || changeVertical) {
      this.updateRenderRange({
        horizontal: changeHorizontal,
        vertical: changeVertical,
      });

      this.notifyScrollChange();
    }
  };

  private notifyScrollChange() {
    const { scrollPosition } = this;

    const fns = this.onScrollFns;
    for (let i = 0, len = fns.length; i < len; i++) {
      fns[i](scrollPosition);
    }
  }

  private computeDirectionalRenderCount = (
    direction: 'horizontal' | 'vertical',
    itemSize: number | ItemSizeFunction,
    count: number,
    theSize: Size,
  ) => {
    let renderCount = 0;

    const size = direction === 'horizontal' ? theSize.width : theSize.height;

    if (typeof itemSize === 'function') {
      const sizes = [];
      for (let i = 0; i < count; i++) {
        sizes.push(this.getItemSize(i, direction));
      }
      sizes.sort(SORT_ASC);
      let sum = 0;
      for (let i = 0; i < count; i++) {
        sum += sizes[i];

        renderCount++;
        if (sum > size) {
          break;
        }
      }
      renderCount += 1;
    } else {
      renderCount = Math.ceil(size / itemSize) + 1;
    }

    renderCount = Math.min(count, renderCount);

    return renderCount;
  };

  computeRenderCount = (which: WhichDirection = ALL_DIRECTIONS) => {
    const recomputeHorizontal = which.horizontal;
    const recomputeVertical = which.vertical;

    let horizontalRenderCount = this.horizontalRenderCount;
    let verticalRenderCount = this.verticalRenderCount;

    if (recomputeHorizontal) {
      horizontalRenderCount = this.computeDirectionalRenderCount(
        'horizontal',
        this.colSize,
        this.cols,
        this.getAvailableSize(),
      );
    }
    if (recomputeVertical) {
      verticalRenderCount = this.computeDirectionalRenderCount(
        'vertical',
        this.rowSize,
        this.rows,
        this.getAvailableSize(),
      );
    }
    const result = {
      horizontal: horizontalRenderCount,
      vertical: verticalRenderCount,
    };
    return result;
  };

  setRenderCount = ({
    horizontal,
    vertical,
  }: {
    horizontal: number;
    vertical: number;
  }) => {
    const horizontalSame = horizontal === this.horizontalRenderCount;
    const verticalSame = vertical === this.verticalRenderCount;

    if (horizontalSame && verticalSame) {
      return;
    }

    this.horizontalRenderCount = horizontal;
    this.verticalRenderCount = vertical;

    this.updateRenderRange({
      horizontal: !horizontalSame,
      vertical: !verticalSame,
    });

    this.notifyRenderCountChange();
  };

  private notifyRenderCountChange() {
    const { horizontalRenderCount, verticalRenderCount } = this;

    const renderCount = {
      horizontal: horizontalRenderCount,
      vertical: verticalRenderCount,
    };

    const fns = this.onRenderCountChangeFns;
    for (let i = 0, len = fns.length; i < len; i++) {
      raf(() => {
        fns[i](renderCount);
      });
    }
  }

  public updateRenderRange = (which: WhichDirection = ALL_DIRECTIONS) => {
    this.setRenderRange(this.computeRenderRange(which));
  };

  computeRenderRange = (which: WhichDirection = ALL_DIRECTIONS) => {
    const horizontal = which.horizontal
      ? this.computeDirectionalRenderRange('horizontal')
      : this.horizontalRenderRange;

    const vertical = which.vertical
      ? this.computeDirectionalRenderRange('vertical')
      : this.verticalRenderRange;

    const { colspan, rowspan } = this;

    const extraCells: [number, number][] = [];

    // if (colspan) {
    //   const colStart = horizontal.startIndex;
    //   const colEnd = horizontal.endIndex;
    //   const rowStart = vertical.startIndex;

    //   for (let colIndex = colStart; colIndex < colEnd; colIndex++) {
    //     this.computeItemSpanUpTo(rowStart, colIndex, 'horizontal');

    //     if (this.colspanParent[colIndex] != colIndex) {
    //       let index = colIndex;
    //       while (this.colspanParent[index] != index) {
    //         index--;
    //       }
    //       if (index < colStart) {
    //         extraCells.push([rowStart, index]);
    //       }
    //     }
    //   }
    // }

    if (rowspan) {
      const rowStart = vertical.startIndex;

      const colStart = horizontal.startIndex;
      const colEnd = horizontal.endIndex;

      // for each rendered column, compute span for the cells in
      // the first row in the render range
      for (let colIndex = colStart; colIndex < colEnd; colIndex++) {
        this.computeItemSpanUpTo(rowStart, colIndex, 'vertical');

        const rowspanParent = this.rowspanParent.get(colIndex)!;

        if (rowspanParent[rowStart] != rowStart) {
          let rowIndex = rowStart;
          while (rowspanParent[rowIndex] != rowIndex) {
            rowIndex--;
          }

          extraCells.push([rowIndex, colIndex]);
        }
      }
    }

    if (colspan) {
      const colStart = horizontal.startIndex;
      const rowStart = vertical.startIndex;
      const rowEnd = vertical.endIndex;

      // for each rendered row, compute span for the cells in
      // the first column in the render range
      for (let rowIndex = rowStart; rowIndex < rowEnd; rowIndex++) {
        this.computeItemSpanUpTo(rowIndex, colStart, 'horizontal');

        const colspanParent = this.colspanParent.get(rowIndex)!;

        if (colspanParent[colStart] != colStart) {
          let colIndex = colStart;
          while (colspanParent[colIndex] != colIndex) {
            colIndex--;
          }

          extraCells.push([rowIndex, colIndex]);
        }
      }
    }

    return {
      horizontal,
      vertical,
      extraCells,
    };
  };

  computeDirectionalRenderRange = (direction: 'horizontal' | 'vertical') => {
    const renderCount =
      direction === 'horizontal'
        ? this.horizontalRenderCount
        : this.verticalRenderCount;
    const count = direction === 'horizontal' ? this.cols : this.rows;

    if (renderCount === 0) {
      return {
        startIndex: 0,
        endIndex: 0,
      };
    }

    const scrollPositionForDirection =
      direction === 'horizontal'
        ? this.scrollPosition.scrollLeft
        : this.scrollPosition.scrollTop;

    let startIndex = this.getItemAt(scrollPositionForDirection, direction);

    let endIndex = startIndex + renderCount;

    if (endIndex > count) {
      // console.log('start', startIndex, 'end', endIndex, 'count', count);
      endIndex = count;
      startIndex = endIndex - renderCount;
    }

    /**
     * 
    //TODO continue here we can avoid doing this expand here
    // if the renderStartIndex row is spanned over, we only need to render the span parent instead
    // of the current row - so big wins
    if (this.options.itemSpan) {
      this.computeItemSpanUpTo(renderStartIndex);

      while (this.itemSpanParent[renderStartIndex] != renderStartIndex) {
        renderStartIndex--;
      }
    }
     */
    return {
      startIndex,
      endIndex,
    };
  };

  getItemAt = (scrollPos: number, direction: 'horizontal' | 'vertical') => {
    const itemSize = direction === 'horizontal' ? this.colSize : this.rowSize;
    const count = direction === 'horizontal' ? this.cols : this.rows;

    if (typeof itemSize !== 'function') {
      return Math.min(Math.max(0, Math.floor(scrollPos / itemSize)), count - 1);
    }

    const itemOffsetCache =
      direction === 'horizontal' ? this.colOffsetCache : this.rowOffsetCache;
    const itemSizeCache =
      direction === 'horizontal' ? this.colSizeCache : this.rowSizeCache;

    let lastOffsetIndex = itemOffsetCache.length - 1;
    let lastSizeIndex = itemSizeCache.length - 1;
    let lastOffset = itemOffsetCache[lastOffsetIndex];

    let _prev: number;

    while (lastOffset < scrollPos) {
      if (lastOffsetIndex >= count) {
        return count - 1;
      }
      lastSizeIndex += 1;
      this.computeCacheFor(lastSizeIndex, direction);
      _prev = lastOffset;
      lastOffset = itemOffsetCache[lastSizeIndex];
      if (_prev === lastOffset && _prev != 0) {
        return count - 1;
      }
    }

    const searchResult = binarySearch(itemOffsetCache, scrollPos, SORT_ASC);

    if (searchResult >= 0) {
      return searchResult;
    }

    return ~searchResult - 1;

    return 0;
  };

  public getCellOffset = (rowIndex: number, colIndex: number) => {
    return {
      x: this.getItemOffsetFor(colIndex, 'horizontal'),
      y: this.getItemOffsetFor(rowIndex, 'vertical'),
    };
  };

  private getItemOffsetFor = (
    itemIndex: number,
    direction: 'horizontal' | 'vertical',
  ): number => {
    const itemSize = direction === 'horizontal' ? this.colSize : this.rowSize;
    if (typeof itemSize !== 'function') {
      return itemIndex * itemSize;
    }
    const itemOffsetCache =
      direction === 'horizontal' ? this.colOffsetCache : this.rowOffsetCache;
    const itemSizeCache =
      direction === 'horizontal' ? this.colSizeCache : this.rowSizeCache;

    let result = itemOffsetCache[itemIndex];

    if (result == null) {
      let lastSizeIndex = itemSizeCache.length - 1;

      while (lastSizeIndex < itemIndex) {
        lastSizeIndex += 1;
        this.computeCacheFor(lastSizeIndex, direction);
      }

      result = itemOffsetCache[itemIndex];
    }
    return result;
  };

  private computeCacheFor = (
    itemIndex: number,
    direction: 'horizontal' | 'vertical',
  ) => {
    const itemSizeValueOrFn =
      direction === 'horizontal' ? this.colSize : this.rowSize;
    const itemSizeCache =
      direction === 'horizontal' ? this.colSizeCache : this.rowSizeCache;
    const itemOffsetCache =
      direction === 'horizontal' ? this.colOffsetCache : this.rowOffsetCache;
    if (typeof itemSizeValueOrFn !== 'function') {
      return;
    }

    const itemSize: number = itemSizeValueOrFn(itemIndex);
    itemSizeCache[itemIndex] = itemSize;

    if (itemIndex > 0) {
      const prevOffset = itemOffsetCache[itemIndex - 1];
      const prevSize = itemSizeCache[itemIndex - 1];
      if (prevOffset == null) {
        console.error(
          `Offset was not available for ${
            direction === 'horizontal' ? 'col' : 'row'
          } ${itemIndex - 1}`,
        );
      }
      if (prevSize == null) {
        console.error(
          `Size was not available for ${
            direction === 'horizontal' ? 'col' : 'row'
          } ${itemIndex - 1}`,
        );
      }
      const offset = prevOffset + prevSize;
      itemOffsetCache[itemIndex] = offset;
    }
  };

  private getItemSizeCacheFor(
    itemIndex: number,
    direction: 'horizontal' | 'vertical',
  ): number {
    return (direction === 'horizontal' ? this.colSizeCache : this.rowSizeCache)[
      itemIndex
    ];
  }

  private computeItemSpanUpTo = (
    rowIndex: number,
    colIndex: number,
    direction: 'horizontal' | 'vertical',
  ) => {
    const itemIndex = direction === 'horizontal' ? colIndex : rowIndex;
    const otherIndex = direction === 'horizontal' ? rowIndex : colIndex;

    const count = direction === 'horizontal' ? this.cols : this.rows;
    const itemSpan = direction === 'horizontal' ? this.colspan : this.rowspan;

    if (!itemSpan) {
      return;
    }

    const directionCache =
      direction === 'horizontal' ? this.colspanParent : this.rowspanParent;
    if (!directionCache.has(otherIndex)) {
      directionCache.set(otherIndex, []);
    }

    const directionSpanResult =
      direction === 'horizontal' ? this.colspanValue : this.rowspanValue;

    if (!directionSpanResult.has(otherIndex)) {
      directionSpanResult.set(otherIndex, []);
    }

    const cache = directionCache.get(otherIndex)!;
    const spanResultArr = directionSpanResult.get(otherIndex)!;

    if (cache[itemIndex] === undefined) {
      let i = cache.length;
      let lastIndex = Math.min(itemIndex, count - 1);

      const cell = { rowIndex, colIndex };

      for (; i <= lastIndex; i++) {
        if (cache[i] === undefined) {
          cell[direction === 'horizontal' ? 'colIndex' : 'rowIndex'] = i;
          let spanValue = itemSpan(cell);

          if (__DEV__ && spanValue < 1) {
            this.debug(
              `${
                direction === 'horizontal' ? 'colspan' : 'rowspan'
              } cannot be less than 1 - got %d for index %d`,
              spanValue,
              i,
            );
          }
          // this is it's own span parent
          cache[i] = i;
          spanResultArr[i] = spanValue;

          let spannedItemIndex: number = i;
          while (spanValue > 1) {
            spannedItemIndex += 1;
            cache[spannedItemIndex] = i;
            spanResultArr[spannedItemIndex] = 0;

            spanValue -= 1;
          }
        }
      }
    }
  };

  private getCellSpan = (
    rowIndex: number,
    colIndex: number,
    direction: 'horizontal' | 'vertical',
  ) => {
    const itemSpan = direction === 'horizontal' ? this.colspan : this.rowspan;
    const itemIndex = direction === 'horizontal' ? colIndex : rowIndex;
    const otherIndex = direction === 'horizontal' ? rowIndex : colIndex;

    if (!itemSpan) {
      return 1;
    }
    const directionSpanValue =
      direction === 'horizontal' ? this.colspanValue : this.rowspanValue;

    let itemSpanValue = directionSpanValue.get(otherIndex);

    if (!itemSpanValue || itemSpanValue[itemIndex] === undefined) {
      this.computeItemSpanUpTo(rowIndex, colIndex, direction);
    }
    if (!itemSpanValue) {
      itemSpanValue = directionSpanValue.get(otherIndex);
    }

    return itemSpanValue![itemIndex] || 1;
  };

  getRowspan = (rowIndex: number, colIndex: number) => {
    return this.getCellSpan(rowIndex, colIndex, 'vertical');
  };
  getColspan = (rowIndex: number, colIndex: number) => {
    return this.getCellSpan(rowIndex, colIndex, 'horizontal');
  };

  getRowspanParent = (rowIndex: number, colIndex: number) => {
    return this.getItemSpanParent(rowIndex, colIndex, 'vertical');
  };
  getColspanParent = (rowIndex: number, colIndex: number) => {
    return this.getItemSpanParent(rowIndex, colIndex, 'horizontal');
  };

  getItemSpanParent = (
    rowIndex: number,
    colIndex: number,
    direction: 'horizontal' | 'vertical',
  ) => {
    const itemSpan = direction == 'horizontal' ? this.colspan : this.rowspan;
    const itemIndex = direction === 'horizontal' ? colIndex : rowIndex;
    const otherIndex = direction === 'horizontal' ? rowIndex : colIndex;
    if (!itemSpan) {
      return itemIndex;
    }
    const directionSpanParent =
      direction === 'horizontal' ? this.colspanParent : this.rowspanParent;
    let itemSpanParent = directionSpanParent.get(otherIndex);
    if (!itemSpanParent || itemSpanParent[itemIndex] === undefined) {
      this.computeItemSpanUpTo(rowIndex, colIndex, direction);
    }
    if (!itemSpanParent) {
      itemSpanParent = directionSpanParent.get(otherIndex);
    }
    return itemSpanParent![itemIndex];
  };

  public getRowHeightWithSpan = (rowIndex: number, rowspan: number) => {
    return this.getItemSizeWithSpan(rowIndex, 0, rowspan, 'vertical');
  };
  public getColWidthWithSpan = (colIndex: number, colspan: number) => {
    return this.getItemSizeWithSpan(colIndex, 0, colspan, 'horizontal');
  };

  private getItemSizeWithSpan = (
    rowIndex: number,
    colIndex: number,
    itemSpan: number,
    direction: 'horizontal' | 'vertical',
  ) => {
    let itemIndex = direction === 'horizontal' ? colIndex : rowIndex;
    let itemSize = this.getItemSize(itemIndex, direction);

    while (itemSpan > 1) {
      itemIndex += 1;
      itemSpan -= 1;
      itemSize += this.getItemSize(itemIndex, direction);
    }

    return itemSize;
  };

  getRowHeight = (rowIndex: number) => {
    return this.getItemSize(rowIndex, 'vertical');
  };

  getColWidth = (colIndex: number) => {
    return this.getItemSize(colIndex, 'horizontal');
  };

  /**
   * For now, this doesn't take into account the row/colspan, and it's okay not to
   * @param itemIndex
   * @returns the size of the specified item
   */
  getItemSize = (
    itemIndex: number,
    direction: 'horizontal' | 'vertical',
  ): number => {
    const count = direction === 'horizontal' ? this.cols : this.rows;
    const itemSize = direction === 'horizontal' ? this.colSize : this.rowSize;

    if (typeof itemSize !== 'function') {
      return itemSize;
    }

    // we make sure when we request the size for an item at a given index
    // all previous items have their size cached

    // we could take a more optimized approach, but for now, we only have
    // itemMainAxisSize as a function for column virtualization
    // which doesn't need a more performant approach right now, as we dont expect a column count > 10k

    let cachedSize = this.getItemSizeCacheFor(itemIndex, direction);

    const itemSizeCache =
      direction === 'horizontal' ? this.colSizeCache : this.rowSizeCache;
    if (cachedSize === undefined) {
      let i = itemSizeCache.length;
      let lastIndex = Math.min(itemIndex, count - 1);

      for (; i <= lastIndex; i++) {
        this.computeCacheFor(i, direction);
      }
      cachedSize = this.getItemSizeCacheFor(itemIndex, direction);
    }

    return cachedSize;
  };

  getTotalSize = () => {
    return {
      height: this.getTotalSizeFor('vertical'),
      width: this.getTotalSizeFor('horizontal'),
    };
  };

  private getTotalSizeFor = (direction: 'horizontal' | 'vertical') => {
    const count = direction === 'horizontal' ? this.cols : this.rows;
    const itemSize = direction === 'horizontal' ? this.colSize : this.rowSize;
    const totalSize =
      direction === 'horizontal'
        ? this.horizontalTotalSize
        : this.verticalTotalSize;

    if (typeof itemSize !== 'function') {
      return itemSize * count;
    }

    if (totalSize !== 0) {
      return totalSize;
    }

    const itemOffsetCache =
      direction === 'horizontal' ? this.colOffsetCache : this.rowOffsetCache;
    const lastItemSize = this.getItemSize(count - 1, direction);

    const lastItemOffset = itemOffsetCache[count - 1];

    const result = lastItemSize + lastItemOffset;

    if (direction === 'horizontal') {
      this.horizontalTotalSize = result;
    } else {
      this.verticalTotalSize = result;
    }

    return result;
  };

  setRenderRange = ({
    horizontal,
    vertical,
    extraCells,
  }: {
    horizontal: RenderRangeType;
    vertical: RenderRangeType;
    extraCells?: [number, number][];
  }) => {
    let horizontalChange = false;
    if (
      horizontal.startIndex !== this.horizontalRenderRange.startIndex ||
      horizontal.endIndex !== this.horizontalRenderRange.endIndex
    ) {
      this.horizontalRenderRange = horizontal;
      horizontalChange = true;
    }

    let verticalChange = false;
    if (
      vertical.startIndex !== this.verticalRenderRange.startIndex ||
      vertical.endIndex !== this.verticalRenderRange.endIndex
    ) {
      this.verticalRenderRange = vertical;
      verticalChange = true;
    }

    this.extraSpanCells = extraCells || [];

    if (horizontalChange || verticalChange) {
      this.notifyRenderRangeChange();
    }
  };

  getRenderRangeCellCount = getRenderRangeCellCount;

  getExtraCells = (): [number, number][] => {
    return this.extraSpanCells;
  };

  getRenderRange = () => {
    return [
      [
        this.verticalRenderRange.startIndex,
        this.horizontalRenderRange.startIndex,
      ],
      [this.verticalRenderRange.endIndex, this.horizontalRenderRange.endIndex],
    ] as TableRenderRange;
  };

  onScroll = (fn: OnScrollFn) => {
    this.onScrollFns.push(fn);
    return () => {
      this.onScrollFns = this.onScrollFns.filter((f) => f !== fn);
    };
  };

  onRenderRangeChange = (fn: FnOnRenderRangeChange) => {
    this.onRenderRangeChangeFns.push(fn);

    return () => {
      this.onRenderRangeChangeFns = this.onRenderRangeChangeFns.filter(
        (f) => f !== fn,
      );
    };
  };

  onRenderCountChange = (fn: FnOnRenderCountChange) => {
    this.onRenderCountChangeFns.push(fn);

    return () => {
      this.onRenderCountChangeFns = this.onRenderCountChangeFns.filter(
        (f) => f !== fn,
      );
    };
  };

  public onDestroy = (fn: VoidFn) => {
    this.onDestroyFns.push(fn);

    return () => {
      this.onDestroyFns = this.onDestroyFns.filter((f) => f !== fn);
    };
  };

  notifyRenderRangeChange = () => {
    const fns = this.onRenderRangeChangeFns;

    const range = this.getRenderRange();
    const extraCells = this.extraSpanCells;

    for (let i = 0, len = fns.length; i < len; i++) {
      raf(() => {
        fns[i](range, extraCells);
      });
    }
  };

  public getAvailableSize = () => {
    return {
      width: this.width,
      height: this.height,
    };
  };

  private notifyDestroy() {
    const fns = this.onDestroyFns;
    for (let i = 0, len = fns.length; i < len; i++) {
      fns[i]();
    }
  }

  destroy = () => {
    if (this.destroyed) {
      return;
    }
    this.notifyDestroy();

    this.reset();

    this.rowspanParent.clear();
    this.colspanParent.clear();
    this.destroyed = true;
    this.onDestroyFns = [];
    this.onScrollFns = [];
    this.onRenderCountChangeFns = [];
    this.onRenderRangeChangeFns = [];
  };
}
