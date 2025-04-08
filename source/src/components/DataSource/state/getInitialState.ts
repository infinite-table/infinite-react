import { type DebugLogger } from '../../../utils/debugPackage';
import { warnOnce } from '../../../utils/logger';
import {
  DataSourceComponentActions,
  DataSourceDataParams,
  DataSourcePropOnCellSelectionChange_MultiCell,
  DataSourcePropOnCellSelectionChange_SingleCell,
  DataSourcePropOnRowSelectionChange_SingleRow,
  DataSourcePropOnTreeSelectionChange_MultiNode,
  DataSourcePropOnTreeSelectionChange_SingleNode,
  DataSourcePropShouldReloadData,
  DataSourcePropShouldReloadDataObject,
  DataSourcePropTreeSelection,
  DataSourcePropTreeSelection_SingleNode,
  DataSourceRowInfoReducer,
  DebugTimingKey,
  RowDisabledStateObject,
  RowSelectionState,
} from '..';
import { dbg } from '../../../utils/debug';
import { DeepMap } from '../../../utils/DeepMap';
import defaultSortTypes from '../../../utils/multisort/sortTypes';
import { raf } from '../../../utils/raf';
import { shallowEqualObjects } from '../../../utils/shallowEqualObjects';
import { ForwardPropsToStateFnResult } from '../../hooks/useComponentState';
import { ComponentInterceptedActions } from '../../hooks/useComponentState/types';
import {
  InfiniteTableRowInfo,
  InfiniteTable_Tree_RowInfoParentNode,
  Scrollbars,
} from '../../InfiniteTable';
import { rowSelectionStateConfigGetter } from '../../InfiniteTable/api/getRowSelectionApi';
import { ScrollStopInfo } from '../../InfiniteTable/types/InfiniteTableProps';
import { buildSubscriptionCallback } from '../../utils/buildSubscriptionCallback';
import { discardCallsWithEqualArg } from '../../utils/discardCallsWithEqualArg';
import { isControlledValue } from '../../utils/isControlledValue';
import { RenderRange } from '../../VirtualBrain';
import {
  CellSelectionState,
  CellSelectionStateObject,
} from '../CellSelectionState';

import { defaultFilterTypes } from '../defaultFilterTypes';
import { GroupRowsState } from '../GroupRowsState';
import { Indexer } from '../Indexer';
import { buildDataSourceDataParams } from '../privateHooks/useLoadData';
import { RowSelectionStateObject } from '../RowSelectionState';
import {
  DataSourceMappedState,
  DataSourceProps,
  DataSourceDerivedState,
  DataSourceSetupState,
  DataSourceState,
  LazyGroupDataDeepMap,
  LazyRowInfoGroup,
  DataSourceFilterOperator,
  DataSourcePropOnRowSelectionChange_MultiRow,
  DataSourcePropSelectionMode,
} from '../types';

import { normalizeSortInfo } from './normalizeSortInfo';
import { RowDisabledState } from '../RowDisabledState';
import { TreeDataSourceProps } from '../../TreeGrid/types/TreeDataSourceProps';
import { NodePath, TreeExpandState } from '../TreeExpandState';
import {
  TreeSelectionState,
  TreeSelectionStateObject,
} from '../TreeSelectionState';
import { treeSelectionStateConfigGetter } from '../TreeApi';
import { NonUndefined } from '../../types/NonUndefined';
import { InfiniteTable_Tree_RowInfoNode } from '../../../utils/groupAndPivot';
import { DEV_TOOLS_DATASOURCE_OVERRIDES } from '../../../DEV_TOOLS_OVERRIDES';

const DataSourceLogger = dbg('DataSource') as DebugLogger;

export const defaultCursorId = Symbol('cursorId');

export const isNodeReadOnly = <T = any>(
  rowInfo: InfiniteTable_Tree_RowInfoParentNode<T>,
) => {
  return rowInfo.totalLeafNodesCount === 0;
};

export const isNodeSelectable = <T = any>(
  rowInfo: InfiniteTable_Tree_RowInfoNode<T>,
) => {
  return rowInfo.isParentNode ? !isNodeReadOnly(rowInfo) : true;
};

