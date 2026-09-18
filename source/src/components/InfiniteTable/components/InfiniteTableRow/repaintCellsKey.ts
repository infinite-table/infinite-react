import type { DataSourceState } from '../../../DataSource/types';
import type { RowInfoStore } from '../../../DataSource/RowInfoStore';
import type {
  InfiniteTableComputedColumn,
  InfiniteTablePropRepaintCellsKey,
  InfiniteTablePropRepaintCellsKeyFn,
} from '../../types';

export type RepaintCellsKeyComputeParams<T> = {
  column: InfiniteTableComputedColumn<T>;
  rowIndex: number;
  rowInfoStore: RowInfoStore<T>;
  getDataSourceState: () => DataSourceState<T>;
};

/**
 * Returned by `computeRepaintCellsKey` when there's no row at `rowIndex`
 * (eg: the row was removed) - callers should skip the comparison.
 */
export const REPAINT_CELLS_KEY_NO_ROW = Symbol('REPAINT_CELLS_KEY_NO_ROW');

export function isRepaintCellsKeyFn<T>(
  repaintCellsKey: InfiniteTablePropRepaintCellsKey<T> | undefined,
): repaintCellsKey is InfiniteTablePropRepaintCellsKeyFn<T> {
  return typeof repaintCellsKey === 'function';
}

/**
 * Calls the `repaintCellsKey` function for the cell at `rowIndex`/`column`,
 * with the current rowInfo and the current & previous DataSource states.
 *
 * Shared by the React and Vue cells.
 */
export function computeRepaintCellsKey<T>(
  fn: InfiniteTablePropRepaintCellsKeyFn<T>,
  params: RepaintCellsKeyComputeParams<T>,
): unknown {
  const { column, rowIndex, rowInfoStore, getDataSourceState } = params;

  const rowInfo = rowInfoStore.getRowInfoAtIndex(rowIndex);

  if (!rowInfo) {
    return REPAINT_CELLS_KEY_NO_ROW;
  }

  const states = rowInfoStore.getDataSourceStates();

  return fn({
    rowInfo,
    column,
    dataSourceState: states.dataSourceState ?? getDataSourceState(),
    previousDataSourceState: states.previousDataSourceState,
  });
}

/**
 * Subscribes to data array changes and calls `onKeyChange` whenever the key
 * computed by `fn` for this cell differs (via `Object.is`) from the one
 * computed on the previous data change (or at subscription time).
 *
 * Returns the unsubscribe function.
 */
export function subscribeToRepaintCellsKey<T>(
  fn: InfiniteTablePropRepaintCellsKeyFn<T>,
  params: RepaintCellsKeyComputeParams<T>,
  onKeyChange: () => void,
): () => void {
  let lastKey = computeRepaintCellsKey(fn, params);

  return params.rowInfoStore.subscribeToDataArrayChange(() => {
    const nextKey = computeRepaintCellsKey(fn, params);

    if (nextKey === REPAINT_CELLS_KEY_NO_ROW) {
      // the row is gone - the cell will be unmounted/reused, nothing to repaint
      return;
    }

    if (!Object.is(nextKey, lastKey)) {
      lastKey = nextKey;
      onKeyChange();
    }
  });
}
