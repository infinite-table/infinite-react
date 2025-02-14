import binarySearch from 'binary-search';
import { Logger } from '../../utils/debug';
import { DeepMap } from '../../utils/DeepMap';
import { setFind } from '../../utils/setUtils';
import { Renderable } from '../types/Renderable';
import { TableRenderRange } from '../VirtualBrain/IBrain';

import { GridCellInterface } from './GridCellInterface';
import { GridCellPoolForReact } from './GridCellPoolForReact';

type CellPos = [number, number];

export type { GridCellInterface };

export class GridCellManager<T_ADDITIONAL_CELL_INFO> extends Logger {
  private matrix: DeepMap<number, GridCellInterface<T_ADDITIONAL_CELL_INFO>> =
    new DeepMap();

  private matrixWithHistory: DeepMap<
    number,
    Set<GridCellInterface<T_ADDITIONAL_CELL_INFO>>
  > = new DeepMap();

  private cellToMatrixPosition: WeakMap<
    GridCellInterface<T_ADDITIONAL_CELL_INFO>,
    CellPos
  > = new WeakMap();

  private pool: GridCellPoolForReact<T_ADDITIONAL_CELL_INFO>;

  public debugId: string;

  private offRemoveCell: VoidFunction;

  constructor(debugId: string) {
    super(`${debugId}:GridCellManager`);

    this.debugId = debugId;
    this.pool = new GridCellPoolForReact<T_ADDITIONAL_CELL_INFO>(debugId);

    this.offRemoveCell = this.pool.onRemoveCell((cell) =>
      this.onRemoveCell(cell),
    );
  }

  private onRemoveCell(cell: GridCellInterface<T_ADDITIONAL_CELL_INFO>) {
    const cellPos = this.cellToMatrixPosition.get(cell);

    // #we-need-the-last-value-in-cell-to-matrix-position
    // as otherwise the cellPos would be empty

    this.cellToMatrixPosition.delete(cell);

    if (!cellPos) {
      return;
    }

    this.matrix.delete(cellPos);

    // get the list of cells at in the history matrix
    // that were rendered at that position
    let cellsAtPos = this.matrixWithHistory.get(cellPos);

    if (cellsAtPos) {
      cellsAtPos.delete(cell);
    }
  }

  set poolSize(cellCount: number) {
    this.pool.poolSize = cellCount;
  }

  get poolSize() {
    return this.pool.poolSize;
  }

  getDetachedCell() {
    console.warn('getting detached cell');
    return this.pool.getDetachedCell();
  }

  private setCellPositionInMatrix(
    cell: GridCellInterface<T_ADDITIONAL_CELL_INFO>,
    cellPos: CellPos | null,
  ) {
    if (cellPos == null) {
      const currentCellPos = this.cellToMatrixPosition.get(cell);
      if (currentCellPos) {
        this.matrix.delete(currentCellPos);
      }
      // don't delete
      // #we-need-the-last-value-in-cell-to-matrix-position
      // this.cellToMatrixPosition.delete(cell);
    } else {
      let prevCellPos = this.cellToMatrixPosition.get(cell);

      const samePos =
        prevCellPos &&
        prevCellPos[0] === cellPos[0] &&
        prevCellPos[1] === cellPos[1];

      this.matrix.set(cellPos, cell);
      this.cellToMatrixPosition.set(cell, cellPos);

      // add the cell to the list of cells last rendered at this position
      let cellsAtPos = this.matrixWithHistory.get(cellPos);

      if (!cellsAtPos) {
        cellsAtPos = new Set();
        cellsAtPos.add(cell);
        this.matrixWithHistory.set(cellPos, cellsAtPos);
      } else {
        cellsAtPos.add(cell);
      }

      // remove from previous position
      if (prevCellPos && !samePos) {
        this.matrix.delete(prevCellPos);
        let cellsAtPrevPos = this.matrixWithHistory.get(prevCellPos);

        if (cellsAtPrevPos) {
          cellsAtPrevPos.delete(cell);
        }
      }
    }
  }

