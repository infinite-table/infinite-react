import type { CellPosition } from '../../types/CellPosition';
import type {
  InfiniteTableApi,
  InfiniteTableComputedColumn,
  InfiniteTableComputedValues,
  InfiniteTableState,
} from '../types';

import binarySearch from 'binary-search';
import { cancelRaf, raf } from '../../../utils/raf';

import { getFormattedValueContextForCell } from '../components/InfiniteTableRow/columnRendering';
import { InfiniteTableColumnRenderingContext } from '../components/InfiniteTableRow/columnRenderingContextType';

import { getFirstFocusableChildForNode } from './getFocusableChildrenForNode';
import { waitForFunction } from './waitForFunction';

type ContentFocusableContext<T> = InfiniteTableColumnRenderingContext<T> & {
  getComputed: () => InfiniteTableComputedValues<T>;
};

const RETRIES = 10;

const SORT_ASC = (a: number, b: number) => a - b;

export function getFollowingContentFocusableCell<T>(
  cellPos: CellPosition,
  direction: 1 | -1,
  context: ContentFocusableContext<T>,
): CellPosition | null {
  let currentCelPos: CellPosition | null = cellPos;

  while (
    (currentCelPos = getFollowingCellPosition(
      currentCelPos,
      direction,
      context,
    ))
  ) {
    if (isCellFocusable(currentCelPos, context)) {
      return currentCelPos;
    }
  }

  return null;
}

export function isCellFocusable<T>(
  cellPos: CellPosition,
  context: ContentFocusableContext<T>,
): boolean {
  const { getComputed, getDataSourceState, getState, api, dataSourceApi } =
    context;

  const { editingCell } = getState();

  const { dataArray } = getDataSourceState();

  const { computedVisibleColumns, computedColumnsMap } = getComputed();

  const column = computedVisibleColumns[cellPos.colIndex];
  if (!column) {
    return false;
  }

  if (
    editingCell &&
    editingCell.columnId === column.id &&
    editingCell.rowIndex === cellPos.rowIndex
  ) {
    return true;
  }

  if (!column.contentFocusable) {
    return false;
  }
  if (column.contentFocusable === true) {
    return true;
  }
  return column.contentFocusable({
    column,
    ...getFormattedValueContextForCell({
      column,
      rowInfo: dataArray[cellPos.rowIndex],
      columnsMap: computedColumnsMap,
      context,
    }).formattedValueContext,
    api,
    dataSourceApi,
  });
}

export function getFollowingFocusableCell<T>(
  cellPos: CellPosition,
  direction: 1 | -1,
  context: ContentFocusableContext<T>,
): CellPosition | null {
  // let nextCellPos: CellPosition | null = cellPos;

  const editingCell = context.getState().editingCell;
  const nextCellPos = getFollowingCellPositionOptimized(
    cellPos,
    direction,
    context,
    {
      isCellFocusable,
      isColumnElligible: (col) => {
        if (editingCell && editingCell.columnId === col.id) {
          return true;
        }
        return !!col.contentFocusable;
      },
    },
  );
  return nextCellPos;
}

export function getFollowingCellPosition<T>(
  cellPos: CellPosition,
  direction: 1 | -1,
  context: ContentFocusableContext<T>,
): CellPosition | null {
  let { rowIndex, colIndex } = cellPos;

  const { getComputed, getDataSourceState } = context;
  const computed = getComputed();
  const { dataArray } = getDataSourceState();

  colIndex += direction;

  if (computed.computedVisibleColumns[colIndex]) {
    return { rowIndex, colIndex };
  }

  rowIndex += direction;

  if (rowIndex < 0 || rowIndex >= dataArray.length) {
    return null;
  }
  colIndex = direction === 1 ? 0 : computed.computedVisibleColumns.length - 1;

  if (computed.computedVisibleColumns[colIndex]) {
    return { rowIndex, colIndex };
  }
  return null;
}

