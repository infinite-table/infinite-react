import binarySearch from 'binary-search';

import { Logger } from '../../utils/debug';
import type { OnScrollFn, ScrollPosition } from '../types/ScrollPosition';
import type { Size } from '../types/Size';
import type { VoidFn } from '../types/VoidFn';
import type {
  IBrain,
  TableRenderRange,
  FixedPosition,
  WhichDirection,
  ItemSizeFunction,
} from './IBrain';

import { SORT_ASC, ALL_DIRECTIONS } from './IBrain';

export type { FixedPosition };
export type SpanFunction = ({
  rowIndex,
  colIndex,
}: {
  rowIndex: number;
  colIndex: number;
}) => number;

export type RenderRangeType = {
  startIndex: number;
  endIndex: number;
};

export type MatrixBrainOptions = {
  width: number;
  height: number;

  cols: number;
  rows: number;

  rowHeight: number | ItemSizeFunction;
  colWidth: number | ItemSizeFunction;

  rowspan?: SpanFunction;
  colspan?: SpanFunction;
};

export type { TableRenderRange };

export const getRenderRangeCellCount = (range: TableRenderRange) => {
  const { start, end } = range;
  const [startRow, startCol] = start;
  const [endRow, endCol] = end;

  const rowCount = endRow - startRow;
  const colCount = endCol - startCol;

  return rowCount * colCount;
};

export const getRenderRangeRowCount = (range: TableRenderRange) => {
  const { start, end } = range;
  const [startRow] = start;
  const [endRow] = end;

  const rowCount = endRow - startRow;

  return rowCount;
};

const raf =
  typeof window !== 'undefined'
    ? requestAnimationFrame
    : (fn: () => void) => setTimeout(fn, 0);

export type FnOnRenderRangeChange = (range: TableRenderRange) => void;
export type FnOnDirectionalRenderRangeChange = (
  range: [number, number],
) => void;

export type FnOnRenderCountChange = ({
  horizontal,
  vertical,
}: {
  horizontal: number;
  vertical: number;
}) => void;

export type OnAvailableSizeChange = (size: Size) => void;

export type FnOnScrollStop = (
  scrollPosition: ScrollPosition,
  range: TableRenderRange,
) => void;

export type ShouldUpdateRenderCountOptions = {
  horizontalChange: boolean;

  colsChanged: boolean;
  colWidthChanged: boolean;
  widthChanged: boolean;
  colspanChanged: boolean;

  verticalChange: boolean;

  rowsChanged: boolean;
  rowHeightChanged: boolean;
  heightChanged: boolean;
  rowspanChanged: boolean;
};

function defaultShouldUpdateRenderCount(
  options: ShouldUpdateRenderCountOptions,
) {
  return options.horizontalChange || options.verticalChange;
}

export class MatrixBrain extends Logger implements IBrain {
  private scrolling = false;
  protected availableWidth: MatrixBrainOptions['width'] = 0;
  protected availableRenderWidth: number = 0;
  public isHorizontalLayoutBrain = false;
  public name: string = '';

  protected availableHeight: MatrixBrainOptions['height'] = 0;
  protected availableRenderHeight: number = 0;

  protected cols: MatrixBrainOptions['cols'] = 0;
  protected rows: MatrixBrainOptions['rows'] = 0;

  protected alwaysRenderedColumns: Set<number> = new Set();

  /**
   * This is only here for easier accessing in the renderer, when the horizontal layout is enabled.
   * In this way, the API is the same for both brains, so we don't have to cast the brain type in the renderer.
   */
  set rowsPerPage(rowsPerPage: number) {
    if (rowsPerPage != this._rowsPerPage) {
      this._rowsPerPage = rowsPerPage;
    }
  }

  get rowsPerPage() {
    return this._rowsPerPage;
  }
  protected _rowsPerPage = 0;

  protected rowHeight: MatrixBrainOptions['rowHeight'] = 0;
  protected colWidth: MatrixBrainOptions['colWidth'] = 0;

  private rowspan: MatrixBrainOptions['rowspan'];
  private colspan: MatrixBrainOptions['colspan'];

  private rowspanParent!: Map<number, number[]>;
  private rowspanValue!: Map<number, number[]>;

  protected rowHeightCache!: number[];
  protected rowOffsetCache!: number[];

  private verticalTotalSize = 0;

  private colspanParent!: Map<number, number[]>;
  private colspanValue!: Map<number, number[]>;

  protected colWidthCache!: number[];
  protected colOffsetCache!: number[];
  private horizontalTotalSize = 0;

  private horizontalRenderCount?: number = undefined;
  private verticalRenderCount?: number = undefined;

  private horizontalExtendRangeBy: { start: number; end: number } = {
    start: 0,
    end: 0,
  };
  private verticalExtendRangeBy: { start: number; end: number } = {
    start: 0,
    end: 0,
  };

