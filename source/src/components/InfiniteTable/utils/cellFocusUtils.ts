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
  const { getComputed, getDataSourceState } = context;

  const { dataArray } = getDataSourceState();

  const { computedVisibleColumns, computedColumnsMap } = getComputed();

  const column = computedVisibleColumns[cellPos.colIndex];

  if (!column || !column.contentFocusable) {
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
  });
}

export function getFollowingFocusableCell<T>(
  cellPos: CellPosition,
  direction: 1 | -1,
  context: ContentFocusableContext<T>,
): CellPosition | null {
  let nextCellPos: CellPosition | null = cellPos;

  while (
    (nextCellPos = getFollowingCellPositionOptimized(
      cellPos,
      direction,
      context,
      (col) => {
        return !!col.contentFocusable;
      },
    ))
  ) {
    if (isCellFocusable(nextCellPos, context)) {
      return nextCellPos;
    }
  }
  return null;
}

function getFoundOrInsertIndex(arr: number[], value: number): number | null {
  const index = binarySearch(arr, value, SORT_ASC);

  if (index < 0) {
    const res = ~index;

    if (res === arr.length) {
      return null;
    }
    return res;
  }
  return index;
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

/**
 * This function is different from the one above. The fn above just gets the next valid
 * cell position without considering other factors. This function is different as it runs the last `fn` argument
 * and only those cells that `fn` return true, can be considered as valid cells.
 */
export function getFollowingCellPositionOptimized<T>(
  cellPos: CellPosition,
  direction: 1 | -1,
  context: ContentFocusableContext<T>,
  fn: (column: InfiniteTableComputedColumn<T>) => boolean,
): CellPosition | null {
  const validColIndexes = context
    .getComputed()
    .computedVisibleColumns.filter(fn)
    .reduce((acc, col) => {
      acc.push(col.computedVisibleIndex);
      return acc;
    }, [] as number[]);

  if (!validColIndexes.length) {
    return null;
  }

  let { rowIndex, colIndex } = cellPos;

  const { getDataSourceState } = context;

  const { dataArray } = getDataSourceState();

  let idx: number | null = getFoundOrInsertIndex(
    validColIndexes,
    colIndex + direction,
  );

  if (idx != null && direction === -1) {
    idx -= 1;

    if (idx < 0) {
      idx = null;
    }
  }

  if (idx !== null) {
    return { rowIndex, colIndex: validColIndexes[idx] };
  }

  rowIndex += direction;

  if (rowIndex < 0 || rowIndex >= dataArray.length) {
    return null;
  }

  colIndex =
    direction === 1
      ? validColIndexes[0]
      : validColIndexes[validColIndexes.length - 1];

  if (colIndex != null) {
    return { rowIndex, colIndex };
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
