import type {
  DataSourceAction,
  DataSourceActions,
  DataSourceDataInfo,
  DataSourceGroupBy,
  DataSourceSortInfo,
} from '../types';
import { DataSourceActionType } from '../types';

import { Setter } from '../../types/Setter';
import { AggregationReducer } from '../../../utils/groupAndPivot';

export function getReducerActions<T>(
  dispatch: React.Dispatch<DataSourceAction<any>>,
): DataSourceActions<T> {
  const setLoading: Setter<boolean> = (loading) => {
    dispatch({
      type: DataSourceActionType.SET_LOADING,
      payload: loading,
    });
  };

  const setGroupBy: Setter<DataSourceGroupBy<T>> = (groupBy) => {
    dispatch({
      type: DataSourceActionType.SET_GROUP_BY,
      payload: groupBy,
    });
  };

  const setSortInfo: Setter<DataSourceSortInfo<T>> = (sortInfo) => {
    dispatch({
      type: DataSourceActionType.SET_SORT_INFO,
      payload: sortInfo,
    });
  };

  const setDataSourceInfo: Setter<DataSourceDataInfo<T>> = (dataSourceInfo) => {
    dispatch({
      type: DataSourceActionType.SET_DATA_SOURCE_INFO,
      payload: dataSourceInfo,
    });
  };
  const setAggregationReducers: Setter<AggregationReducer<T, any>[]> = (
    aggregationReducers,
  ) => {
    dispatch({
      type: DataSourceActionType.SET_AGGREGATION_REDUCERS,
      payload: aggregationReducers,
    });
  };

  return {
    setLoading,
    setDataSourceInfo,
    setSortInfo,
    setGroupBy,
    setAggregationReducers,
  };
}