function getNextCol(
  colIndex: number,
  direction: number,
  validColIndexes: number[],
) {
  let index = binarySearch(validColIndexes, colIndex + direction, SORT_ASC);
  if (index < 0) {
    index = ~index;

    if (direction > 0 && index >= validColIndexes.length) {
      return null;
    }
    if (direction < 0 && index === 0) {
      return null;
    }
  }

  return validColIndexes[index] ?? null;
}

//@ts-ignore
globalThis.getNextCol = getNextCol;
/**
 * This function is different from the one above. The fn above just gets the next valid
 * cell position without considering other factors. This function is different as it runs the last `fn` argument
 * and only those cells that `fn` return true, can be considered as valid cells.
 */
export function getFollowingCellPositionOptimized<T>(
  cellPos: CellPosition,
  direction: 1 | -1,
  context: ContentFocusableContext<T>,
  options: {
    isColumnElligible: (col: InfiniteTableComputedColumn<T>) => boolean;
    isCellFocusable: (
      cellPos: CellPosition,
      context: ContentFocusableContext<T>,
    ) => boolean;
  },
): CellPosition | null {
  const { isColumnElligible, isCellFocusable } = options;
  const validColIndexes = context
    .getComputed()
    .computedVisibleColumns.filter(isColumnElligible)
    .reduce((acc, col) => {
      acc.push(col.computedVisibleIndex);
      return acc;
    }, [] as number[]);

  if (!validColIndexes.length) {
    return null;
  }

  const { getDataSourceState } = context;

  const { dataArray } = getDataSourceState();

  let rowIndex: number | null = cellPos.rowIndex;
  let colIndex: number | null = cellPos.colIndex;

  while (rowIndex != null || colIndex != null) {
    colIndex =
      colIndex === null
        ? validColIndexes[direction === -1 ? validColIndexes.length - 1 : 0]
        : getNextCol(colIndex, direction, validColIndexes);

    if (colIndex === null) {
      // we have to move to next row
      rowIndex += direction;

      if (rowIndex < 0 || rowIndex >= dataArray.length) {
        return null;
      }
      continue;
    }

    if (isCellFocusable({ colIndex, rowIndex }, context)) {
      return {
        colIndex,
        rowIndex,
      };
    }
  }
  return null;
}

export async function focusLastFocusableCell<T>(
  context: ContentFocusableContext<T>,
) {
  const lastCellPos = {
    rowIndex: context.getDataSourceState().dataArray.length - 1,
    colIndex: context.getComputed().computedVisibleColumns.length - 1,
  };

  const cellPos = isCellFocusable(lastCellPos, context)
    ? lastCellPos
    : getFollowingFocusableCell(lastCellPos, -1, context);

  if (cellPos) {
    await tryScrollToCell([cellPos.rowIndex, cellPos.colIndex], context);

    const cellNode = context.getState().getDOMNodeForCell(cellPos);

    if (!cellNode) {
      return;
    }

    const first = getFirstFocusableChildForNode(cellNode);

    first?.focus();
  }
}

export async function tryScrollToCell<T>(
  [rowIndex, colIndex]: [number, number],
  context: { api: InfiniteTableApi<T>; getState: () => InfiniteTableState<T> },
) {
  const { api } = context;
  return new Promise((resolve, reject) => {
    const maxRetries = RETRIES;
    let rafId: number | null = null;
    let didScroll: boolean = false;

    function tryScroll(times = 0) {
      times++;
      cancelRaf(rafId!);
      rafId = raf(async () => {
        didScroll = api.scrollCellIntoView(rowIndex, colIndex, {
          offset: 30,
        });

        if (!didScroll && times < maxRetries) {
          tryScroll(times);
        }
        if (didScroll) {
          try {
            await waitForFunction(
              () =>
                !!context.getState().getDOMNodeForCell({
                  rowIndex,
                  colIndex,
                }),
            );
          } catch (e) {
            reject(e);
            return;
          }
          resolve(true);
        }
      });
    }

    tryScroll();
  });
}
