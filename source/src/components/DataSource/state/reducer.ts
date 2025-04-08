import { composeFunctions } from '../../../utils/composeFunctions';
import {
  DataSourceFilterValueItem,
  DataSourcePropTreeFilterFunction,
  DataSourceSetupState,
} from '..';
import { DeepMap } from '../../../utils/DeepMap';
import {
  InfiniteTableRowInfo,
  InfiniteTable_NoGrouping_RowInfoNormal,
  InfiniteTable_Tree_RowInfoNode,
  InfiniteTable_Tree_RowInfoParentNode,
  lazyGroup,
} from '../../../utils/groupAndPivot';
import {
  enhancedFlatten,
  group,
  tree,
  enhancedTreeFlatten,
} from '../../../utils/groupAndPivot';
import { getPivotColumnsAndColumnGroups } from '../../../utils/groupAndPivot/getPivotColumnsAndColumnGroups';
import { multisort, multisortNested } from '../../../utils/multisort';
import { rowSelectionStateConfigGetter } from '../../InfiniteTable/api/getRowSelectionApi';
import { CellSelectionState } from '../CellSelectionState';
import { DataSourceCache, DataSourceMutation } from '../DataSourceCache';
import { getCacheAffectedParts } from '../getDataSourceApi';
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
import {
  computeRowInfoReducersFor,
  finishRowInfoReducersFor,
  initRowInfoReducers,
} from './initRowInfoReducers';
import { TreeExpandState } from '../TreeExpandState';
import { getTreeSelectionState } from './getInitialState';

import { once } from '../../../utils/DeepMap/once';

export function cleanupEmptyFilterValues<T>(
  filterValue: DataSourceState<T>['filterValue'],

  filterTypes: DataSourceState<T>['filterTypes'],
) {
  if (!filterValue) {
    return filterValue;
  }
  // for remote filters, we don't want to include the values that are empty
  return filterValue.filter((filterValue) => {
    const filterType = filterTypes[filterValue.filter.type];
    if (!filterType) {
      return false;
    }

    if (
      filterType.emptyValues &&
      filterType.emptyValues.includes(filterValue.filter.value)
    ) {
      return false;
    }
    return true;
  });
}

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

function returnFalse() {
  return false;
}

function toRowInfo<T>(
  data: T,
  id: any,
  index: number,
  isRowSelected?: (rowInfo: InfiniteTableRowInfo<T>) => boolean | null,
  isRowDisabled?: (rowInfo: InfiniteTableRowInfo<T>) => boolean,
  cellSelectionState?: CellSelectionState,
): InfiniteTable_NoGrouping_RowInfoNormal<T> {
  const rowInfo: InfiniteTable_NoGrouping_RowInfoNormal<T> = {
    dataSourceHasGrouping: false,
    isTreeNode: false,
    data,
    id,
    indexInAll: index,
    isGroupRow: false,
    selfLoaded: true,
    rowSelected: false,
    rowDisabled: false,
    isCellSelected: returnFalse,
    hasSelectedCells: returnFalse,
  };
  if (isRowSelected) {
    rowInfo.rowSelected = isRowSelected(rowInfo);
  }
  if (isRowDisabled) {
    rowInfo.rowDisabled = isRowDisabled(rowInfo);
  }

  if (cellSelectionState) {
    rowInfo.isCellSelected = (colId: string) => {
      return cellSelectionState!.isCellSelected(rowInfo.id, colId);
    };
    rowInfo.hasSelectedCells = (columnIds: string[]) => {
      return cellSelectionState.isCellSelectionInRow(rowInfo.id, columnIds);
    };
  }

  return rowInfo;
}

const warnIncorrectTreeFilterOnce = once(() => {
  console.warn(`Your "treeFilterFunction" should NOT MUTATE the data object. You're probably mutating the node children.

Your filtering function probably looks like this:

function treeFilterFunction({ data }) {
  data.children = data.children.filter(...) // <-- THIS MUTATION IS NOT SUPPORTED (data.children = ...)!
  
  return data
}

Make sure you avoid mutations.

`);
});

