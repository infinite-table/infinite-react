import React from 'react';
import { RefCallback } from 'react';
import { Logger } from '../../utils/debug';
import { arrayIntersection } from '../../utils/mathIntersection';
import { AvoidReactDiff } from '../RawList/AvoidReactDiff';
import { Renderable } from '../types/Renderable';
import { ScrollPosition } from '../types/ScrollPosition';
import { SubscriptionCallback } from '../types/SubscriptionCallback';
import { buildSubscriptionCallback } from '../utils/buildSubscriptionCallback';
import {
  getRenderRangeCellCount,
  MatrixBrain,
  TableRenderRange,
} from '../VirtualBrain/MatrixBrain';

import { MappedCells } from './MappedCells';

type FixedPosition = false | 'start' | 'end';

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
};
export type TableRenderCellFn = (param: TableRenderCellFnParam) => Renderable;

const ITEM_POSITION_WITH_TRANSFORM = true;

export class ReactHeadlessTableRenderer extends Logger {
  private brain: MatrixBrain;

  private destroyed = false;

  private itemDOMElements: Record<number, HTMLElement | null> = {};
  private itemDOMRefs: Record<number, RefCallback<HTMLElement>> = {};
  private updaters: Record<number, SubscriptionCallback<Renderable>> = {};

  private mappedCells: MappedCells;

  private items: Renderable[] = [];

  constructor(brain: MatrixBrain) {
    super('ReactHeadlessTableRenderer');
    this.brain = brain;

    this.mappedCells = new MappedCells();
  }

