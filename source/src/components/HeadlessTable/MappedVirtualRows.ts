import { Logger } from '../../utils/debugLoggers';
import { Renderable } from '../types/Renderable';
import { TableRenderRange } from '../VirtualBrain/MatrixBrain';

/**
 * This class abstracts the following behavior:
 *
 * in the DOM, we have a list (flat, so no nesting) of elements that represent detail/virtual rows
 * At any one time, just a fraction of all table virtual rows are rendered/present in the DOM
 * and we need to keep track and know for each element what row represents and for each
 * rendered row, to what element it is currently mapped (so we need a bi-directional mapping)
 *
 */

export class MappedVirtualRows extends Logger {
  private elementIndexToRowIndex!: (number | null)[];

  private rowToElementIndex!: (number | null)[];

  /**
   * Keeps the JSX of rendered elements in memory, so we can possibly reuse it later.
   */
  private renderedElements!: Renderable[];

  constructor() {
    super(`MappedVirtualRows`);
    this.init();
  }

  init() {
    this.elementIndexToRowIndex = [];
    this.rowToElementIndex = [];
    this.renderedElements = [];
  }

  reset() {
    this.init();
  }

  destroy() {
    this.elementIndexToRowIndex = [];
    this.rowToElementIndex = [];
    this.renderedElements = [];
  }

  /**
   * Retrieves the elements that contain rendered rows that are outside
   * of the specified range
   *
   * @param start in [rowIndex, colIndex] format - represents the topmost-leftmost cell visible of the render range
   * @param end in [rowIndex, colIndex] format - represents the bottom-right corner of the visible range. The end is not inclusive,
   * so the last visible cell will be [rowIndex-1, colIndex-1]
   *
   * @returns an array of element indexes that are outside the specified range
   */
  getElementsOutsideRenderRange = (range: TableRenderRange) => {
    const { start, end } = range;
    const [startRow] = start;
    const [endRow] = end;

    const result: number[] = [];

    for (
      let elementIndex = 0, len = this.elementIndexToRowIndex.length;
      elementIndex < len;
      elementIndex++
    ) {
      const currentRowIndex = this.elementIndexToRowIndex[elementIndex];
      if (currentRowIndex == null) {
        continue;
      }

      const rowBefore = currentRowIndex < startRow;
      const rowAfter = currentRowIndex >= endRow;

      const outsideRenderRange = rowBefore || rowAfter;

      if (outsideRenderRange) {
        result.push(elementIndex);
      }
    }

    return result;
  };

  isRowRendered = (rowIndex: number): boolean => {
    return this.rowToElementIndex[rowIndex] != null;
  };

  isElementRendered = (elementIndex: number): boolean => {
    return this.elementIndexToRowIndex[elementIndex] != null;
  };

  getRenderedNodeAtElement = (elementIndex: number): Renderable | null => {
    return this.renderedElements[elementIndex] || null;
  };

  getRenderedRowAtElement = (elementIndex: number): number | null => {
    const row = this.elementIndexToRowIndex[elementIndex];
    return row ?? null;
  };

  getRenderedNodeForRow = (rowIndex: number): Renderable | null => {
    const elementIndex = this.rowToElementIndex[rowIndex];

    return elementIndex != null
      ? this.renderedElements[elementIndex] ?? null
      : null;
  };

  getElementIndexForRow = (rowIndex: number): number | null => {
    const elementIndex = this.rowToElementIndex[rowIndex];

    return elementIndex ?? null;
  };

  renderRowAtElement = (
    rowIndex: number,
    elementIndex: number,
    renderNode?: Renderable,
  ) => {
    if (__DEV__) {
      this.debug(`Render row ${rowIndex} at element ${elementIndex}`);
    }

    const currentRow = this.elementIndexToRowIndex[elementIndex];
    if (currentRow != null) {
      this.rowToElementIndex[currentRow] = null;
    }
    if (renderNode !== undefined) {
      this.renderedElements[elementIndex] = renderNode;
    }

    this.elementIndexToRowIndex[elementIndex] = rowIndex;
    this.rowToElementIndex[rowIndex] = elementIndex;
  };

  discardRow = (rowIndex: number) => {
    const elementIndex = this.rowToElementIndex[rowIndex];

    if (elementIndex != null) {
      this.renderedElements[elementIndex] = null;
      this.elementIndexToRowIndex[elementIndex] = null;
      this.rowToElementIndex[rowIndex] = null;
    }
  };

  discardElement = (elementIndex: number): number | null => {
    const rowIndex = this.elementIndexToRowIndex[elementIndex];
    if (rowIndex != null) {
      this.renderedElements[elementIndex] = null;
      this.elementIndexToRowIndex[elementIndex] = null;
      this.rowToElementIndex[rowIndex] = null;

      return rowIndex;
    }
    return null;
  };

  discardElementsStartingWith = (
    elIndex: number,
    callback?: (index: number, rowIndex: number | null) => void,
  ) => {
    let discardedRow: number | null = null;
    let oneDiscarded: boolean = false;

    if (elIndex < this.elementIndexToRowIndex.length) {
      for (
        let elementIndex = elIndex, len = this.elementIndexToRowIndex.length;
        elementIndex < len;
        elementIndex++
      ) {
        discardedRow = this.discardElement(elementIndex);
        if (discardedRow) {
          oneDiscarded = true;
        }
        if (callback) {
          callback(elementIndex, discardedRow);
        }
      }

      this.elementIndexToRowIndex.length = elIndex;

      this.renderedElements.length = elIndex;
    }

    return oneDiscarded;
  };
}