  protected horizontalRenderRange: RenderRangeType = {
    startIndex: 0,
    endIndex: 0,
  };

  protected verticalRenderRange: RenderRangeType = {
    startIndex: 0,
    endIndex: 0,
  };

  protected extraSpanCells: [number, number][] = [];

  private scrollPosition: ScrollPosition = { scrollLeft: 0, scrollTop: 0 };

  private onScrollFns: OnScrollFn[] = [];
  // private onTotalSizeChangeFns: OnSizeChangeFn[] = [];
  private onRenderRangeChangeFns: Set<FnOnRenderRangeChange> = new Set();

  private onVerticalRenderRangeChangeFns: Set<FnOnDirectionalRenderRangeChange> =
    new Set();
  private onHorizontalRenderRangeChangeFns: Set<FnOnDirectionalRenderRangeChange> =
    new Set();

  private onDestroyFns: VoidFn[] = [];
  protected destroyed = false;
  private onRenderCountChangeFns: Set<FnOnRenderCountChange> = new Set();
  private onAvailableSizeChangeFns: Set<OnAvailableSizeChange> = new Set();
  private onScrollStartFns: VoidFunction[] = [];
  private onScrollStopFns: FnOnScrollStop[] = [];

  private scrollTimeoutId = 0;
  private scrollStopDelay = 250;

  /**
   * Number of columns that are fixed at the start
   */
  private fixedColsStart = 0;
  /**
   * Number of columns that are fixed at the end
   */
  private fixedColsEnd = 0;
  /**
   * Number of rows that are fixed at the start
   */
  private fixedRowsStart = 0;
  /**
   * Number of rows that are fixed at the end
   */
  private fixedRowsEnd = 0;

  constructor(name: string) {
    const logName = `MatrixBrain${name ? `:${name}` : ''}`;
    super(logName);
    this.name = name || 'MatrixBrain';

    this.update = this.update.bind(this);
    this.destroy = this.destroy.bind(this);

    this.getCellOffset = this.getCellOffset.bind(this);

    this.reset();
  }

  private reset(which: WhichDirection = ALL_DIRECTIONS) {
    if (which.vertical) {
      this.resetVertical();
    }

    if (which.horizontal) {
      this.resetHorizontal();
    }

    this.extraSpanCells = [];
  }

  private resetVertical() {
    this.rowspanParent = new Map();
    this.rowspanValue = new Map();
    this.rowHeightCache = [];
    this.rowOffsetCache = [0];
    this.verticalRenderCount = undefined;
    this.verticalTotalSize = 0;
  }
  private resetHorizontal() {
    this.colspanParent = new Map();
    this.colspanValue = new Map();
    this.colWidthCache = [];
    this.colOffsetCache = [0];
    this.horizontalRenderCount = undefined;
    this.horizontalTotalSize = 0;
  }

  public setScrollStopDelay = (scrollStopDelay: number) => {
    this.scrollStopDelay = scrollStopDelay;
  };

  public getVirtualColIndex(colIndex: number, _opts?: { pageIndex: number }) {
    return colIndex;
  }

  public getRowCount = () => {
    return this.rows;
  };
  public getColCount = () => {
    return this.cols;
  };