export function initSetupState<T>(): DataSourceSetupState<T> {
  const now = Date.now();
  const originalDataArray: T[] = [];
  const dataArray: InfiniteTableRowInfo<T>[] = [];

  const originalLazyGroupData: LazyGroupDataDeepMap<T> = new DeepMap<
    string,
    LazyRowInfoGroup<T>
  >();

  return {
    debugTimings: new Map<DebugTimingKey, number>(),

    devToolsDetected: !!(globalThis as any).__INFINITE_TABLE_DEVTOOLS_HOOK__,
    // TODO cleanup indexer on unmount
    indexer: new Indexer<T, any>(),
    totalLeafNodesCount: 0,
    __apiRef: { current: null },

    repeatWrappedGroupRows: false,

    destroyedRef: {
      current: false,
    },

    lastSelectionUpdatedNodePathRef: { current: null },
    lastExpandStateInfoRef: {
      current: {
        state: 'collapsed',
        nodePath: null,
      },
    },

    idToIndexMap: new Map<any, number>(),
    idToPathMap: new Map<any, NodePath>(),
    pathToIndexMap: new DeepMap<any, number>(),

    waitForNodePathPromises: new DeepMap<
      any,
      {
        timestamp: number;
        promise: Promise<boolean>;
        resolve: (value: boolean) => void;
      }
    >(),

    getDataSourceMasterContextRef: { current: () => undefined },

    // TODO: cleanup cache on unmount
    cache: undefined,
    detailDataSourcesStateToRestore: new Map(),
    stateReadyAsDetails: false,

    originalDataArrayChanged: false,
    originalDataArrayChangedInfo: {
      timestamp: 0,
      mutations: undefined,
    },
    rowsPerPage: null,
    lazyLoadCacheOfLoadedBatches: new DeepMap<string, true>(),
    dataParams: undefined,
    onCleanup: buildSubscriptionCallback<DataSourceState<T>>(),
    notifyScrollbarsChange: buildSubscriptionCallback<Scrollbars>(),
    notifyScrollStop: buildSubscriptionCallback<ScrollStopInfo>(),
    notifyRenderRangeChange: buildSubscriptionCallback<RenderRange>(),
    pivotTotalColumnPosition: 'end',
    pivotGrandTotalColumnPosition: false,
    scrollStopDelayUpdatedByTable: 100,
    originalLazyGroupData,
    originalLazyGroupDataChangeDetect: 0,
    originalDataArray,
    cursorId: defaultCursorId,
    showSeparatePivotColumnForSingleAggregation: false,

    propsCache: new Map<keyof DataSourceProps<T>, WeakMap<any, any>>([
      ['sortInfo', new WeakMap()],
      ['rowDisabledState', new WeakMap()],
    ]),

    rowInfoReducerResults: undefined,
    pivotMappings: undefined,

    pivotColumns: undefined,
    pivotColumnGroups: undefined,
    dataArray,
    unfilteredCount: dataArray.length,
    filteredCount: dataArray.length,

    updatedAt: now,
    groupedAt: 0,
    sortedAt: 0,
    treeAt: 0,
    filteredAt: 0,
    reducedAt: now,
    generateGroupRows: true,
    groupDeepMap: undefined,
    reducerResults: undefined,
    allRowsSelected: false,
    someRowsSelected: false,
    // selectedRowCount: 0,
    postSortDataArray: undefined,
    postGroupDataArray: undefined,
    lastSortDataArray: undefined,
    lastGroupDataArray: undefined,

    forceRerenderTimestamp: 0,
  };
}

function getCompareObjectForDataParams<T>(
  dataParams: DataSourceDataParams<T>,
): Partial<DataSourceDataParams<T>> {
  const obj: Partial<DataSourceDataParams<T>> = {
    ...dataParams,
  };

  delete obj.originalDataArray;

  return obj;
}

const EMPTY_ARRAY: any[] = [];

export const cleanupDataSource = <T>(state: DataSourceState<T>) => {
  state.destroyedRef.current = true;

  state.__apiRef.current = null;
  state.lastSelectionUpdatedNodePathRef.current = null;
  state.lastExpandStateInfoRef.current = {
    state: 'collapsed',
    nodePath: null,
  };
  state.treeExpandState?.destroy();
  state.treePaths?.clear();
  state.waitForNodePathPromises.clear();
  state.pathToIndexMap?.clear();
  state.rowDisabledState?.destroy();
  state.groupRowsState?.destroy();
  state.treeSelectionState?.destroy();
  state.idToPathMap.clear();
  state.idToIndexMap.clear();
};

export const forwardProps = <T>(
  setupState: DataSourceSetupState<T>,
  props: DataSourceProps<T> & TreeDataSourceProps<T>,
): ForwardPropsToStateFnResult<
  DataSourceProps<T> & TreeDataSourceProps<T>,
  DataSourceMappedState<T>,
  DataSourceSetupState<T>
