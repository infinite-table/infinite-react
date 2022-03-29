import type {
  DataSourceState,
  DataSourceDerivedState,
  LazyGroupRowInfo,
} from '../types';
import {
  InfiniteTableRowInfo,
  InfiniteTableRowInfoNormal,
  lazyGroup,
} from '../../../utils/groupAndPivot';
import { enhancedFlatten, group } from '../../../utils/groupAndPivot';

import { multisort } from '../../../utils/multisort';
import { getPivotColumnsAndColumnGroups } from '../../../utils/groupAndPivot/getPivotColumnsAndColumnGroups';
import { DataSourceSetupState } from '..';
import { DeepMap } from '../../../utils/DeepMap';

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
): InfiniteTableRowInfoNormal<T> {
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
  let shouldSort = !!sortInfo?.length && !state.controlledSort;

  if (state.lazyLoad || state.livePagination) {
    shouldSort = false;
  }

  let originalDataArrayChanged = haveDepsChanged(previousState, state, [
    'originalDataArray',
  ]);

  const dataSourceChange = previousState && state.data !== previousState.data;
  let lazyLoadGroupDataChange =
    state.lazyLoad &&
    previousState &&
    (previousState.groupBy !== state.groupBy ||
      previousState.sortInfo !== state.sortInfo);

  if (dataSourceChange) {
    lazyLoadGroupDataChange = true;
  }

  if (lazyLoadGroupDataChange) {
    state.originalLazyGroupData = new DeepMap<string, LazyGroupRowInfo<T>>();
    originalDataArrayChanged = true;

    // TODO if we have defaultGroupRowsState in props (so this is uncontrolled)
    // reset state.groupRowsState to the value in props.defaultGroupRowsState
    // also make sure onGroupRowsState is triggered to notify the action to consumers
  }

  const sortInfoChanged = haveDepsChanged(previousState, state, ['sortInfo']);

  const sortDepsChanged = originalDataArrayChanged || sortInfoChanged;

  const shouldSortAgain =
    shouldSort && (sortDepsChanged || !state.lastSortDataArray);

  const groupBy = state.groupBy;
  const pivotBy = state.pivotBy;

  const shouldGroup = groupBy.length || pivotBy;
  const groupsDepsChanged =
    originalDataArrayChanged ||
    haveDepsChanged(previousState, state, [
      'generateGroupRows',
      'originalDataArray',
      'originalLazyGroupData',
      'originalLazyGroupDataChangeDetect',
      'groupBy',
      'groupRowsState',
      'pivotBy',
      'aggregationReducers',
      'pivotTotalColumnPosition',
      'pivotGrandTotalColumnPosition',
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
    const pk = data[state.primaryKey];

    if (Array.isArray(pk)) {
      debugger;
    }
    return pk;
  };

  if (shouldGroup) {
    if (shouldGroupAgain) {
      const groupResult = state.lazyLoad
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
            pivotGrandTotalColumnPosition:
              state.pivotGrandTotalColumnPosition ?? false,
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

    if (arrayDifferentAfterSortStep || groupsDepsChanged) {
      rowInfoDataArray = dataArray.map((data, index) =>
        toRowInfo(data, data ? toPrimaryKey(data) : index, index),
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
