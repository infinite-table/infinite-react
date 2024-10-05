import { raf } from '../../utils/raf';
import { Size } from '../types/Size';
import {
  ALL_DIRECTIONS,
  IBrain,
  ItemSizeFunction,
  SORT_ASC,
  WhichDirection,
} from './IBrain';

import { MatrixBrain, MatrixBrainOptions } from './MatrixBrain';

/**
 *
 * A Horizontal layout brain is a variation of the matrix brain.
 *
 * It's a matrix brain that will only have rows that fit in the viewport
 * while repeating the columns multiple times.
 * Basically all rows outside the viewport are wrapped and brought horizontally,
 * after the initial column set.
 *
 * Say we have 4 cols and 24 rows, and the viewport can only fit 10 rows without vertical scrollbar.
 *
 * This means the first 10 rows are displayed as is,
 * then the next 10 rows are wrapped horizontally, thus creating another 4 columns
 * (identical to the first ones)
 * and then the last 4 rows are wrapped again, thus another 4 cols are created.
 *
 * So we have a total of 24 rows and 12 columns - although physically, there are only 10 rows.
 *
 * It's still a matrix, so the matrix brain should work its way and the algorithm is the same
 * after we enforce the correct number of physical rows and columns (10 and 24 respectively
 * in the example above).
 *
 *
 * Let's take another, more simple example,
 *
 *   col0|col1|col2   col0'|col1'|col2'|
 *  +----+----+----++------+-----+-----|
 * 0| 0,0| 0,1|0,2 ||  3,0 | 3,1 | 3,2 |
 * 1| 1,0| 1,1|1,2 ||  4,0 | 4,1 | 4,2 |
 * 2| 2,0| 2,1|2,2 ||  5,0 | 5,1 | 5,2 |
 *  +----+----+----||-------------------
 *
 *
 * Now imagine that we have scrolling and only col1 to col1' are in the viewport
 *
 * this gives us the following render range:
 *   rows 0 to 2, with col1 and col2
 *   rows 3 to 4, with col0' and col1'
 *
 * so if we were to unwrap and put those rows vertically,
 * we won't have a contiguous render range like we do for the normal matrix brain.
 *
 * I mean we still have a valid matrix brain range, which would be
 * rows 0 to 2 and col1 to col1', so start:[0,1], end: [3,5]
 * but this is in the normal matrix, but when we unwrap, it's no longer continuous
 * but rather we have two render ranges:
 * start: [0,1], end: [3,3] so
 *  |col1|col2
 *  +----+----+
 * 0| 0,1|0,2 |
 * 1| 1,1|1,2 |
 * 2| 2,1|2,2 |
 *  +----+----+----|
 * start: [3,0], end: [6,3] so
 *   col0'|col1'|
 *  +-----+-----+
 * 3| 3,0 | 3,1 |
 * 4| 4,0 | 4,1 |
 * 5| 5,0 | 5,1 |
 *  +-----+-----+
 *
 *
 * SO: we need a way to translate a cell position from MATRIX RANGE to HORIZONTAL LAYOUT RANGE.
 *
 * This is what
 *  - getMatrixCoordinatesForHorizontalLayoutPosition and
 *  - getHorizontalLayoutPositionFromMatrixCoordinates
 * do!
 *
 */

type HorizontalLayoutMatrixBrainOptions = {
  isHeader: boolean;
  masterBrain?: HorizontalLayoutMatrixBrain;
};

export class HorizontalLayoutMatrixBrain extends MatrixBrain implements IBrain {
  public visiblePageCount = 0;
  public isHorizontalLayoutBrain = true;

  private _totalPageCount: number = 0;
  public pageWidth: number = 0;

  public initialCols = 0;
  public initialRows = 0;
  private initialColWidth: MatrixBrainOptions['colWidth'] = 0;
  protected colWidth: ItemSizeFunction = () => 10;

  private options: HorizontalLayoutMatrixBrainOptions;

  constructor(name: string, opts: HorizontalLayoutMatrixBrainOptions) {
    super(`HorizontalLayout${name ? `:${name}` : ''}`);
    this.options = opts;

    if (this.options.masterBrain) {
      this.options.masterBrain.onTotalPageCountChange(() => {
        this.updateRenderCount({ horizontal: true, vertical: true });
      });
    }
  }