> => {
  return {
    onDataParamsChange: (fn) =>
      fn
        ? discardCallsWithEqualArg(fn, 100, getCompareObjectForDataParams)
        : undefined,
    lazyLoad: (lazyLoad) => !!lazyLoad,
    isNodeReadOnly: (isReadOnly) => isReadOnly ?? isNodeReadOnly,
    isNodeSelectable: (isSelectable) => isSelectable ?? isNodeSelectable,
    data: 1,

    nodesKey: 1,
    isNodeExpanded: 1,
    isNodeCollapsed: 1,
    pivotBy: 1,
    primaryKey: 1,
    livePagination: 1,
    treeSelection: 1,
    refetchKey: (refetchKey) => refetchKey ?? '',
    filterFunction: 1,
    treeFilterFunction: 1,
    filterValue: 1,
    useGroupKeysForMultiRowSelection: (useGroupKeysForMultiRowSelection) =>
      useGroupKeysForMultiRowSelection ?? false,
    filterDelay: (filterDelay) => filterDelay ?? 200,
    filterTypes: (filterTypes) => {
      return { ...defaultFilterTypes, ...filterTypes };
    },

    sortTypes: (sortTypes) => {
      return { ...defaultSortTypes, ...sortTypes };
    },

    sortFunction: 1,
    onReady: 1,
    rowInfoReducers: (reducers, state) => {
      const idToIndexReducer: DataSourceRowInfoReducer<T> = {
        initialValue: () => {
          state.idToIndexMap.clear();
        },
        reducer: (_, rowInfo) => {
          if (
            props.debugId &&
            !props.nodesKey &&
            state.idToIndexMap.has(rowInfo.id)
          ) {
            console.warn(`Duplicate id found in data source: ${rowInfo.id}`);
          }
          state.idToIndexMap.set(rowInfo.id, rowInfo.indexInAll);
        },
      };

      const result = reducers
        ? {
            ...reducers,
            __idToIndex: idToIndexReducer,
          }
        : {
            __idToIndex: idToIndexReducer,
          };

      if (props.nodesKey) {
        const pathToIndexReducer: DataSourceRowInfoReducer<T> = {
          initialValue: () => {
            state.idToPathMap.clear();
            state.pathToIndexMap.clear();
          },
          reducer: (_, rowInfo) => {
            if (rowInfo.isTreeNode) {
              state.idToPathMap.set(rowInfo.id, rowInfo.nodePath);
              if (props.debugId && state.pathToIndexMap.has(rowInfo.nodePath)) {
                console.warn(
                  `Duplicate node path found in data source (debugId: ${
                    props.debugId || 'none'
                  }): ${rowInfo.nodePath}`,
                );
              }
              state.pathToIndexMap.set(rowInfo.nodePath, rowInfo.indexInAll);
            }
          },
        };
        //@ts-ignore ignore
        result.__pathToIndex = pathToIndexReducer;
      }

      return result;
    },

    onNodeCollapse: 1,
    onNodeExpand: 1,
    batchOperationDelay: 1,
    isRowSelected: 1,
    isNodeSelected: 1,
    isRowDisabled: 1,
    rowDisabledState: (
      rowDisabledState:
        | RowDisabledState<T>
        | RowDisabledStateObject<T>
        | undefined,
    ) => {
      if (!rowDisabledState) {
        return null;
      }
      if (rowDisabledState instanceof RowDisabledState) {
        return rowDisabledState;
      }

      const wMap = setupState.propsCache.get('rowDisabledState') ?? weakMap;

      let cachedRowDisabledState = wMap.get(
        rowDisabledState,
      ) as RowDisabledState<T>;

      if (!cachedRowDisabledState) {
        cachedRowDisabledState = new RowDisabledState<T>(rowDisabledState);
        wMap.set(rowDisabledState, cachedRowDisabledState);
      }

      rowDisabledState = cachedRowDisabledState;

      return rowDisabledState ?? null;
    },
    onDataArrayChange: 1,
    onDataMutations: 1,
    onTreeDataMutations: 1,
    aggregationReducers: 1,
    collapseGroupRowsOnDataFunctionChange: (
      collapseGroupRowsOnDataFunctionChange,
    ) => collapseGroupRowsOnDataFunctionChange ?? true,
    loading: (loading) => loading ?? false,
    sortInfo: (sortInfo) =>
      normalizeSortInfo(sortInfo, setupState.propsCache.get('sortInfo')),
    groupBy: (groupBy) => groupBy ?? EMPTY_ARRAY,
  };
};

