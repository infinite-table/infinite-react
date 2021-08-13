import { InfiniteTableEnhancedData } from '../../InfiniteTable';
import { isControlled } from '../../utils/isControlled';
import { normalizeSortInfo } from './normalizeSortInfo';
import { DataSourceProps, DataSourceSortInfo, DataSourceState } from '../types';

export function getInitialState<T>(
  initialProps: DataSourceProps<T>,
): DataSourceState<T> {
  const dataArray: InfiniteTableEnhancedData<T>[] = [];
  const originalDataArray: T[] = [];
  const sortInfo: DataSourceSortInfo<T> = normalizeSortInfo(
    isControlled('sortInfo', initialProps)
      ? initialProps.sortInfo
      : initialProps.defaultSortInfo,
  );

  return {
    data: initialProps.data,
    loading: initialProps.loading ?? initialProps.defaultLoading ?? false,
    dataArray,
    originalDataArray,
    sortInfo,
    // postSortDataArray,
    // postGroupDataArray,

    groupBy: isControlled('groupBy', initialProps)
      ? initialProps.groupBy ?? []
      : initialProps.defaultGroupBy ?? [],
    aggregationReducers: undefined,
  };
}
