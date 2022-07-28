import { DataSourceSetupState } from '..';
import { DeepMap } from '../../../utils/DeepMap';
import {
  InfiniteTableRowInfo,
  InfiniteTable_NoGrouping_RowInfoNormal,
  lazyGroup,
} from '../../../utils/groupAndPivot';
import { enhancedFlatten, group } from '../../../utils/groupAndPivot';
import { getPivotColumnsAndColumnGroups } from '../../../utils/groupAndPivot/getPivotColumnsAndColumnGroups';
import { multisort } from '../../../utils/multisort';
import { RowSelectionState } from '../RowSelectionState';
import type {
  DataSourceState,
  DataSourceDerivedState,
  LazyRowInfoGroup,
  DataSourcePropFilterFunction,
  DataSourcePropFilterValue,
  DataSourceFilterOperatorFunctionParam,
  DataSourcePropFilterTypes,
} from '../types';

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
  isRowSelected?: (rowInfo: InfiniteTableRowInfo<T>) => boolean,
): InfiniteTable_NoGrouping_RowInfoNormal<T> {
  const rowInfo: InfiniteTable_NoGrouping_RowInfoNormal<T> = {
    dataSourceHasGrouping: false,
    data,
    id,
    indexInAll: index,
    isGroupRow: false,
    selfLoaded: true,
    rowSelected: false,
  };
  if (isRowSelected) {
    rowInfo.rowSelected = isRowSelected(rowInfo);
  }

  return rowInfo;
}

function filterDataSource<T>(params: {
  dataArray: T[];
  operatorsByFilterType: DataSourceDerivedState<T>['operatorsByFilterType'];
  filterTypes: DataSourcePropFilterTypes<T>;
  filterFunction?: DataSourcePropFilterFunction<T>;
  filterValue?: DataSourcePropFilterValue<T>;
  toPrimaryKey: (data: T, index: number) => any;
}) {
  const {
    filterTypes,
    filterValue: filterValueArray,
    operatorsByFilterType,
    filterFunction,
    toPrimaryKey,
  } = params;
  let { dataArray } = params;
  if (filterFunction) {
    dataArray = dataArray.filter((data, index, arr) =>
      filterFunction({
        data,
        index,
        dataArray: arr,
        primaryKey: toPrimaryKey(data, index),
      }),
    );
  }

  if (filterValueArray && filterValueArray.length) {
    return dataArray.filter((data, index, arr) => {
      const param = {
        data,
        index,
        dataArray: arr,
        primaryKey: toPrimaryKey(data, index),
      };

      for (let i = 0, len = filterValueArray.length; i < len; i++) {
        const currentFilterValue = filterValueArray[i];

        const {
          disabled,
          filterValue,
          field,
          filterType: filterTypeKey,
          valueGetter,
          operator,
        } = currentFilterValue;
        const filterType = filterTypes[filterTypeKey];
        if (disabled || !filterType) {
          continue;
        }
        const currentOperator =
          operatorsByFilterType[filterTypeKey]?.[operator];
        if (!currentOperator) {
          continue;
        }

        const getter =
          valueGetter || (({ data }) => (field ? data[field] : data));

        const operatorFnParam = {
          ...param,
        } as DataSourceFilterOperatorFunctionParam<T>;
        operatorFnParam.filterValue = filterValue;
        operatorFnParam.currentValue = getter(param);
        operatorFnParam.emptyValues = filterType.emptyValues;

        if (!currentOperator.fn(operatorFnParam)) {
          return false;
        }
      }
      return true;
    });
  }

  return dataArray;
}