  public update(
    options: Partial<MatrixBrainOptions>,
    shouldUpdateRenderCount?: (
      options: ShouldUpdateRenderCountOptions,
    ) => boolean,
  ) {
    const {
      rows,
      cols,
      rowHeight,
      colWidth,
      width: availableWidth,
      height: availableHeight,
    } = options;

    const widthDefined = typeof availableWidth === 'number';
    const heightDefined = typeof availableHeight === 'number';

    const widthChanged = widthDefined && availableWidth !== this.availableWidth;
    const heightChanged =
      heightDefined && availableHeight !== this.availableHeight;

    if (widthChanged) {
      this.availableWidth = availableWidth;
      this.availableRenderWidth = availableWidth;
    }
    if (heightChanged) {
      this.availableHeight = availableHeight;
      this.availableRenderHeight = availableHeight;
    }

    if (widthChanged || heightChanged) {
      this.notifyAvailableSizeChange();
    }

    const rowsDefined = typeof rows === 'number';
    const colsDefined = typeof cols === 'number';

    const rowsChanged = rowsDefined && rows !== this.rows;
    const colsChanged = colsDefined && cols !== this.cols;

    if (rowsDefined) {
      this.rows = rows;
      this.rowsPerPage = rows;
    }
    if (colsDefined) {
      this.cols = cols;
    }

    const rowHeightDefined = rowHeight != null;
    const colWidthDefined = colWidth != null;

    const rowHeightChanged = rowHeightDefined && rowHeight !== this.rowHeight;
    const colWidthChanged = colWidthDefined && colWidth !== this.colWidth;

    if (rowHeightDefined) {
      this.rowHeight = rowHeight;
    }
    if (colWidthDefined) {
      this.colWidth = colWidth;
    }

    if (__DEV__) {
      if (widthChanged) {
        this.debug(
          'New available width %d (size is %d,%d)',
          this.availableWidth,
          this.availableWidth,
          this.availableHeight,
        );
      }
      if (heightChanged) {
        this.debug(
          'New available height %d (size is %d,%d)',
          this.availableHeight,
          this.availableWidth,
          this.availableHeight,
        );
      }

      if (rowsChanged) {
        this.debug('New rows count: %d', this.rows);
      }
      if (colsChanged) {
        this.debug('New cols count: %d', this.cols);
      }
      if (rowHeightChanged) {
        this.debug('New row size', this.rowHeight);
      }
      if (colWidthChanged) {
        this.debug('New col size', this.colWidth);
      }
    }

    const rowspanDefined = options.rowspan != null;
    const colspanDefined = options.colspan != null;

    const rowspanChanged = rowspanDefined && options.rowspan != this.rowspan;
    const colspanChanged = colspanDefined && options.colspan != this.colspan;

    if (rowspanChanged) {
      this.rowspan = options.rowspan;
    }
    if (colspanChanged) {
      this.colspan = options.colspan;
    }

    const horizontalChange =
      colsChanged || colWidthChanged || widthChanged || colspanChanged;
    const verticalChange =
      rowsChanged || rowHeightChanged || heightChanged || rowspanChanged;

    const shouldUpdateFn =
      shouldUpdateRenderCount || defaultShouldUpdateRenderCount;

    if (
      shouldUpdateFn({
        horizontalChange,
        verticalChange,
        colsChanged,
        colWidthChanged,
        widthChanged,
        colspanChanged,
        rowsChanged,
        rowHeightChanged,
        heightChanged,
        rowspanChanged,
      })
    ) {
      this.updateRenderCount({
        horizontal: horizontalChange,
        vertical: verticalChange,
      });
    }
  }

  /**
   *
   * @param options.left - if true, extends the left side with the amount of current visible columns, otherwise with the specified number
   * @param options.right - if true, extends the right side with the amount of current visible columns, otherwise with the specified number
   */
  public extendRenderRange(options: {
    start?: number | boolean;
    end?: number | boolean;
    direction: 'horizontal' | 'vertical';
  }) {
    const { direction } = options;
    const horizontal = direction === 'horizontal';
    const extendValueWhenTrue = horizontal
      ? this.horizontalRenderCount || this.getInitialCols()
      : this.verticalRenderCount || this.getInitialRows();

    const startAmount =
      typeof options.start === 'number'
        ? options.start
        : options.start === true
        ? extendValueWhenTrue
        : 0;
    const endAmount =
      typeof options.end === 'number'
        ? options.end
        : options.end === true
        ? extendValueWhenTrue
        : 0;

    if (horizontal) {
      this.horizontalExtendRangeBy = {
        start: startAmount,
        end: endAmount,
      };
    } else {
      this.verticalExtendRangeBy = {
        start: startAmount,
        end: endAmount,
      };
    }

    this.updateRenderRange({ horizontal: horizontal, vertical: !horizontal });

    const restore = () => {
      this.extendRenderRange({
        start: 0,
        end: 0,
        direction,
      });
    };

    return restore;
  }

  public updateRenderCount(which: WhichDirection = ALL_DIRECTIONS) {
    // if (this._updateRenderCountRafId) {
    //   cancelAnimationFrame(this._updateRenderCountRafId);
    // }
    // this._updateRenderCountRafId = requestAnimationFrame(() => {
    this.reset(which);
    this.doUpdateRenderCount(which);

    //   delete this._updateRenderCountRafId;
    // });
  }

  protected doUpdateRenderCount(which: WhichDirection = ALL_DIRECTIONS) {
    if (!this.availableWidth || !this.availableHeight) {
      const count: Parameters<typeof this.setRenderCount>[0] = {
        horizontal: undefined,
        vertical: undefined,
      };

      if (!this.availableWidth) {
        count.horizontal = 0;
      }
      if (!this.availableHeight) {
        count.vertical = 0;
      }

      this.setRenderCount(count);
      // DON'T uncomment the return
      // return
    }

    this.setRenderCount(this.computeRenderCount(which));
  }

  get scrollTopMax() {
    const totalSize = this.getVirtualizedContentSize();
    return totalSize.height - this.availableHeight;
  }
  get scrollLeftMax() {
    const totalSize = this.getVirtualizedContentSize();
    return totalSize.width - this.availableWidth;
  }