function getLivePaginationCursorValue<T>(
  livePaginationCursorProp: DataSourceProps<T>['livePaginationCursor'],
  state: DataSourceState<T>,
) {
  const livePaginationCursor =
    typeof livePaginationCursorProp === 'function'
      ? livePaginationCursorProp({
          array: state.originalDataArray,
          length: state.originalDataArray.length,
          lastItem: state.originalDataArray[state.originalDataArray.length - 1],
        })
      : livePaginationCursorProp;

  return livePaginationCursor;
}

const weakMap = new WeakMap<any, any>();

function toShouldReloadObject<T>(
  shouldReloadData: DataSourcePropShouldReloadData<T>,
): DataSourcePropShouldReloadDataObject<T> {
  if (typeof shouldReloadData === 'boolean') {
    return {
      filterValue: shouldReloadData,
      sortInfo: shouldReloadData,
      groupBy: shouldReloadData,
      pivotBy: shouldReloadData,
    };
  }

  const result: DataSourcePropShouldReloadDataObject<T> = {};

  if (shouldReloadData.filterValue != null) {
    result.filterValue = shouldReloadData.filterValue;
  }
  if (shouldReloadData.sortInfo != null) {
    result.sortInfo = shouldReloadData.sortInfo;
  }
  if (shouldReloadData.groupBy != null) {
    result.groupBy = shouldReloadData.groupBy;
  }
  if (shouldReloadData.pivotBy != null) {
    result.pivotBy = shouldReloadData.pivotBy;
  }

  return result;
}

const treeSelectionStateDefaultObject: TreeSelectionStateObject = {
  selectedPaths: [],
  deselectedPaths: [],
  defaultSelection: false,
};

export function getTreeSelectionState<T>(
  currentTreeSelection: DataSourcePropTreeSelection | undefined,
  selectionMode: DataSourcePropSelectionMode,
  state: DataSourceState<T>,
) {
  if (selectionMode != 'multi-row') {
    throw new Error(
      `TreeSelectionState is only supported for multi-row selection. Your current selection mode is "${selectionMode}". See https://infinite-table.com/docs/reference/datasource-props#selectionMode for details. \n\n\n`,
    );
  }

  const config = treeSelectionStateConfigGetter(state);

  if (currentTreeSelection instanceof TreeSelectionState) {
    currentTreeSelection.setConfigFn(config);
    return currentTreeSelection;
  }

  if (
    currentTreeSelection === null ||
    currentTreeSelection === undefined ||
    typeof currentTreeSelection != 'object'
  ) {
    currentTreeSelection = undefined;
  }

  const treeSelectionStateObject =
    (currentTreeSelection as TreeSelectionStateObject | null) ??
    treeSelectionStateDefaultObject;

  let instance: TreeSelectionState = weakMap.get(treeSelectionStateObject);

  if (instance) {
    instance.setConfigFn(config);
  }

  instance =
    instance ?? new TreeSelectionState(treeSelectionStateObject, config);

  weakMap.set(treeSelectionStateObject, instance);

  return instance;
}

