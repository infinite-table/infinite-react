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

function toEnhancedData<T>(
  data: T,
  id: any,
  index: number,
): InfiniteTableEnhancedData<T> {
  return { data, collapsed: true, id, indexInAll: index, indexInGroup: index };
}

export function concludeReducer<T>(
  previousState: DataSourceState<T> & DataSourceReadOnlyState<T>,
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
    shouldSort && (sortDepsChanged || !state.lastSortDataArray);

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
    shouldGroup && (groupsDepsChanged || !state.lastGroupDataArray);

  const now = Date.now();

  let dataArray = state.originalDataArray;

  let enhancedDataArray: InfiniteTableEnhancedData<T>[] = state.dataArray;

  if (shouldSort) {
    dataArray = shouldSortAgain
      ? multisort(sortInfo!, [...dataArray])
      : state.lastSortDataArray!;

    state.lastSortDataArray = dataArray;
    state.sortedAt = now;
  }
  state.postSortDataArray = dataArray;

  state.groupDeepMap = undefined;

  const toPrimaryKey = (data: T) => {
    return data[state.primaryKey];
  };

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
      const flattenResult = enhancedFlatten(
        groupResult,
        toPrimaryKey,
        state.groupRowsState,
      );

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
      enhancedDataArray = state.lastGroupDataArray!;
    }

    state.lastGroupDataArray = enhancedDataArray;
    state.groupedAt = now;
  } else {
    state.groupDeepMap = undefined;
    state.pivotColumns = undefined;

    const arrayDifferentAfterSortStep =
      previousState.postSortDataArray != state.postSortDataArray;

    if (arrayDifferentAfterSortStep) {
      enhancedDataArray = dataArray.map((data, index) =>
        toEnhancedData(data, toPrimaryKey(data), index),
      );
    }
  }

  state.postGroupDataArray = enhancedDataArray;

  if (enhancedDataArray !== state.dataArray) {
    state.updatedAt = now;
  }
  state.dataArray = enhancedDataArray;
  state.reducedAt = now;
  (globalThis as any).state = state;

  return state;
}
