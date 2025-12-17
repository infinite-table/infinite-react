import { Logger } from '../../utils/debugLoggers';

import { raf } from '../../utils/raf';
import { stripVar } from '../../utils/stripVar';
import { InternalVars } from '../InfiniteTable/internalVars.css';
import { ScrollAdjustPosition } from '../InfiniteTable/types/InfiniteTableProps';
import {
  getParentInfiniteNode,
  InternalVarUtils,
  setInfiniteScrollPosition,
} from '../InfiniteTable/utils/infiniteDOMUtils';

import { Renderable } from '../types/Renderable';
import { ScrollPosition } from '../types/ScrollPosition';
import {
  FixedPosition,
  getRenderRangeCellCount,
  getRenderRangeRowCount,
  MatrixBrain,
  TableRenderRange,
} from '../VirtualBrain/MatrixBrain';
import {
  HorizontalLayoutColVisibilityOptions,
  RenderRangeOptions,
  TableRenderCellFn,
  TableRenderDetailRowFn,
} from './rendererTypes';

import { GridCellManager } from './GridCellManager';
import { GridCellInterface } from './GridCellInterface';

import { setFilter, setIntersection } from '../../utils/setUtils';
import { ListRowInterface, ListRowManager } from './ListRowManager';

const ITEM_POSITION_WITH_TRANSFORM = true;

export const currentTransformY = stripVar(InternalVars.y);

export const scrollTopCSSVar = stripVar(InternalVars.scrollTop);
export const columnOffsetAtIndex = stripVar(InternalVars.columnOffsetAtIndex);
export const columnOffsetAtIndexWhileReordering = stripVar(
  InternalVars.columnOffsetAtIndexWhileReordering,
);

const SCROLLING_OBJECT_PARAM_FLYWEIGHT = {
  scrolling: false,
};

export class GridRenderer extends Logger {
  protected brain: MatrixBrain;

  public debugId: string = '';

  protected destroyed = false;
  private scrolling = false;

  public cellHoverClassNames: string[] = [];

  public cellDetachedClassNames: string[] = [];

  public cellManager: GridCellManager<{
    renderRowIndex: number;
    renderColIndex: number;
  }>;
  protected rowManager: ListRowManager;

  private lastEnteredRow = -1;
  private lastExitedRow = -1;

  private onDestroy: VoidFunction;

  private hoverRowUpdatesInProgress: Map<number, boolean> = new Map();
  private infiniteNode: HTMLElement | null = null;

  private getInfiniteNode(node: HTMLElement) {
    if (!this.infiniteNode) {
      this.infiniteNode = getParentInfiniteNode(node);
    }
    return this.infiniteNode!;
  }

  setDetailTransform = (
    element: HTMLElement,
    _rowIndex: number,
    {
      y,
      scrollTop,
      scrollLeft,
    }: { y: number; scrollTop?: boolean; scrollLeft?: number },
  ) => {
    element.style.setProperty(
      currentTransformY,
      scrollTop ? `calc( ${y}px + var(${scrollTopCSSVar}) )` : `${y}px`,
    );

    // this does not change, but we need for initial setup
    element.style.transform = `translate3d(${
      scrollLeft || 0
    }px, var(${currentTransformY}), 0)`;
  };

  setTransform = (
    element: HTMLElement,
    _rowIndex: number,
    colIndex: number,

    {
      //@ts-ignore
      x,
      y,
      //@ts-ignore
      scrollLeft,
      scrollTop,
    }: { x: number; y: number; scrollLeft?: boolean; scrollTop?: boolean },
    zIndex: number | 'auto' | undefined | null,
  ) => {
    const columnOffsetX = InternalVarUtils.columnOffsets.get(colIndex);
    const columnOffsetXWhileReordering = `${columnOffsetAtIndexWhileReordering}-${colIndex}`;
    // const columnZIndex = `${columnZIndexAtIndex}-${colIndex}`;

    // const infiniteNode = this.getInfiniteNode(element);

    // TODO this would be needed if it were not managed by the grid/table component
    // infiniteNode.style.setProperty(
    //   columnOffsetX,
    //   scrollLeft ? `calc( ${x}px + var(${scrollLeftCSSVar}) )` : `${x}px`,
    // );

    /**
     * #row-css-vars-on-parent-node
     * We wanted to set the transform Y of rows on the infiniteNode - so to have CSS vars
     * like currentTransformY-0, currentTransformY-1, currentTransformY-2, etc - so one for each visible row
     * and set the value of the transform in each of those CSS vars
     *
     * But it proves it's not as performant as setting it directly on the cell element
     * so we will keep it for now on each cell
     */

    const currentTransformYValue = scrollTop
      ? `calc( ${y}px + var(${scrollTopCSSVar}) )`
      : `${y}px`;
    //@ts-ignore
    if (element.__currentTransformY !== currentTransformYValue) {
      //@ts-ignore
      element.__currentTransformY = currentTransformYValue;
      element.style.setProperty(currentTransformY, currentTransformYValue);
    }

    const transformValue = `translate3d(var(${columnOffsetXWhileReordering}, ${columnOffsetX}), var(${currentTransformY}), 0)`;

    // this does not change, but we need for initial setup
    //@ts-ignore
    if (element.__transformValue !== transformValue) {
      //@ts-ignore
      element.__transformValue = transformValue;
      element.style.transform = transformValue;
    }

    if (zIndex != null) {
      // TODO this would be needed if zIndex would not be managed in grid
      // this.infiniteNode!.style.setProperty(columnZIndex, `${zIndex}`);
    }
  };

  constructor(brain: MatrixBrain, debugId?: string) {
    debugId = debugId || 'ReactHeadlessTableRenderer';
    super(debugId);
    this.brain = brain;
    this.debugId = debugId;

    this.cellManager = new GridCellManager<{
      renderRowIndex: number;
      renderColIndex: number;
    }>(debugId);

    this.cellManager.onCellAttachmentChange((cell, attached) => {
      if (attached) {
        this.onCellAttached(cell);
      } else {
        this.onCellDetached(cell);
      }
    });
    this.rowManager = new ListRowManager(debugId);

    this.rowManager.onRowAttachmentChange((row, attached) => {
      if (attached) {
        this.onRowAttached(row);
      } else {
        this.onRowDetached(row);
      }
    });

    this.renderRange = this.renderRange.bind(this);

    const removeOnScroll = brain.onScroll(this.adjustFixedElementsOnScroll);
    const removeOnSizeChange = brain.onAvailableSizeChange(() => {
      this.adjustFixedElementsOnScroll();
      //for whatever reason, sometimes there's a misplaced fixed cell and we need to
      //have it executed again, on a raf
      raf(() => {
        if (this.destroyed) {
          return;
        }
        this.adjustFixedElementsOnScroll();
      });
    });
    const removeOnScrollStart = brain.onScrollStart(this.onScrollStart);
    const removeOnScrollStop = brain.onScrollStop(this.onScrollStop);

    this.onDestroy = () => {
      removeOnScroll();
      removeOnSizeChange();
      removeOnScrollStart();
      removeOnScrollStop();
    };
  }

