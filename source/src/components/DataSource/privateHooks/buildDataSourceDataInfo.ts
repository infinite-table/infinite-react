import { DataSourceDataInfo } from '../types';

export function buildDataSourceDataInfo<T>(
  dataParam: T[] | { data: T[] },
): DataSourceDataInfo<T> {
  let dataArray: T[] = [] as T[];

  if (Array.isArray((dataParam as { data: T[] }).data)) {
    dataArray = (dataParam as { data: T[] }).data;
  } else {
    dataArray = dataParam as T[];
  }

  return {
    originalDataArray: dataArray,
  };
}