export function deriveStateFromProps<T extends any>(params: {
  props: DataSourceProps<T>;

  state: DataSourceState<T>;
  oldState: DataSourceState<T> | null;
}): DataSourceDerivedState<T> {
  const { props, state, oldState } = params;

  const isTree = !!state.nodesKey;

  const controlledSort = isControlledValue(props.sortInfo);
  const controlledFilter = isControlledValue(props.filterValue);

  const { filterTypes } = state;

  const operatorsByFilterType = Object.keys(filterTypes).reduce((acc, key) => {
    const operators = filterTypes[key].operators;

    acc[key] = acc[key] || {};
    const currentFilterTypeOperators = acc[key];

    operators.forEach((operator) => {
      currentFilterTypeOperators[operator.name] = operator;
    });

    return acc;
  }, {} as Record<string, Record<string, DataSourceFilterOperator<T>>>);

  const treeProps = props as TreeDataSourceProps<T>;

  let selectionMode: DataSourcePropSelectionMode | undefined =
    props.selectionMode;

  if (selectionMode === undefined) {
    if (
      props.cellSelection !== undefined ||
      props.defaultCellSelection !== undefined
    ) {
      // TODO implement single cell selection as well
      selectionMode = 'multi-cell';
    } else {
      const rowSelectionProp =
        props.rowSelection !== undefined
          ? props.rowSelection
          : props.defaultRowSelection;
      if (rowSelectionProp !== undefined) {
        if (rowSelectionProp && typeof rowSelectionProp === 'object') {
          selectionMode = 'multi-row';
        } else {
          selectionMode = 'single-row';
        }
      }

      if (!selectionMode) {
        const treeSelectionProp =
          treeProps.treeSelection ?? treeProps.defaultTreeSelection;

        if (treeSelectionProp !== undefined) {
          selectionMode =
            typeof treeSelectionProp === 'object' ? 'multi-row' : 'single-row';
        }
      }

      selectionMode = selectionMode ?? false;
    }
  }

  let rowSelectionState: RowSelectionState | null | number | string = null;
  let cellSelectionState: CellSelectionState | null = null;

  let currentRowSelection =
    props.rowSelection !== undefined
      ? props.rowSelection
      : state.rowSelection === undefined
      ? props.defaultRowSelection !== undefined
        ? props.defaultRowSelection
        : null
      : state.rowSelection;

  let currentCellSelection =
    props.cellSelection !== undefined
      ? props.cellSelection
      : state.cellSelection === undefined
      ? props.defaultCellSelection !== undefined
        ? props.defaultCellSelection
        : null
      : state.cellSelection || null;

  if (!isTree) {
    if (selectionMode !== false) {
      if (selectionMode === 'single-row' || selectionMode === 'multi-row') {
        if (currentRowSelection === null) {
          rowSelectionState =
            selectionMode === 'single-row'
              ? null
              : new RowSelectionState(
                  {
                    selectedRows: [],
                    deselectedRows: [],
                    defaultSelection: false,
                  },
                  rowSelectionStateConfigGetter(state),
                );
        } else {
          if (selectionMode === 'single-row') {
            rowSelectionState = currentRowSelection as string | number;
          } else {
            if (currentRowSelection instanceof RowSelectionState) {
              rowSelectionState = currentRowSelection;
            } else {
              const instance = new RowSelectionState(
                currentRowSelection as RowSelectionStateObject,
                rowSelectionStateConfigGetter(state),
              );

              rowSelectionState = instance;
            }
          }
        }
      }
    }

    if (selectionMode === 'single-cell' || selectionMode === 'multi-cell') {
      if (currentCellSelection === null) {
        cellSelectionState =
          selectionMode === 'single-cell' ? null : new CellSelectionState();
      } else {
        if (currentCellSelection instanceof CellSelectionState) {
          cellSelectionState = currentCellSelection;
        } else {
          // reuse the instance if it's the same object
          const instance =
            weakMap.get(currentCellSelection) ??
            new CellSelectionState(
              currentCellSelection as CellSelectionStateObject,
            );
          weakMap.set(currentCellSelection, instance);
          cellSelectionState = instance;
        }
      }
    }
  }

  const primaryKeyDescriptor = state.primaryKey;
  const toPrimaryKey =
    typeof primaryKeyDescriptor === 'function'
      ? (data: T) => primaryKeyDescriptor(data)
      : (data: T) => data[primaryKeyDescriptor];

  let treeExpandState =
    treeProps.treeExpandState ||
    state.treeExpandState ||
    treeProps.defaultTreeExpandState;

  if (treeExpandState && !(treeExpandState instanceof TreeExpandState)) {
    const instance: TreeExpandState =
      weakMap.get(treeExpandState) ?? new TreeExpandState(treeExpandState);

    weakMap.set(treeExpandState, instance);
    treeExpandState = instance;
  }

  treeExpandState =
    treeExpandState ||
    new TreeExpandState({
      defaultExpanded: true,
      collapsedPaths: [],
    });

  let groupRowsState =
    props.groupRowsState || state.groupRowsState || props.defaultGroupRowsState;

  if (groupRowsState && !(groupRowsState instanceof GroupRowsState)) {
    const instance =
      weakMap.get(groupRowsState) ?? new GroupRowsState(groupRowsState);
    weakMap.set(groupRowsState, instance);
    groupRowsState = instance;
  }

  groupRowsState =
    groupRowsState ||
    new GroupRowsState(
      state.lazyLoad
        ? { expandedRows: [], collapsedRows: true }
        : {
            expandedRows: true,
            collapsedRows: [],
          },
    );

  const shouldReloadData = toShouldReloadObject(props.shouldReloadData || {});
  const propsGroupMode =
    props.groupMode ??
    (shouldReloadData.groupBy != null
      ? shouldReloadData.groupBy
        ? 'remote'
        : 'local'
      : undefined);
  const propsSortMode =
    props.sortMode ?? shouldReloadData.sortInfo != null
      ? shouldReloadData.sortInfo
        ? 'remote'
        : 'local'
      : undefined;
  const propsFilterMode =
    props.filterMode ?? shouldReloadData.filterValue != null
      ? shouldReloadData.filterValue
        ? 'remote'
        : 'local'
      : undefined;

  if (props.groupMode) {
    warnOnce(
      `"groupMode" prop is deprecated for the <DataSource />, use "shouldReloadData.groupBy: true|false" instead`,
      'groupMode deprecated',
      DataSourceLogger,
    );
  }
  if (props.sortMode) {
    warnOnce(
      `"sortMode" prop is deprecated for the <DataSource />, use "shouldReloadData.sortInfo: true|false" instead`,
      'sortMode deprecated',
      DataSourceLogger,
    );
  }

  if (props.filterMode) {
    warnOnce(
      `"filterMode" prop is deprecated for the <DataSource />, use "shouldReloadData.filterValue: true|false" instead`,
      'filterMode deprecated',
      DataSourceLogger,
    );
  }

  const groupMode =
    typeof props.data === 'function' ? propsGroupMode ?? 'local' : 'local';

  const sortMode = props.sortFunction
    ? 'local'
    : propsSortMode ?? (controlledSort ? 'remote' : 'local');
  const filterMode =
    typeof props.filterFunction === 'function' ||
    typeof props.treeFilterFunction === 'function'
      ? 'local'
      : propsFilterMode ??
        (typeof props.data === 'function' ? 'remote' : 'local');

  const pivotMode = shouldReloadData.pivotBy ? 'remote' : 'local';

  const rowDisabledState = state.rowDisabledState;

  let isRowDisabled = props.isRowDisabled;

  if (!isRowDisabled && rowDisabledState) {
    const cachedIsRowDisabled = weakMap.get(rowDisabledState);
    if (cachedIsRowDisabled) {
      isRowDisabled = cachedIsRowDisabled;
    } else {
      isRowDisabled = (rowInfo) => {
        return rowDisabledState.isRowDisabled(rowInfo.id);
      };
      weakMap.set(rowDisabledState, isRowDisabled);
    }
  }

  let result: DataSourceDerivedState<T> = {
    debugId: state.debugId ?? props.debugId,
    isTree,
    selectionMode,
    groupRowsState: groupRowsState as GroupRowsState,
    treeExpandState,
    treeExpandMode: treeExpandState.mode,

    shouldReloadData: {
      // #sortMode_vs_shouldReloadData.sortInfo
      // we reconstruct this object
      // and don't default to the computed filterMode, sortMode, groupMode and pivotMode
      // as computed above
      // since we want a subtle difference between the computed sortMode and shouldReloadData.sortInfo (for example)
      // difference: sortMode will be local when sortFunction is provided, however, the user may want to reload data when sortInfo changes
      // and thus the data will be refetched, but will be sorted locally
      filterValue: shouldReloadData?.filterValue ?? filterMode === 'remote',
      sortInfo: shouldReloadData?.sortInfo ?? sortMode === 'remote',
      groupBy: shouldReloadData?.groupBy ?? groupMode === 'remote',
      pivotBy: shouldReloadData?.pivotBy ?? pivotMode === 'remote',
    },
    isRowDisabled,
    rowSelection: rowSelectionState,
    cellSelection: cellSelectionState,
    groupMode,
    sortMode,
    filterMode,
    pivotMode,

    toPrimaryKey,
    operatorsByFilterType,
    controlledSort,
    controlledFilter,

    multiSort: Array.isArray(
      controlledSort ? props.sortInfo : props.defaultSortInfo,
    ),
    lazyLoadBatchSize:
      typeof props.lazyLoad === 'object' ? props.lazyLoad.batchSize : undefined,
  };

  if (props.livePagination) {
    const dataArrayChanged =
      !oldState || oldState.originalDataArray !== state.originalDataArray;

    const livePaginationCursor =
      typeof props.livePaginationCursor === 'function'
        ? dataArrayChanged
          ? getLivePaginationCursorValue(props.livePaginationCursor, state)
          : state.livePaginationCursor
        : props.livePaginationCursor;

    result.livePaginationCursor = livePaginationCursor;
  }

  if (state.devToolsDetected && state.debugId) {
    const devToolsDataSourceOverrides = DEV_TOOLS_DATASOURCE_OVERRIDES.get(
      state.debugId,
    );

    if (devToolsDataSourceOverrides) {
      // @ts-ignore
      result = {
        ...result,
        ...devToolsDataSourceOverrides,
      };
    }
  }

  return result;
}

