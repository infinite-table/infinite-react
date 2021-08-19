import type { DataSourceState, DataSourceReadOnlyState } from '../types';

import { multisort } from '../../../utils/multisort';
import { enhancedFlatten, group } from '../../../utils/groupAndPivot';
import { InfiniteTableEnhancedData } from '../../InfiniteTable';

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

export function reducer<T>(
  state: DataSourceState<T> & DataSourceReadOnlyState<T>,
) {
  const initialState = state;

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
      // console.log({ flattenResult });
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
  // console.log('!!!', state);

  state.dataArray = enhancedDataArray;

  return state;
}