  protected computeDirectionalRenderCount(
    direction: 'horizontal' | 'vertical',
    itemSize: number | ItemSizeFunction,
    count: number,
    theRenderSize: Size,
  ) {
    if (direction === 'vertical') {
      return super.computeDirectionalRenderCount(
        direction,
        itemSize,
        count,
        theRenderSize,
      );
    }
    let renderCount = 0;

    let size = theRenderSize.width;

    size -= this.getFixedSize('horizontal');

    if (size <= 0) {
      return 0;
    }

    if (typeof itemSize === 'number') {
      renderCount = (itemSize ? Math.ceil(size / itemSize) : 0) + 1;
      renderCount = Math.min(count, renderCount);
      return renderCount;
    }

    const pagesInView = Math.floor(size / this.pageWidth);

    renderCount += pagesInView * this.initialCols;

    const remainingSize = size - pagesInView * this.pageWidth;

    const sizes = [];
    for (let i = 0; i < this.initialCols; i++) {
      sizes.push(this.getItemSize(i, direction));
    }
    sizes.sort(SORT_ASC);

    let sum = 0;
    for (let i = 0; i < this.initialCols; i++) {
      sum += sizes[i];

      renderCount++;
      if (sum > remainingSize) {
        break;
      }
    }
    renderCount += 1;
    renderCount = Math.min(count, renderCount);

    return renderCount;
  }

  getRowIndexInPage(rowIndex: number) {
    return this.rowsPerPage ? rowIndex % this.rowsPerPage : rowIndex;
  }

  getInitialCols() {
    return this.initialCols;
  }

  getInitialRows() {
    return this.initialRows;
  }

  getPageIndexForRow(rowIndex: number) {
    const pageIndex = Math.floor(rowIndex / this.rowsPerPage);

    return pageIndex;
  }

  public getMatrixCoordinatesForHorizontalLayoutPosition(pos: {
    rowIndex: number;
    colIndex: number;
  }) {
    let rowIndex = pos.rowIndex;
    let colIndex = pos.colIndex;
    if (pos.rowIndex >= this.rowsPerPage && this.rowsPerPage > 0) {
      rowIndex = pos.rowIndex % this.rowsPerPage;

      const pageIndex = Math.floor(pos.rowIndex / this.rowsPerPage);
      colIndex = pageIndex * this.initialCols + colIndex;
    }

    return {
      rowIndex,
      colIndex,
    };
  }

  public getHorizontalLayoutPositionFromMatrixCoordinates(pos: {
    rowIndex: number;
    colIndex: number;
  }) {
    let rowIndex = pos.rowIndex;
    let colIndex = pos.colIndex;

    if (pos.colIndex >= this.initialCols && this.initialCols > 0) {
      const pageIndex = Math.floor(pos.colIndex / this.initialCols);

      colIndex = pos.colIndex - pageIndex * this.initialCols;
      rowIndex = this.rowsPerPage * pageIndex + pos.rowIndex;
    }
    return {
      colIndex: Math.min(colIndex, this.initialCols),
      rowIndex: this.options.isHeader
        ? rowIndex
        : Math.min(rowIndex, this.initialRows),
    };
  }