  renderNodeAtCell(
    node: Renderable,
    cell: GridCellInterface<T_ADDITIONAL_CELL_INFO>,
    cellPos: CellPos,
    additionalInfo?: T_ADDITIONAL_CELL_INFO,
  ) {
    const currentCellAtPos = this.getCellAt(cellPos);

    if (currentCellAtPos) {
      if (currentCellAtPos !== cell) {
        // we have another cell at that position
        // so we need to detach that cell
        this.detachCellAt(cellPos);
        // but also detach this cell if it's attached
        this.detachCell(cell);
      } else {
        // it's the same cell, so we don't need to do anything
      }
    } else {
      // we don't have a cell at that position

      // and we cant to put `cell` at that position
      // but if it's attached somewhere else, we need to detach it first

      this.detachCell(cell);
    }

    this.pool.attachCell(cell);

    this.setCellPositionInMatrix(cell, cellPos);

    cell.update(node, additionalInfo);

    return cell;
  }

  getCellPosition(cell: GridCellInterface<T_ADDITIONAL_CELL_INFO>) {
    const cellPos = this.cellToMatrixPosition.get(cell);

    if (!cellPos) {
      return null;
    }

    // make sure it's the same cell
    // as in the `cellToMatrixPosition` we keep all cells
    // that were last rendered at that position
    // so we need to make sure that the cell is still at that position
    const cellAtPos = this.getCellAt(cellPos);

    if (cellAtPos != cell) {
      return null;
    }

    return cellPos;
  }

  getCellAt(cellPos: CellPos) {
    return this.matrix.get(cellPos);
  }

  /**
   * This gets a cell for a given position.
   * If there's already a cell currently attached at that position, it will be returned.
   *
   * Otherwise, we try to return the most optimal cell to use for that position.
   * If the optimise parameter is set to 'row', we will try to return a detached cell
   * that was last rendered in that row.
   *
   * If the optimise parameter is set to 'column', we will try to return a detached cell
   * that was last rendered in that column.
   *
   * @param cellPos [rowIndex, colIndex]
   * @param optimise 'row' | 'column'
   */
  getCellFor(cellPos: CellPos, optimise: 'row' | 'column') {
    let cell = this.getCellAt(cellPos);

    if (cell) {
      return cell;
    }

    const [rowIndex, colIndex] = cellPos;

    if (optimise === 'row') {
      this.matrixWithHistory.visitSome((cellsForPos, [row], __, next) => {
        if (cell) {
          return true;
        }
        if (row === rowIndex) {
          cell = setFind(cellsForPos, (c) => !this.isCellAttached(c));
          if (cell) {
            return true;
          }
        }
        next?.();
        return false;
      });
    }

    if (optimise === 'column') {
      this.matrixWithHistory.visitSome((cellsForPos, [_row, col], __, next) => {
        if (cell) {
          return true;
        }
        if (col === colIndex) {
          cell = setFind(cellsForPos, (c) => !this.isCellAttached(c));
          if (cell) {
            return true;
          }
        }
        next?.();
        return false;
      });
    }

    return cell ?? this.getDetachedCell();
  }

  isCellAttached(cell: GridCellInterface<T_ADDITIONAL_CELL_INFO>) {
    return this.getCellPosition(cell) !== null;
  }

  isCellAttachedAt(cellPos: CellPos) {
    const cell = this.getCellAt(cellPos);

    if (!cell) {
      return false;
    }

    return this.isCellAttached(cell);
  }

  getMatrix() {
    const lastRow = this.getRowsWithCells().pop() ?? -1;
    const lastColumn = this.getColumnsWithCells().pop() ?? -1;

    const matrix = Array.from({ length: lastRow + 1 }, (_, rowIndex) => {
      const row = Array.from({ length: lastColumn + 1 }, (_, colIndex) => {
        const cellPos = [rowIndex, colIndex] as CellPos;
        const cell = this.getCellAt(cellPos);
        return cell ? cell.getNode() : null;
      });

      return row;
    });

    return matrix;
  }

  getAllCells() {
    return [...this.pool.getAllCells()];
  }

  getCellsForRow(rowIndex: number) {
    return this.matrix
      .getKeysStartingWith([rowIndex])
      .map((cellPos) => {
        return this.getCellAt(cellPos as CellPos);
      })
      .filter(Boolean) as GridCellInterface<T_ADDITIONAL_CELL_INFO>[];
  }

  getOneAttachedCell() {
    const cells = this.pool.getAttachedCells();

    // get the first cell in the set
    const cell = cells.values().next().value;

    return cell;
  }

  getRowsWithCells() {
    // we need to sort them, as otherwise it could return [1,3,2]
    // and then in getMatrix we do a .pop and not get the latest row
    return this.matrix.rawKeysAt([]).sort();
  }