function filterTreeDataSource<T>(params: {
  dataArray: T[];
  treeFilterFunction: NonNullable<DataSourcePropTreeFilterFunction<T>>;
  toPrimaryKey: FilterDataSourceParams<T>['toPrimaryKey'];
  getNodeChildren: NonNullable<FilterDataSourceParams<T>['getNodeChildren']>;
  isLeafNode: NonNullable<FilterDataSourceParams<T>['isLeafNode']>;
  nodesKey: NonNullable<FilterDataSourceParams<T>['nodesKey']>;
}) {
  const {
    dataArray,
    treeFilterFunction,
    toPrimaryKey,
    getNodeChildren,
    isLeafNode,
    nodesKey,
  } = params;
  let treeDataArray: T[] = [];

  const filterTreeNode = (data: T) => {
    const children = getNodeChildren(data);

    if (isLeafNode(data) || !Array.isArray(children)) {
      return data;
    }
    const newChildren = filterTreeDataSource({
      ...params,
      dataArray: children,
    });

    if (newChildren.length === 0) {
      return false;
    }
    data = {
      ...data,
      [nodesKey]: newChildren,
    };
    return data;
  };

  for (let i = 0, len = dataArray.length; i < len; i++) {
    const data = dataArray[i];
    const initialChildren = getNodeChildren(data);

    let res = treeFilterFunction({
      data,
      index: i,
      dataArray,
      primaryKey: toPrimaryKey(data, i),
      filterTreeNode,
    });

    if (!res) {
      continue;
    }

    if (res === true) {
      res = data;
    } else if (typeof res === 'object') {
      if (res === data && initialChildren !== getNodeChildren!(res)) {
        warnIncorrectTreeFilterOnce();
      }
    }

    treeDataArray.push(res);
  }
  return treeDataArray;
}

type FilterDataSourceParams<T> = {
  dataArray: T[];
  operatorsByFilterType: DataSourceDerivedState<T>['operatorsByFilterType'];
  filterTypes: DataSourcePropFilterTypes<T>;
  filterFunction?: DataSourcePropFilterFunction<T>;
  filterValue?: DataSourcePropFilterValue<T>;
  toPrimaryKey: (data: T, index: number) => any;
  treeFilterFunction: undefined | DataSourcePropTreeFilterFunction<T>;
  isLeafNode: undefined | ((item: T) => boolean);
  getNodeChildren: undefined | ((item: T) => null | T[]);
  nodesKey: string | undefined;
};