  private onCellAttached(cell: GridCellInterface) {
    if (this.cellDetachedClassNames.length) {
      const el = cell.getElement();
      if (el) {
        this.cellDetachedClassNames.forEach((className) => {
          el.classList.remove(className);
        });
      }
    }
  }

  private onCellDetached(cell: GridCellInterface) {
    if (this.cellDetachedClassNames.length) {
      const el = cell.getElement();
      if (el) {
        this.cellDetachedClassNames.forEach((className) => {
          el.classList.add(className);
        });
      }
    }
  }

  private onRowAttached(row: ListRowInterface) {
    if (this.cellDetachedClassNames.length) {
      const el = row.getElement();
      if (el) {
        this.cellDetachedClassNames.forEach((className) => {
          el.classList.remove(className);
        });
      }
    }
  }

  private onRowDetached(row: ListRowInterface) {
    if (this.cellDetachedClassNames.length) {
      const el = row.getElement();
      if (el) {
        this.cellDetachedClassNames.forEach((className) => {
          el.classList.add(className);
        });
      }
    }
  }

  public getFullyVisibleRowsRange = () => {
    let {
      start: [startRow],
      end: [endRow],
    } = this.brain.getRenderRange();

    while (!this.isRowFullyVisible(startRow)) {
      startRow++;

      if (startRow === endRow) {
        return null;
      }
    }
    while (!this.isRowFullyVisible(endRow)) {
      endRow--;

      if (endRow === startRow) {
        return null;
      }
    }

    return { start: startRow, end: endRow };
  };

  public getScrollPositionForScrollRowIntoView = (
    rowIndex: number,
    config: {
      scrollAdjustPosition?: ScrollAdjustPosition;
      offset?: number;
      colIndex?: number;
    } = { offset: 0 },
  ): ScrollPosition | null => {
    if (this.destroyed) {
      return null;
    }
    const { brain } = this;
    const scrollPosition = brain.getScrollPosition();

    // only needed for horizontal layout
    let scrollLeft = scrollPosition.scrollLeft;

    let { scrollAdjustPosition, offset = 0 } = config;
    if (this.isRowFullyVisible(rowIndex) && !scrollAdjustPosition) {
      return scrollPosition;
    }

    const rowOffset = brain.getItemOffsetFor(rowIndex, 'vertical');
    const rowHeight = brain.getItemSize(rowIndex, 'vertical');

    const fixedStartRowsHeight = brain.getFixedStartRowsHeight();
    const fixedEndRowsHeight = brain.getFixedEndRowsHeight();

    const top = scrollPosition.scrollTop;

    const availableSize = brain.getAvailableSize();

    if (!availableSize.height) {
      return null;
    }
    const bottom = top + availableSize.height;

    if (!scrollAdjustPosition) {
      scrollAdjustPosition =
        rowOffset > bottom - fixedEndRowsHeight
          ? 'end'
          : rowOffset < top + fixedStartRowsHeight
          ? 'start'
          : 'end';
    }

    let scrollTop = scrollPosition.scrollTop;
    if (scrollAdjustPosition === 'center') {
      scrollTop =
        rowOffset -
        Math.floor(
          (brain.getAvailableSize().height -
            fixedStartRowsHeight -
            fixedEndRowsHeight) /
            2,
        );
    } else if (scrollAdjustPosition === 'start') {
      offset = -offset;
      scrollTop += rowOffset - top + offset - fixedStartRowsHeight;
    } else {
      offset += rowHeight;
      scrollTop += rowOffset - bottom + offset + fixedEndRowsHeight;
    }

    if (this.brain.isHorizontalLayoutBrain) {
      const colIndex =
        config.colIndex! ?? Math.ceil(this.brain.getInitialCols() / 2);

      const colScrollPosition = this.getScrollPositionForScrollColumnIntoView(
        colIndex,
        {
          ...config,
          horizontalLayoutPageIndex: this.brain.getPageIndexForRow(rowIndex),
        },
      );
      if (colScrollPosition) {
        scrollLeft = colScrollPosition.scrollLeft;
      }
    }

    return {
      scrollLeft,
      scrollTop,
    };
  };

  public getScrollPositionForScrollColumnIntoView = (
    colIndex: number,
    config: {
      scrollAdjustPosition?: ScrollAdjustPosition;
      offset?: number;
    } & HorizontalLayoutColVisibilityOptions = { offset: 0 },
  ): ScrollPosition | null => {
    if (this.destroyed) {
      return null;
    }
    const { brain } = this;
    const scrollPosition = brain.getScrollPosition();
    const horizLayoutOptions =
      config.horizontalLayoutPageIndex != null
        ? { horizontalLayoutPageIndex: config.horizontalLayoutPageIndex }
        : undefined;
    let { scrollAdjustPosition, offset = 0 } = config;
    if (
      this.isColumnFullyVisible(colIndex, undefined, horizLayoutOptions) &&
      !scrollAdjustPosition
    ) {
      return scrollPosition;
    }

    if (horizLayoutOptions) {
      colIndex =
        brain.getInitialCols() * horizLayoutOptions.horizontalLayoutPageIndex +
        colIndex;
    }

    const colOffset = brain.getItemOffsetFor(colIndex, 'horizontal');
    const colWidth = brain.getItemSize(colIndex, 'horizontal');

    const fixedStartColsWidth = brain.getFixedStartColsWidth();
    const fixedEndColsWidth = brain.getFixedStartColsWidth();

    const left = scrollPosition.scrollLeft;

    const availableSize = brain.getAvailableSize();

    if (!availableSize.width) {
      return null;
    }
    const right = left + availableSize.width;

    if (!scrollAdjustPosition) {
      scrollAdjustPosition =
        colOffset > right - fixedEndColsWidth
          ? 'end'
          : colOffset < left + fixedStartColsWidth
          ? 'start'
          : 'end';
    }

    let scrollLeft = scrollPosition.scrollLeft;
    if (scrollAdjustPosition === 'center') {
      scrollLeft =
        colOffset -
        Math.floor(
          (brain.getAvailableSize().width -
            fixedStartColsWidth -
            fixedEndColsWidth) /
            2,
        );
    } else if (scrollAdjustPosition === 'start') {
      offset = -offset;
      scrollLeft += colOffset - left + offset - fixedStartColsWidth;
    } else {
      offset += colWidth;
      scrollLeft += colOffset - right + offset + fixedEndColsWidth;
    }

    return {
      ...scrollPosition,
      scrollLeft,
    };
  };

