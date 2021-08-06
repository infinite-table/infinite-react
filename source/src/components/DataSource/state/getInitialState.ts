import { InfiniteTableEnhancedData } from '../../InfiniteTable';
import { normalizeSortInfo } from '../props/useSortInfoProp';
import { DataSourceProps, DataSourceSortInfo, DataSourceState } from '../types';

function getInitialState<T>(
  initialProps: DataSourceProps<T>,
): DataSourceState<T> {
  const dataArray: InfiniteTableEnhancedData<T>[] = [];
  const originalDataArray: T[] = [];
  const sortInfo: DataSourceSortInfo<T> = normalizeSortInfo(
    initialProps.defaultSortInfo,
  );

  return {
    loading: false,
    dataArray,
    originalDataArray,
    sortInfo,
    // postSortDataArray,
    // postGroupDataArray,

    groupBy: initialProps.defaultGroupBy ?? [],
    aggregationReducers: undefined,
  };
}

export default getInitialState;