function filterDataSource<T>(params: FilterDataSourceParams<T>) {
  const {
    filterTypes,

    operatorsByFilterType,
    filterFunction,
    toPrimaryKey,
    treeFilterFunction,
    getNodeChildren,
    nodesKey,
    isLeafNode,
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

  if (treeFilterFunction) {
    dataArray = filterTreeDataSource({
      ...params,
      treeFilterFunction,
      getNodeChildren: getNodeChildren!,
      nodesKey: nodesKey!,
      isLeafNode: isLeafNode!,
    });
  }

  const filterValueArray =
    cleanupEmptyFilterValues(params.filterValue, filterTypes) || [];

  if (filterValueArray && filterValueArray.length) {
    return dataArray.filter((data, index, arr) => {
      const param = {
        data,
        index,
        dataArray: arr,
        primaryKey: toPrimaryKey(data, index),
        field: undefined as keyof T | undefined,
      };

      for (let i = 0, len = filterValueArray.length; i < len; i++) {
        const currentFilterValue = filterValueArray[i];

        const {
          disabled,
          field,
          valueGetter: filterValueGetter,
          filter: { type: filterTypeKey, value: filterValue, operator },
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

        const valueGetter: DataSourceFilterValueItem<T>['valueGetter'] =
          filterValueGetter || filterType.valueGetter;
        const getter =
          valueGetter || (({ data, field }) => (field ? data[field] : data));

        // this assignment is important
        param.field = field;

        const operatorFnParam =
          param as DataSourceFilterOperatorFunctionParam<T>;

        operatorFnParam.filterValue = filterValue;
        operatorFnParam.currentValue = getter(operatorFnParam);
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

  const cacheAffectedParts = getCacheAffectedParts(state);

  const sortInfo = state.sortInfo;
  // #sortMode_vs_shouldReloadData.sortInfo
  const sortMode = state.sortMode;
  let shouldSort = !!sortInfo?.length ? sortMode === 'local' : false;

  if (state.lazyLoad || state.livePagination) {
    shouldSort = false;
  }

  const refetchKeyChanged = haveDepsChanged(previousState, state, [
    'refetchKey',
  ]);

  let originalDataArrayChanged = haveDepsChanged(previousState, state, [
    'cache',
    'originalDataArray',
    'originalLazyGroupDataChangeDetect',
  ]);

  if (Array.isArray(state.data) && refetchKeyChanged) {
    originalDataArrayChanged = true;
  }

  // const dataSourceChange = previousState && state.data !== previousState.data;
  const lazyLoadGroupDataChange = false; // this is now handled by the useLoadData hook
  //   state.lazyLoad &&
  //   previousState &&
  //   (previousState.groupBy !== state.groupBy ||
  //     previousState.sortInfo !== state.sortInfo);

  // if (dataSourceChange) {
  //   lazyLoadGroupDataChange = true;
  // }

  if (lazyLoadGroupDataChange) {
    state.originalLazyGroupData = new DeepMap<string, LazyRowInfoGroup<T>>();
    originalDataArrayChanged = true;

    // TODO if we have defaultGroupRowsState in props (so this is uncontrolled)
    // reset state.groupRowsState to the value in props.defaultGroupRowsState
    // also make sure onGroupRowsState is triggered to notify the action to consumers
  }

  const cache = state.cache ? DataSourceCache.clone(state.cache) : undefined;
  if (cache && !cache.isEmpty()) {
    originalDataArrayChanged = true;
  }

  const toPrimaryKey = state.toPrimaryKey;
  const nodesKey = state.nodesKey;
  const isTree = state.isTree;

  const getNodeChildren = nodesKey
    ? (node: T) => {
        return node[nodesKey as keyof T] as any as T[] | null;
      }
    : undefined;
  const isLeafNode = nodesKey
    ? (node: T) => {
        return node[nodesKey as keyof T] === undefined;
      }
    : undefined;

  let mutations: Map<string, DataSourceMutation<T>[]> | undefined;
  let treeMutations: DeepMap<any, DataSourceMutation<T>[]> | undefined;
  const shouldIndex = originalDataArrayChanged;
  if (shouldIndex) {
    state.indexer.clear();

    // why only when not lazyLoad?
    if (!state.lazyLoad) {
      mutations = cache?.getMutations();
      treeMutations = cache?.getTreeMutations();
      state.originalDataArray = state.indexer.indexArray(
        state.originalDataArray,
        {
          toPrimaryKey,
          cache,
          getNodeChildren,
          isLeafNode,
          nodesKey,
        },
      );

      if (isTree) {
        state.waitForNodePathPromises.visit(({ value }, keys) => {
          if (!value) {
            return;
          }

          if (state.indexer.getDataForNodePath(keys) !== undefined) {
            value.resolve(true);
          }
        });
      }
    }
  }
  if (cache) {
    cache.clear();
    state.cache = undefined;
  }

  const {
    filterFunction,
    treeFilterFunction,
    filterValue,
    filterTypes,
    operatorsByFilterType,
  } = state;
  const shouldFilter =
    !!filterFunction ||
    !!treeFilterFunction ||
    (Array.isArray(filterValue) && filterValue.length);

  const shouldFilterClientSide = shouldFilter && state.filterMode === 'local';

  const filterDepsChanged = haveDepsChanged(previousState, state, [
    'filterFunction',
    'treeFilterFunction',
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
    shouldSort &&
    (sortDepsChanged ||
      !state.lastSortDataArray ||
      cacheAffectedParts.sortInfo);

  const groupBy = state.groupBy;
  const pivotBy = state.pivotBy;

  const shouldGroup = !isTree && (groupBy.length > 0 || !!pivotBy);
  const shouldTree = isTree;

  const rowDisabledStateDepsChanged = haveDepsChanged(previousState, state, [
    'rowDisabledState',
    'isRowDisabled',
  ]);

  const selectionDepsChanged = haveDepsChanged(previousState, state, [
    'rowSelection',
    'cellSelection',
    'isRowSelected',
    'originalLazyGroupDataChangeDetect',
  ]);

  const treeSelectionDepsChanged = haveDepsChanged(previousState, state, [
    'treeSelection',
    'cellSelection',
    'isNodeSelected',
    'originalLazyGroupDataChangeDetect',
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
      'repeatWrappedGroupRows',
      'rowsPerPage',
    ]);

  const treeDepsChanged =
    originalDataArrayChanged ||
    sortDepsChanged ||
    haveDepsChanged(previousState, state, [
      'originalLazyGroupData',
      'originalLazyGroupDataChangeDetect',
      'treeExpandState',
      'isNodeExpanded',
      'isNodeCollapsed',
      'aggregationReducers',
      'repeatWrappedGroupRows',
      'rowsPerPage',
    ]);

  const rowInfoReducersChanged = haveDepsChanged(previousState, state, [
    'rowInfoReducers',
  ]);

  const shouldGroupAgain =
    (shouldGroup &&
      (groupsDepsChanged ||
        !state.lastGroupDataArray ||
        cacheAffectedParts.groupBy)) ||
    selectionDepsChanged ||
    rowDisabledStateDepsChanged ||
    rowInfoReducersChanged;

  const shouldTreeAgain =
    (shouldTree &&
      (treeDepsChanged ||
        cacheAffectedParts.tree ||
        !state.lastTreeDataArray)) ||
    treeSelectionDepsChanged ||
    rowDisabledStateDepsChanged ||
    rowInfoReducersChanged;

  const now = Date.now();

  let dataArray = state.originalDataArray;

  if (!shouldFilter) {
    state.unfilteredCount = dataArray.length;
  }
  if (shouldFilterClientSide) {
    state.unfilteredCount = dataArray.length;

    let filterTimestamp = now;

    if (shouldFilterAgain) {
      if (state.devToolsDetected) {
        filterTimestamp = Date.now();
      }
      dataArray = filterDataSource({
        // tree-related stuff
        getNodeChildren,
        isLeafNode,
        nodesKey,
        treeFilterFunction,
        // ---
        dataArray,
        toPrimaryKey,
        filterTypes,
        operatorsByFilterType,
        filterFunction,
        filterValue,
      });
      if (state.devToolsDetected) {
        state.debugTimings.set('filter', Date.now() - filterTimestamp);
      }
    } else {
      dataArray = state.lastFilterDataArray!;
    }

    state.lastFilterDataArray = dataArray;
    state.filteredAt = now;
  }

  state.filteredCount = dataArray.length;
  state.postFilterDataArray = dataArray;

  if (shouldSort) {
    const prevKnownTypes = multisort.knownTypes;
    multisort.knownTypes = { ...prevKnownTypes, ...state.sortTypes };

    if (shouldSortAgain) {
      let sortTimestamp = now;
      if (state.devToolsDetected) {
        sortTimestamp = Date.now();
      }
      if (state.sortFunction) {
        dataArray = state.sortFunction(sortInfo!, [...dataArray]);
      } else {
        if (isTree) {
          dataArray = multisortNested(sortInfo!, dataArray, {
            inplace: false,
            isLeafNode: isLeafNode!,
            getNodeChildren: getNodeChildren!,
            toKey: toPrimaryKey,
            nodesKey: nodesKey!,
          });
        } else {
          dataArray = multisort(sortInfo!, [...dataArray]);
        }
      }
      if (state.devToolsDetected) {
        const sortDuration = Date.now() - sortTimestamp;
        state.debugTimings.set('sort', sortDuration);
      }
    } else {
      dataArray = state.lastSortDataArray!;
    }

    multisort.knownTypes = prevKnownTypes;

    state.lastSortDataArray = dataArray;
    state.sortedAt = now;
  }
  state.postSortDataArray = dataArray;

  let rowInfoDataArray: InfiniteTableRowInfo<T>[] = state.dataArray;

  const rowSelectionState =
    state.rowSelection instanceof RowSelectionState
      ? state.rowSelection
      : undefined;

  const treeExpandState =
    state.treeExpandState instanceof TreeExpandState
      ? state.treeExpandState
      : undefined;
  const cellSelectionState =
    state.cellSelection instanceof CellSelectionState
      ? state.cellSelection
      : undefined;

  //@ts-ignore
  rowSelectionState?.xcache();

  let isRowSelected:
    | ((rowInfo: InfiniteTableRowInfo<T>) => boolean | null)
    | undefined =
    state.selectionMode === 'single-row'
      ? (rowInfo) => {
          return rowInfo.id === state.rowSelection;
        }
      : state.selectionMode === 'multi-row'
      ? (rowInfo) => {
          const rowSelection = rowSelectionState as RowSelectionState;

          return rowInfo.isGroupRow
            ? rowSelection.getGroupRowSelectionState(rowInfo.groupKeys)
            : rowSelection.isRowSelected(
                rowInfo.id,
                rowInfo.dataSourceHasGrouping ? rowInfo.groupKeys : undefined,
              );
        }
      : undefined;

  const isRowDisabled = state.isRowDisabled || returnFalse;
  if (state.isRowSelected && state.selectionMode === 'multi-row') {
    isRowSelected = (rowInfo) =>
      state.isRowSelected!(
        rowInfo,
        rowSelectionState as RowSelectionState,
        state.selectionMode as 'multi-row',
      );
  }

  let isNodeExpanded:
    | ((rowInfo: InfiniteTable_Tree_RowInfoParentNode<T>) => boolean)
    | undefined;

  if (state.isNodeExpanded) {
    isNodeExpanded = (rowInfo) =>
      state.isNodeExpanded!(rowInfo, treeExpandState!);
  }

  if (state.isNodeCollapsed) {
    isNodeExpanded = (rowInfo) =>
      !state.isNodeExpanded!(rowInfo, treeExpandState!);
  }

  if (!isNodeExpanded) {
    const defaultIsRowExpanded = (
      rowInfo: InfiniteTable_Tree_RowInfoParentNode<T>,
    ) => {
      return treeExpandState!.isNodeExpanded(rowInfo.nodePath);
    };

    isNodeExpanded = defaultIsRowExpanded;
  }

  const rowInfoReducers = state.rowInfoReducers!;

  if (shouldGroup) {
    if (shouldGroupAgain) {
      let groupTimestamp = now;
      if (state.devToolsDetected) {
        groupTimestamp = Date.now();
      }
      let aggregationReducers = state.aggregationReducers;

      const groupResult = state.lazyLoad
        ? lazyGroup(
            {
              groupBy,
              // groupByIndex: 0,
              // parentGroupKeys: [],
              pivot: pivotBy,
              mappings: state.pivotMappings,
              reducers: aggregationReducers,
              indexer: state.indexer,
              toPrimaryKey,
              cache,
            },
            state.originalLazyGroupData,
          )
        : group(
            {
              groupBy,
              pivot: pivotBy,
              reducers: aggregationReducers,
            },
            dataArray,
          );

      state.groupDeepMap = groupResult.deepMap;
      if (rowSelectionState) {
        rowSelectionState.getConfig = rowSelectionStateConfigGetter(state);
      }

      const rowInfoReducerKeys = Object.keys(
        rowInfoReducers || {},
      ) as (keyof typeof rowInfoReducers)[];

      const rowInfoReducerResults = initRowInfoReducers(
        rowInfoReducers,
      ) as Record<keyof typeof rowInfoReducers, any>;

      const rowInfoReducersShape = {
        reducers: rowInfoReducers,
        results: rowInfoReducerResults,
        reducerKeys: rowInfoReducerKeys,
        rowInfo: {} as InfiniteTableRowInfo<T>,
      };

      const withRowInfoForReducers = rowInfoReducerResults
        ? (rowInfo: InfiniteTableRowInfo<T>) => {
            rowInfoReducersShape.rowInfo = rowInfo;
            computeRowInfoReducersFor(rowInfoReducersShape);
          }
        : undefined;

      const withRowInfoForCellSelection = cellSelectionState
        ? (rowInfo: InfiniteTableRowInfo<T>) => {
            rowInfo.isCellSelected = (colId: string) => {
              return cellSelectionState!.isCellSelected(rowInfo.id, colId);
            };
          }
        : undefined;

      const withRowInfo =
        withRowInfoForReducers || withRowInfoForCellSelection
          ? composeFunctions(
              withRowInfoForReducers,
              withRowInfoForCellSelection,
            )
          : undefined;

      const flattenResult = enhancedFlatten({
        groupResult,
        lazyLoad: !!state.lazyLoad,
        reducers: aggregationReducers,
        toPrimaryKey,
        isRowSelected,
        rowSelectionState,

        withRowInfo,

        repeatWrappedGroupRows:
          state.rowsPerPage != null ? state.repeatWrappedGroupRows : false,
        rowsPerPage: state.rowsPerPage,

        groupRowsState: state.groupRowsState,
        generateGroupRows: state.generateGroupRows,
      });

      rowInfoDataArray = flattenResult.data;

      state.rowInfoReducerResults = finishRowInfoReducersFor<T>({
        reducers: rowInfoReducers,
        results: rowInfoReducerResults,
        array: rowInfoDataArray,
      });

      state.groupRowsIndexesInDataArray = flattenResult.groupRowsIndexes;
      state.reducerResults = groupResult.reducerResults;

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

      if (state.devToolsDetected) {
        state.debugTimings.set('group-and-pivot', Date.now() - groupTimestamp);
      }
    } else {
      rowInfoDataArray = state.lastGroupDataArray!;
    }

    state.lastGroupDataArray = rowInfoDataArray;
    state.groupedAt = now;
  } else if (shouldTree) {
    if (shouldTreeAgain) {
      let treeTimestamp = now;
      if (state.devToolsDetected) {
        treeTimestamp = Date.now();
      }
      let aggregationReducers = state.aggregationReducers;

      const treeParams = {
        isLeafNode: isLeafNode!,
        getNodeChildren: getNodeChildren!,
        toKey: toPrimaryKey,
        reducers: aggregationReducers,
      };

      const treeResult = tree(treeParams, dataArray);

      state.treeDeepMap = treeResult.deepMap;
      state.treePaths = treeResult.treePaths;

      const treeSelectionState =
        state.selectionMode === 'multi-row'
          ? getTreeSelectionState(
              state.treeSelection,
              state.selectionMode,
              state,
            )
          : undefined;

      state.treeSelectionState = treeSelectionState;

      const rowInfoReducerKeys = Object.keys(
        rowInfoReducers || {},
      ) as (keyof typeof rowInfoReducers)[];

      const rowInfoReducerResults = initRowInfoReducers(
        rowInfoReducers,
      ) as Record<keyof typeof rowInfoReducers, any>;

      const rowInfoReducersShape = {
        reducers: rowInfoReducers,
        results: rowInfoReducerResults,
        reducerKeys: rowInfoReducerKeys,
        rowInfo: {} as InfiniteTableRowInfo<T>,
      };

      const withRowInfoForReducers = rowInfoReducerResults
        ? (rowInfo: InfiniteTableRowInfo<T>) => {
            rowInfoReducersShape.rowInfo = rowInfo;
            computeRowInfoReducersFor(rowInfoReducersShape);
          }
        : undefined;

      const withRowInfoForCellSelection = cellSelectionState
        ? (rowInfo: InfiniteTableRowInfo<T>) => {
            rowInfo.isCellSelected = (colId: string) => {
              return cellSelectionState!.isCellSelected(rowInfo.id, colId);
            };
          }
        : undefined;

      const withRowInfo =
        withRowInfoForReducers || withRowInfoForCellSelection
          ? composeFunctions(
              withRowInfoForReducers,
              withRowInfoForCellSelection,
            )
          : undefined;

      let isNodeSelected:
        | ((rowInfo: InfiniteTable_Tree_RowInfoNode<T>) => boolean | null)
        | undefined =
        state.selectionMode === 'single-row'
          ? (rowInfo) => {
              return rowInfo.id === state.treeSelection;
            }
          : state.selectionMode === 'multi-row'
          ? (rowInfo) => {
              return treeSelectionState!.isNodeSelected(rowInfo.nodePath);
            }
          : undefined;

      const repeatWrappedGroupRows =
        state.rowsPerPage != null ? state.repeatWrappedGroupRows : false;

      const flattenResult = enhancedTreeFlatten({
        treeResult,
        treeParams,
        dataArray,

        reducers: aggregationReducers,
        toPrimaryKey,
        isNodeSelected,
        isNodeExpanded,
        treeSelectionState,

        withRowInfo,

        repeatWrappedGroupRows,
        rowsPerPage: state.rowsPerPage,
      });

      rowInfoDataArray = flattenResult.data;

      state.rowInfoReducerResults = finishRowInfoReducersFor<T>({
        reducers: rowInfoReducers,
        results: rowInfoReducerResults,
        array: rowInfoDataArray,
      });

      state.reducerResults = treeResult.reducerResults;

      state.totalLeafNodesCount =
        treeResult.deepMap.get([])?.totalLeafNodesCount ?? 0;
      state.treeAt = now;
      if (state.devToolsDetected) {
        state.debugTimings.set('tree', Date.now() - treeTimestamp);
      }
    } else {
      rowInfoDataArray = state.lastTreeDataArray!;
    }
    state.lastTreeDataArray = rowInfoDataArray;
  } else {
    state.groupDeepMap = undefined;
    state.pivotColumns = undefined;
    state.groupRowsIndexesInDataArray = undefined;
    const arrayDifferentAfterSortStep =
      previousState.postSortDataArray != state.postSortDataArray;

    if (
      arrayDifferentAfterSortStep ||
      groupsDepsChanged ||
      selectionDepsChanged ||
      rowDisabledStateDepsChanged ||
      rowInfoReducersChanged
    ) {
      const rowInfoReducerKeys = Object.keys(
        rowInfoReducers || {},
      ) as (keyof typeof rowInfoReducers)[];

      const rowInfoReducerResults = initRowInfoReducers(
        rowInfoReducers,
      ) as Record<keyof typeof rowInfoReducers, any>;

      const rowInfoReducersShape = {
        reducers: rowInfoReducers,
        results: rowInfoReducerResults,
        reducerKeys: rowInfoReducerKeys,
        rowInfo: {} as InfiniteTableRowInfo<T>,
      };

      rowInfoDataArray = dataArray.map((data, index) => {
        const rowInfo = toRowInfo(
          data,
          data ? toPrimaryKey(data) : index,
          index,
          isRowSelected,
          isRowDisabled,
          cellSelectionState,
        );

        if (rowInfoReducerResults) {
          rowInfoReducersShape.rowInfo = rowInfo;
          computeRowInfoReducersFor(rowInfoReducersShape);
        }

        return rowInfo;
      });

      state.rowInfoReducerResults = finishRowInfoReducersFor<T>({
        reducers: rowInfoReducers,
        results: rowInfoReducerResults,
        array: rowInfoDataArray,
      });
    }
  }

  state.postGroupDataArray = rowInfoDataArray;

  if (rowInfoDataArray !== state.dataArray) {
    state.updatedAt = now;
  }

  state.dataArray = rowInfoDataArray;
  state.reducedAt = now;

  if (state.selectionMode === 'multi-row') {
    if (shouldGroup && state.lazyLoad) {
      let allRowsSelected = true;
      let someRowsSelected = false;

      state.dataArray.forEach((rowInfo) => {
        if (rowInfo.isTreeNode) {
          return;
        }
        if (rowInfo.isGroupRow && rowInfo.groupKeys.length === 1) {
          const { rowSelected } = rowInfo;
          if (rowSelected !== true) {
            allRowsSelected = false;
          }
          if (rowSelected === true || rowSelected === null) {
            someRowsSelected = true;
          }
        }
      });
      state.allRowsSelected = allRowsSelected;
      state.someRowsSelected = someRowsSelected;
    } else {
      const dataArrayCount = state.isTree
        ? state.totalLeafNodesCount
        : state.filteredCount;

      const selectedRowCount = state.isTree
        ? state.treeSelectionState
          ? state.treeSelectionState.getSelectedCount()
          : 0
        : (state.rowSelection as RowSelectionState)!.getSelectedCount();

      state.allRowsSelected = dataArrayCount === selectedRowCount;
      state.someRowsSelected = selectedRowCount > 0;
    }
  }

  if (__DEV__) {
    (globalThis as any).state = state;
  }

  state.originalDataArrayChanged = originalDataArrayChanged;

  if (originalDataArrayChanged) {
    state.originalDataArrayChangedInfo = {
      timestamp: now,
      mutations: mutations?.size ? mutations : undefined,
      treeMutations: treeMutations?.size ? treeMutations : undefined,
    };
  }

  return state;
}