  public getScrollPositionForScrollCellIntoView = (
    rowIndex: number,
    colIndex: number,
    config: {
      rowScrollAdjustPosition?: ScrollAdjustPosition;
      colScrollAdjustPosition?: ScrollAdjustPosition;
      scrollAdjustPosition?: ScrollAdjustPosition;
      offsetTop: number;
      offsetLeft: number;
    } = { offsetLeft: 0, offsetTop: 0 },
  ): ScrollPosition | null => {
    if (this.destroyed) {
      return null;
    }
    const scrollPosForCol = this.getScrollPositionForScrollColumnIntoView(
      colIndex,
      {
        scrollAdjustPosition:
          config.colScrollAdjustPosition || config.scrollAdjustPosition,
        offset: config.offsetLeft,
      },
    );

    const scrollPosForRow = this.getScrollPositionForScrollRowIntoView(
      rowIndex,
      {
        scrollAdjustPosition:
          config.rowScrollAdjustPosition || config.scrollAdjustPosition,
        offset: config.offsetTop,
      },
    );

    if (!scrollPosForCol || !scrollPosForRow) {
      return null;
    }

    const { scrollLeft } = scrollPosForCol;
    const { scrollTop } = scrollPosForRow;

    return { scrollLeft, scrollTop };
  };

  public isRowFullyVisible = (rowIndex: number, offsetMargin = 2) => {
    return this.isRowVisible(
      rowIndex,
      this.brain.getRowHeight(rowIndex) - offsetMargin,
    );
  };

  public isRowVisible = (rowIndex: number, offsetMargin = 10) => {
    if (!this.isRowRendered(rowIndex)) {
      return false;
    }
    const pageIndex = this.brain.getPageIndexForRow(rowIndex);
    rowIndex =
      pageIndex && this.brain.rowsPerPage
        ? rowIndex % this.brain.rowsPerPage
        : rowIndex;

    const { brain } = this;

    if (brain.isRowFixed(rowIndex)) {
      return true;
    }

    const {
      start: [startRow],
      end: [endRow],
    } = this.brain.getRenderRange();

    const midRow = Math.floor((startRow + endRow) / 2);

    if (rowIndex < startRow) {
      return false;
    }
    if (rowIndex >= endRow) {
      return false;
    }

    if (rowIndex >= midRow) {
      const lastVisibleRow = brain.getItemAt(
        brain.getAvailableSize().height +
          brain.getScrollPosition().scrollTop -
          offsetMargin,
        'vertical',
      );

      return rowIndex <= lastVisibleRow;
    }

    if (rowIndex < midRow) {
      const firstVisibleRow = brain.getItemAt(
        brain.getScrollPosition().scrollTop + offsetMargin,
        'vertical',
      );

      return rowIndex >= firstVisibleRow;
    }

    return true;
  };

  public isRowRendered = (rowIndex: number) => {
    if (!this.brain.isHorizontalLayoutBrain) {
      return this.cellManager.isRowAttached(rowIndex);
    }

    const initialRowIndex = rowIndex;

    rowIndex = this.brain.rowsPerPage
      ? rowIndex % this.brain.rowsPerPage
      : rowIndex;

    return (
      this.cellManager
        .getCellsForRow(rowIndex)
        .filter(
          (cell) =>
            cell.getAdditionalInfo()?.renderRowIndex === initialRowIndex,
        ).length > 0
    );
  };

  public isCellVisible = (rowIndex: number, colIndex: number) => {
    return this.isRowVisible(rowIndex) && this.isColumnVisible(colIndex);
  };

  public isCellFullyVisible = (
    rowIndex: number,
    colIndex: number,
    opts?: HorizontalLayoutColVisibilityOptions,
  ) => {
    return (
      this.isRowFullyVisible(rowIndex) &&
      this.isColumnVisible(colIndex, undefined, opts)
    );
  };

  public isColumnFullyVisible = (
    colIndex: number,
    offsetMargin = 2,
    opts?: HorizontalLayoutColVisibilityOptions,
  ) => {
    return this.isColumnVisible(
      colIndex,
      this.brain.getColWidth(colIndex) - offsetMargin,
      opts,
    );
  };

  public isColumnVisible = (
    colIndex: number,
    offsetMargin = 10,
    opts?: HorizontalLayoutColVisibilityOptions,
  ) => {
    if (!this.isColumnRendered(colIndex, opts)) {
      return false;
    }

    const { brain } = this;

    if (brain.isColFixed(colIndex)) {
      return true;
    }
    if (opts && opts.horizontalLayoutPageIndex != null) {
      colIndex = brain.getVirtualColIndex(colIndex, {
        pageIndex: opts.horizontalLayoutPageIndex,
      });
    }

    const {
      start: [_, startCol],
      end: [__, endCol],
    } = brain.getRenderRange();

    if (colIndex < startCol) {
      return false;
    }
    if (colIndex >= endCol) {
      return false;
    }

    const midCol = Math.floor((startCol + endCol) / 2);

    if (colIndex >= midCol) {
      const lastVisibleCol = brain.getItemAt(
        brain.getAvailableSize().width +
          brain.getScrollPosition().scrollLeft -
          offsetMargin -
          brain.getFixedEndColsWidth(),
        'horizontal',
      );

      return colIndex <= lastVisibleCol;
    }

    if (colIndex < midCol) {
      const firstVisibleCol = brain.getItemAt(
        brain.getScrollPosition().scrollLeft +
          offsetMargin +
          brain.getFixedStartColsWidth(),
        'horizontal',
      );

      return colIndex >= firstVisibleCol;
    }

    return true;
  };

  public isCellRendered = (
    rowIndex: number,
    colIndex: number,
    opts?: HorizontalLayoutColVisibilityOptions,
  ) => {
    return (
      this.isRowRendered(rowIndex) && this.isColumnRendered(colIndex, opts)
    );
  };

  public isColumnRendered = (
    colIndex: number,
    opts?: HorizontalLayoutColVisibilityOptions,
  ) => {
    const {
      start: [startRow],
    } = this.brain.getRenderRange();

    if (opts?.horizontalLayoutPageIndex != null) {
      const colsCount = this.brain.getInitialCols();

      colIndex = colsCount * opts.horizontalLayoutPageIndex + colIndex;
    }

    return this.cellManager.isCellAttachedAt([startRow, colIndex]);
  };

  getExtraSpanCellsForRange = (range: TableRenderRange) => {
    const { start, end } = range;
    const [startRow, startCol] = start;
    const [endRow, endCol] = end;

    return this.brain.getExtraSpanCellsForRange({
      horizontal: { startIndex: startCol, endIndex: endCol },
      vertical: { startIndex: startRow, endIndex: endRow },
    });
  };

  isCellRenderedAndMappedCorrectly(row: number, col: number) {
    const rendered = !!this.cellManager.getCellAt([row, col]);
    return {
      rendered,
      mapped: rendered,
    };
  }