  private setScrolling = (scrolling: boolean) => {
    const prevScrolling = this.scrolling;
    this.scrolling = scrolling;

    if (scrolling) {
      if (this.scrollTimeoutId) {
        clearTimeout(this.scrollTimeoutId);
      }
      this.scrollTimeoutId = setTimeout(() => {
        this.setScrolling(false);
        this.scrollTimeoutId = 0;
      }, this.scrollStopDelay) as any as number;
    }
    if (scrolling !== prevScrolling) {
      if (scrolling) {
        this.notifyScrollStart();
      } else {
        this.notifyScrollStop();
      }
    }
  };

  private notifyScrollStart = () => {
    if (this.destroyed) {
      return;
    }
    const fns = this.onScrollStartFns;
    for (let i = 0, len = fns.length; i < len; i++) {
      fns[i]();
    }
  };

  private notifyScrollStop = () => {
    if (this.destroyed) {
      return;
    }
    const fns = this.onScrollStopFns;

    const scrollPos = this.scrollPosition;
    const range = this.getRenderRange();

    for (let i = 0, len = fns.length; i < len; i++) {
      fns[i](scrollPos, range);
    }
  };

  public setScrollPosition(
    scrollPosition: ScrollPosition,
    callback?: (scrollPos: ScrollPosition) => void,
  ) {
    this.setScrolling(true);
    const changeHorizontal =
      scrollPosition.scrollLeft !== this.scrollPosition.scrollLeft;
    const changeVertical =
      scrollPosition.scrollTop !== this.scrollPosition.scrollTop;

    this.scrollPosition = scrollPosition;

    if (changeHorizontal || changeVertical) {
      callback?.(scrollPosition);
      this.updateRenderRange({
        horizontal: changeHorizontal,
        vertical: changeVertical,
      });

      this.notifyScrollChange();
    }
  }

  protected notifyAvailableSizeChange = () => {
    if (this.destroyed) {
      return;
    }
    const fns = this.onAvailableSizeChangeFns;

    const range = this.getAvailableSize();

    fns.forEach((fn) => {
      raf(() => {
        if (this.destroyed) {
          return;
        }
        // #check-for-presence - we need to check the fn is still in the collection,
        // as it might have been removed between the time of fns.forEach and the time
        // it took the raf to trigger, so we only need to call fns that are still present in the collection
        // this is an important detail, which can cause mis-renderings if not adressed properly (like this)
        if (fns.has(fn)) {
          fn(range);
        }
      });
    });
  };

  protected notifyRenderRangeChange() {
    if (this.destroyed) {
      return;
    }
    const fns = this.onRenderRangeChangeFns;

    const range = this.getRenderRange();

    fns.forEach((fn) => {
      raf(() => {
        if (this.destroyed) {
          return;
        }
        // #check-for-presence - see above note
        if (fns.has(fn)) {
          fn(range);
        }
      });
    });
  }
  protected notifyVerticalRenderRangeChange = () => {
    if (this.destroyed) {
      return;
    }
    const fns = this.onVerticalRenderRangeChangeFns;

    const range = this.verticalRenderRange;

    fns.forEach((fn) => {
      raf(() => {
        if (this.destroyed) {
          return;
        }
        // #check-for-presence - see above note
        if (fns.has(fn)) {
          fn([range.startIndex, range.endIndex]);
        }
      });
    });
  };
  protected notifyHorizontalRenderRangeChange = () => {
    if (this.destroyed) {
      return;
    }
    const fns = this.onHorizontalRenderRangeChangeFns;

    const range = this.horizontalRenderRange;

    fns.forEach((fn) => {
      raf(() => {
        if (this.destroyed) {
          return;
        }
        // #check-for-presence - see above note
        if (fns.has(fn)) {
          fn([range.startIndex, range.endIndex]);
        }
      });
    });
  };

  private notifyScrollChange() {
    if (this.destroyed) {
      return;
    }
    const { scrollPosition } = this;

    const fns = this.onScrollFns;
    for (let i = 0, len = fns.length; i < len; i++) {
      fns[i](scrollPosition);
    }
  }

  protected computeDirectionalRenderCount(
    direction: 'horizontal' | 'vertical',
    itemSize: number | ItemSizeFunction,
    count: number,
    theRenderSize: Size,
  ) {
    let renderCount = 0;

    let size =
      direction === 'horizontal' ? theRenderSize.width : theRenderSize.height;

    size -= this.getFixedSize(direction);

    if (size <= 0) {
      return 0;
    }
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
      renderCount = (itemSize ? Math.ceil(size / itemSize) : 0) + 1;
    }

    renderCount = Math.min(count, renderCount);