  getColumnsWithCells() {
    const positions = this.matrix.getUnnestedKeysStartingWith([], true);

    // we use a set to remove duplicates
    const columns = new Set(positions.map((pos) => pos[1]));

    return [...columns.values()].sort();
  }

  isRowAttached(rowIndex: number) {
    return this.getRowsWithCells().includes(rowIndex);
  }
  isColumnAttached(colIndex: number) {
    return this.getColumnsWithCells().includes(colIndex);
  }

  detachRow(rowIndex: number) {
    const cellPositions = this.matrix.getKeysStartingWith([
      rowIndex,
    ]) as CellPos[];

    cellPositions.forEach((cellPos) => this.detachCellAt(cellPos));
  }

  detachCol(colIndex: number) {
    this.matrix.visit((_, cellPos) => {
      if (cellPos[1] === colIndex) {
        this.detachCellAt(cellPos as CellPos);
      }
    });
  }

  detachCell(cell: GridCellInterface<T_ADDITIONAL_CELL_INFO>) {
    const cellPos = this.getCellPosition(cell);
    if (cellPos) {
      this.detachCellAt(cellPos);
    }
  }

  detachCells(cells: Set<GridCellInterface<T_ADDITIONAL_CELL_INFO>>) {
    cells.forEach((cell) => this.detachCell(cell));
  }

  detachRowsStartingWith(rowIndex: number) {
    const rows = this.getRowsWithCells().sort();

    let idx = binarySearch(rows, rowIndex, (a, b) => a - b);

    if (idx < 0) {
      idx = ~idx;
    }
    const rowsToDiscard = rows.slice(idx);

    rowsToDiscard.forEach((row) => this.detachRow(row));
  }

  detachColsStartingWith(colIndex: number) {
    const cols = this.getColumnsWithCells().sort();
    let idx = binarySearch(cols, colIndex, (a, b) => a - b);
    if (idx < 0) {
      idx = ~idx;
    }
    const colsToDiscard = cols.slice(idx);
    colsToDiscard.forEach((col) => this.detachCol(col));
  }

  detachCellsStartingAt(cellPos: CellPos) {
    const [rowIndex, colIndex] = cellPos;
    this.matrix.visit((_, cellPos) => {
      const [row, col] = cellPos;
      if (row >= rowIndex || col >= colIndex) {
        this.detachCellAt(cellPos as CellPos);
      }
    });
  }

  detachCellAt(cellPos: CellPos) {
    const cell = this.getCellAt(cellPos);
    if (cell) {
      this.setCellPositionInMatrix(cell, null);
      this.pool.detachCell(cell!);
    }
  }

  getCellsOutsideRenderRange = (range: TableRenderRange) => {
    const { start, end } = range;
    const [startRow, startCol] = start;
    const [endRow, endCol] = end;

    const cells: Set<GridCellInterface<T_ADDITIONAL_CELL_INFO>> = new Set();

    this.matrix.visit(({ value: cell }, cellPos) => {
      if (!cell) {
        return;
      }
      const [rowIndex, colIndex] = cellPos;
      const rowBefore = rowIndex < startRow;
      const rowAfter = rowIndex >= endRow;

      const colBefore = colIndex < startCol;
      const colAfter = colIndex >= endCol;

      const outsideRenderRange = rowBefore || rowAfter || colBefore || colAfter;

      if (outsideRenderRange) {
        cells.add(cell);
      }
    });

    return cells;
  };

  getCellFromListForRow(
    cells: Set<GridCellInterface<T_ADDITIONAL_CELL_INFO>>,
    rowIndex: number,
  ) {
    return setFind(cells, (cell) => {
      return this.getCellPosition(cell)?.[0] === rowIndex;
    });
  }
  getCellFromListForColumn(
    cells: Set<GridCellInterface<T_ADDITIONAL_CELL_INFO>>,
    colIndex: number,
  ) {
    return setFind(cells, (cell) => {
      return this.getCellPosition(cell)?.[1] === colIndex;
    });
  }

  getCellCountInMatrix() {
    return this.matrix.size;
  }

  destroy() {
    this.reset();
  }

  reset() {
    this.pool.reset();
    this.matrix.clear();
    this.matrixWithHistory.clear();
    this.offRemoveCell();
    this.offRemoveCell = () => {};
  }

  makeDetachedCellsEmpty() {
    this.pool.getDetachedCells().forEach((cell) => {
      cell.update(null);
    });
  }
}