  renderRange(
    range: TableRenderRange,

    { renderCell, renderDetailRow, force, onRender }: RenderRangeOptions,
  ): Renderable[] {
    if (this.destroyed) {
      return [];
    }

    const { start, end } = range;

    const horizontalLayout = this.brain.isHorizontalLayoutBrain;

    if (__DEV__) {
      this.debug(`Render range ${start}-${end}. Force ${force}`);
    }

    const { rowManager, cellManager } = this;

    const fixedRanges = this.getFixedRanges(range);
    const ranges = [range, ...fixedRanges];

    const alwaysRenderedColumns = this.brain.getAlwaysRenderedColumns();

    if (alwaysRenderedColumns.length > 0) {
      const startCol = range.start[1];
      const endCol = range.end[1];

      alwaysRenderedColumns.forEach((colIndex) => {
        const colInRange = startCol <= colIndex && colIndex < endCol;

        if (!colInRange) {
          ranges.push({
            start: [range.start[0], colIndex],
            end: [range.end[0], colIndex + 1],
          });
        }
      });
    }

    const extraCellsMap = new Map<string, boolean>();
    const extraCells = ranges.map(this.getExtraSpanCellsForRange).flat();
    /**
     * We can have some extra cells outside the render range that should still
     * be visible (even though they are outside). This is due to row/col spanning.
     *
     * All cells from the extra cells are cells outside the render range
     * that span and cover cells from either the first row or the first column
     * in the render range
     *
     * here we build a map for faster accessing
     */
    if (extraCells) {
      extraCells.forEach(([rowIndex, colIndex]) => {
        extraCellsMap.set(`${rowIndex}:${colIndex}`, true);
      });
    }

    /**
     * the render count is always the rows times cols that are inside the viewport
     * and is not modified by row or column spanning
     *
     * when we have fixed cols/rows, the fixed range could, at runtime, be included in the initial `range` const
     * but could as well not be included
     *
     * but we want to compute the biggest renderCount we can, so as to avoid mounting extra DOM elements
     * at runtime based on the scroll position
     */
    const renderCount = ranges.reduce(
      (sum, range) => sum + getRenderRangeCellCount(range),
      0,
    );
    const renderRowCount = renderDetailRow
      ? ranges.reduce((sum, range) => sum + getRenderRangeRowCount(range), 0)
      : 0;

    const rowCount = this.brain.getRowCount();
    const colCount = this.brain.getColCount();

    cellManager.detachCellsStartingAt([rowCount, colCount]);

    const maxCount = Math.min(rowCount * colCount, renderCount);

    if (renderDetailRow) {
      rowManager.detachStartingWith(this.brain.getRowCount());

      if (rowManager.poolSize > renderRowCount) {
        rowManager.poolSize = renderRowCount;
      }
    }

    // we only need to keep those that are outside all ranges
    // so we need to do an intersection of all those elements

    let cellsOutsideRanges = setIntersection(
      ...ranges.map((range) => cellManager.getCellsOutsideRenderRange(range)),
    );

    cellsOutsideRanges = setFilter(cellsOutsideRanges, (cell) => {
      const cellPos = cellManager.getCellPosition(cell);
      // keep those elements that host a cell that is in the extraCells map
      // We do this in order not to do extra work and rerender it later in case
      // it's already rendered
      //
      // so we need to filter those elements out
      if (cellPos && extraCellsMap.has(`${cellPos[0]}:${cellPos[1]}`)) {
        return false;
      }

      // and only keep those elements that correspond to cells
      // outside the render range and outside the extra cells
      return true;
    });

    // detach cells that are outside the render range
    // meaning they won't have an x,y position in the matrix
    cellManager.detachCells(cellsOutsideRanges);

    // if renderCount > poolSize, this creates extra elements in the pool, as needed
    // but if renderCount < poolSize, it destroys the extra elements that are
    // not bound to an x,y position in the matrix
    cellManager.poolSize = maxCount;

    // start from the last rendered, and render additional elements, until we have renderCount
    // this loop might not even execute the body once if all the elements are present
    // for (let i = this.items.length; i < renderCount; i++) {
    //   this.renderElement(i);
    //   // push at start
    //   elementsOutsideItemRange.splice(0, 0, i);
    // }

    const visitedCells = new Map<string, boolean>();
    const visitedRows = new Map<number, boolean>();

    ranges.forEach((range) => {
      const { start, end } = range;
      const [startRow, startCol] = start;
      const [endRow, endCol] = end;

      for (let row = startRow; row < endRow; row++) {
        for (let col = startCol; col < endCol; col++) {
          const key = `${row}:${col}`;
          if (visitedCells.has(key)) {
            continue;
          }
          visitedCells.set(key, true);
          const { rendered: cellRendered, mapped: cellMappedCorrectly } =
            this.isCellRenderedAndMappedCorrectly(row, col);

          // for cells that belong to the first row of the render range
          // or to the first column of the render range
          // if they are "covered" (spanned by) by previous cells
          // those cells we want to "throw" away and instead of them
          // we render the spanning cell
          // all other spanned cells (further below or to the right), we keep as rendered
          // we do this in order to preserve a constant renderCount
          if (row === startRow || col === startCol) {
            const parentCellPos = this.isCellCovered(row, col);

            // if this cell is covered by another (parent) cell
            // which is outside of the render range (so which is in the extra cells collection)
            if (
              parentCellPos &&
              extraCellsMap.has(`${parentCellPos[0]}:${parentCellPos[1]}`)
            ) {
              // then we can take that cell and reuse it
              // for other cells
              const coveredCell = cellManager.getCellAt([row, col]);

              if (coveredCell != null) {
                cellManager.detachCell(coveredCell);
              }
              continue;
            }
          }

          if (cellRendered && !force && cellMappedCorrectly) {
            continue;
          }

          let theCell: GridCellInterface | undefined;

          if (cellRendered) {
            theCell = cellManager.getCellAt([row, col]);
          } else {
            theCell = cellManager.getCellFor(
              [row, col],
              horizontalLayout ? 'row' : 'column',
            );
          }

          if (theCell == null) {
            // we might have had overlap initially of the render range with a fixed range
            // as we want to create an element even for the overlap of the two
            // but that element might not have been rendered, so it will be in itemDOMRefs
            // but won't have a corresponding DOM element yet in itemDOMElements

            theCell = cellManager.getDetachedCell();
          }

          this.renderCellAt(row, col, theCell, renderCell);
        }
        if (!renderDetailRow) {
          continue;
        }
        if (visitedRows.has(row)) {
          continue;
        }
        visitedRows.set(row, true);
        const rowRendered = rowManager.isRowAttachedAt(row);

        // for now we wont implement row spanning with detail rows
        // so we can have simplified logic here

        if (rowRendered && !force) {
          continue;
        }

        this.renderDetailRowAtElement(
          row,
          this.rowManager.getRowFor(row),
          renderDetailRow,
        );
      }
    });

    extraCells.forEach(([rowIndex, colIndex]) => {
      const { rendered, mapped } = this.isCellRenderedAndMappedCorrectly(
        rowIndex,
        colIndex,
      );
      if (rendered) {
        if (force || !mapped) {
          const cellPos: [number, number] = [rowIndex, colIndex];
          const cell = cellManager.getCellAt(cellPos)!;

          this.renderCellAt(rowIndex, colIndex, cell, renderCell);
        }
        return;
      }

      const cell = cellManager.getCellFor(
        [rowIndex, colIndex],
        horizontalLayout ? 'row' : 'column',
      );
      if (cell == null) {
        if (__DEV__) {
          this.error(`Cannot find cell to render ${rowIndex}-${colIndex}`);
        }

        return;
      }
      this.renderCellAt(rowIndex, colIndex, cell, renderCell);
    });

    // cellManager.withDetachedCells((cell) => {
    //   cell.update(null);
    // });

    if (renderDetailRow) {
      // rowManager.withDetachedRows((row) => {
      //   row.update(null);
      // });
    }

    // OLD we need to spread and create a new array
    // OLD as otherwise the AvoidReactDiff component will receive the same array
    // OLD and since it uses setState internally, it will not render/update
    // const result = [...this.items];
    // let result = this.items;
    let result = cellManager.getAllCells().map((cell) => cell.getNode());

    if (renderDetailRow) {
      rowManager.getAllRows().forEach((row) => {
        result.push(row.getNode());
      });
    }

    // TODO why does this optimisation not work
    // if (this.items.length > this.prevLength) {
    //   // only assign and do a render when
    //   // we have more items than last time
    //   // so we need to show new items
    // result = [...this.items, ...this.detailItems];

    this.adjustFixedElementsOnScroll();
    if (onRender) {
      onRender(result);
    }
    //   this.prevLength = result.length;
    // }

    return result;
  }