  public update(options: Partial<MatrixBrainOptions>) {
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

    const rowsChanged = rowsDefined && rows !== this.initialRows;
    const colsChanged = colsDefined && cols !== this.initialCols;

    if (rowsDefined && rowsChanged) {
      this.initialRows = rows;
      this.rows = rows;
    }
    if (colsDefined && colsChanged) {
      this.initialCols = cols;
      this.cols = cols;
    }

    const rowHeightDefined = rowHeight != null;
    const colWidthDefined = colWidth != null;

    const rowHeightChanged = rowHeightDefined && rowHeight !== this.rowHeight;
    const colWidthChanged =
      colWidthDefined && colWidth !== this.initialColWidth;

    if (rowHeightDefined) {
      this.rowHeight = rowHeight;
    }
    if (colWidthDefined) {
      this.initialColWidth = colWidth;
      this.colWidth = this.getColWidth;
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

    const verticalChange = rowsChanged || rowHeightChanged || heightChanged;
    const horizontalChange =
      colsChanged ||
      colWidthChanged ||
      widthChanged ||
      /** when something changes vertically,
       * it needs to trigger horizontal change as well since
       * the number of "virtual" columns needs to be adjusted
       *
       * THIS IS VERY IMPORTANT TO HAVE HERE
       */
      verticalChange;

    if (horizontalChange || verticalChange) {
      this.updateRenderCount({
        horizontal: horizontalChange,
        vertical: verticalChange,
      });
    }
  }

  getColWidth = (colIndex: number) => {
    if (typeof this.initialColWidth === 'number') {
      return this.initialColWidth;
    }

    return this.initialColWidth(colIndex % this.initialCols);
  };

  getInitialRowHeight() {
    if (typeof this.rowHeight !== 'number') {
      return this.getRowHeight(0);
    }

    return this.rowHeight;
  }

  get totalPageCount(): number {
    return this.options.masterBrain
      ? this.options.masterBrain.totalPageCount
      : this._totalPageCount;
  }

  set totalPageCount(value: number) {
    if (this.options.masterBrain) {
      return;
    }
    this._totalPageCount = value;
  }

  getPageWidth() {
    return this.pageWidth;
  }

  doUpdateRenderCount(which: WhichDirection = ALL_DIRECTIONS) {
    const rowHeight = this.getInitialRowHeight();

    // determine the width of a column-set (or page)

    let pageWidth = 0;
    for (let i = 0; i < this.initialCols; i++) {
      pageWidth += this.getColWidth(i);
    }
    this.pageWidth = pageWidth;

    // based on the page width, determine the number of rows per page
    this.rowsPerPage = Math.floor(this.availableHeight / rowHeight);

    let shouldNotifyTotalPageCountChange = false;

    if (!this.options.masterBrain) {
      const prevTotalPageCount = this.totalPageCount;
      this.totalPageCount = this.rowsPerPage
        ? Math.ceil(this.initialRows / this.rowsPerPage)
        : 0;

      if (prevTotalPageCount != this.totalPageCount) {
        shouldNotifyTotalPageCountChange = true;
      }
    }

    this.visiblePageCount =
      this.totalPageCount && this.pageWidth
        ? Math.max(Math.ceil(this.availableWidth / this.pageWidth), 1)
        : 1;

    this.availableRenderHeight =
      this.visiblePageCount * this.rowsPerPage * rowHeight;

    this.cols = Math.max(
      this.totalPageCount * this.initialCols,
      this.initialCols,
    );
    this.rows = this.rowsPerPage;

    super.doUpdateRenderCount(which);

    if (shouldNotifyTotalPageCountChange) {
      this.notifyTotalPageCountChange();
    }
  }
  private onTotalPageCountChangeFns: Set<(totalPageCount: number) => void> =
    new Set();

  private notifyTotalPageCountChange() {
    if (this.destroyed) {
      return;
    }
    const fns = this.onTotalPageCountChangeFns;

    fns.forEach((fn) => {
      raf(() => {
        if (this.destroyed) {
          return;
        }
        // #check-for-presence - see above note
        if (fns.has(fn)) {
          fn(this.totalPageCount);
        }
      });
    });
  }

  protected onTotalPageCountChange = (fn: (x: number) => void) => {
    this.onTotalPageCountChangeFns.add(fn);

    return () => {
      this.onTotalPageCountChangeFns.delete(fn);
    };
  };

  public getVirtualColIndex(colIndex: number, opts?: { pageIndex: number }) {
    return this.initialCols * (opts?.pageIndex ?? 0) + colIndex;
  }

  destroy() {
    if (this.destroyed) {
      return;
    }
    super.destroy();

    this.options.masterBrain = undefined;
    this.onTotalPageCountChangeFns.clear();
  }

  getVirtualizedContentSizeFor(direction: 'horizontal' | 'vertical') {
    if (direction === 'vertical') {
      const rowHeight = this.getInitialRowHeight();
      return rowHeight * this.rowsPerPage;
    }

    return this.pageWidth * this.totalPageCount;
  }
}
