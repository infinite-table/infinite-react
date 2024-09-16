import {
  ALL_DIRECTIONS,
  IBrain,
  ItemSizeFunction,
  TableRenderRange,
  WhichDirection,
} from './IBrain';

import {
  MatrixBrain,
  MatrixBrainOptions,
  RenderRangeType,
} from './MatrixBrain';

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

export class HorizontalLayoutMatrixBrain extends MatrixBrain implements IBrain {
  public visiblePageCount = 0;
  private _rowsPerPage = 0;

  private totalPageCount: number = 0;
  public pageWidth: number = 0;

  public initialCols = 0;
  public initialRows = 0;
  private initialColWidth: MatrixBrainOptions['colWidth'] = 0;
  protected colWidth: ItemSizeFunction = () => 10;

  constructor(name?: string) {
    super(`HorizontalLayout${name ? `:${name}` : ''}`);
  }

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

  convertHorizontalRenderRangeToVerticalRenderRange(
    renderRange: TableRenderRange,
  ): TableRenderRange {
    const { start, end } = renderRange;

    const [startRowIndex, startColIndex] = start;
    const [endRowIndex, endColIndex] = end;

    const startCoords = this.getHorizontalLayoutPositionFromMatrixCoordinates({
      rowIndex: startRowIndex,
      colIndex: startColIndex,
    });
    const endCoords = this.getHorizontalLayoutPositionFromMatrixCoordinates({
      rowIndex: endRowIndex,
      colIndex: endColIndex,
    });

    const startPageIndex = Math.floor(startColIndex / this.initialCols);
    const endPageIndex = Math.floor(endColIndex / this.initialCols);

    let startCol = 0;
    let endCol = this.initialCols;
    if (startPageIndex === endPageIndex) {
      startCol = startCoords.colIndex;
      endCol = endCoords.colIndex;
    }
    // this.getP
    // const startCol = startCoords.colIndex < endCoords.colIndex ?
    return {
      start: [startCoords.rowIndex, startCol],
      end: [endCoords.rowIndex, endCol],
    };
  }

  // TODO CONTINUE_HERE remove this
  public x_getCellOffset = (rowIndex: number, colIndex: number) => {
    let { x, y } = super.getCellOffset(rowIndex, colIndex);
    const rowHeight = this.rowHeight;
    if (typeof rowHeight !== 'number') {
      throw new Error('rowHeight must be a number');
    }
    if (rowIndex >= this.rowsPerPage && this.rowsPerPage > 0) {
      const rowIndexInPage = rowIndex % this.rowsPerPage;

      y = rowIndexInPage * rowHeight;

      const pageIndex = Math.floor(rowIndex / this.rowsPerPage);
      const pageOffset = pageIndex ? pageIndex * this.pageWidth : 0;

      x += pageOffset;
    }

    return { x, y };
  };

  x_setRenderRange = (options: {
    horizontal: RenderRangeType;
    vertical: RenderRangeType;
    extraCells?: [number, number][];
  }) => {
    const newRange: TableRenderRange = {
      start: [options.vertical.startIndex, options.horizontal.startIndex],
      end: [options.vertical.endIndex, options.horizontal.endIndex],
    };
    // TODO CONTINUE_HERE we currently overwrote this
    // but this overriding is not optimal
    // since if a row from another segment has the last column rendered
    // then when we unwrap rows, we assume all cols of that row are rendered,
    // which is not ideal

    // the other solution means we go with the normal matrix render
    // but for the last segment, there will be cells in the render range
    // that do not actually exist - so we need to subtract that from the render range
    // or pass a union of ranges
    const convertedRange =
      this.convertHorizontalRenderRangeToVerticalRenderRange(newRange);

    console.log(
      'convert',
      JSON.stringify(newRange),
      'to',
      JSON.stringify(convertedRange),
    );
    const horizontal: RenderRangeType = {
      startIndex: convertedRange.start[1],
      endIndex: convertedRange.end[1],
    };
    const vertical: RenderRangeType = {
      startIndex: convertedRange.start[0],
      endIndex: convertedRange.end[0],
    };

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

    this.extraSpanCells = options.extraCells || [];

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

  getRowIndexInPage(rowIndex: number) {
    return this.rowsPerPage ? rowIndex % this.rowsPerPage : rowIndex;
  }

  set rowsPerPage(rowsPerPage: number) {
    if (rowsPerPage != this._rowsPerPage) {
      this._rowsPerPage = rowsPerPage;
    }
  }

  get rowsPerPage() {
    return this._rowsPerPage;
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
      rowIndex: Math.min(rowIndex, this.initialRows),
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
      console.log('rows defined', rows);
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

    const horizontalChange = colsChanged || colWidthChanged || widthChanged;
    const verticalChange = rowsChanged || rowHeightChanged || heightChanged;

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
  doUpdateRenderCount(which: WhichDirection = ALL_DIRECTIONS) {
    if (typeof this.rowHeight !== 'number') {
      throw new Error('rowHeight must be a number');
    }

    // determine the width of a column-set (or page)

    let pageWidth = 0;
    for (let i = 0; i < this.initialCols; i++) {
      pageWidth += this.getColWidth(i);
    }
    this.pageWidth = pageWidth;

    // based on the page width, determine the number of rows per page
    this.rowsPerPage = Math.floor(this.availableHeight / this.rowHeight);

    this.totalPageCount = this.rowsPerPage
      ? Math.ceil(this.initialRows / this.rowsPerPage)
      : 0;
    this.visiblePageCount = this.totalPageCount
      ? Math.max(Math.ceil(this.availableWidth / this.pageWidth), 1)
      : 1;

    this.availableRenderHeight =
      this.visiblePageCount * this.rowsPerPage * this.rowHeight;

    console.log(
      'visiblePageCount',
      this.visiblePageCount,
      'initialCols',
      this.initialCols,
    );
    this.cols = this.totalPageCount * this.initialCols;
    this.rows = this.rowsPerPage;

    super.doUpdateRenderCount(which);
  }

  getVirtualizedContentSizeFor(direction: 'horizontal' | 'vertical') {
    if (direction === 'vertical') {
      if (typeof this.rowHeight !== 'number') {
        throw new Error('rowHeight must be a number');
      }
      return this.rowHeight * this.rowsPerPage;
    }

    return this.pageWidth * this.totalPageCount;
  }
}