  getExtraSpanCellsForRange = (range: TableRenderRange) => {
    const [start, end] = range;
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

    const [start, end] = range;

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
    let renderCount = ranges.reduce(
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

    if (this.itemDOMElements[renderCount]) {
      mappedCells.discardElementsStartingWith(renderCount, (elementIndex) => {
        delete this.itemDOMElements[elementIndex];
        delete this.itemDOMRefs[elementIndex];

        // when less items become rendered
        // we unmount the extra items by calling destroy on the updater
        // so we don't need to re-render the whole container
        if (this.updaters[elementIndex]) {
          this.updaters[elementIndex].destroy();
          delete this.updaters[elementIndex];
        }

        delete this.items[elementIndex];
        if (__DEV__) {
          this.debug(`Discard element ${elementIndex}`);
        }
      });
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

    // start from the last rendered, and render additional elements, until we have renderCount
    // this loop might not even execute the body once if all the elements are present
    for (let i = this.items.length; i < renderCount; i++) {
      this.renderElement(i);
      // push at start
      elementsOutsideItemRange.splice(0, 0, i);
    }

    const visitedCells = new Map<string, boolean>();

    ranges.forEach((range) => {
      const [start, end] = range;
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
            : elementsOutsideItemRange.pop();

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
        // useraf
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

    const [start, end] = currentRenderRange;
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
       * if we have overlap, both cols start and rows fixed at start and end
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
        arr.push([
          [0, 0],
          [fixedRowsStart, fixedColsStart],
        ]);
      }
      if (fixedRowsEnd) {
        arr.push([
          [rowCount - fixedRowsEnd, 0],
          [rowCount, fixedColsStart],
        ]);
      }
      arr.push([
        [startRow, 0],
        [endRow, fixedColsStart],
      ]);
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
        arr.push([
          [0, colCount - fixedColsEnd],
          [fixedRowsStart, colCount],
        ]);
      }
      if (fixedRowsEnd) {
        arr.push([
          [rowCount - fixedRowsEnd, colCount - fixedColsEnd],
          [rowCount, colCount],
        ]);
      }
      arr.push([
        [startRow, colCount - fixedColsEnd],
        [endRow, colCount],
      ]);
    }

    if (fixedRowsStart) {
      /**
       * If we have cols start and end, this will be only section 2
       * otherwise, if we only have cols start, though we only push 1 range, it will include section 2 and 3
       * and if we only have cols end, though we only push 1 range it will include section 1 and 2
       * and if we have no fixed cols, this will be one range that inclues 1, 2 and 3
       */
      const fixedRowsStartRange: TableRenderRange = [
        [0, startCol],
        [fixedRowsStart, endCol],
      ];
      arr.push(fixedRowsStartRange);
    }

    if (fixedRowsEnd) {
      /**
       * Likewise for fixedRowsEnd
       */
      const fixedRowsEndRange: TableRenderRange = [
        [rowCount - fixedRowsEnd, startCol],
        [rowCount, endCol],
      ];
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

    let rowFixed: boolean = false;
    let colFixed: boolean = false;

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
        : this.brain.getRowHeightWithSpan(rowIndex, rowspan);

    const widthWithColspan =
      colspan === 1 ? width : this.brain.getColWidthWithSpan(colIndex, colspan);

    const { row: rowFixed, col: colFixed } = this.isCellFixed(
      rowIndex,
      colIndex,
    );

    const renderedNode = renderCell({
      rowIndex,
      colIndex,
      height,
      width,
      rowspan,
      colspan,
      rowFixed,
      colFixed,
      hidden: !!covered,
      heightWithRowspan,
      widthWithColspan,
      domRef: this.itemDOMRefs[elementIndex],
    });

    const itemUpdater = this.updaters[elementIndex];

    if (!itemUpdater) {
      this.error(
        `Cannot find item updater for item ${rowIndex},${colIndex} at this time... sorry.`,
      );
      return;
    }

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

    itemUpdater(renderedNode);

    this.updateElementPosition(elementIndex);
    return;
  }

  private updateElementPosition = (elementIndex: number) => {
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
      // itemElement.style.gridColumn = `${colIndex} / span 1`;
      // itemElement.style.gridRow = `${rowIndex} / span 1`;

      if (__DEV__) {
        // (itemElement.dataset as any).elementIndex = elementIndex;
        (itemElement.dataset as any).rowIndex = rowIndex;
        (itemElement.dataset as any).colIndex = colIndex;
      }

      if (ITEM_POSITION_WITH_TRANSFORM) {
        itemElement.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        itemElement.style.visibility = '';
        itemElement.style.willChange = 'transform';
        itemElement.style.backfaceVisibility = 'hidden';
        itemElement.style.zIndex = 'auto';
      } else {
        itemElement.style.display = '';
        itemElement.style.left = `${x}px`;
        itemElement.style.top = `${y}px`;
      }
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
    const fixedEndColsOffsets = this.brain.getFixedEndColsOffsets();
    const fixedEndRowsOffsets = this.brain.getFixedEndRowsOffsets();

    const [start, end] = this.brain.getRenderRange();

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
      node.style.transform = `translate3d(${x + scrollLeft}px, ${y}px, 0)`;
    }

    function adjustRowStart(
      rowIndex: number,
      _colIndex: number,
      node: HTMLElement,
      coords: { x: number; y: number },
      scrollPosition: ScrollPosition,
    ) {
      node.style.zIndex = `${fixedRowsStart - rowIndex}`;
      node.style.transform = `translate3d(${coords.x}px, ${
        coords.y + scrollPosition.scrollTop
      }px, 0)`;
    }

    function adjustColEnd(
      _rowIndex: number,
      colIndex: number,
      node: HTMLElement,
      { y }: { y: number },
    ) {
      node.style.zIndex = `${cols - colIndex}`;
      node.style.transform = `translate3d(${fixedEndColsOffsets[colIndex]}px, ${y}px, 0)`;
    }

    function adjustRowEnd(
      rowIndex: number,
      _colIndex: number,
      node: HTMLElement,
      coords: { x: number; y: number },
    ) {
      node.style.zIndex = `${rows - rowIndex}`;
      node.style.transform = `translate3d(${coords.x}px, ${fixedEndRowsOffsets[rowIndex]}px, 0)`;
    }

    function adjustColStartRowStart(
      _rowIndex: number,
      _colIndex: number,
      node: HTMLElement,
      { x, y }: { x: number; y: number },
      scrollPosition: ScrollPosition,
    ) {
      node.style.zIndex = `10000`;
      node.style.transform = `translate3d(${x + scrollPosition.scrollLeft}px, ${
        y + scrollPosition.scrollTop
      }px, 0)`;
    }

    function adjustColStartRowEnd(
      _rowIndex: number,
      _colIndex: number,
      node: HTMLElement,
      { x, y }: { x: number; y: number },
      scrollPosition: ScrollPosition,
    ) {
      node.style.zIndex = `20000`;
      node.style.transform = `translate3d(${x + scrollPosition.scrollLeft}px, ${
        fixedEndRowsOffsets[_rowIndex]
      }px, 0)`;
    }

    function adjustColEndRowStart(
      _rowIndex: number,
      colIndex: number,
      node: HTMLElement,
      coords: { y: number },
    ) {
      node.style.zIndex = `30000`;
      node.style.transform = `translate3d(${fixedEndColsOffsets[colIndex]}px, ${
        coords.y + scrollPosition.scrollTop
      }px, 0)`;
    }

    function adjustColEndRowEnd(
      rowIndex: number,
      colIndex: number,
      node: HTMLElement,
    ) {
      node.style.zIndex = `40000`;
      node.style.transform = `translate3d(${fixedEndColsOffsets[colIndex]}px, ${fixedEndRowsOffsets[rowIndex]}px, 0)`;
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
    this.destroyed = true;
    this.reset();

    (this as any).brain = null;
    (this as any).mappedCells = null;
  };

  reset() {
    this.itemDOMElements = {};
    this.itemDOMRefs = {};
    this.updaters = {};
    this.items = [];
    this.mappedCells.reset();
  }
}
