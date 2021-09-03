import type { DataSourceState, DataSourceReadOnlyState } from '../types';

import { multisort } from '../../../utils/multisort';
import {
  enhancedFlatten,
  group,
  getPivotColumnsAndColumnGroups,
} from '../../../utils/groupAndPivot';
import { InfiniteTableEnhancedData } from '../../InfiniteTable';

const haveDepsChanged = <StateType>(
  updated: Partial<StateType> | null,

  deps: (keyof StateType)[],
) => {
  if (!updated) {
    return false;
  }
  for (var i = 0, len = deps.length; i < len; i++) {
    if (updated.hasOwnProperty(deps[i])) {
      return true;
    }
  }
  return false;
};

function toEnhancedData<T>(data: T): InfiniteTableEnhancedData<T> {
  return { data, collapsed: true };
}

export function concludeReducer<T>(
  _previousState: DataSourceState<T> & DataSourceReadOnlyState<T>,
  state: DataSourceState<T> & DataSourceReadOnlyState<T>,
  updated: Partial<DataSourceState<T> & DataSourceReadOnlyState<T>> | null,
) {
  const sortInfo = state.sortInfo;
  const shouldSort = sortInfo?.length;

  const sortDepsChanged = haveDepsChanged(updated, [
    'originalDataArray',
    'sortInfo',
  ]);
  const shouldSortAgain =
    shouldSort && (sortDepsChanged || !state.postSortDataArray);

  const groupBy = state.groupRowsBy;
  const pivotBy = state.pivotBy;

  const shouldGroup = groupBy.length || pivotBy;
  const groupsDepsChanged = haveDepsChanged(updated, [
    'originalDataArray',
    'groupRowsBy',
    'groupRowsState',
    'pivotBy',
    'aggregationReducers',
    'sortInfo',
  ]);

  const shouldGroupAgain =
    shouldGroup && (groupsDepsChanged || !state.postGroupDataArray);

  let dataArray = state.originalDataArray;

  let enhancedDataArray: InfiniteTableEnhancedData<T>[] = [];

  if (shouldSort) {
    dataArray = shouldSortAgain
      ? multisort(sortInfo!, [...dataArray])
      : state.postSortDataArray!;

    state.postSortDataArray = dataArray;
  }

  state.groupDeepMap = undefined;

  if (shouldGroup) {
    if (shouldGroupAgain) {
      const groupResult = group(
        {
          groupBy,
          pivot: pivotBy,
          reducers: state.aggregationReducers,
        },
        dataArray,
      );
      const flattenResult = enhancedFlatten(groupResult, state.groupRowsState);

      enhancedDataArray = flattenResult.data;
      state.groupDeepMap = groupResult.deepMap;
      const pivotGroupsAndCols = pivotBy
        ? getPivotColumnsAndColumnGroups<T>(
            groupResult.topLevelPivotColumns!,
            pivotBy.length,
          )
        : undefined;

      state.pivotColumns = pivotGroupsAndCols?.columns;
      state.pivotColumnGroups = pivotGroupsAndCols?.columnGroups;
    } else {
      enhancedDataArray = state.postGroupDataArray!;
    }

    state.postGroupDataArray = enhancedDataArray;
  } else {
    state.groupDeepMap = undefined;
    state.pivotColumns = undefined;
    enhancedDataArray = dataArray.map(toEnhancedData);
  }

  if (enhancedDataArray !== state.dataArray) {
    state.timestamp = Date.now();
  }
  state.dataArray = enhancedDataArray;

  (globalThis as any).state = state;

  return state;
}
