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
export type InfiniteTableCellSelectionApi = {
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
};

export type GetCellSelectionApiParam<T> = {
  getComputed: () => InfiniteTableComputedValues<T>;
  getDataSourceState: () => DataSourceState<T>;
  dataSourceActions: {
    cellSelection: DataSourceComponentActions<T>['cellSelection'];
  };
};

export function getCellSelectionApi<T>(
  param: GetCellSelectionApiParam<T>,
): InfiniteTableCellSelectionApi {
  const {
    getComputed,
    // getState,
    getDataSourceState,
    // componentActions,
    dataSourceActions,
  } = param;

  const getCellSelectionPosition = (options: CellPositionOptions) => {
    const rowId =
      options.rowId ?? getRowInfoAt(options.rowIndex!, getDataSourceState)?.id;

    const colId =
      options.colId ??
      getComputed().computedVisibleColumns[options.colIndex].id;

    return [rowId, colId] as const;
  };

  const cellSelectionApi = {
    getAllCellSelectionPositions: () => {
      const dataArray = getRowInfoArray(getDataSourceState);

      const { computedVisibleColumns } = getComputed();

      const computedVisibleColumnsIds = computedVisibleColumns.map((x) => x.id);

      const colsInSelection = new Set<string>();
      const rowsInSelection: InfiniteTableRowInfo<T>[] = [];
      const rowIdsInSelection = new Set<any>();

      dataArray.filter((rowInfo) => {
        computedVisibleColumns.forEach((col) => {
          if (
            cellSelectionApi.isCellSelected({
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
          if (cellSelectionApi.isCellSelected({ rowId: rowInfo.id, colId })) {
            return [rowInfo.id, colId] as CellSelectionPosition;
          }
          return null;
        });
      });

      return {
        columnIds: columnIds,
        positions,
      };
    },
    deselectAll: () => {
      const dataSourceState = getDataSourceState();
      const cellSelection = dataSourceState.cellSelection;

      if (!cellSelection) {
        return;
      }

      const newCellSelection = new CellSelectionState(cellSelection);

      newCellSelection.deselectAll();

      dataSourceActions.cellSelection = newCellSelection;
    },
    clear: () => {
      cellSelectionApi.deselectAll();
    },
    selectAll: () => {
      const dataSourceState = getDataSourceState();
      const cellSelection = dataSourceState.cellSelection;

      if (!cellSelection) {
        return;
      }

      const newCellSelection = new CellSelectionState(cellSelection);

      newCellSelection.selectAll();

      dataSourceActions.cellSelection = newCellSelection;
    },
    selectRange: (
      startOptions: CellPositionOptions,
      endOptions: CellPositionOptions,
    ) => {
      cellSelectionApi.setRangeSelected(startOptions, endOptions, true);
    },

    deselectRange: (
      startOptions: CellPositionOptions,
      endOptions: CellPositionOptions,
    ) => {
      cellSelectionApi.setRangeSelected(startOptions, endOptions, false);
    },

    setRangeSelected: (
      startOptions: CellPositionOptions,
      endOptions: CellPositionOptions,
      selected: boolean,
    ) => {
      const dataSourceState = getDataSourceState();
      const cellSelection = dataSourceState.cellSelection;

      if (!cellSelection) {
        return;
      }

      const newCellSelection = new CellSelectionState(cellSelection);

      const [startRowId, startColId] = getCellSelectionPosition(startOptions);
      const [endRowId, endColId] = getCellSelectionPosition(endOptions);

      const startCol = getComputed().computedVisibleColumnsMap.get(startColId);
      const endCol = getComputed().computedVisibleColumnsMap.get(endColId);

      if (!startCol || !endCol) {
        return;
      }
      const startColIndex = startCol.computedVisibleIndex;
      const endColIndex = endCol.computedVisibleIndex;

      const startRowInfo = getRowInfoAt(startRowId, getDataSourceState);
      const endRowInfo = getRowInfoAt(endRowId, getDataSourceState);
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
          const [pk, colId] = getCellSelectionPosition(pos);

          if (selected) {
            newCellSelection.selectCell(pk, colId);
          } else {
            newCellSelection.deselectCell(pk, colId);
          }
        }
      }
      dataSourceActions.cellSelection = newCellSelection;
    },

    isCellSelected: (options: CellPositionOptions) => {
      const [pk, colId] = getCellSelectionPosition(options);
      return (
        getDataSourceState().cellSelection?.isCellSelected(pk, colId) ?? false
      );
    },
    selectCell: (options: CellPositionOptions & { clear?: boolean }) => {
      const cellSelection = getDataSourceState().cellSelection;

      if (!cellSelection) {
        return;
      }

      const [pk, colId] = getCellSelectionPosition(options);
      const newCellSelection = options.clear
        ? new CellSelectionState()
        : new CellSelectionState(cellSelection);
      newCellSelection.selectCell(pk, colId);
      dataSourceActions.cellSelection = newCellSelection;
    },
    deselectCell: (options: CellPositionOptions) => {
      const cellSelection = getDataSourceState().cellSelection;
      if (!cellSelection) {
        return;
      }

      const [pk, colId] = getCellSelectionPosition(options);

      const newCellSelection = new CellSelectionState(cellSelection);
      newCellSelection.deselectCell(pk, colId);
      dataSourceActions.cellSelection = newCellSelection;
    },

    selectColumn: (colId: string, options?: { clear?: boolean }) => {
      if (options?.clear) {
        cellSelectionApi.deselectAll();
      }
      const cellSelection = getDataSourceState().cellSelection;
      if (!cellSelection) {
        return;
      }

      const newCellSelection = new CellSelectionState(cellSelection);
      newCellSelection.selectColumn(colId);
      dataSourceActions.cellSelection = newCellSelection;
    },
    deselectColumn: (colId: string) => {
      const cellSelection = getDataSourceState().cellSelection;
      if (!cellSelection) {
        return;
      }

      const newCellSelection = new CellSelectionState(cellSelection);
      newCellSelection.deselectColumn(colId);
      dataSourceActions.cellSelection = newCellSelection;
    },
  };

  if (__DEV__) {
    (globalThis as any).cellSelectionApi = cellSelectionApi;
  }
  return cellSelectionApi;
}