export function concludeReducer<T>(params: {
  previousState: DataSourceState<T> & DataSourceDerivedState<T>;
  state: DataSourceState<T> &
    DataSourceDerivedState<T> &
    DataSourceSetupState<T>;
}) {
  const { state, previousState } = params;

  const primaryKeyDescriptor = state.primaryKey;
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
    state.originalLazyGroupData = new DeepMap<string, LazyRowInfoGroup<T>>();
    originalDataArrayChanged = true;

    // TODO if we have defaultGroupRowsState in props (so this is uncontrolled)
    // reset state.groupRowsState to the value in props.defaultGroupRowsState
    // also make sure onGroupRowsState is triggered to notify the action to consumers
  }

  const { filterFunction, filterValue, filterTypes, operatorsByFilterType } =
    state;
  const shouldFilter =
    !!filterFunction || (Array.isArray(filterValue) && filterValue.length);

  const shouldFilterClientSide = shouldFilter && state.filterMode === 'local';

  const filterDepsChanged = haveDepsChanged(previousState, state, [
    'filterFunction',
    'filterValue',
    'filterTypes',
  ]);
  const filterChanged = originalDataArrayChanged || filterDepsChanged;

  const sortInfoChanged = haveDepsChanged(previousState, state, ['sortInfo']);

  const sortDepsChanged =
    originalDataArrayChanged || filterDepsChanged || sortInfoChanged;

  const shouldFilterAgain =
    state.filterMode === 'local' &&
    (filterChanged || !state.lastFilterDataArray);

  const shouldSortAgain =
    shouldSort && (sortDepsChanged || !state.lastSortDataArray);

  const groupBy = state.groupBy;
  const pivotBy = state.pivotBy;

  const shouldGroup = groupBy.length > 0 || !!pivotBy;
  const selectionDepsChanged = haveDepsChanged(previousState, state, [
    'rowSelection',
    'isRowSelected',
  ]);
  const groupsDepsChanged =
    originalDataArrayChanged ||
    sortDepsChanged ||
    haveDepsChanged(previousState, state, [
      'generateGroupRows',
      'originalLazyGroupData',
      'originalLazyGroupDataChangeDetect',
      'groupBy',
      'groupRowsState',
      'pivotBy',
      'aggregationReducers',
      'pivotTotalColumnPosition',
      'pivotGrandTotalColumnPosition',
      'showSeparatePivotColumnForSingleAggregation',
    ]);

  const shouldGroupAgain =
    shouldGroup && (groupsDepsChanged || !state.lastGroupDataArray);

  const now = Date.now();

  let dataArray = state.originalDataArray;

  const toPrimaryKey =
    typeof primaryKeyDescriptor === 'function'
      ? (data: T, index: number) => primaryKeyDescriptor({ data, index })
      : (data: T, _index?: number) => {
          const pk = data[primaryKeyDescriptor];

          return pk;
        };

  if (!shouldFilter) {
    state.unfilteredCount = dataArray.length;
  }
  if (shouldFilterClientSide) {
    state.unfilteredCount = dataArray.length;

    dataArray = shouldFilterAgain
      ? filterDataSource({
          dataArray,
          toPrimaryKey,
          filterTypes,
          operatorsByFilterType,
          filterFunction,
          filterValue,
        })
      : state.lastFilterDataArray!;

    state.lastFilterDataArray = dataArray;
    state.filteredAt = now;
  }

  state.filteredCount = dataArray.length;

  state.postFilterDataArray = dataArray;

  const shouldSortClientSide = shouldSort && state.sortMode === 'local';
  if (shouldSortClientSide) {
    const prevKnownTypes = multisort.knownTypes;
    multisort.knownTypes = state.sortTypes;
    dataArray = shouldSortAgain
      ? multisort(sortInfo!, [...dataArray])
      : state.lastSortDataArray!;

    multisort.knownTypes = prevKnownTypes;

    state.lastSortDataArray = dataArray;
    state.sortedAt = now;
  }
  state.postSortDataArray = dataArray;

  let rowInfoDataArray: InfiniteTableRowInfo<T>[] = state.dataArray;

  let isRowSelected:
    | ((rowInfo: InfiniteTableRowInfo<T>) => boolean)
    | undefined =
    state.selectionMode === 'single-row'
      ? (rowInfo) => {
          return rowInfo.id === state.rowSelection;
        }
      : state.selectionMode === 'multi-row'
      ? (rowInfo) => {
          return (state.rowSelection as RowSelectionState).isRowSelected(
            rowInfo.id,
          );
        }
      : undefined;

  if (state.isRowSelected) {
    isRowSelected = (rowInfo) =>
      state.isRowSelected!(rowInfo, state.rowSelection, state.selectionMode) ||
      false;
  }

  if (shouldGroup) {
    // TODO handle selection in grouping
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
        lazyLoad: !!state.lazyLoad,
        reducers: state.aggregationReducers,
        toPrimaryKey,
        isRowSelected,

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

    if (
      arrayDifferentAfterSortStep ||
      groupsDepsChanged ||
      selectionDepsChanged
    ) {
      rowInfoDataArray = dataArray.map((data, index) =>
        toRowInfo(
          data,
          data ? toPrimaryKey(data, index) : index,
          index,
          isRowSelected,
        ),
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
