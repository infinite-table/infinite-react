import { TableEnhancedData } from '../../Table';
import { normalizeSortInfo } from '../props/useSortInfoProp';
import { DataSourceProps, DataSourceSortInfo, DataSourceState } from '../types';

function getInitialState<T>(
  initialProps: DataSourceProps<T>,
): DataSourceState<T> {
  const dataArray: TableEnhancedData<T>[] = [];
  const originalDataArray: T[] = [];
  const sortInfo: DataSourceSortInfo<T> = normalizeSortInfo(
    initialProps.defaultSortInfo,
  );

  return {
    loading: false,
    dataArray,
    originalDataArray,
    sortInfo,

    groupBy: initialProps.defaultGroupBy ?? [],
  };
}

export default getInitialState;
