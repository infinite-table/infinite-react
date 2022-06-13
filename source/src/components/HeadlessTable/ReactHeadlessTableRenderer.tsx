import React from 'react';
import { RefCallback } from 'react';

import { Logger } from '../../utils/debug';
import { arrayIntersection } from '../../utils/mathIntersection';
import { raf } from '../../utils/raf';
import { stripVar } from '../../utils/stripVar';
import { InternalVars } from '../InfiniteTable/theme.css';
import { ScrollAdjustPosition } from '../InfiniteTable/types/InfiniteTableProps';
import { AvoidReactDiff } from '../RawList/AvoidReactDiff';
import { Renderable } from '../types/Renderable';
import { ScrollPosition } from '../types/ScrollPosition';
import { SubscriptionCallback } from '../types/SubscriptionCallback';
import { buildSubscriptionCallback } from '../utils/buildSubscriptionCallback';
import {
  FixedPosition,
  getRenderRangeCellCount,
  MatrixBrain,
  TableRenderRange,
} from '../VirtualBrain/MatrixBrain';

import { MappedCells } from './MappedCells';

export type TableRenderCellFnParam = {
  domRef: RefCallback<HTMLElement>;
  rowIndex: number;
  colIndex: number;
  rowspan: number;
  colspan: number;
  hidden: boolean;
  width: number;
  height: number;
  widthWithColspan: number;
  heightWithRowspan: number;
  rowFixed: FixedPosition;
  colFixed: FixedPosition;
  onMouseEnter: VoidFunction;
  onMouseLeave: VoidFunction;
};
export type TableRenderCellFn = (param: TableRenderCellFnParam) => Renderable;

export type RenderableWithPosition = {
  renderable: Renderable;
  position: 'start' | 'end' | null;
};

const ITEM_POSITION_WITH_TRANSFORM = true;

const currentColumnTransformX = stripVar(InternalVars.currentColumnTransformX);
const currentColumnTransformY = stripVar(InternalVars.currentColumnTransformY);

function setTransform(element: HTMLElement, x: number, y: number) {
  element.style.setProperty(currentColumnTransformX, `${x}px`);
  element.style.setProperty(currentColumnTransformY, `${y}px`);

  element.style.transform = `translate3d(${InternalVars.currentColumnTransformX}, ${InternalVars.currentColumnTransformY}, 0)`;
}
export class ReactHeadlessTableRenderer extends Logger {
  private brain: MatrixBrain;

  private destroyed = false;
  private scrolling = false;

  public cellHoverClassNames: string[] = [];

  private itemDOMElements: (HTMLElement | null)[] = [];
  private itemDOMRefs: RefCallback<HTMLElement>[] = [];
  private updaters: SubscriptionCallback<Renderable>[] = [];

  private mappedCells: MappedCells;

  private items: Renderable[] = [];

  private currentHoveredRow = -1;
  private onDestroy: VoidFunction;

  private hoverRowUpdatesInProgress: Map<number, boolean> = new Map();

