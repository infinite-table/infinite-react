import type { DataSourceState, DataSourceDerivedState } from '../types';
import { InfiniteTableRowInfo, lazyGroup } from '../../../utils/groupAndPivot';
import { enhancedFlatten, group } from '../../../utils/groupAndPivot';

import { multisort } from '../../../utils/multisort';
import { getPivotColumnsAndColumnGroups } from '../../../utils/groupAndPivot/getPivotColumnsAndColumnGroups';
import { DataSourceSetupState } from '..';

const haveDepsChanged = <StateType>(
  state1: StateType,
  state2: StateType,
  deps: (keyof StateType)[],
) => {
  for (let i = 0, len = deps.length; i < len; i++) {
    const k = deps[i];
    const oldValue = (state1 as any)[k];
    const newValue = (state2 as any)[k];

    if (oldValue !== newValue) {
      return true;
    }
  }
  return false;
};

function toRowInfo<T>(
  data: T,
  id: any,
  index: number,
): InfiniteTableRowInfo<T> {
  return {
    data,
    collapsed: true,
    id,
    indexInAll: index,
    indexInGroup: index,
    isGroupRow: false,
  };
}

export function concludeReducer<T>(params: {
  previousState: DataSourceState<T> & DataSourceDerivedState<T>;
  state: DataSourceState<T> &
    DataSourceDerivedState<T> &
    DataSourceSetupState<T>;
}) {
  const { state, previousState } = params;
  const sortInfo = state.sortInfo;
  const shouldSort = !!sortInfo?.length && !state.controlledSort;

  const originalDataArrayChanged = haveDepsChanged(previousState, state, [
    'originalDataArray',
  ]);

  const sortInfoChanged = haveDepsChanged(previousState, state, ['sortInfo']);

  const sortDepsChanged = originalDataArrayChanged || sortInfoChanged;

  const shouldSortAgain =
    shouldSort && (sortDepsChanged || !state.lastSortDataArray);

  const groupBy = state.groupBy;
  const pivotBy = state.pivotBy;

  const shouldGroup = groupBy.length || pivotBy;
  const groupsDepsChanged = haveDepsChanged(previousState, state, [
    'generateGroupRows',
    'originalDataArray',
    'originalLazyGroupData',
    'groupBy',
    'groupRowsState',
    'pivotBy',
    'aggregationReducers',
    'pivotTotalColumnPosition',
    'showSeparatePivotColumnForSingleAggregation',
    'sortInfo',
  ]);

  const shouldGroupAgain =
    shouldGroup && (groupsDepsChanged || !state.lastGroupDataArray);

  const now = Date.now();

  let dataArray = state.originalDataArray;

  let rowInfoDataArray: InfiniteTableRowInfo<T>[] = state.dataArray;

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
      // console.log({ shouldGroupAgain });
      console.log(
        'grouping',
        state.originalLazyGroupData.size,
        state.fullLazyLoad,
      );
      const groupResult = state.fullLazyLoad
        ? lazyGroup(
            {
              groupBy,
              // groupByIndex: 0,
              // parentGroupKeys: [],
              pivot: pivotBy,
              mappings: state.pivotMappings,
              reducers: state.aggregationReducers,
            },
            state.originalLazyGroupData,
          )
        : group(
            {
              groupBy,
              pivot: pivotBy,
              reducers: state.aggregationReducers,
            },
            dataArray,
          );

      const flattenResult = enhancedFlatten({
        groupResult,
        reducers: state.aggregationReducers,
        toPrimaryKey,
        groupRowsState: state.groupRowsState,
        generateGroupRows: state.generateGroupRows,
      });

      rowInfoDataArray = flattenResult.data;
      state.groupDeepMap = groupResult.deepMap;

      const pivotGroupsAndCols = pivotBy
        ? getPivotColumnsAndColumnGroups<T>({
            deepMap: groupResult.topLevelPivotColumns!,
            pivotBy,

            pivotTotalColumnPosition: state.pivotTotalColumnPosition ?? 'end',
            reducers: state.aggregationReducers,
            showSeparatePivotColumnForSingleAggregation:
              state.showSeparatePivotColumnForSingleAggregation,
          })
        : undefined;

      state.pivotColumns = pivotGroupsAndCols?.columns;
      state.pivotColumnGroups = pivotGroupsAndCols?.columnGroups;
    } else {
      rowInfoDataArray = state.lastGroupDataArray!;
    }

    state.lastGroupDataArray = rowInfoDataArray;
    state.groupedAt = now;
  } else {
    state.groupDeepMap = undefined;
    state.pivotColumns = undefined;

    const arrayDifferentAfterSortStep =
      previousState.postSortDataArray != state.postSortDataArray;

    if (arrayDifferentAfterSortStep) {
      rowInfoDataArray = dataArray.map((data, index) =>
        toRowInfo(data, toPrimaryKey(data), index),
      );
    }
  }

  state.postGroupDataArray = rowInfoDataArray;

  if (rowInfoDataArray !== state.dataArray) {
    state.updatedAt = now;
  }

  state.dataArray = rowInfoDataArray;
  state.reducedAt = now;

  if (__DEV__) {
    (globalThis as any).state = state;
  }

  return state;
}
