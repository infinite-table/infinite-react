import { DataSourceData, DataSourceDataInfo } from '../types';
import { buildDataSourceDataInfo } from './buildDataSourceDataInfo';

export async function loadDataAsync<T>(
  data: DataSourceData<T>,
): Promise<DataSourceDataInfo<T>> {
  if (typeof data === 'function') {
    data = data();
  }

  return buildDataSourceDataInfo(await data);
}