const debugFullLazyLoad = dbg('DataSource:fullLazyLoad');

export function onPropChange<T>(
  params: { name: keyof T; newValue: any; oldValue: any },
  props: DataSourceProps<T>,
  actions: DataSourceComponentActions<T>,
) {
  const { name, newValue } = params;

  if (
    name === 'data' &&
    typeof newValue === 'function' &&
    !props.groupRowsState
  ) {
    if (props.lazyLoad) {
      debugFullLazyLoad(`"data" function prop has changed`);
    }

    if (props.collapseGroupRowsOnDataFunctionChange !== false) {
      actions.groupRowsState = new GroupRowsState({
        collapsedRows: true,
        expandedRows: [],
      });
    }
  }
}

const debugDataParams = dbg('DataSource:dataParams');

export type DataSourceMappedCallbackParams<T> = {
  [k in keyof DataSourceState<T>]: (
    value: DataSourceState<T>[k],
    state: DataSourceState<T>,
  ) => {
    callbackName?: string;
    callbackParams: any[];
  };
};

export function getMappedCallbacks<T>() {
  return {
    rowSelection: (
      rowSelection,
      state: DataSourceState<T>,
    ): { callbackParams: any[] } => {
      if (state.selectionMode === 'single-row') {
        return {
          callbackParams: [
            rowSelection,
            'single-row',
          ] as Parameters<DataSourcePropOnRowSelectionChange_SingleRow>,
        };
      }
      return {
        callbackParams: [
          (rowSelection as RowSelectionState).getState(),
          'multi-row',
        ] as Parameters<DataSourcePropOnRowSelectionChange_MultiRow>,
      };
    },

    treeSelection: (
      treeSelection,
      state: DataSourceState<T>,
    ): { callbackParams: any[] } => {
      if (state.selectionMode === 'single-row') {
        const callbackParams: Parameters<DataSourcePropOnTreeSelectionChange_SingleNode> =
          [
            treeSelection as DataSourcePropTreeSelection_SingleNode,
            { selectionMode: 'single-row' },
          ];

        return {
          callbackParams,
        };
      }
      const callbackParams: Parameters<DataSourcePropOnTreeSelectionChange_MultiNode> =
        [
          (treeSelection as TreeSelectionState).getState(),
          {
            selectionMode: 'multi-row',
            lastUpdatedNodePath: state.lastSelectionUpdatedNodePathRef.current,
            dataSourceApi: state.__apiRef.current!,
          },
        ];
      return {
        callbackParams,
      };
    },
    treeExpandState: (
      treeExpandState,
      state: DataSourceState<T>,
    ): { callbackParams: any[] } => {
      const callbackParams: Parameters<
        NonUndefined<TreeDataSourceProps<T>['onTreeExpandStateChange']>
      > = [
        (treeExpandState as TreeExpandState<T>).getState(),
        {
          nodeState: state.lastExpandStateInfoRef.current.state,
          nodePath: state.lastExpandStateInfoRef.current.nodePath,
          dataSourceApi: state.__apiRef.current!,
        },
      ];

      return {
        callbackParams,
      };
    },
    cellSelection: (
      cellSelection,
      state: DataSourceState<T>,
    ): { callbackParams: any[] } => {
      if (state.selectionMode === 'single-cell') {
        return {
          callbackParams: [
            cellSelection instanceof CellSelectionState
              ? cellSelection.getState().selectedCells
              : null,
            'single-cell',
          ] as Parameters<DataSourcePropOnCellSelectionChange_SingleCell>,
        };
      }

      return {
        callbackParams: [
          (cellSelection as CellSelectionState).getState(),
          'multi-cell',
        ] as Parameters<DataSourcePropOnCellSelectionChange_MultiCell>,
      };
    },
  } as DataSourceMappedCallbackParams<T>;
}