    return renderCount;
  }

  getFixedSize(direction: 'horizontal' | 'vertical') {
    return direction === 'horizontal'
      ? this.getFixedStartColsWidth() + this.getFixedEndColsWidth()
      : this.getFixedStartRowsHeight() + this.getFixedEndRowsHeight();
  }
  getFixedStartSize(direction: 'horizontal' | 'vertical') {
    return direction === 'horizontal'
      ? this.getFixedStartColsWidth()
      : this.getFixedStartRowsHeight();
  }
  getFixedEndSize(direction: 'horizontal' | 'vertical') {
    return direction === 'horizontal'
      ? this.getFixedEndColsWidth()
      : this.getFixedEndRowsHeight();
  }

  isColFixedEnd = (colIndex: number) => {
    if (!this.fixedColsEnd) {
      return false;
    }

    return colIndex >= this.cols - this.fixedColsEnd;
  };
  isColFixedStart = (colIndex: number) => {
    if (!this.fixedColsStart) {
      return false;
    }

    return colIndex < this.fixedColsStart;
  };

  isRowFixedEnd = (rowIndex: number) => {
    if (!this.fixedRowsEnd) {
      return false;
    }

    return rowIndex >= this.rows - this.fixedRowsEnd;
  };
  isRowFixedStart = (rowIndex: number) => {
    if (!this.fixedRowsStart) {
      return false;
    }

    return rowIndex < this.fixedRowsStart;
  };

  isColFixed = (colIndex: number) => {
    return this.isColFixedStart(colIndex) || this.isColFixedEnd(colIndex);
  };

  isRowFixed = (rowIndex: number) => {
    return this.isRowFixedStart(rowIndex) || this.isRowFixedEnd(rowIndex);
  };

  getFixedEndColsWidth = () => {
    if (!this.fixedColsEnd) {
      return 0;
    }

    let sum = 0;

    for (let i = this.cols - this.fixedColsEnd; i < this.cols; i++) {
      sum += this.getColWidth(i);
    }

    return sum;
  };

  /**
   * Returns an array of offsets for all cols fixed at the end
   *
   * The order in the array is from leftmost col to the rightmost col
   * The reference for offset is the left side of the table.
   * The offsets take into account the scroll position and return the correct position.
   *
   * The indexes in the returned array are the absolute indexes of the cols, so the returned array is an array with holes
   *
   */
  getFixedEndColsOffsets = (
    { skipScroll }: { skipScroll: boolean } = { skipScroll: false },
  ): number[] => {
    if (!this.fixedColsEnd) {
      return [];
    }

    const { scrollLeft } = this.scrollPosition;
    const { width } = this.getAvailableSize();
    const offsets = [];
    const widths = [];
    let sum = 0;

    for (
      let colIndex = this.cols - this.fixedColsEnd;
      colIndex < this.cols;
      colIndex++
    ) {
      const colWidth = this.getColWidth(colIndex);
      widths.push(colWidth);
      sum += colWidth;
    }

    const baseOffset = width - sum + (skipScroll ? 0 : scrollLeft);

    sum = 0;

    let index = 0;
    for (
      let colIndex = this.cols - this.fixedColsEnd;
      colIndex < this.cols;
      colIndex++
    ) {
      const offset = baseOffset + sum;
      offsets[colIndex] = offset;
      sum += widths[index];
      index++;
    }
    return offsets;
  };

  /**
   * Returns an array of offsets for all rows fixed at the end
   *
   * The order in the array is from topmost row to the bottom-most row
   * The reference for offset is the top side of the table.
   * The offsets take into account the scroll position and return the correct position.
   *
   * The indexes in the returned array are the absolute indexes of the rows, so the returned array is an array with holes
   *
   */
  getFixedEndRowsOffsets = (
    { skipScroll }: { skipScroll: boolean } = { skipScroll: false },
  ): number[] => {
    if (!this.fixedRowsEnd) {
      return [];
    }

    const { scrollTop } = this.scrollPosition;
    const { height } = this.getAvailableSize();
    const offsets = [];
    const heights = [];
    let sum = 0;

    for (
      let rowIndex = this.rows - this.fixedRowsEnd;
      rowIndex < this.rows;
      rowIndex++
    ) {
      const rowHeight = this.getRowHeight(rowIndex);
      heights.push(rowHeight);
      sum += rowHeight;
    }

    const baseOffset = height - sum + (skipScroll ? 0 : scrollTop);

    sum = 0;

    let index = 0;
    for (
      let rowIndex = this.rows - this.fixedRowsEnd;
      rowIndex < this.rows;
      rowIndex++
    ) {
      const offset = baseOffset + sum;
      offsets[rowIndex] = offset;
      sum += heights[index];
      index++;
    }
    return offsets;
  };

  getFixedStartColsWidth = () => {
    if (!this.fixedColsStart) {
      return 0;
    }

    let sum = 0;

    for (let i = 0; i < this.fixedColsStart; i++) {
      sum += this.getColWidth(i);
    }

    return sum;
  };

  getFixedEndRowsHeight = () => {
    if (!this.fixedRowsEnd) {
      return 0;
    }

    let sum = 0;

    for (let i = this.rows - this.fixedRowsEnd; i < this.rows; i++) {
      sum += this.getRowHeight(i);
    }

    return sum;
  };

  getFixedStartRowsHeight = () => {
    if (!this.fixedRowsStart) {
      return 0;
    }

    let sum = 0;

    for (let i = 0; i < this.fixedRowsStart; i++) {
      sum += this.getRowHeight(i);
    }

    return sum;
  };

  computeRenderCount = (which: WhichDirection = ALL_DIRECTIONS) => {
    const recomputeHorizontal = which.horizontal;
    const recomputeVertical = which.vertical;

    let horizontalRenderCount = this.horizontalRenderCount || 0;
    let verticalRenderCount = this.verticalRenderCount || 0;

    if (recomputeHorizontal) {
      horizontalRenderCount = this.computeDirectionalRenderCount(
        'horizontal',
        this.colWidth,
        this.cols,
        this.getAvailableRenderSize(),
      );
    }
    if (recomputeVertical) {
      verticalRenderCount = this.computeDirectionalRenderCount(
        'vertical',
        this.rowHeight,
        this.rows,
        this.getAvailableRenderSize(),
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
    horizontal: number | undefined;
    vertical: number | undefined;
  }) => {
    if (horizontal === undefined) {
      horizontal = this.horizontalRenderCount;
    }
    if (vertical === undefined) {
      vertical = this.verticalRenderCount;
    }
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
    if (this.destroyed) {
      return;
    }
    const { horizontalRenderCount, verticalRenderCount } = this;

    const renderCount = {
      horizontal: horizontalRenderCount!,
      vertical: verticalRenderCount!,
    };

    const fns = this.onRenderCountChangeFns;

    fns.forEach((fn) => {
      raf(() => {
        if (this.destroyed) {
          return;
        }
        // #check-for-presence - see above note
        if (fns.has(fn)) {
          fn(renderCount);
        }
      });
    });
  }

  public updateFixedCells = (config: {
    fixedColsStart?: number;
    fixedColsEnd?: number;
    fixedRowsStart?: number;
    fixedRowsEnd?: number;
  }) => {
    if (config.fixedColsStart != this.fixedColsStart) {
      this.fixedColsStart = config.fixedColsStart || 0;
    }
    if (config.fixedColsEnd != this.fixedColsEnd) {
      this.fixedColsEnd = config.fixedColsEnd || 0;
    }
    if (config.fixedRowsStart != this.fixedRowsStart) {
      this.fixedRowsStart = config.fixedRowsStart || 0;
    }
    if (config.fixedRowsEnd != this.fixedRowsEnd) {
      this.fixedRowsEnd = config.fixedRowsEnd || 0;
    }
  };

  public getFixedCellInfo = () => {
    const { fixedRowsStart, fixedColsStart, fixedRowsEnd, fixedColsEnd } = this;

    return {
      fixedRowsStart,
      fixedColsStart,
      fixedRowsEnd,
      fixedColsEnd,
    };
  };

  public updateRenderRange = (which: WhichDirection = ALL_DIRECTIONS) => {
    this.setRenderRange(this.computeRenderRange(which));
  };

  public getExtraSpanCellsForRange = ({
    horizontal,
    vertical,
  }: {
    horizontal: RenderRangeType;
    vertical: RenderRangeType;
  }) => {
    const { colspan, rowspan } = this;

    const extraCells: [number, number][] = [];

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

    return extraCells;
  };

  computeRenderRange = (which: WhichDirection = ALL_DIRECTIONS) => {
    const horizontal = which.horizontal
      ? this.computeDirectionalRenderRange('horizontal')
      : this.horizontalRenderRange;

    const vertical = which.vertical
      ? this.computeDirectionalRenderRange('vertical')
      : this.verticalRenderRange;

    return {
      horizontal,
      vertical,
      extraCells: this.getExtraSpanCellsForRange({ horizontal, vertical }),
    };
  };

  computeDirectionalRenderRange = (direction: 'horizontal' | 'vertical') => {
    let renderCount =
      direction === 'horizontal'
        ? this.horizontalRenderCount
        : this.verticalRenderCount;
    const count = direction === 'horizontal' ? this.cols : this.rows;

    if (!renderCount) {
      return {
        startIndex: 0,
        endIndex: 0,
      };
    }

    const fixedStartIndex =
      (direction === 'horizontal'
        ? this.fixedColsStart
        : this.fixedRowsStart) || 0;

    let scrollPositionForDirection =
      direction === 'horizontal'
        ? this.scrollPosition.scrollLeft
        : this.scrollPosition.scrollTop;

    scrollPositionForDirection += this.getFixedStartSize(direction);

    const extendBy =
      direction === 'horizontal'
        ? this.horizontalExtendRangeBy
        : this.verticalExtendRangeBy;

    let startIndex = this.getItemAt(scrollPositionForDirection, direction);

    if (extendBy.start) {
      startIndex = Math.max(0, startIndex - extendBy.start);
      renderCount += extendBy.start;
    }

    if (extendBy.end) {
      renderCount += extendBy.end;
    }

    let endIndex = startIndex + renderCount;

    const theEnd = Math.max(
      fixedStartIndex,
      count -
        (direction === 'horizontal' ? this.fixedColsEnd : this.fixedRowsEnd),
    );

    if (endIndex > theEnd) {
      endIndex = theEnd;
      startIndex = Math.max(fixedStartIndex, endIndex - renderCount);
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
    const itemSize =
      direction === 'horizontal' ? this.colWidth : this.rowHeight;
    const count = direction === 'horizontal' ? this.cols : this.rows;

    if (typeof itemSize !== 'function') {
      return Math.min(Math.max(0, Math.floor(scrollPos / itemSize)), count - 1);
    }

    const itemOffsetCache =
      direction === 'horizontal' ? this.colOffsetCache : this.rowOffsetCache;
    const itemSizeCache =
      direction === 'horizontal' ? this.colWidthCache : this.rowHeightCache;

    const lastOffsetIndex = itemOffsetCache.length - 1;
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
  };

  public getCellOffset(rowIndex: number, colIndex: number) {
    return {
      x: this.getItemOffsetFor(colIndex, 'horizontal'),
      y: this.getItemOffsetFor(rowIndex, 'vertical'),
    };
  }

  getInitialRowHeight() {
    return this.rowHeight;
  }

  getInitialCols() {
    return this.cols;
  }

  getInitialRows() {
    return this.rows;
  }

  public getItemOffsetFor(
    itemIndex: number,
    direction: 'horizontal' | 'vertical',
  ): number {
    const itemSize =
      direction === 'horizontal' ? this.colWidth : this.rowHeight;
    if (typeof itemSize !== 'function') {
      return itemIndex * itemSize;
    }
    const itemOffsetCache =
      direction === 'horizontal' ? this.colOffsetCache : this.rowOffsetCache;
    const itemSizeCache =
      direction === 'horizontal' ? this.colWidthCache : this.rowHeightCache;

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
  }

  protected computeCacheFor = (
    itemIndex: number,
    direction: 'horizontal' | 'vertical',
  ) => {
    const itemSizeValueOrFn =
      direction === 'horizontal' ? this.colWidth : this.rowHeight;
    const itemSizeCache =
      direction === 'horizontal' ? this.colWidthCache : this.rowHeightCache;
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
    return (
      direction === 'horizontal' ? this.colWidthCache : this.rowHeightCache
    )[itemIndex];
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
      const lastIndex = count ? Math.min(itemIndex, count - 1) : 0;

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

  public getRowHeightWithSpan = (
    rowIndex: number,
    colIndex: number,
    rowspan: number,
  ) => {
    return this.getItemSizeWithSpan(rowIndex, colIndex, rowspan, 'vertical');
  };
  public getColWidthWithSpan = (
    rowIndex: number,
    colIndex: number,
    colspan: number,
  ) => {
    return this.getItemSizeWithSpan(rowIndex, colIndex, colspan, 'horizontal');
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
    const itemSize =
      direction === 'horizontal' ? this.colWidth : this.rowHeight;

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
      direction === 'horizontal' ? this.colWidthCache : this.rowHeightCache;
    if (cachedSize === undefined) {
      let i = itemSizeCache.length;
      const lastIndex = Math.min(itemIndex, count - 1);

      for (; i <= lastIndex; i++) {
        this.computeCacheFor(i, direction);
      }
      cachedSize = this.getItemSizeCacheFor(itemIndex, direction);
    }

    return cachedSize;
  };

  getRowIndexInPage(rowIndex: number) {
    return rowIndex;
  }

  getPageIndexForRow(_rowIndex: number) {
    return 0;
  }

  getVirtualizedContentSize() {
    return {
      height: this.getVirtualizedContentSizeFor('vertical'),
      width: this.getVirtualizedContentSizeFor('horizontal'),
    };
  }

  public getVirtualizedContentSizeFor(direction: 'horizontal' | 'vertical') {
    const count = direction === 'horizontal' ? this.cols : this.rows;
    const itemSize =
      direction === 'horizontal' ? this.colWidth : this.rowHeight;
    const totalSize =
      direction === 'horizontal'
        ? this.horizontalTotalSize
        : this.verticalTotalSize;

    if (typeof itemSize !== 'function') {
      return itemSize * count;
    }

    if (totalSize !== 0 && !isNaN(totalSize)) {
      return totalSize;
    }

    const itemOffsetCache =
      direction === 'horizontal' ? this.colOffsetCache : this.rowOffsetCache;
    const lastItemSize = count ? this.getItemSize(count - 1, direction) : 0;

    const lastItemOffset = count ? itemOffsetCache[count - 1] : 0;

    const result = lastItemSize + lastItemOffset;

    if (direction === 'horizontal') {
      this.horizontalTotalSize = result;
    } else {
      this.verticalTotalSize = result;
    }

    return result;
  }

  keepColumnRendered = (colIndex: number) => {
    this.alwaysRenderedColumns.add(colIndex);

    return () => {
      this.alwaysRenderedColumns.delete(colIndex);
    };
  };

  getAlwaysRenderedColumns = () => {
    return Array.from(this.alwaysRenderedColumns);
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
    if (verticalChange) {
      this.notifyVerticalRenderRangeChange();
    }
    if (horizontalChange) {
      this.notifyHorizontalRenderRangeChange();
    }
  };

  getRenderRangeCellCount = getRenderRangeCellCount;

  getExtraCells = (): [number, number][] => {
    return this.extraSpanCells;
  };

  getScrollPosition = () => {
    return this.scrollPosition;
  };

  getRenderRange = () => {
    return {
      start: [
        this.verticalRenderRange.startIndex,
        this.horizontalRenderRange.startIndex,
      ],
      end: [
        this.verticalRenderRange.endIndex,
        this.horizontalRenderRange.endIndex,
      ],
    } as TableRenderRange;
  };

  onScroll = (fn: OnScrollFn) => {
    this.onScrollFns.push(fn);
    return () => {
      this.onScrollFns = this.onScrollFns.filter((f) => f !== fn);
    };
  };

  onScrollStart = (fn: VoidFunction) => {
    this.onScrollStartFns.push(fn);
    return () => {
      this.onScrollStartFns = this.onScrollStartFns.filter((f) => f !== fn);
    };
  };

  onScrollStop = (fn: (scrollPos: ScrollPosition) => void) => {
    this.onScrollStopFns.push(fn);
    return () => {
      this.onScrollStopFns = this.onScrollStopFns.filter((f) => f !== fn);
    };
  };

  onRenderRangeChange = (fn: FnOnRenderRangeChange) => {
    this.onRenderRangeChangeFns.add(fn);
    return () => {
      this.onRenderRangeChangeFns.delete(fn);
    };
  };
  onVerticalRenderRangeChange = (fn: FnOnDirectionalRenderRangeChange) => {
    this.onVerticalRenderRangeChangeFns.add(fn);
    return () => {
      this.onVerticalRenderRangeChangeFns.delete(fn);
    };
  };
  onHorizontalRenderRangeChange = (fn: FnOnDirectionalRenderRangeChange) => {
    this.onHorizontalRenderRangeChangeFns.add(fn);
    return () => {
      this.onHorizontalRenderRangeChangeFns.delete(fn);
    };
  };

  onRenderCountChange = (fn: FnOnRenderCountChange) => {
    this.onRenderCountChangeFns.add(fn);

    return () => {
      this.onRenderCountChangeFns.delete(fn);
    };
  };

  onAvailableSizeChange = (fn: OnAvailableSizeChange) => {
    this.onAvailableSizeChangeFns.add(fn);

    return () => {
      this.onAvailableSizeChangeFns.delete(fn);
    };
  };

  public onDestroy = (fn: VoidFn) => {
    this.onDestroyFns.push(fn);

    return () => {
      this.onDestroyFns = this.onDestroyFns.filter((f) => f !== fn);
    };
  };

  public getAvailableSize = () => {
    return {
      width: this.availableWidth,
      height: this.availableHeight,
    };
  };

  protected getAvailableRenderSize = () => {
    return {
      width: this.availableRenderWidth ?? this.availableWidth,
      height: this.availableRenderHeight ?? this.availableHeight,
    };
  };

  private notifyDestroy() {
    const fns = this.onDestroyFns;
    for (let i = 0, len = fns.length; i < len; i++) {
      fns[i]();
    }
  }

  destroy() {
    if (this.destroyed) {
      return;
    }
    this.notifyDestroy();

    this.reset();

    this.rowspanParent.clear();
    this.colspanParent.clear();
    this.alwaysRenderedColumns.clear();
    this.horizontalExtendRangeBy = { start: 0, end: 0 };
    this.verticalExtendRangeBy = { start: 0, end: 0 };
    this.destroyed = true;
    this.onDestroyFns = [];
    this.onScrollFns = [];
    this.onScrollStartFns = [];
    this.onScrollStopFns = [];
    this.onRenderCountChangeFns.clear();
    this.onRenderRangeChangeFns.clear();
    this.onVerticalRenderRangeChangeFns.clear();
    this.onHorizontalRenderRangeChangeFns.clear();
  }
}
