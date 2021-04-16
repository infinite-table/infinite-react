import { useLayoutEffect } from 'react';
import {
  DataSourceDataInfo,
  DataSourceData,
  DataSourceContextValue,
} from '../types';

import { loadDataAsync } from './loadDataAsync';

function buildDataSourceInfo<T>(data: T[]): DataSourceDataInfo<T> {
  return { originalDataArray: data };
}

function useLoadData<T>(contextValue: DataSourceContextValue<T>) {
  const { data } = contextValue.props;
  const { actions } = contextValue;

  const loadData = (data: DataSourceData<T>) => {
    let dataSourceInfo: DataSourceDataInfo<T> = {
      originalDataArray: [] as T[],
    };
    if (typeof data === 'function') {
      data = data();
    }
    if (Array.isArray(data)) {
      dataSourceInfo = buildDataSourceInfo(data);
      actions.setDataSourceInfo(dataSourceInfo);
    } else {
      actions.setLoading(true);
      loadDataAsync(data).then((dataSourceInfo: DataSourceDataInfo<T>) => {
        actions.setDataSourceInfo(dataSourceInfo);
        actions.setLoading(false);
      });
    }
  };

  useLayoutEffect(() => {
    loadData(data);
  }, [data]);
}

export default useLoadData;
