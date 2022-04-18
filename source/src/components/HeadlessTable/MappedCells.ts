import { Logger } from '../../utils/debug';
import { DeepMap } from '../../utils/DeepMap';
import { Renderable } from '../types/Renderable';
import { TableRenderRange } from '../VirtualBrain/MatrixBrain';

/**
 * This class abstracts the following behavior:
 *
 * in the DOM, we have a list (flat, so no nesting) of elements that represent table cells
 * At any one time, just a fraction of all table cells are rendered/present in the DOM
 * and we need to keep track and know for each element what cell represents and for each
 * rendered cell, to what element it is currently mapped (so we need a bi-directional mapping)
 *
 * This class has tests - see tests/mapped-cells.spec.ts
 */

export class MappedCells extends Logger {
  /**
   * This is the mapping from element index to cell info.
   * The index in the array is the element index while the value at the position is an array where
   * the first number is the row index and the second number is the column index.
   */
  private elementIndexToCell!: ([number, number] | null)[];

  /**
   * This is the mapping from cell address to element index.
   * The key in the map is the cell address (built like this: `${rowIndex}:${columnIndex}`)
   * while the value is the element index it is being rendered to.
   */
  private cellToElementIndex!: DeepMap<number, number>;

  /**
   * Keeps the JSX of rendered elements in memory, so we can possibly reuse it later.
   */
  private renderedElements!: Renderable[];

  constructor() {
    super(`MappedCells`);
    this.init();

    // if (__DEV__) {
    //   (globalThis as any).mappedCells = this;
    //   (globalThis as any).DeepMap = DeepMap;
    // }
  }

  init() {
    this.elementIndexToCell = [];
    this.cellToElementIndex = new DeepMap();
    this.renderedElements = [];
  }

  reset() {
    this.init();
  }

  destroy() {
    this.elementIndexToCell = [];
    this.cellToElementIndex.clear();
    this.renderedElements = [];
  }

  /**
   * Retrieves the elements that contain rendered cells that are outside
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
    const [startRow, startCol] = start;
    const [endRow, endCol] = end;

    const result: number[] = [];

    for (
      let elementIndex = 0, len = this.elementIndexToCell.length;
      elementIndex < len;
      elementIndex++
    ) {
      const entry = this.elementIndexToCell[elementIndex];
      if (!entry) {
        continue;
      }
      const [rowIndex, colIndex] = entry;
      const rowBefore = rowIndex < startRow;
      const rowAfter = rowIndex >= endRow;

      const colBefore = colIndex < startCol;
      const colAfter = colIndex >= endCol;

      const outsideRenderRange = rowBefore || rowAfter || colBefore || colAfter;

      if (outsideRenderRange) {
        result.push(elementIndex);
      }
    }

    return result;
  };

  isCellRendered = (rowIndex: number, columnIndex: number): boolean => {
    return this.cellToElementIndex.has([rowIndex, columnIndex]);
  };

  isElementRendered = (elementIndex: number): boolean => {
    return !!this.elementIndexToCell[elementIndex];
  };

  getElementsForRowIndex = (rowIndex: number): number[] => {
    return this.cellToElementIndex.getValuesStartingWith([rowIndex]);
  };

  getRenderedNodeAtElement = (elementIndex: number): Renderable | null => {
    return this.renderedElements[elementIndex] || null;
  };

  getRenderedCellAtElement = (
    elementIndex: number,
  ): [number, number] | null => {
    const cell = this.elementIndexToCell[elementIndex];
    return cell || null;
  };

  getRenderedNodeForCell = (
    rowIndex: number,
    columnIndex: number,
  ): Renderable | null => {
    const elementIndex = this.cellToElementIndex.get([rowIndex, columnIndex]);

    return elementIndex != null
      ? this.renderedElements[elementIndex] || null
      : null;
  };

  getElementIndexForCell = (
    rowIndex: number,
    columnIndex: number,
  ): number | null => {
    const elementIndex = this.cellToElementIndex.get([rowIndex, columnIndex]);

    return elementIndex ?? null;
  };

  renderCellAtElement = (
    rowIndex: number,
    colIndex: number,
    elementIndex: number,
    renderNode?: Renderable,
  ) => {
    if (__DEV__) {
      this.debug(
        `Render cell ${rowIndex},${colIndex} at element ${elementIndex}`,
      );
    }

    const key = [rowIndex, colIndex];

    const currentCell = this.elementIndexToCell[elementIndex];
    if (currentCell) {
      this.cellToElementIndex.delete([currentCell[0], currentCell[1]]);
    }
    if (renderNode) {
      this.renderedElements[elementIndex] = renderNode;
    }

    this.elementIndexToCell[elementIndex] = [rowIndex, colIndex];
    this.cellToElementIndex.set(key, elementIndex);
  };

  discardCell = (rowIndex: number, colIndex: number) => {
    const key = [rowIndex, colIndex];
    const elementIndex = this.cellToElementIndex.get(key);

    if (elementIndex != null) {
      this.renderedElements[elementIndex] = null;
      this.elementIndexToCell[elementIndex] = null;
      this.cellToElementIndex.delete(key);
    }
  };

  discardElement = (elementIndex: number): [number, number] | null => {
    const cell = this.elementIndexToCell[elementIndex];
    if (cell) {
      const key = [cell[0], cell[1]];

      this.renderedElements[elementIndex] = null;
      this.elementIndexToCell[elementIndex] = null;
      this.cellToElementIndex.delete(key);

      return cell;
    }
    return null;
  };

  discardElementsStartingWith = (
    elIndex: number,
    callback?: (index: number, cell: [number, number] | null) => void,
  ) => {
    let discardedCell: [number, number] | null = null;
    let oneDiscarded: boolean = false;

    if (elIndex < this.elementIndexToCell.length) {
      for (
        let elementIndex = elIndex, len = this.elementIndexToCell.length;
        elementIndex < len;
        elementIndex++
      ) {
        discardedCell = this.discardElement(elementIndex);
        if (discardedCell) {
          oneDiscarded = true;
        }
        if (callback) {
          callback(elementIndex, discardedCell);
        }
      }

      this.elementIndexToCell.length = elIndex;

      this.renderedElements.length = elIndex;
    }

    return oneDiscarded;
  };
}
