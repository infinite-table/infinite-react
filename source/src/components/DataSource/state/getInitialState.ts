import { type DebugLogger } from '../../../utils/debugPackage';
import { warnOnce } from '../../../utils/logger';
import {
  DataSourceComponentActions,
  DataSourceDataParams,
  DataSourcePropOnCellSelectionChange_MultiCell,
  DataSourcePropOnCellSelectionChange_SingleCell,
  DataSourceRowInfoReducer,
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
import { InfiniteTableRowInfo, Scrollbars } from '../../InfiniteTable';
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
  DataSourcePropOnRowSelectionChange_SingleRow,
  DataSourcePropSelectionMode,
} from '../types';

import { normalizeSortInfo } from './normalizeSortInfo';
import { RowDisabledState } from '../RowDisabledState';

const DataSourceLogger = dbg('DataSource') as DebugLogger;

export const defaultCursorId = Symbol('cursorId');

export function initSetupState<T>(): DataSourceSetupState<T> {
  const now = Date.now();
  const originalDataArray: T[] = [];
  const dataArray: InfiniteTableRowInfo<T>[] = [];

  const originalLazyGroupData: LazyGroupDataDeepMap<T> = new DeepMap<
    string,
    LazyRowInfoGroup<T>
  >();

  return {
    // TODO cleanup indexer on unmount
    indexer: new Indexer<T, any>(),

    repeatWrappedGroupRows: false,

    destroyedRef: {
      current: false,
    },

    idToIndexMap: new Map<any, number>(),

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
};

export const forwardProps = <T>(
  setupState: DataSourceSetupState<T>,
): ForwardPropsToStateFnResult<
  DataSourceProps<T>,
  DataSourceMappedState<T>,
  DataSourceSetupState<T>
> => {
  return {
    onDataParamsChange: (fn) =>
      fn
        ? discardCallsWithEqualArg(fn, 100, getCompareObjectForDataParams)
        : undefined,
    lazyLoad: (lazyLoad) => !!lazyLoad,
    data: 1,
    debugId: 1,
    pivotBy: 1,
    primaryKey: 1,
    livePagination: 1,
    refetchKey: (refetchKey) => refetchKey ?? '',
    filterFunction: 1,
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
          state.idToIndexMap.set(rowInfo.id, rowInfo.indexInAll);
        },
      };
      return reducers
        ? {
            ...reducers,
            __idToIndex: idToIndexReducer,
          }
        : {
            __idToIndex: idToIndexReducer,
          };
    },
    batchOperationDelay: 1,
    isRowSelected: 1,
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

export function deriveStateFromProps<T extends any>(params: {
  props: DataSourceProps<T>;

  state: DataSourceState<T>;
  oldState: DataSourceState<T> | null;
}): DataSourceDerivedState<T> {
  const { props, state, oldState } = params;

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

  let groupRowsState =
    props.groupRowsState || state.groupRowsState || props.defaultGroupRowsState;

  if (groupRowsState && !(groupRowsState instanceof GroupRowsState)) {
    groupRowsState = new GroupRowsState(groupRowsState);
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

  const { shouldReloadData = {} } = props;
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
    typeof props.filterFunction === 'function'
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

  const result: DataSourceDerivedState<T> = {
    selectionMode,
    groupRowsState,

    shouldReloadData: {
      // #sortMode_vs_shouldReloadData.sortInfo
      // we reconstruct this object
      // and don't default to the computed filterMode, sortMode, groupMode and pivotMode
      // as computed above
      // since we want a subtle difference between the computed sortMode and shouldReloadData.sortInfo (for example)
      // difference: sortMode will be local when sortFunction is provided, however, the user may want to reload data when sortInfo changes
      // and thus the data will be refetched, but will be sorted locally
      filterValue:
        props.shouldReloadData?.filterValue ?? filterMode === 'remote',
      sortInfo: props.shouldReloadData?.sortInfo ?? sortMode === 'remote',
      groupBy: props.shouldReloadData?.groupBy ?? groupMode === 'remote',
      pivotBy: props.shouldReloadData?.pivotBy ?? pivotMode === 'remote',
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