  getFixedRanges = (
    currentRenderRange: TableRenderRange,
  ): TableRenderRange[] => {
    const { fixedRowsStart, fixedRowsEnd, fixedColsStart, fixedColsEnd } =
      this.brain.getFixedCellInfo();
    if (!fixedRowsStart && !fixedColsStart && !fixedRowsEnd && !fixedColsEnd) {
      return [];
    }
    /**
     * The current range includes all non-fixed cells in the viewport
     *
     * So for example, if we have 10x10 (10 rows and 10 cols), with
     * fixed rows start = 2
     * fixed rows end = 2
     * fixed cols start = 2
     * fixed cols end = 2
     *
     * then the current range will be [2, 2] to [8, 8]
     *
     *
     *
     */
    const colCount = this.brain.getColCount();
    const rowCount = this.brain.getRowCount();

    const { start, end } = currentRenderRange;
    const [startRow, startCol] = start;
    const [endRow, endCol] = end;

    const arr: TableRenderRange[] = [];

    /**
     *  *--*-----*--*
     *  | 1|  2  |3 |
     *  *--*-----*--*
     *  |  |     |  |
     *  |4 | 5   |6 |
     *  *--*-----*--*
     *  |7 |8    |9 |
     *  *--*-----*--*
     */

    if (fixedColsStart) {
      /**
       * if we have overlap, both cols fixed at start AND rows fixed at start and end
       *
       * then for this if-branch, we push to the resulting array
       * both 1, 4 and 7
       *
       * and when we'll get to fixedRowsStart, we'll only push 2 there
       * and when we'll get to fixedRowsEnd, we'll only push 8 there
       *
       *
       */
      if (fixedRowsStart) {
        // range 1
        arr.push({
          rowFixed: 'start',
          colFixed: 'start',
          start: [0, 0],
          end: [fixedRowsStart, fixedColsStart],
        });
      }
      if (fixedRowsEnd) {
        // range 7
        arr.push({
          rowFixed: 'end',
          colFixed: 'start',
          start: [rowCount - fixedRowsEnd, 0],
          end: [rowCount, fixedColsStart],
        });
      }
      // range 4
      arr.push({
        rowFixed: false,
        colFixed: 'start',
        start: [startRow, 0],
        end: [endRow, fixedColsStart],
      });
    }
    if (fixedColsEnd) {
      /**
       * if we have overlap, both cols fixed at end and rows fixed at start and end
       *
       * then for this if-branch, we push to the resulting array
       * both 3, 6 and 9
       *
       * and when we'll get to fixedRowsStart, we'll only push 2 there
       * and when we'll get to fixedRowsEnd, we'll only push 8 there
       *
       */
      if (fixedRowsStart) {
        // range 3
        arr.push({
          colFixed: 'end',
          rowFixed: 'start',
          start: [0, colCount - fixedColsEnd],
          end: [fixedRowsStart, colCount],
        });
      }
      if (fixedRowsEnd) {
        // range 9
        arr.push({
          colFixed: 'end',
          rowFixed: 'end',
          start: [rowCount - fixedRowsEnd, colCount - fixedColsEnd],
          end: [rowCount, colCount],
        });
      }
      // range 6
      arr.push({
        colFixed: 'end',
        rowFixed: false,
        start: [startRow, colCount - fixedColsEnd],
        end: [endRow, colCount],
      });
    }

    if (fixedRowsStart) {
      /**
       * If we have cols start and end, this will be only section 2
       * otherwise, if we only have cols start, though we only push 1 range, it will include section 2 and 3
       * and if we only have cols end, though we only push 1 range it will include section 1 and 2
       * and if we have no fixed cols, this will be one range that inclues 1, 2 and 3
       */
      const fixedRowsStartRange: TableRenderRange = {
        start: [0, startCol],
        end: [fixedRowsStart, endCol],
        rowFixed: 'start',
        colFixed: false,
      };
      arr.push(fixedRowsStartRange);
    }

    if (fixedRowsEnd) {
      /**
       * Likewise for fixedRowsEnd
       */
      const fixedRowsEndRange: TableRenderRange = {
        rowFixed: 'end',
        colFixed: false,
        start: [rowCount - fixedRowsEnd, startCol],
        end: [rowCount, endCol],
      };
      arr.push(fixedRowsEndRange);
    }

    return arr;
  };

