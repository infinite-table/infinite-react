import {
  DataSourceComponentActions,
  DataSourceState,
  CellSelectionState,
} from '../../DataSource';
import { CellSelectionPosition } from '../../DataSource/CellSelectionState';
import {
  getRowInfoArray,
  getRowInfoAt,
} from '../../DataSource/dataSourceGetters';
import { CellPositionByIndex } from '../../types/CellPositionByIndex';
import { InfiniteTableComputedValues, InfiniteTableRowInfo } from '../types';
import { CellPositionOptions } from './type';

function ensureSortedPerOrder<T>(arr: T[], sortPattern: T[]) {
  const arrSet = new Set(arr);

  return sortPattern
    .map((item: T) => {
      if (arrSet.has(item)) {
        return item;
      }
      return null;
    })
    .filter((x: T | null) => x != null) as T[];
}

export function ensureMinMaxCellPositionByIndex(
  start: CellPositionByIndex,
  end: CellPositionByIndex,
) {
  let { rowIndex: startRowIndex, colIndex: startColIndex } = start;
  let { rowIndex: endRowIndex, colIndex: endColIndex } = end;

  const [colStart, colEnd] =
    startColIndex > endColIndex
      ? [endColIndex, startColIndex]
      : [startColIndex, endColIndex];

  const [rowStart, rowEnd] =
    startRowIndex > endRowIndex
      ? [endRowIndex, startRowIndex]
      : [startRowIndex, endRowIndex];

  return [
    { rowIndex: rowStart, colIndex: colStart },
    { rowIndex: rowEnd, colIndex: colEnd },
  ];
}
export type InfiniteTableCellSelectionApi<T> = {
  isCellSelected(cellPosition: CellPositionOptions): boolean;
  selectCell(cellPosition: CellPositionOptions & { clear?: boolean }): void;
  deselectCell(cellPosition: CellPositionOptions): void;
  deselectAll(): void;
  clear(): void;
  selectAll(): void;
  selectColumn(colId: string, options?: { clear?: boolean }): void;
  deselectColumn(colId: string): void;
  selectRange(start: CellPositionOptions, end: CellPositionOptions): void;
  deselectRange(start: CellPositionOptions, end: CellPositionOptions): void;
  getAllCellSelectionPositions(): {
    columnIds: string[];
    positions: (CellSelectionPosition | null)[][];
  };
  getMappedCellSelectionPositions<SELECTED_VALUE, EMPTY_VALUE>(
    fn: (rowInfo: InfiniteTableRowInfo<T>, colId: string) => SELECTED_VALUE,
    emptyValue: EMPTY_VALUE,
  ): {
    columnIds: string[];
    positions: (SELECTED_VALUE | EMPTY_VALUE)[][];
  };
};

export type GetCellSelectionApiParam<T> = {
  getComputed: () => InfiniteTableComputedValues<T>;
  getDataSourceState: () => DataSourceState<T>;
  dataSourceActions: {
    cellSelection: DataSourceComponentActions<T>['cellSelection'];
  };
};