export function getInterceptActions<T>(): ComponentInterceptedActions<
  DataSourceState<T>
> {
  return {
    sortInfo: (sortInfo, { actions, state }) => {
      const getDataSourceMasterContext =
        state.getDataSourceMasterContextRef.current;
      const dataParams = buildDataSourceDataParams(
        state,
        {
          sortInfo,
          livePaginationCursor: null,
        },
        getDataSourceMasterContext(),
      );

      actions.dataParams = dataParams;

      if (state.livePagination) {
        // #wait_for_update do it on raf, since it also does actions.dataParams assignment
        // so we allow dataParams to be updated (the call 3 lines above) in state

        raf(() => {
          actions.livePaginationCursor = null;
        });
      }
    },
    groupBy: (groupBy, { actions, state }) => {
      const getDataSourceMasterContext =
        state.getDataSourceMasterContextRef.current;
      const dataParams = buildDataSourceDataParams(
        state,
        {
          groupBy,
          livePaginationCursor: null,
        },
        getDataSourceMasterContext(),
      );

      actions.dataParams = dataParams;

      if (state.livePagination) {
        // see #wait_for_update above

        raf(() => {
          actions.livePaginationCursor = null;
        });
      }
    },
    pivotBy: (pivotBy, { actions, state }) => {
      const getDataSourceMasterContext =
        state.getDataSourceMasterContextRef.current;
      const dataParams = buildDataSourceDataParams(
        state,
        {
          pivotBy,
          livePaginationCursor: null,
        },
        getDataSourceMasterContext(),
      );

      actions.dataParams = dataParams;

      if (state.livePagination) {
        // see #wait_for_update above

        raf(() => {
          actions.livePaginationCursor = null;
        });
      }
    },
    filterValue: (filterValue, { actions, state }) => {
      const getDataSourceMasterContext =
        state.getDataSourceMasterContextRef.current;
      const dataParams = buildDataSourceDataParams(
        state,
        {
          filterValue,
          livePaginationCursor: null,
        },
        getDataSourceMasterContext(),
      );

      actions.dataParams = dataParams;

      if (state.livePagination) {
        // see #wait_for_update above

        raf(() => {
          actions.livePaginationCursor = null;
        });
      }
    },
    cursorId: (cursorId, { actions, state }) => {
      const getDataSourceMasterContext =
        state.getDataSourceMasterContextRef.current;
      const dataParams = buildDataSourceDataParams(
        state,
        {
          __cursorId: cursorId,
        },
        getDataSourceMasterContext(),
      );
      actions.dataParams = dataParams;
    },
    livePaginationCursor: (livePaginationCursor, { actions, state }) => {
      const getDataSourceMasterContext =
        state.getDataSourceMasterContextRef.current;
      const dataParams = buildDataSourceDataParams(
        state,
        {
          livePaginationCursor,
        },
        getDataSourceMasterContext(),
      );

      actions.dataParams = dataParams;
    },
    dataParams: (dataParams, { state }) => {
      if (
        shallowEqualObjects(
          dataParams!,
          state.dataParams!,
          new Set<keyof DataSourceDataParams<T>>([
            'changes',
            'originalDataArray',
            'masterRowInfo',
          ]),
        )
      ) {
        return false;
      }

      debugDataParams(
        'onDataParamsChange triggered because the following values have changed',
        dataParams?.changes,
      );

      return true;
    },
  };
}