  protected isCellFixed = (
    rowIndex: number,
    colIndex: number,
  ): { row: FixedPosition; col: FixedPosition } => {
    const { fixedRowsStart, fixedRowsEnd, fixedColsStart, fixedColsEnd } =
      this.brain.getFixedCellInfo();

    const colCount = this.brain.getColCount();
    const rowCount = this.brain.getRowCount();

    let rowFixed = false;
    let colFixed = false;

    let pos: FixedPosition = false;

    if (rowIndex < fixedRowsStart) {
      rowFixed = true;
      pos = 'start';
    }

    if (fixedRowsEnd && !rowFixed) {
      const firstRowFixedEnd = rowCount - fixedRowsEnd;
      if (rowIndex >= firstRowFixedEnd) {
        rowFixed = true;
        pos = 'end';
      }
    }

    if (colIndex < fixedColsStart) {
      colFixed = true;
      pos = 'start';
    }

    if (fixedColsEnd && !colFixed) {
      const firstColFixedEnd = colCount - fixedColsEnd;

      if (colIndex >= firstColFixedEnd) {
        colFixed = true;
        pos = 'end';
      }
    }

    return {
      row: rowFixed ? pos : false,
      col: colFixed ? pos : false,
    };
  };

  protected isCellCovered = (rowIndex: number, colIndex: number) => {
    const rowspanParent = this.brain.getRowspanParent(rowIndex, colIndex);
    const colspanParent = this.brain.getColspanParent(rowIndex, colIndex);

    const coveredByAnotherRow = rowspanParent != rowIndex;
    const coveredByAnotherCol = colspanParent != colIndex;

    const covered = coveredByAnotherRow || coveredByAnotherCol;

    return covered ? [rowspanParent, colspanParent] : false;
  };

  private renderDetailRowAtElement(
    rowIndex: number,
    row: ListRowInterface,
    renderDetailRow: TableRenderDetailRowFn,
  ) {
    if (this.destroyed) {
      return;
    }

    const covered = false;

    const height = this.brain.getRowHeight(rowIndex);

    // const { row: rowFixed, col: colFixed } = this.isCellFixed(rowIndex);

    const rowFixed = this.brain.isRowFixedStart(rowIndex)
      ? 'start'
      : this.brain.isRowFixedEnd(rowIndex)
      ? 'end'
      : false;

    const hidden = !!covered;

    const renderedDetailNode = renderDetailRow({
      rowIndex,
      height,
      rowFixed,
      hidden,
      onMouseEnter: () => {},
      onMouseLeave: () => {},
      domRef: row.ref,
    });

    if (!row.isMounted()) {
      row.onMount((row) => {
        const element = row.getElement();
        if (element) {
          element.style.position = 'absolute';
          element.style.left = '0px';
        }
        this.updateDetailElementPosition(row);
      });
    }

    if (!renderedDetailNode) {
      // if (this.brain.isHorizontalLayoutBrain) {
      // see renderCellAt
      // here we're doing very similar things
      this.rowManager.detachRow(row);
      // }
      return;
    }
    this.rowManager.renderNodeAtRow(renderedDetailNode, row, rowIndex);

    this.updateDetailElementPosition(row);
    return;
  }

  protected getCellRealCoordinates(rowIndex: number, colIndex: number) {
    return {
      rowIndex,
      colIndex,
    };
  }

  protected renderCellAt(
    rowIndex: number,
    colIndex: number,
    cell: GridCellInterface,
    renderCell: TableRenderCellFn,
  ) {
    if (this.destroyed) {
      return;
    }

    const covered = this.isCellCovered(rowIndex, colIndex);

    const height = this.brain.getRowHeight(rowIndex);
    const width = this.brain.getColWidth(colIndex);

    const rowspan = this.brain.getRowspan(rowIndex, colIndex);
    const colspan = this.brain.getColspan(rowIndex, colIndex);

    const heightWithRowspan =
      rowspan === 1
        ? height
        : this.brain.getRowHeightWithSpan(rowIndex, colIndex, rowspan);

    const widthWithColspan =
      colspan === 1
        ? width
        : this.brain.getColWidthWithSpan(rowIndex, colIndex, colspan);

    const { row: rowFixed, col: colFixed } = this.isCellFixed(
      rowIndex,
      colIndex,
    );

    const hidden = !!covered;

    const { rowIndex: renderRowIndex, colIndex: renderColIndex } =
      this.getCellRealCoordinates(rowIndex, colIndex);

    const renderedNode = renderCell({
      rowIndex: renderRowIndex,
      colIndex: renderColIndex,
      height,
      width,
      rowspan,
      colspan,
      rowFixed,
      colFixed,
      hidden,
      heightWithRowspan,
      widthWithColspan,
      onMouseEnter: this.onMouseEnter.bind(null, rowIndex),
      onMouseLeave: this.onMouseLeave.bind(null, rowIndex),
      domRef: cell.ref,
    });

    if (!cell.isMounted()) {
      cell.onMount((cell) => {
        const element = cell.getElement();
        if (element) {
          element.style.position = 'absolute';
          element.style.left = '0px';
          element.style.top = '0px';
        }
        this.updateElementPosition(cell);
      });
    }

    const cellAdditionalInfo = this.brain.isHorizontalLayoutBrain
      ? {
          renderRowIndex,
          renderColIndex,
        }
      : undefined;

    if (!renderedNode) {
      if (this.brain.isHorizontalLayoutBrain) {
        // we're rendering a cell that's in the range but actually there's no matching
        // cell for it.
        // TODO: radu - see http://localhost:5555/tests/table/virtualization/perf-demo
        // when expanding group 1 and group 2, then collapse group 1
        // we should correctly update - but if we don't do the line below
        // cells will not get detached
        this.cellManager.detachCell(cell);
      } else {
        //however, we have to do it not only for horizontal layout
        // but also for other non-horizontal layout scenarios as well
        // eg for pivot, in the header we can have some cells (due to column grouping)
        // that should not be attached, even if they are in range
        // see
        // /tests/table/props/pivot/pivot-total-column-position
        this.cellManager.detachCell(cell);
      }

      return;
    }
    SCROLLING_OBJECT_PARAM_FLYWEIGHT.scrolling = this.scrolling;
    this.cellManager.renderNodeAtCell(
      renderedNode,
      cell,
      [rowIndex, colIndex],
      cellAdditionalInfo,
      SCROLLING_OBJECT_PARAM_FLYWEIGHT,
    );

    this.updateElementPosition(cell, { hidden, rowspan, colspan });
    return;
  }

  protected onMouseEnter = (rowIndex: number) => {
    this.lastEnteredRow = rowIndex;
    this.lastExitedRow = -1;

    if (this.scrolling) {
      return;
    }
    if (rowIndex != -1) {
      this.addHoverClass(rowIndex);
    }
  };

  private addHoverClass = (rowIndex: number) => {
    this.cellManager.getCellsForRow(rowIndex).forEach((cell) => {
      const element = cell.getElement();
      if (element) {
        this.cellHoverClassNames.forEach((cls) => {
          element.classList.add(cls);
        });
      }
    });
  };

  protected onMouseLeave = (rowIndex: number) => {
    this.lastExitedRow = rowIndex;
    this.lastEnteredRow = -1;
    if (this.scrolling) {
      return;
    }
    if (rowIndex != -1) {
      this.removeHoverClass(rowIndex);
    }
  };

