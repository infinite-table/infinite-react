import {
  CellSelectionPosition,
  CellSelectionState,
} from '../../DataSource/CellSelectionState';
import { CellPositionByIndex } from '../../types/CellPositionByIndex';
import { ensureMinMaxCellPositionByIndex } from '../api/getCellSelectionApi';

export type MultiCellSelectorOptions = {
  getPrimaryKeyByIndex: (rowIndex: number) => string | number;
  getColumnIdByIndex: (colIndex: number) => string;
};

export class MultiCellSelector {
  multiSelectStartPosition: CellPositionByIndex = { rowIndex: 0, colIndex: 0 };
  multiSelectEndPosition?: CellPositionByIndex;

  getPrimaryKeyByIndex: MultiCellSelectorOptions['getPrimaryKeyByIndex'];
  getColumnIdByIndex: MultiCellSelectorOptions['getColumnIdByIndex'];

  _cellSelectionState!: CellSelectionState;

  constructor(options: MultiCellSelectorOptions) {
    this.getPrimaryKeyByIndex = options.getPrimaryKeyByIndex;
    this.getColumnIdByIndex = options.getColumnIdByIndex;
  }

  private getCellSelectionPosition(
    position: CellPositionByIndex,
  ): CellSelectionPosition | undefined {
    const { rowIndex, colIndex } = position;

    const rowId = this.getPrimaryKeyByIndex(rowIndex);
    const columnId = this.getColumnIdByIndex(colIndex);

    if (rowId === undefined || !columnId) {
      return undefined;
    }

    return [rowId, columnId];
  }

  set cellSelectionState(cellSelectionState: CellSelectionState) {
    this._cellSelectionState = cellSelectionState;
  }

  get cellSelectionState() {
    return this._cellSelectionState;
  }

  /**
   * This is the single click, without any modifier
   */
  resetClick(position: CellPositionByIndex) {
    this.cellSelectionState.deselectAll();

    const cellSelectionPosition = this.getCellSelectionPosition(position);

    if (!cellSelectionPosition) {
      return;
    }

    this.cellSelectionState.deselectAll();
    this.cellSelectionState.selectCell(...cellSelectionPosition);

    this.multiSelectStartPosition = position;
    this.multiSelectEndPosition = undefined;
  }

  /**
   * This is the click with ctrl/cmd key pressed
   * @param position CellPosition
   */
  singleAddClick(position: CellPositionByIndex) {
    const cellSelectionPosition = this.getCellSelectionPosition(position);
    if (!cellSelectionPosition) {
      return;
    }

    if (this.cellSelectionState.isCellSelected(...cellSelectionPosition)) {
      this.cellSelectionState.deselectCell(...cellSelectionPosition);
      const nextPos = {
        rowIndex: position.rowIndex + 1,
        colIndex: position.colIndex,
      };
      if (this.getCellSelectionPosition(nextPos)) {
        this.multiSelectStartPosition = nextPos;
      }
    } else {
      this.cellSelectionState.selectCell(...cellSelectionPosition);
      this.multiSelectStartPosition = position;
      this.multiSelectEndPosition = undefined;
    }
  }

  multiSelectClick(position: CellPositionByIndex) {
    if (!this.multiSelectStartPosition) {
      return;
    }

    const cellSelectionPosition = this.getCellSelectionPosition(position);

    if (!cellSelectionPosition) {
      return;
    }

    if (this.multiSelectEndPosition) {
      this.deselectRange(
        this.multiSelectStartPosition,
        this.multiSelectEndPosition,
      );
    }
    this.selectRange(this.multiSelectStartPosition, position);

    this.multiSelectEndPosition = position;
  }

  setRangeSelected(
    startPosition: CellPositionByIndex,
    endPosition: CellPositionByIndex,
    selected: boolean,
  ) {
    const [start, end] = ensureMinMaxCellPositionByIndex(
      startPosition,
      endPosition,
    );
    const startSelectionPosition = this.getCellSelectionPosition(start);
    const endSelectionPosition = this.getCellSelectionPosition(end);

    if (!startSelectionPosition || !endSelectionPosition) {
      return;
    }

    for (let i = start.rowIndex; i <= end.rowIndex; i++) {
      for (let j = start.colIndex; j <= end.colIndex; j++) {
        const selectionPosition = this.getCellSelectionPosition({
          rowIndex: i,
          colIndex: j,
        });

        if (!selectionPosition) {
          continue;
        }

        if (selected) {
          this.cellSelectionState.selectCell(...selectionPosition);
        } else {
          this.cellSelectionState.deselectCell(...selectionPosition);
        }
      }
    }
  }

  deselectRange(
    startPosition: CellPositionByIndex,
    endPosition: CellPositionByIndex,
  ) {
    this.setRangeSelected(startPosition, endPosition, false);
  }

  selectRange(
    startPosition: CellPositionByIndex,
    endPosition: CellPositionByIndex,
  ) {
    this.setRangeSelected(startPosition, endPosition, true);
  }
}