export type DataSourceStateRestoreForDetail<T> = {
  originalDataArray: DataSourceState<T>['originalDataArray'] | undefined;
  groupBy: DataSourceState<T>['groupBy'] | undefined;
  groupRowsState: DataSourceState<T>['groupRowsState'] | undefined;
  pivotBy: DataSourceState<T>['pivotBy'] | undefined;
  sortInfo: DataSourceState<T>['sortInfo'] | undefined;
  filterValue: DataSourceState<T>['filterValue'] | undefined;
  livePaginationCursor: DataSourceState<T>['livePaginationCursor'] | undefined;
};

export type RowDetailCacheKey = string | number;
export type RowDetailCacheEntry = {
  all?: boolean;
  groupBy?: boolean;
  sortInfo?: boolean;
  filterValue?: boolean;
  data?: boolean;
  livePaginationCursor?: boolean;
  columnOrder?: boolean;
};

export function getDataSourceStateRestoreForDetails<T>(
  state: DataSourceState<T>,
): DataSourceStateRestoreForDetail<T> {
  return {
    originalDataArray: state.originalDataArray,
    groupRowsState: state.groupRowsState,
    groupBy: state.groupBy,
    pivotBy: state.pivotBy,
    sortInfo: state.sortInfo,
    filterValue: state.filterValue,
    livePaginationCursor: state.livePaginationCursor,
  };
}
