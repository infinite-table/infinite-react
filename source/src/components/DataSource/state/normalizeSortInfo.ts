import { DataSourceSingleSortInfo, DataSourceSortInfo } from '../types';

export const normalizeSortInfo = <T>(
  sortInfo: DataSourceSortInfo<T>,
): DataSourceSingleSortInfo<T>[] => {
  sortInfo = sortInfo ?? [];
  return Array.isArray(sortInfo) ? sortInfo : [sortInfo];
};
