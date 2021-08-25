import { useLayoutEffect } from 'react';
import { useComponentState } from '../../hooks/useComponentState';
import { DataSourceDataInfo, DataSourceData, DataSourceState } from '../types';

import { loadDataAsync } from './loadDataAsync';

function buildDataSourceInfo<T>(data: T[]): DataSourceDataInfo<T> {
  return { originalDataArray: data };
}

export function useLoadData<T>() {
  const {
    componentActions: actions,
    componentState: { data },
  } = useComponentState<DataSourceState<T>>();

  const loadData = (data: DataSourceData<T>) => {
    let dataSourceInfo: DataSourceDataInfo<T> = {
      originalDataArray: [] as T[],
    };
    if (typeof data === 'function') {
      data = data();
    }
    if (Array.isArray(data)) {
      dataSourceInfo = buildDataSourceInfo(data);
      actions.originalDataArray = dataSourceInfo.originalDataArray;
    } else {
      actions.loading = true;
      loadDataAsync(data).then((dataSourceInfo: DataSourceDataInfo<T>) => {
        actions.originalDataArray = dataSourceInfo.originalDataArray;
        actions.loading = false;
      });
    }
  };

  useLayoutEffect(() => {
    loadData(data);
  }, [data]);
}