  private removeHoverClass = (rowIndex: number) => {
    this.cellManager.getCellsForRow(rowIndex).forEach((cell) => {
      const element = cell.getElement();

      if (element) {
        this.cellHoverClassNames.forEach((cls) => {
          element.classList.remove(cls);
        });
      }
    });
  };

  protected updateHoverClassNamesForRow = (rowIndex: number) => {
    if (this.scrolling) {
      return;
    }
    if (__DEV__ && !this.hoverRowUpdatesInProgress) {
      return;
    }
    if (this.hoverRowUpdatesInProgress.has(rowIndex)) {
      return;
    }

    this.hoverRowUpdatesInProgress.set(rowIndex, true);

    const checkHoverClass = () => {
      if (!this.scrolling && this.lastEnteredRow != -1) {
        if (this.lastEnteredRow === rowIndex) {
          this.addHoverClass(rowIndex);
        } else {
          this.removeHoverClass(rowIndex);
        }
      }
    };
    raf(() => {
      if (this.destroyed) {
        return;
      }
      checkHoverClass();

      this.hoverRowUpdatesInProgress.delete(rowIndex);
    });
  };

  protected updateElementPosition = (
    cell: GridCellInterface<{
      renderRowIndex: number;
      renderColIndex: number;
    }>,
    options?: { hidden: boolean; rowspan: number; colspan: number },
  ) => {
    if (this.destroyed) {
      return;
    }
    const itemElement = cell.getElement();

    const cellPos = this.cellManager.getCellPosition(cell);
    if (!cellPos) {
      return;
    }
    const [rowIndex, colIndex] = cellPos;

    const itemPosition = this.brain.getCellOffset(rowIndex, colIndex);

    if (itemPosition == null) {
      return;
    }

    const { x, y } = itemPosition;

    if (itemElement) {
      this.updateHoverClassNamesForRow(rowIndex);

      // itemElement.style.gridColumn = `${colIndex} / span 1`;
      // itemElement.style.gridRow = `${rowIndex} / span 1`;

      // (itemElement.dataset as any).elementIndex = elementIndex;
      const realCoords = this.getCellRealCoordinates(rowIndex, colIndex);
      (itemElement.dataset as any).rowIndex = realCoords.rowIndex;

      (itemElement.dataset as any).colIndex = realCoords.colIndex;

      if (ITEM_POSITION_WITH_TRANSFORM) {
        this.setTransform(itemElement, rowIndex, colIndex, { x, y }, null);

        itemElement.style.willChange = 'transform';
        itemElement.style.backfaceVisibility = 'hidden';
        // need to set it to auto
        // in case some fixed cells are reused
        // as the fixed cells had a zIndex
        const hidden = options
          ? options.hidden
          : !!this.isCellCovered(rowIndex, colIndex);

        const zIndex = hidden
          ? '-1'
          : // #updatezindex - we need to allow elements use their own zIndex, so we
            // resort to allowing them to have it as a data-z-index attribute
            itemElement.dataset.zIndex || 'auto';

        //@ts-ignore
        if (itemElement.__zIndex !== zIndex) {
          //@ts-ignore
          itemElement.__zIndex = zIndex;
          itemElement.style.zIndex = zIndex;
        }
      } else {
        itemElement.style.display = '';
        itemElement.style.left = `${x}px`;
        itemElement.style.top = `${y}px`;
      }
    }
  };

  private updateDetailElementPosition = (row: ListRowInterface) => {
    if (this.destroyed) {
      return;
    }
    const itemElement = row.getElement();
    const rowIndex = this.rowManager.getRowIndex(row);

    if (rowIndex == null) {
      if (__DEV__) {
        this.error(`Cannot find row for detail element ${rowIndex}`);
      }
      return;
    }

    const itemPosition = this.brain.getItemOffsetFor(rowIndex, 'vertical');

    if (itemPosition == null) {
      return;
    }

    const y = itemPosition;

    if (itemElement) {
      (itemElement.dataset as any).detailRowIndex = rowIndex;

      if (ITEM_POSITION_WITH_TRANSFORM) {
        this.setDetailTransform(itemElement, rowIndex, {
          y,
          scrollLeft: this.brain.getScrollPosition().scrollLeft,
        });

        itemElement.style.willChange = 'transform';
        itemElement.style.backfaceVisibility = 'hidden';
        // need to set it to auto
        // in case some fixed cells are reused
        // as the fixed cells had a zIndex

        itemElement.style.zIndex = // #updatezindex - we need to allow elements use their own zIndex, so we
          // resort to allowing them to have it as a data-z-index attribute
          itemElement.dataset.zIndex || 'auto';
        // } else {
        //   itemElement.style.display = '';
        //   itemElement.style.top = `${y}px`;
      }
    }
  };

  private onScrollStart = () => {
    this.scrolling = true;

    if (this.lastEnteredRow != -1) {
      this.removeHoverClass(this.lastEnteredRow);
    }
  };

  private onScrollStop = () => {
    this.scrolling = false;

    if (this.lastEnteredRow != -1) {
      this.addHoverClass(this.lastEnteredRow);
    }
    if (this.lastExitedRow != -1) {
      this.removeHoverClass(this.lastExitedRow);
    }
  };