  constructor(brain: MatrixBrain) {
    super('ReactHeadlessTableRenderer');
    this.brain = brain;

    this.mappedCells = new MappedCells();

    const removeOnScroll = brain.onScroll(this.adjustFixedElementsOnScroll);
    const removeOnSizeChange = brain.onAvailableSizeChange(() => {
      this.adjustFixedElementsOnScroll();
      //for whatever reason, sometimes there's a misplaced fixed cell and we need to
      //have it executed again, on a raf
      raf(() => {
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
    } = { offset: 0 },
  ): ScrollPosition => {
    const { brain } = this;
    const scrollPosition = brain.getScrollPosition();
    let { scrollAdjustPosition, offset = 0 } = config;
    if (this.isRowFullyVisible(rowIndex) && !scrollAdjustPosition) {
      return scrollPosition;
    }

    const rowOffset = brain.getItemOffsetFor(rowIndex, 'vertical');
    const rowHeight = brain.getItemSize(rowIndex, 'vertical');

    const top = scrollPosition.scrollTop;

    const availableSize = brain.getAvailableSize();
    const bottom = top + availableSize.height;

    if (!scrollAdjustPosition) {
      scrollAdjustPosition =
        rowOffset > bottom ? 'end' : rowOffset < top ? 'start' : 'end';
    }

    let scrollTop = scrollPosition.scrollTop;
    if (scrollAdjustPosition === 'center') {
      scrollTop = rowOffset - Math.floor(brain.getAvailableSize().height / 2);
    } else if (scrollAdjustPosition === 'start') {
      offset = -offset;
      scrollTop += rowOffset - top + offset;
    } else {
      offset += rowHeight;
      scrollTop += rowOffset - bottom + offset;
    }

    return {
      ...scrollPosition,
      scrollTop,
    };
  };

  public getScrollPositionForScrollColumnIntoView = (
    colIndex: number,
    config: {
      scrollAdjustPosition?: ScrollAdjustPosition;
      offset?: number;
    } = { offset: 0 },
  ): ScrollPosition => {
    const { brain } = this;
    const scrollPosition = brain.getScrollPosition();
    let { scrollAdjustPosition, offset = 0 } = config;
    if (this.isColumnFullyVisible(colIndex) && !scrollAdjustPosition) {
      return scrollPosition;
    }

    const rowOffset = brain.getItemOffsetFor(colIndex, 'horizontal');
    const colWidth = brain.getItemSize(colIndex, 'horizontal');

    const left = scrollPosition.scrollLeft;

    const availableSize = brain.getAvailableSize();
    const right = left + availableSize.width;

    if (!scrollAdjustPosition) {
      scrollAdjustPosition =
        rowOffset > right ? 'end' : rowOffset < left ? 'start' : 'end';
    }

    let scrollLeft = scrollPosition.scrollLeft;
    if (scrollAdjustPosition === 'center') {
      scrollLeft = rowOffset - Math.floor(brain.getAvailableSize().width / 2);
    } else if (scrollAdjustPosition === 'start') {
      offset = -offset;
      scrollLeft += rowOffset - left + offset;
    } else {
      offset += colWidth;
      scrollLeft += rowOffset - right + offset;
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
  ): ScrollPosition => {
    const { scrollLeft } = this.getScrollPositionForScrollColumnIntoView(
      colIndex,
      {
        scrollAdjustPosition:
          config.colScrollAdjustPosition || config.scrollAdjustPosition,
        offset: config.offsetLeft,
      },
    );
    const { scrollTop } = this.getScrollPositionForScrollRowIntoView(rowIndex, {
      scrollAdjustPosition:
        config.rowScrollAdjustPosition || config.scrollAdjustPosition,
      offset: config.offsetTop,
    });

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
    const { brain } = this;

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
    const elements = this.mappedCells.getElementsForRowIndex(rowIndex);

    return elements.length > 0;
  };

  public isCellVisible = (rowIndex: number, colIndex: number) => {
    return this.isRowVisible(rowIndex) && this.isColumnVisible(colIndex);
  };

  public isCellFullyVisible = (rowIndex: number, colIndex: number) => {
    return this.isRowFullyVisible(rowIndex) && this.isColumnVisible(colIndex);
  };

  public isColumnFullyVisible = (colIndex: number, offsetMargin = 2) => {
    return this.isColumnVisible(
      colIndex,
      this.brain.getColWidth(colIndex) - offsetMargin,
    );
  };

  public isColumnVisible = (colIndex: number, offsetMargin = 10) => {
    if (!this.isColumnRendered(colIndex)) {
      return false;
    }

    const { brain } = this;

    const {
      start: [_, startCol],
      end: [__, endCol],
    } = brain.getRenderRange();
    const midCol = Math.floor((startCol + endCol) / 2);

    if (colIndex < startCol) {
      return false;
    }
    if (colIndex >= endCol) {
      return false;
    }

    if (colIndex >= midCol) {
      const lastVisibleCol = brain.getItemAt(
        brain.getAvailableSize().width +
          brain.getScrollPosition().scrollLeft -
          offsetMargin,
        'horizontal',
      );

      return colIndex <= lastVisibleCol;
    }

    if (colIndex < midCol) {
      const firstVisibleCol = brain.getItemAt(
        brain.getScrollPosition().scrollLeft + offsetMargin,
        'horizontal',
      );

      return colIndex >= firstVisibleCol;
    }

    return true;
  };

  public isCellRendered = (rowIndex: number, colIndex: number) => {
    return this.isRowRendered(rowIndex) && this.isColumnRendered(colIndex);
  };

  public isColumnRendered = (colIndex: number) => {
    const {
      start: [startRow],
    } = this.brain.getRenderRange();

    return this.mappedCells.getRenderedNodeForCell(startRow, colIndex) !== null;
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

  renderRange = (
    range: TableRenderRange,

    {
      renderCell,
      force,
      onRender,
    }: {
      force?: boolean;
      renderCell: TableRenderCellFn;
      onRender: (items: Renderable[]) => void;
    },
  ): Renderable[] => {
    if (this.destroyed) {
      return [];
    }

    const { start, end } = range;

    if (__DEV__) {
      this.debug(`Render range ${start}-${end}. Force ${force}`);
    }

    const { mappedCells } = this;

    const fixedRanges = this.getFixedRanges(range);
    const ranges = [range, ...fixedRanges];

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
     */
    const renderCount = ranges.reduce(
      (sum, range) => sum + getRenderRangeCellCount(range),
      0,
    );

    // renderCount += 4;

    // const { fixedRowsStart, fixedColsStart, fixedRowsEnd, fixedColsEnd } =
    //   this.brain.getFixedCellInfo();

    // console.log(ranges, renderCount);

    // if (fixedRowsStart && fixedColsStart) {
    //   // renderCount -= fixedRowsStart * fixedColsStart;
    // }
    // if (fixedRowsStart && fixedColsEnd) {
    //   // renderCount -= fixedRowsStart * fixedColsEnd;
    // }
    // if (fixedRowsEnd && fixedColsStart) {
    //   // renderCount -= fixedRowsEnd * fixedColsStart;
    // }
    // if (fixedRowsEnd && fixedColsEnd) {
    //   // renderCount -= fixedRowsEnd * fixedColsEnd;
    // }

    if (this.itemDOMElements.length >= renderCount) {
      mappedCells.discardElementsStartingWith(renderCount, (elementIndex) => {
        // when less items become rendered
        // we unmount the extra items by calling destroy on the updater
        // so we don't need to re-render the whole container
        if (this.updaters[elementIndex]) {
          this.updaters[elementIndex].destroy();
        }
        if (__DEV__) {
          // console.log(`Discard element ${elementIndex}`);
          this.debug(`Discard element ${elementIndex}`);
        }
      });
      this.itemDOMElements.length = Math.min(
        this.itemDOMElements.length,
        renderCount,
      );
      this.itemDOMRefs.length = Math.min(this.itemDOMRefs.length, renderCount);
      this.updaters.length = Math.min(this.updaters.length, renderCount);
      this.items.length = Math.min(this.items.length, renderCount);
    }

    // we only need to keep those that are outside all ranges
    // so we need to do an intersection of all those elements
    const elementsOutsideRanges: number[] = arrayIntersection(
      ...ranges.map(mappedCells.getElementsOutsideRenderRange),
    );

    const elementsOutsideItemRange = elementsOutsideRanges.filter(
      (elementIndex) => {
        const cell = this.mappedCells.getRenderedCellAtElement(elementIndex);

        // keep those elements that host a cell that is in the extraCells map
        // We do this in order not to do extra work and rerender it later in case
        // it's already rendered
        //
        // so we need to filter those elements out
        if (cell && extraCellsMap.has(`${cell[0]}:${cell[1]}`)) {
          return false;
        }

        // and only keep those elements that correspond to cells
        // outside the render range and outside the extra cells
        return true;
      },
    );

    if (this.items.length > renderCount) {
      this.items.length = renderCount;
    }

    // start from the last rendered, and render additional elements, until we have renderCount
    // this loop might not even execute the body once if all the elements are present
    for (let i = this.items.length; i < renderCount; i++) {
      this.renderElement(i);
      // push at start
      elementsOutsideItemRange.splice(0, 0, i);
    }

    const visitedCells = new Map<string, boolean>();

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
          const cellRendered = mappedCells.isCellRendered(row, col);

          // for cells that belong to the first row of the render range
          // or to the first column of the render range
          // if they are "covered" (spanned by) by previous cells
          // those cells we want to "throw" away and instead of them
          // we render the spanning cell
          // all other spanned cells (further below or to the right), we keep as rendered
          // we do this in order to preserve a constant renderCount
          if (row === startRow || col === startCol) {
            const parentCell = this.isCellCovered(row, col);

            // if this cell is covered by another (parent) cell
            // which is outside of the render range (so which is in the extra cells collection)
            if (
              parentCell &&
              extraCellsMap.has(`${parentCell[0]}:${parentCell[1]}`)
            ) {
              // then we can take that element and reuse it
              // for other cells
              const elIndexForCoveredCell = mappedCells.getElementIndexForCell(
                row,
                col,
              );

              if (elIndexForCoveredCell != null) {
                elementsOutsideItemRange.push(elIndexForCoveredCell);
              }
              continue;
            }
          }

          if (cellRendered && !force) {
            continue;
          }

          const elementIndex = cellRendered
            ? mappedCells.getElementIndexForCell(row, col)
            : mappedCells.getElementFromListForColumn(
                elementsOutsideItemRange,
                col,
              );

          if (elementIndex == null) {
            if (__DEV__) {
              this.error(`Cannot find element to render cell ${row}:${col}`);
            }
            continue;
          }

          this.renderCellAtElement(row, col, elementIndex, renderCell);
        }
      }
    });

    extraCells.forEach(([rowIndex, colIndex]) => {
      if (mappedCells.isCellRendered(rowIndex, colIndex)) {
        if (force) {
          const elementIndex = mappedCells.getElementIndexForCell(
            rowIndex,
            colIndex,
          )!;
          this.renderCellAtElement(
            rowIndex,
            colIndex,
            elementIndex,
            renderCell,
          );
        }
        return;
      }

      const elementIndex = elementsOutsideItemRange.pop();
      if (elementIndex == null) {
        if (__DEV__) {
          this.error(
            `Cannot find element to render cell ${rowIndex}-${colIndex}`,
          );
        }
        return;
      }
      this.renderCellAtElement(rowIndex, colIndex, elementIndex, renderCell);
    });

    // OLD we need to spread and create a new array
    // OLD as otherwise the AvoidReactDiff component will receive the same array
    // OLD and since it uses setState internally, it will not render/update
    // const result = [...this.items];
    let result = this.items;

    // TODO why does this optimisation not work
    // if (this.items.length > this.prevLength) {
    //   // only assign and do a render when
    //   // we have more items than last time
    //   // so we need to show new items
    result = [...this.items];

    this.adjustFixedElementsOnScroll();
    if (onRender) {
      onRender(result);
    }
    //   this.prevLength = result.length;
    // }

    return result;
  };

  private renderElement(elementIndex: number) {
    const domRef = (node: HTMLElement | null) => {
      if (node) {
        this.itemDOMElements[elementIndex] = node;
        node.style.position = 'absolute';
        node.style.left = '0px';
        node.style.top = '0px';
        this.updateElementPosition(elementIndex);
      }
    };
    this.itemDOMRefs[elementIndex] = domRef;
    this.updaters[elementIndex] = buildSubscriptionCallback<Renderable>();

    const item = (
      <AvoidReactDiff
        key={elementIndex}
        name={`${elementIndex}`}
        updater={this.updaters[elementIndex]}
      />
    );
    this.items[elementIndex] = item;

    return item;
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

  private isCellFixed = (
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

  private isCellCovered = (rowIndex: number, colIndex: number) => {
    const rowspanParent = this.brain.getRowspanParent(rowIndex, colIndex);
    const colspanParent = this.brain.getColspanParent(rowIndex, colIndex);

    const coveredByAnotherRow = rowspanParent != rowIndex;
    const coveredByAnotherCol = colspanParent != colIndex;

    const covered = coveredByAnotherRow || coveredByAnotherCol;

    return covered ? [rowspanParent, colspanParent] : false;
  };

  private renderCellAtElement(
    rowIndex: number,
    colIndex: number,
    elementIndex: number,
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

    const renderedNode = renderCell({
      rowIndex,
      colIndex,
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
      domRef: this.itemDOMRefs[elementIndex],
    });

    const itemUpdater = this.updaters[elementIndex];

    if (!itemUpdater) {
      this.error(
        `Cannot find item updater for item ${rowIndex},${colIndex} at this time... sorry.`,
      );
      return;
    }

    // console.log('render row', rowIndex);

    this.mappedCells.renderCellAtElement(
      rowIndex,
      colIndex,
      elementIndex,
      renderedNode,
    );

    if (__DEV__) {
      this.debug(
        `Render cell ${rowIndex},${colIndex} at element ${elementIndex}`,
      );
    }

    // console.log('update', rowIndex, colIndex, renderedNode);
    itemUpdater(renderedNode);

    this.updateElementPosition(elementIndex, { hidden, rowspan, colspan });
    return;
  }

  private onMouseEnter = (rowIndex: number) => {
    this.currentHoveredRow = rowIndex;

    if (this.scrolling) {
      return;
    }
    this.addHoverClass(rowIndex);
  };

  private addHoverClass = (rowIndex: number) => {
    this.mappedCells.getElementsForRowIndex(rowIndex).forEach((elIndex) => {
      const node = this.itemDOMElements[elIndex];

      if (node) {
        this.cellHoverClassNames.forEach((cls) => {
          node.classList.add(cls);
        });
      }
    });
  };

  private onMouseLeave = (rowIndex: number) => {
    if (this.currentHoveredRow != -1 && this.currentHoveredRow === rowIndex) {
      this.removeHoverClass(rowIndex);
    }
    this.currentHoveredRow = -1;
    if (this.scrolling) {
      return;
    }
    this.removeHoverClass(rowIndex);
  };

  private removeHoverClass = (rowIndex: number) => {
    this.mappedCells.getElementsForRowIndex(rowIndex).forEach((elIndex) => {
      const node = this.itemDOMElements[elIndex];

      if (node) {
        this.cellHoverClassNames.forEach((cls) => {
          node.classList.remove(cls);
        });
      }
    });
  };

  private updateHoverClassNamesForRow = (rowIndex: number) => {
    if (this.scrolling) {
      return;
    }
    if (this.hoverRowUpdatesInProgress.has(rowIndex)) {
      return;
    }

    this.hoverRowUpdatesInProgress.set(rowIndex, true);

    const checkHoverClass = () => {
      if (this.currentHoveredRow != -1 && !this.scrolling) {
        if (this.currentHoveredRow === rowIndex) {
          this.addHoverClass(rowIndex);
        } else {
          this.removeHoverClass(rowIndex);
        }
      }
    };
    raf(() => {
      checkHoverClass();
      this.hoverRowUpdatesInProgress.delete(rowIndex);
    });
  };

  private updateElementPosition = (
    elementIndex: number,
    options?: { hidden: boolean; rowspan: number; colspan: number },
  ) => {
    const itemElement = this.itemDOMElements[elementIndex];
    const cell = this.mappedCells.getRenderedCellAtElement(elementIndex);

    if (cell == null) {
      if (__DEV__) {
        this.error(`Cannot find item for element ${elementIndex}`);
      }
      return;
    }
    const [rowIndex, colIndex] = cell;

    const itemPosition = this.brain.getCellOffset(rowIndex, colIndex);

    if (itemPosition == null) {
      return;
    }

    const { x, y } = itemPosition;

    if (itemElement) {
      this.updateHoverClassNamesForRow(rowIndex);

      // itemElement.style.gridColumn = `${colIndex} / span 1`;
      // itemElement.style.gridRow = `${rowIndex} / span 1`;

      if (__DEV__) {
        // (itemElement.dataset as any).elementIndex = elementIndex;
        (itemElement.dataset as any).rowIndex = rowIndex;

        (itemElement.dataset as any).colIndex = colIndex;
      }

      if (ITEM_POSITION_WITH_TRANSFORM) {
        setTransform(itemElement, x, y);

        itemElement.style.willChange = 'transform';
        itemElement.style.backfaceVisibility = 'hidden';
        // need to set it to auto
        // in case some fixed cells are reused
        // as the fixed cells had a zIndex
        const hidden = options
          ? options.hidden
          : !!this.isCellCovered(rowIndex, colIndex);
        itemElement.style.zIndex = hidden
          ? '-1'
          : // #updatezindex - we need to allow elements use their own zIndex, so we
            // resort to allowing them to have it as a data-z-index attribute
            itemElement.dataset.zIndex || 'auto';
      } else {
        itemElement.style.display = '';
        itemElement.style.left = `${x}px`;
        itemElement.style.top = `${y}px`;
      }
    }
  };

  private onScrollStart = () => {
    this.scrolling = true;
    // if (this.currentHoveredRow != -1) {
    //   this.removeHoverClass(this.currentHoveredRow);
    // }
  };

  private onScrollStop = () => {
    this.scrolling = false;

    if (this.currentHoveredRow != -1) {
      this.addHoverClass(this.currentHoveredRow);
    }
  };

  public adjustFixedElementsOnScroll = (
    scrollPosition: ScrollPosition = this.brain.getScrollPosition(),
  ) => {
    const { mappedCells, brain, itemDOMElements } = this;

    const cols = this.brain.getColCount();
    const rows = this.brain.getRowCount();

    const { fixedColsStart, fixedColsEnd, fixedRowsStart, fixedRowsEnd } =
      this.brain.getFixedCellInfo();

    if (!fixedColsStart && !fixedColsEnd && !fixedRowsStart && !fixedRowsEnd) {
      return;
    }
    const fixedEndColsOffsets = this.brain.getFixedEndColsOffsets();
    const fixedEndRowsOffsets = this.brain.getFixedEndRowsOffsets();

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
        scrollPosition: ScrollPosition,
      ) => void,
    ) {
      const elementIndex = mappedCells.getElementIndexForCell(
        rowIndex,
        colIndex,
      );
      if (elementIndex === null) {
        return;
      }
      const itemPosition = brain.getCellOffset(rowIndex, colIndex);
      const node = itemDOMElements[elementIndex];
      // console.log('adjusting', node);

      if (elementIndex != null && node && itemPosition) {
        fn(rowIndex, colIndex, node!, itemPosition, scrollPosition);
      }
    }

    function adjustColStart(
      _rowIndex: number,
      colIndex: number,
      node: HTMLElement,
      { x, y }: { x: number; y: number },
      { scrollLeft }: ScrollPosition,
    ) {
      node.style.zIndex = `${fixedColsStart - colIndex}`;
      setTransform(node, x + scrollLeft, y);
    }

    function adjustRowStart(
      rowIndex: number,
      _colIndex: number,
      node: HTMLElement,
      coords: { x: number; y: number },
      scrollPosition: ScrollPosition,
    ) {
      node.style.zIndex = `${fixedRowsStart - rowIndex}`;
      setTransform(node, coords.x, coords.y + scrollPosition.scrollTop);
    }

    function adjustColEnd(
      _rowIndex: number,
      colIndex: number,
      node: HTMLElement,
      { y }: { y: number },
    ) {
      node.style.zIndex = `${cols - colIndex}`;
      const val = fixedEndColsOffsets[colIndex];
      // console.log('value', val);

      setTransform(node, val, y);
    }

    function adjustRowEnd(
      rowIndex: number,
      _colIndex: number,
      node: HTMLElement,
      coords: { x: number; y: number },
    ) {
      node.style.zIndex = `${rows - rowIndex}`;
      setTransform(node, coords.x, fixedEndRowsOffsets[rowIndex]);
    }

    function adjustColStartRowStart(
      _rowIndex: number,
      _colIndex: number,
      node: HTMLElement,
      { x, y }: { x: number; y: number },
      scrollPosition: ScrollPosition,
    ) {
      node.style.zIndex = `1000000`;
      setTransform(
        node,
        x + scrollPosition.scrollLeft,
        y + scrollPosition.scrollTop,
      );
    }

    function adjustColStartRowEnd(
      _rowIndex: number,
      _colIndex: number,
      node: HTMLElement,
      { x }: { x: number; y: number },
      scrollPosition: ScrollPosition,
    ) {
      node.style.zIndex = `2000000`;
      setTransform(
        node,
        x + scrollPosition.scrollLeft,
        fixedEndRowsOffsets[_rowIndex],
      );
    }

    function adjustColEndRowStart(
      _rowIndex: number,
      colIndex: number,
      node: HTMLElement,
      coords: { y: number },
    ) {
      node.style.zIndex = `3000000`;
      setTransform(
        node,
        fixedEndColsOffsets[colIndex],
        coords.y + scrollPosition.scrollTop,
      );
    }

    function adjustColEndRowEnd(
      rowIndex: number,
      colIndex: number,
      node: HTMLElement,
    ) {
      node.style.zIndex = `4000000`;
      setTransform(
        node,
        fixedEndColsOffsets[colIndex],
        fixedEndRowsOffsets[rowIndex],
      );
    }

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
    (this as any).mappedCells = null;
  };

  reset() {
    this.itemDOMElements = [];
    this.itemDOMRefs = [];
    this.updaters = [];
    this.items = [];
    this.mappedCells.reset();
  }
}