class InfiniteTableCellSelectionApiImpl<T>
  implements InfiniteTableCellSelectionApi<T>
{
  private getComputed: GetCellSelectionApiParam<T>['getComputed'];
  private getDataSourceState: GetCellSelectionApiParam<T>['getDataSourceState'];
  private dataSourceActions: GetCellSelectionApiParam<T>['dataSourceActions'];

  constructor(param: GetCellSelectionApiParam<T>) {
    this.getComputed = param.getComputed;
    this.getDataSourceState = param.getDataSourceState;
    this.dataSourceActions = param.dataSourceActions;
  }

  private getCellSelectionPosition = (options: CellPositionOptions) => {
    const rowId =
      options.rowId ??
      getRowInfoAt(options.rowIndex!, this.getDataSourceState)?.id;

    const colId =
      options.colId ??
      this.getComputed().computedVisibleColumns[options.colIndex].id;

    return [rowId, colId] as const;
  };

  private setRangeSelected = (
    startOptions: CellPositionOptions,
    endOptions: CellPositionOptions,
    selected: boolean,
  ) => {
    const dataSourceState = this.getDataSourceState();
    const cellSelection = dataSourceState.cellSelection;

    if (!cellSelection) {
      return;
    }

    const newCellSelection = new CellSelectionState(cellSelection);

    const [startRowId, startColId] =
      this.getCellSelectionPosition(startOptions);
    const [endRowId, endColId] = this.getCellSelectionPosition(endOptions);

    const startCol =
      this.getComputed().computedVisibleColumnsMap.get(startColId);
    const endCol = this.getComputed().computedVisibleColumnsMap.get(endColId);

    if (!startCol || !endCol) {
      return;
    }
    const startColIndex = startCol.computedVisibleIndex;
    const endColIndex = endCol.computedVisibleIndex;

    const startRowInfo = getRowInfoAt(startRowId, this.getDataSourceState);
    const endRowInfo = getRowInfoAt(endRowId, this.getDataSourceState);
    if (!startRowInfo || !endRowInfo) {
      return;
    }

    const startRowIndex = startRowInfo.indexInAll;
    const endRowIndex = endRowInfo.indexInAll;

    const [start, end] = ensureMinMaxCellPositionByIndex(
      { rowIndex: startRowIndex, colIndex: startColIndex },
      { rowIndex: endRowIndex, colIndex: endColIndex },
    );

    for (let i = start.rowIndex; i <= end.rowIndex; i++) {
      for (let j = start.colIndex; j <= end.colIndex; j++) {
        const pos: CellPositionOptions = {
          rowIndex: i,
          colIndex: j,
        };
        const [pk, colId] = this.getCellSelectionPosition(pos);

        if (selected) {
          newCellSelection.selectCell(pk, colId);
        } else {
          newCellSelection.deselectCell(pk, colId);
        }
      }
    }
    this.dataSourceActions.cellSelection = newCellSelection;
  };

  private getCellSelectionPositionsWithFn = <SELECTED_VALUE, EMPTY_VALUE>(
    fn: (rowInfo: InfiniteTableRowInfo<T>, colId: string) => SELECTED_VALUE,
    emptyValue: EMPTY_VALUE,
  ) => {
    const dataArray = getRowInfoArray(this.getDataSourceState);

    const { computedVisibleColumns } = this.getComputed();

    const computedVisibleColumnsIds = computedVisibleColumns.map((x) => x.id);

    const colsInSelection = new Set<string>();
    const rowsInSelection: InfiniteTableRowInfo<T>[] = [];
    const rowIdsInSelection = new Set<any>();

    dataArray.filter((rowInfo) => {
      computedVisibleColumns.forEach((col) => {
        if (
          this.isCellSelected({
            rowId: rowInfo.id,
            colId: col.id,
          })
        ) {
          if (!colsInSelection.has(col.id)) {
            colsInSelection.add(col.id);
          }
          if (!rowIdsInSelection.has(rowInfo.id)) {
            rowIdsInSelection.add(rowInfo.id);
            rowsInSelection.push(rowInfo);
          }
        }
      });
    });

    const columnIds = ensureSortedPerOrder(
      Array.from(colsInSelection),
      computedVisibleColumnsIds,
    );

    const positions = rowsInSelection.map((rowInfo) => {
      return columnIds.map((colId) => {
        if (this.isCellSelected({ rowId: rowInfo.id, colId })) {
          return fn(rowInfo, colId);
        }
        return emptyValue;
      });
    });

    return {
      columnIds: columnIds,
      positions,
    };
  };

  getAllCellSelectionPositions = () => {
    return this.getCellSelectionPositionsWithFn((rowInfo, colId) => {
      return [rowInfo.id, colId] as CellSelectionPosition;
    }, null);
  };
  getMappedCellSelectionPositions = <SELECTED_VALUE, EMPTY_VALUE>(
    fn: (rowInfo: InfiniteTableRowInfo<T>, colId: string) => SELECTED_VALUE,
    emptyValue: EMPTY_VALUE,
  ) => {
    return this.getCellSelectionPositionsWithFn(fn, emptyValue);
  };
  deselectAll = () => {
    const dataSourceState = this.getDataSourceState();
    const cellSelection = dataSourceState.cellSelection;

    if (!cellSelection) {
      return;
    }

    const newCellSelection = new CellSelectionState(cellSelection);

    newCellSelection.deselectAll();

    this.dataSourceActions.cellSelection = newCellSelection;
  };
  clear = () => {
    this.deselectAll();
  };
  selectAll = () => {
    const dataSourceState = this.getDataSourceState();
    const cellSelection = dataSourceState.cellSelection;

    if (!cellSelection) {
      return;
    }

    const newCellSelection = new CellSelectionState(cellSelection);

    newCellSelection.selectAll();

    this.dataSourceActions.cellSelection = newCellSelection;
  };
  selectRange = (
    startOptions: CellPositionOptions,
    endOptions: CellPositionOptions,
  ) => {
    this.setRangeSelected(startOptions, endOptions, true);
  };

  deselectRange = (
    startOptions: CellPositionOptions,
    endOptions: CellPositionOptions,
  ) => {
    this.setRangeSelected(startOptions, endOptions, false);
  };

  isCellSelected = (options: CellPositionOptions) => {
    const [pk, colId] = this.getCellSelectionPosition(options);
    return (
      this.getDataSourceState().cellSelection?.isCellSelected(pk, colId) ??
      false
    );
  };
  selectCell = (options: CellPositionOptions & { clear?: boolean }) => {
    const cellSelection = this.getDataSourceState().cellSelection;

    if (!cellSelection) {
      return;
    }

    const [pk, colId] = this.getCellSelectionPosition(options);
    const newCellSelection = options.clear
      ? new CellSelectionState()
      : new CellSelectionState(cellSelection);
    newCellSelection.selectCell(pk, colId);
    this.dataSourceActions.cellSelection = newCellSelection;
  };
  deselectCell = (options: CellPositionOptions) => {
    const cellSelection = this.getDataSourceState().cellSelection;
    if (!cellSelection) {
      return;
    }

    const [pk, colId] = this.getCellSelectionPosition(options);

    const newCellSelection = new CellSelectionState(cellSelection);
    newCellSelection.deselectCell(pk, colId);
    this.dataSourceActions.cellSelection = newCellSelection;
  };

  selectColumn = (colId: string, options?: { clear?: boolean }) => {
    if (options?.clear) {
      this.deselectAll();
    }
    const cellSelection = this.getDataSourceState().cellSelection;
    if (!cellSelection) {
      return;
    }

    const newCellSelection = new CellSelectionState(cellSelection);
    newCellSelection.selectColumn(colId);
    this.dataSourceActions.cellSelection = newCellSelection;
  };
  deselectColumn = (colId: string) => {
    const cellSelection = this.getDataSourceState().cellSelection;
    if (!cellSelection) {
      return;
    }

    const newCellSelection = new CellSelectionState(cellSelection);
    newCellSelection.deselectColumn(colId);
    this.dataSourceActions.cellSelection = newCellSelection;
  };
}

export function getCellSelectionApi<T>(
  param: GetCellSelectionApiParam<T>,
): InfiniteTableCellSelectionApi<T> {
  const cellSelectionApi = new InfiniteTableCellSelectionApiImpl<T>(param);

  if (__DEV__) {
    (globalThis as any).cellSelectionApi = cellSelectionApi;
  }

  return cellSelectionApi;
}