  public adjustFixedElementsOnScroll = (
    scrollPosition: ScrollPosition = this.brain.getScrollPosition(),
  ) => {
    const { brain, cellManager, rowManager } = this;

    const cols = this.brain.getColCount();
    const rows = this.brain.getRowCount();

    const { fixedColsStart, fixedColsEnd, fixedRowsStart, fixedRowsEnd } =
      this.brain.getFixedCellInfo();

    if (rowManager.getAttachedCount()) {
      rowManager.forEachAttachedRow((row) => {
        const rowIndex = rowManager.getRowIndex(row);

        if (rowIndex != null) {
          const y = this.brain.getItemOffsetFor(rowIndex, 'vertical');

          if (y == null) {
            return;
          }
          const node = row.getElement();
          if (!node) {
            return;
          }

          this.setDetailTransform(node, rowIndex, {
            y,
            scrollLeft: scrollPosition.scrollLeft,
          });
        }
      });
    }

    if (!fixedColsStart && !fixedColsEnd && !fixedRowsStart && !fixedRowsEnd) {
      return;
    }

    const attachedCell = this.cellManager.getOneAttachedCell();
    if (attachedCell) {
      setInfiniteScrollPosition(
        scrollPosition,
        this.getInfiniteNode(attachedCell.getElement()!),
      );
    }

    const fixedEndColsOffsets = this.brain.getFixedEndColsOffsets({
      skipScroll: true,
    });
    const fixedEndRowsOffsets = this.brain.getFixedEndRowsOffsets({
      skipScroll: true,
    });

    const { start, end } = this.brain.getRenderRange();

    const [startRow, startCol] = start;
    const [endRow, endCol] = end;

    function adjustElementPosition(
      rowIndex: number,
      colIndex: number,
      fn: (
        rowIndex: number,
        colIndex: number,
        node: HTMLElement,
        { x, y }: { x: number; y: number },
      ) => void,
    ) {
      const cell = cellManager.getCellAt([rowIndex, colIndex]);
      if (cell == null) {
        return;
      }
      const itemPosition = brain.getCellOffset(rowIndex, colIndex);

      const node = cell.getElement();

      if (node && itemPosition) {
        fn(rowIndex, colIndex, node!, itemPosition);
      }
    }

    const adjustColStart = (
      _rowIndex: number,
      colIndex: number,
      node: HTMLElement,
      { x, y }: { x: number; y: number },
    ) => {
      this.setTransform(
        node,
        _rowIndex,
        colIndex,
        { x: x, y, scrollLeft: true },
        fixedColsStart - colIndex,
      );
    };

    const adjustRowStart = (
      rowIndex: number,
      _colIndex: number,
      node: HTMLElement,
      coords: { x: number; y: number },
    ) => {
      this.setTransform(
        node,
        rowIndex,
        _colIndex,

        { x: coords.x, y: coords.y, scrollTop: true },
        fixedRowsStart - rowIndex,
      );
    };

    const adjustColEnd = (
      _rowIndex: number,
      colIndex: number,
      node: HTMLElement,
      { y }: { y: number },
    ) => {
      const val = fixedEndColsOffsets[colIndex];

      this.setTransform(
        node,
        _rowIndex,
        colIndex,
        { x: val, y, scrollLeft: true },
        cols - colIndex,
      );
    };

    const adjustRowEnd = (
      rowIndex: number,
      _colIndex: number,
      node: HTMLElement,
      coords: { x: number; y: number },
    ) => {
      this.setTransform(
        node,
        rowIndex,
        _colIndex,
        { x: coords.x, y: fixedEndRowsOffsets[rowIndex], scrollTop: true },
        rows - rowIndex,
      );
    };

    const adjustColStartRowStart = (
      _rowIndex: number,
      _colIndex: number,
      node: HTMLElement,
      { x, y }: { x: number; y: number },
    ) => {
      this.setTransform(
        node,
        _rowIndex,
        _colIndex,
        { x: x, scrollLeft: true, y: y, scrollTop: true },
        100_000,
      );
    };

    const adjustColStartRowEnd = (
      _rowIndex: number,
      _colIndex: number,
      node: HTMLElement,
      { x }: { x: number; y: number },
    ) => {
      this.setTransform(
        node,
        _rowIndex,
        _colIndex,
        {
          x: x,
          scrollLeft: true,
          y: fixedEndRowsOffsets[_rowIndex],
          scrollTop: true,
        },
        200_000,
      );
    };

    const adjustColEndRowStart = (
      _rowIndex: number,
      colIndex: number,
      node: HTMLElement,
      coords: { y: number },
    ) => {
      this.setTransform(
        node,
        _rowIndex,
        colIndex,
        {
          x: fixedEndColsOffsets[colIndex],
          y: coords.y,
          scrollLeft: true,
          scrollTop: true,
        },
        300_000,
      );
    };

    const adjustColEndRowEnd = (
      rowIndex: number,
      colIndex: number,
      node: HTMLElement,
    ) => {
      this.setTransform(
        node,
        rowIndex,
        colIndex,
        {
          x: fixedEndColsOffsets[colIndex],
          y: fixedEndRowsOffsets[rowIndex],
          scrollLeft: true,
          scrollTop: true,
        },
        400_000,
      );
    };

    if (fixedColsStart || fixedColsEnd) {
      for (let rowIndex = startRow; rowIndex < endRow; rowIndex++) {
        for (let colIndex = 0; colIndex < fixedColsStart; colIndex++) {
          adjustElementPosition(rowIndex, colIndex, adjustColStart);
        }
        if (fixedColsEnd) {
          const firstColFixedEnd = cols - fixedColsEnd;

          for (let colIndex = firstColFixedEnd; colIndex < cols; colIndex++) {
            adjustElementPosition(rowIndex, colIndex, adjustColEnd);
          }
        }
      }
    }

    if (fixedRowsStart || fixedRowsEnd) {
      for (let colIndex = startCol; colIndex < endCol; colIndex++) {
        for (let rowIndex = 0; rowIndex < fixedRowsStart; rowIndex++) {
          adjustElementPosition(rowIndex, colIndex, adjustRowStart);
        }
        if (fixedRowsEnd) {
          const firstRowFixedEnd = rows - fixedRowsEnd;
          for (let rowIndex = firstRowFixedEnd; rowIndex < rows; rowIndex++) {
            adjustElementPosition(rowIndex, colIndex, adjustRowEnd);
          }
        }
      }
    }

    if (fixedColsStart && fixedRowsStart) {
      for (let rowIndex = 0; rowIndex < fixedRowsStart; rowIndex++) {
        for (let colIndex = 0; colIndex < fixedColsStart; colIndex++) {
          adjustElementPosition(rowIndex, colIndex, adjustColStartRowStart);
        }
      }
    }
    if (fixedColsStart && fixedRowsEnd) {
      const firstRowFixedEnd = rows - fixedRowsEnd;
      for (let rowIndex = firstRowFixedEnd; rowIndex < rows; rowIndex++) {
        for (let colIndex = 0; colIndex < fixedColsStart; colIndex++) {
          adjustElementPosition(rowIndex, colIndex, adjustColStartRowEnd);
        }
      }
    }

    if (fixedColsEnd && fixedRowsStart) {
      const firstColFixedEnd = cols - fixedColsEnd;
      for (let rowIndex = 0; rowIndex < fixedRowsStart; rowIndex++) {
        for (let colIndex = firstColFixedEnd; colIndex < cols; colIndex++) {
          adjustElementPosition(rowIndex, colIndex, adjustColEndRowStart);
        }
      }
    }

    if (fixedColsEnd && fixedRowsEnd) {
      const firstRowFixedEnd = rows - fixedRowsEnd;
      const firstColFixedEnd = cols - fixedColsEnd;

      for (let rowIndex = firstRowFixedEnd; rowIndex < rows; rowIndex++) {
        for (let colIndex = firstColFixedEnd; colIndex < cols; colIndex++) {
          adjustElementPosition(rowIndex, colIndex, adjustColEndRowEnd);
        }
      }
    }
  };

  destroy = () => {
    if (this.destroyed) {
      return;
    }
    this.destroyed = true;
    this.reset();
    this.onDestroy();

    this.hoverRowUpdatesInProgress.clear();

    (this as any).hoverRowUpdatesInProgress = null;
    (this as any).brain = null;
  };

  reset() {
    this.cellManager.reset();
    this.rowManager.reset();
  }
}
