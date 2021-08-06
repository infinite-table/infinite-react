import type {
  DataSourceState,
  DataSourceAction,
  DataSourceReducer,
  DataSourceSortInfo,
  DataSourceGroupBy,
  DataSourceDataInfo,
  DataSourceProps,
} from '../types';

import { DataSourceActionType } from '../types';

import { multisort } from '../../../utils/multisort';
import {
  AggregationReducer,
  enhancedFlatten,
  group,
} from '../../../utils/groupAndPivot';
import { InfiniteTableEnhancedData } from '../../InfiniteTable';

let reducerFn: any;

function setDataSourceInfo<T>(
  state: DataSourceState<T>,
  action: DataSourceAction<DataSourceDataInfo<T>>,
) {
  const { originalDataArray } = action.payload;
  return { ...state, originalDataArray };
}

function setLoading<T>(
  state: DataSourceState<T>,
  action: DataSourceAction<boolean>,
) {
  return { ...state, loading: action.payload };
}

function setSortInfo<T>(
  state: DataSourceState<T>,
  action: DataSourceAction<DataSourceSortInfo<T>>,
) {
  let sortInfo = action.payload ?? [];
  if (sortInfo && !Array.isArray(sortInfo)) {
    sortInfo = [sortInfo];
  }

  return { ...state, sortInfo };
}

function setGroupBy<T>(
  state: DataSourceState<T>,
  action: DataSourceAction<DataSourceGroupBy<T>>,
) {
  return { ...state, groupBy: action.payload ?? [] };
}

function setAggregationReducers<T>(
  state: DataSourceState<T>,
  action: DataSourceAction<AggregationReducer<T, any>[]>,
) {
  return { ...state, aggregationReducers: action.payload ?? [] };
}

const reducers: {
  [key: string]: <T>(
    state: DataSourceState<T>,
    action: DataSourceAction<any>,
    props: DataSourceProps<T>,
  ) => DataSourceState<T>;
} = {
  [DataSourceActionType.SET_DATA_SOURCE_INFO]: setDataSourceInfo,
  [DataSourceActionType.SET_GROUP_BY]: setGroupBy,
  [DataSourceActionType.SET_SORT_INFO]: setSortInfo,
  [DataSourceActionType.SET_LOADING]: setLoading,
  [DataSourceActionType.SET_AGGREGATION_REDUCERS]: setAggregationReducers,
};

const haveDepsChanged = <StateType>(
  initialState: StateType,
  finalState: StateType,
  deps: (keyof StateType)[],
) => {
  const initialValues = deps.map((k) => (initialState as any)[k]);

  const finalValues = deps.map((k) => (finalState as any)[k]);

  return finalValues.reduce((acc, _, index) => {
    const oldValue = initialValues[index];
    const newValue = finalValues[index];

    return acc || oldValue !== newValue;
  }, false);
};

function toEnhancedData<T>(data: T): InfiniteTableEnhancedData<T> {
  return { data };
}

function getReducer<T>(
  getProps: () => DataSourceProps<T>,
): DataSourceReducer<T> {
  if (reducerFn as DataSourceReducer<T>) {
    return reducerFn;
  }

  return (reducerFn = (
    state: DataSourceState<T>,
    action: DataSourceAction<any>,
  ) => {
    const initialState = state;

    let fn = reducers[action.type];
    if (fn) {
      state = fn(state, action, getProps());
    }

    console.log(state.aggregationReducers, 'RED');

    const sortInfo = state.sortInfo;
    const shouldSort = sortInfo.length;
    const sortDepsChanged = haveDepsChanged(initialState, state, [
      'originalDataArray',
      'sortInfo',
    ]);
    const shouldSortAgain =
      shouldSort && (sortDepsChanged || !state.postSortDataArray);

    const groupBy = state.groupBy;
    const shouldGroup = groupBy.length;
    const groupsDepsChanged = haveDepsChanged(initialState, state, [
      'originalDataArray',
      'groupBy',
      'aggregationReducers',
      'sortInfo',
    ]);

    const shouldGroupAgain =
      shouldGroup && (groupsDepsChanged || !state.postGroupDataArray);

    let dataArray = state.originalDataArray;

    let enhancedDataArray: InfiniteTableEnhancedData<T>[] = [];

    if (shouldSort) {
      dataArray = shouldSortAgain
        ? multisort(sortInfo, [...dataArray])
        : state.postSortDataArray!;

      state.postSortDataArray = dataArray;
    }

    state.groupDeepMap = undefined;

    if (shouldGroup) {
      if (shouldGroupAgain) {
        const groupResult = group(
          {
            groupBy,
          },
          dataArray,
        );
        const flattenResult = enhancedFlatten(groupResult, {
          reducers: state.aggregationReducers,
        });
        enhancedDataArray = flattenResult.data;
        state.groupDeepMap = groupResult.deepMap;
      } else {
        enhancedDataArray = state.postGroupDataArray!;
      }

      state.postGroupDataArray = enhancedDataArray;
    } else {
      state.groupDeepMap = undefined;
      enhancedDataArray = dataArray.map(toEnhancedData);
    }

    state.dataArray = enhancedDataArray;

    return state;
  });
}
export default getReducer;
