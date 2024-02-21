import { useMemo } from 'react';
import { DataSourceState } from '../../DataSource';
import { InfiniteTableRowInfo } from '../types';

export type UseComputedRowHeightParam<T> = {
  rowHeight: number | ((rowInfo: InfiniteTableRowInfo<T>) => number);
  rowDetailHeight: number | ((rowInfo: InfiniteTableRowInfo<T>) => number);
  isRowDetailsExpanded?: (rowInfo: InfiniteTableRowInfo<T>) => boolean;
  isRowDetailsEnabled?:
    | boolean
    | ((rowInfo: InfiniteTableRowInfo<T>) => boolean);
  getDataSourceState: () => DataSourceState<T>;
};

export class RowSizeCache {
  rowHeight: Map<number, number> = new Map();
  rowDetailHeight: Map<number, number> = new Map();

  getTotalRowHeight(index: number) {
    return this.getRowHeight(index) + this.getRowDetailHeight(index);
  }
  getRowHeight = (index: number) => {
    return this.rowHeight.get(index) ?? 0;
  };
  getRowDetailHeight = (index: number) => {
    return this.rowDetailHeight.get(index) ?? 0;
  };

  getSize(index: number) {
    const rowHeight = this.getRowHeight(index);
    const rowDetailHeight = this.getRowDetailHeight(index);
    return {
      rowHeight,
      rowDetailHeight,
      totalRowHeight: rowHeight + rowDetailHeight,
    };
  }
}

function getComputedRowHeight<T>(
  param: UseComputedRowHeightParam<T>,
  cache?: {
    rowHeight: Map<number, number>;
    rowDetailHeight: Map<number, number>;
  },
) {
  const initialRowDetailHeight = param.rowDetailHeight;
  const initialRowHeight = param.rowHeight;

  const { isRowDetailsExpanded, isRowDetailsEnabled, getDataSourceState } =
    param;

  if (!isRowDetailsExpanded) {
    // if we don't have row details
    // then we're in the easy case
    //
    // if rowHeight is function of (rowInfo), make sure we return a function that can be called with an index
    // instead of the rowInfo
    if (typeof initialRowHeight === 'function') {
      return (index: number) => {
        if (cache && cache.rowHeight.has(index)) {
          return cache.rowHeight.get(index)!;
        }
        const item = getDataSourceState().dataArray[index];
        const result = !item ? 0 : initialRowHeight(item);

        if (cache) {
          cache.rowHeight.set(index, result);
        }
        return result;
      };
    }

    return initialRowHeight;
  }

  const rowHeightAsFn = typeof initialRowHeight === 'function';
  const rowDetailHeightAsFn = typeof initialRowDetailHeight === 'function';

  // but we do have row details - which might for each row
  // be in a different state - expanded or not, etc
  // so we need to always return a function in this case
  const result = (index: number) => {
    if (
      cache &&
      cache.rowHeight.has(index) &&
      cache.rowDetailHeight.has(index)
    ) {
      const result =
        cache.rowHeight!.get(index)! + cache.rowDetailHeight!.get(index)!;

      return result;
    }
    const item = getDataSourceState().dataArray[index];
    if (!item) {
      if (cache) {
        cache.rowHeight.set(index, 0);
        cache.rowDetailHeight.set(index, 0);
      }
      return 0;
    }
    const rowHeight = rowHeightAsFn ? initialRowHeight(item) : initialRowHeight;
    const expandable =
      !isRowDetailsEnabled ||
      (typeof isRowDetailsEnabled === 'function' &&
        isRowDetailsEnabled(item) === false)
        ? false
        : true;

    if (!expandable || !isRowDetailsExpanded(item)) {
      if (cache) {
        cache.rowHeight.set(index, rowHeight);
        cache.rowDetailHeight.set(index, 0);
      }
      return rowHeight;
    }

    let rowDetailHeight = 0;
    if (rowDetailHeightAsFn) {
      rowDetailHeight = initialRowDetailHeight(item);
    } else {
      rowDetailHeight = initialRowDetailHeight;
    }
    if (cache) {
      cache.rowHeight.set(index, rowHeight);
      cache.rowDetailHeight.set(index, rowDetailHeight);
    }

    return rowHeight + rowDetailHeight;
  };

  return result;
}
export function useComputedRowHeight<T>(param: UseComputedRowHeightParam<T>) {
  return useMemo(() => {
    const computedRowSizeCache = new RowSizeCache();
    const computedRowHeight = getComputedRowHeight(param, computedRowSizeCache);

    return {
      computedRowHeight,
      computedRowSizeCacheForDetails: param.isRowDetailsExpanded
        ? computedRowSizeCache
        : undefined,
    };
  }, [
    param.rowHeight,
    param.rowDetailHeight,
    param.isRowDetailsExpanded,
    param.isRowDetailsEnabled,
    param.getDataSourceState,
  ]);
}
