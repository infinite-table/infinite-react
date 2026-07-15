import { useMemo } from 'react';

import {
  computeRowHeightWithCache,
  ComputedRowHeightParam,
  RowSizeCache,
} from './computedRowHeightShared';

export { RowSizeCache };

export type UseComputedRowHeightParam<T> = ComputedRowHeightParam<T>;

export function useComputedRowHeight<T>(param: UseComputedRowHeightParam<T>) {
  return useMemo(() => {
    return computeRowHeightWithCache(param);
  }, [
    param.rowHeight,
    param.rowDetailHeight,
    param.isRowDetailsExpanded,
    param.isRowDetailsEnabled,
    param.getDataSourceState,
  ]);
}
