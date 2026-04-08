import { DataSourceApi, useDataSourceSelector } from '..';

export function useDataSourceApi<T>(): DataSourceApi<T> {
  return useDataSourceSelector((ctx) => ctx.dataSourceApi);
}
