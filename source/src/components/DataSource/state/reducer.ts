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
import { enhancedFlatten, group } from '../../../utils/groupAndPivot';
import { TableEnhancedData } from '../../Table';

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

    const shouldSort = haveDepsChanged(initialState, state, [
      'originalDataArray',
      'sortInfo',
    ]);

    const groupBy = state.groupBy;
    const shouldGroup =
      groupBy &&
      haveDepsChanged(initialState, state, ['originalDataArray', 'groupBy']);

    let dataArray = state.originalDataArray;
    let enhancedDataArray: TableEnhancedData<T>[] = [];

    const sortInfo = state.sortInfo;

    if (shouldSort && sortInfo.length) {
      dataArray = multisort(sortInfo, [...dataArray]);
    }

    if (shouldGroup && groupBy.length) {
      enhancedDataArray = enhancedFlatten(
        group(
          {
            groupBy,
          },
          dataArray,
        ),
      );
    } else {
      enhancedDataArray = dataArray.map((data) => ({ data }));
    }

    state.dataArray = enhancedDataArray;

    return state;
  });
}
export default getReducer;
