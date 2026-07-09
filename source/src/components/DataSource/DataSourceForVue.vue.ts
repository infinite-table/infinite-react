import {
  defineComponent,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  shallowRef,
  watch,
} from 'vue';
import type { InjectionKey, ShallowRef } from 'vue';

import { buildManagedVueComponent } from '../hooks/useComponentState/useManagedComponent.vue';

import {
  deriveStateFromProps,
  forwardProps,
  initSetupState,
  getInterceptActions,
  onPropChange,
  getMappedCallbacks,
  cleanupDataSource,
} from './state/getInitialState';
import { concludeReducer } from './state/reducer';
import { getDataSourceApi } from './getDataSourceApi';
import {
  loadData,
  buildDataSourceDataParams,
  computeFilterValueForRemote,
  getDetailReady,
  lazyLoadRange,
} from './privateHooks/loadDataShared';
import { DeepMap } from '../../utils/DeepMap';
import { debounce } from '../utils/debounce';
import { logDevToolsWarning } from '../../utils/debugModeUtils';
import type { RenderRange } from '../VirtualBrain';
import type { Scrollbars } from '../InfiniteTable/types/InfiniteTableProps';

import type {
  DataSourceApi,
  DataSourceComponentActions,
  DataSourceMasterDetailContextValue,
  DataSourceState,
} from './types';

/**
 * All public DataSource props (camelCase). Declared explicitly so Vue
 * resolves them as props (with kebab-case normalization in templates) and
 * absent props stay `undefined` — which is what presence-based
 * controlled/uncontrolled detection relies on. Array-form declaration on
 * purpose: no Boolean casting, no defaults.
 */
export const DATA_SOURCE_PROP_NAMES = [
  'debugId',
  'primaryKey',
  'fields',
  'refetchKey',
  'batchOperationDelay',
  'rowInfoReducers',
  'data',
  'selectionMode',
  'useGroupKeysForMultiRowSelection',
  'rowSelection',
  'defaultRowSelection',
  'onRowSelectionChange',
  'cellSelection',
  'defaultCellSelection',
  'onCellSelectionChange',
  'rowDisabledState',
  'defaultRowDisabledState',
  'onRowDisabledStateChange',
  'isRowDisabled',
  'isRowSelected',
  'lazyLoad',
  'loading',
  'defaultLoading',
  'onLoadingChange',
  'onReady',
  'pivotBy',
  'defaultPivotBy',
  'onPivotByChange',
  'aggregationReducers',
  'defaultAggregationReducers',
  'groupBy',
  'defaultGroupBy',
  'onGroupByChange',
  'groupRowsState',
  'defaultGroupRowsState',
  'onGroupRowsStateChange',
  'collapseGroupRowsOnDataFunctionChange',
  'sortFunction',
  'sortInfo',
  'defaultSortInfo',
  'onSortInfoChange',
  'onDataParamsChange',
  'onDataArrayChange',
  'onDataMutations',
  'livePagination',
  'livePaginationCursor',
  'onLivePaginationCursorChange',
  'filterFunction',
  'treeFilterFunction',
  'sortMode',
  'filterMode',
  'groupMode',
  'shouldReloadData',
  'filterValue',
  'defaultFilterValue',
  'onFilterValueChange',
  'filterDelay',
  'filterTypes',
  'sortTypes',
  'multiSort',
  // tree props (TreeDataSourceProps)
  'nodesKey',
  'isNodeExpanded',
  'isNodeCollapsed',
  'isNodeReadOnly',
  'isNodeSelectable',
  'isNodeSelected',
  'treeSelection',
  'defaultTreeSelection',
  'onTreeSelectionChange',
  'onTreeDataMutations',
  'onNodeCollapse',
  'onNodeExpand',
  'treeExpandState',
  'defaultTreeExpandState',
  'onTreeExpandStateChange',
] as const;

export type DataSourceContextValueForVue<T = any> = {
  state: ShallowRef<DataSourceState<T>>;
  getDataSourceState: () => DataSourceState<T>;
  dataSourceActions: DataSourceComponentActions<T>;
  dataSourceApi: DataSourceApi<T>;
  assignState: (state: Partial<DataSourceState<T>>) => void;
};

export const DataSourceInjectionKeyForVue: InjectionKey<DataSourceContextValueForVue> =
  Symbol('DataSource');

export function useDataSourceContext<T = any>() {
  return inject(
    DataSourceInjectionKeyForVue,
  ) as DataSourceContextValueForVue<T>;
}

const { useManagedComponent: useManagedDataSourceVue } =
  buildManagedVueComponent({
    debugName: 'DataSource',
    //@ts-ignore
    initSetupState,
    //@ts-ignore
    forwardProps,
    //@ts-ignore
    concludeReducer,
    //@ts-ignore
    mapPropsToState: deriveStateFromProps,
    //@ts-ignore
    onPropChange,
    //@ts-ignore
    cleanup: cleanupDataSource,
    //@ts-ignore
    interceptActions: getInterceptActions(),
    //@ts-ignore
    mappedCallbacks: getMappedCallbacks(),
  });

/**
 * Vue mirror of React's useEffectWithChanges: invokes fn only with the deps
 * that actually changed (reference equality), like the React hook, and runs
 * on mount with every dep reported as changed.
 */
function watchWithChanges(
  getDeps: () => Record<string, any>,
  fn: (changes: Record<string, any>, prevValues: Record<string, any>) => void,
) {
  let prev: Record<string, any> = {};
  let first = true;

  const run = (current: Record<string, any>) => {
    const changes: Record<string, any> = {};
    const oldValues: Record<string, any> = {};
    for (const k in current) {
      if (current.hasOwnProperty(k)) {
        if (first || current[k] !== prev[k]) {
          changes[k] = current[k];
          oldValues[k] = prev[k];
        }
      }
    }
    prev = current;
    first = false;

    if (Object.keys(changes).length !== 0) {
      fn(changes, oldValues);
    }
  };

  onMounted(() => run(getDeps()));
  watch(getDeps, run, { flush: 'post' });
}

/**
 * Vue port of useLazyLoadRange from useLoadData.ts: render-range driven
 * batch loading (lazyLoad / lazyLoadBatchSize).
 */
function useLazyLoadRangeForVue<T>(options: {
  state: ShallowRef<DataSourceState<T>>;
  getDataSourceState: () => DataSourceState<T>;
  dataSourceActions: DataSourceComponentActions<T>;
  getDepsObject: () => Record<string, any>;
}) {
  const { state, getDataSourceState, dataSourceActions, getDepsObject } =
    options;

  // cache reset on data/dataParams changes
  watchWithChanges(
    () => ({
      data: state.value.data,
      dataParams: state.value.dataParams,
    }),
    () => {
      dataSourceActions.lazyLoadCacheOfLoadedBatches = new DeepMap<
        string,
        true
      >();
    },
  );

  let latestRenderRange: RenderRange | null = null;

  const loadRange = (
    renderRange?: RenderRange | null,
    options?: { dismissLoadedRows?: boolean },
    cache: DeepMap<string, true> = getDataSourceState()
      .lazyLoadCacheOfLoadedBatches,
  ) => {
    const componentState = getDataSourceState();
    renderRange = renderRange || latestRenderRange;
    if (!renderRange) {
      return;
    }
    const { renderStartIndex: startIndex, renderEndIndex: endIndex } =
      renderRange;

    const { lazyLoadBatchSize, lazyLoad } = componentState;

    if (!lazyLoad) {
      return;
    }

    if (!lazyLoadBatchSize || lazyLoadBatchSize <= 0) {
      // when the batch size is not defined we could still have rows that
      // should be lazily loaded (eg expanded rows in groupRowsState), but
      // if there is no grouping, there will be no such rows
      if (!componentState.groupBy || componentState.groupBy.length === 0) {
        return;
      }
    }

    lazyLoadRange(
      {
        startIndex,
        endIndex,
        lazyLoadBatchSize,
        componentState,
        componentActions: dataSourceActions,
        dismissLoadedRows: options?.dismissLoadedRows ?? false,
      },
      cache,
    );
  };

  // mirrors the debounced loadRange memo (recreated when the scroll stop
  // delay changes)
  let debouncedLoadRangeEntry: {
    wait: number;
    fn: () => void;
  } | null = null;
  const getDebouncedLoadRange = () => {
    const wait = getDataSourceState().scrollStopDelayUpdatedByTable;
    if (!debouncedLoadRangeEntry || debouncedLoadRangeEntry.wait !== wait) {
      debouncedLoadRangeEntry = {
        wait,
        fn: debounce(loadRange, { wait }),
      };
    }
    return debouncedLoadRangeEntry.fn;
  };

  let removeRenderRangeSubscription: VoidFunction | null = null;

  watchWithChanges(
    () => {
      const deps = getDepsObject();
      const s = state.value;
      return {
        sortInfo: deps.sortInfo,
        filterValue: deps.filterValue,
        groupBy: deps.groupBy,
        pivotBy: deps.pivotBy,
        refetchKey: deps.refetchKey,
        cursorId: deps.cursorId,
        lazyLoadBatchSize: s.lazyLoadBatchSize,
        lazyLoad: s.lazyLoad,
        originalLazyGroupDataChangeDetect: s.originalLazyGroupDataChangeDetect,
        groupRowsState: s.groupRowsState,
      };
    },
    (changes) => {
      removeRenderRangeSubscription?.();
      removeRenderRangeSubscription = null;

      const { lazyLoad, notifyRenderRangeChange } = getDataSourceState();

      if (!lazyLoad) {
        return;
      }

      if (
        changes.sortInfo ||
        changes.filterValue ||
        changes.groupBy ||
        changes.pivotBy ||
        changes.refetchKey ||
        changes.cursorId
      ) {
        // clear the cache of loaded batches, as the changes in
        // sorting/filtering/grouping/pivoting need to reload new data
        getDataSourceState().lazyLoadCacheOfLoadedBatches.clear();

        // it's crucial to also clear the originalLazyGroupData
        // as otherwise, previously loaded data will be kept in memory
        // see #make-sure-old-lazy-data-is-cleared
        getDataSourceState().originalLazyGroupData.clear();

        loadRange(notifyRenderRangeChange.get(), {
          dismissLoadedRows: true,
        });
      } else {
        // when there are changes in lazily loaded data or group row state
        // we need to trigger another loadRange immediately
        if (
          changes.originalLazyGroupDataChangeDetect ||
          changes.groupRowsState
        ) {
          loadRange(notifyRenderRangeChange.get());
        }
      }

      // loading a new range when the render range has changed is needed
      removeRenderRangeSubscription = notifyRenderRangeChange.onChange(
        (renderRange: RenderRange | null) => {
          latestRenderRange = renderRange;
          loadRange(renderRange);
        },
      );
    },
  );

  watch(
    () => state.value.dataArray,
    () => {
      const { lazyLoadBatchSize } = getDataSourceState();
      if (lazyLoadBatchSize && lazyLoadBatchSize > 0) {
        getDebouncedLoadRange()();
      }
    },
    { flush: 'post' },
  );

  onBeforeUnmount(() => {
    removeRenderRangeSubscription?.();
    removeRenderRangeSubscription = null;
  });
}

/**
 * Vue port of the data-loading effects from useLoadData: initial + reactive
 * loadData calls for both plain and function data, the initial dataParams
 * assignment, livePagination cursor advancement on scrollbar changes and
 * lazyLoad batching (via useLazyLoadRangeForVue).
 */
function useLoadDataForVue<T>(options: {
  state: ShallowRef<DataSourceState<T>>;
  getDataSourceState: () => DataSourceState<T>;
  dataSourceActions: DataSourceComponentActions<T>;
}) {
  const { state, getDataSourceState, dataSourceActions } = options;

  const getMasterContext = (): DataSourceMasterDetailContextValue | undefined =>
    state.value.getDataSourceMasterContextRef.current?.() ?? undefined;

  // ---- scrollbars tracking + livePagination cursor advancement ----
  // (mirrors the notifyScrollbarsChange subscription + the three
  // livePagination effects in React's useLoadData)
  const scrollbarsRef = shallowRef<Scrollbars>({
    vertical: false,
    horizontal: false,
  });

  const removeScrollbarsSubscription =
    state.value.notifyScrollbarsChange.onChange(
      (scrollbars: Scrollbars | null) => {
        if (!scrollbars) {
          return;
        }
        scrollbarsRef.value = scrollbars;
      },
    );
  onBeforeUnmount(() => {
    removeScrollbarsSubscription();
  });

  // effect: livePaginationCursor changed - if the data doesn't fill the
  // viewport (no vertical scrollbar), keep requesting the next batch
  // (ref #lvpgn)
  let livePaginationCursorFrameId: number | null = null;
  watch(
    () => state.value.livePaginationCursor,
    (livePaginationCursor) => {
      if (!state.value.livePagination) {
        return;
      }
      if (livePaginationCursorFrameId != null) {
        cancelAnimationFrame(livePaginationCursorFrameId);
      }
      livePaginationCursorFrameId = requestAnimationFrame(() => {
        livePaginationCursorFrameId = null;
        if (!scrollbarsRef.value?.vertical) {
          if (livePaginationCursor) {
            dataSourceActions.cursorId = livePaginationCursor;
          }
        }
      });
    },
    { flush: 'post' },
  );

  // effect: no livePaginationCursor prop - use dataArray.length as cursor
  // (#useDataArrayLengthAsCursor)
  let dataLengthCursorFrameId: number | null = null;
  watch(
    () => [state.value.dataArray.length, state.value.livePaginationCursor],
    () => {
      const { livePagination, livePaginationCursor, cursorId, dataArray } =
        state.value;
      if (!livePagination || livePaginationCursor !== undefined) {
        // the case when `livePaginationCursor` is defined is handled above
        return;
      }
      if (dataLengthCursorFrameId != null) {
        cancelAnimationFrame(dataLengthCursorFrameId);
      }
      dataLengthCursorFrameId = requestAnimationFrame(() => {
        dataLengthCursorFrameId = null;
        if (!scrollbarsRef.value?.vertical) {
          if (cursorId != null && dataArray.length) {
            dataSourceActions.cursorId = dataArray.length;
          }
        }
      });
    },
    { flush: 'post' },
  );

  // effect: the vertical scrollbar disappeared (eg viewport resized to fit
  // all rows) - request the next batch
  watch(
    () => scrollbarsRef.value.vertical,
    (vertical) => {
      const { livePaginationCursor, livePagination, dataArray } =
        getDataSourceState();

      if (!vertical && livePagination) {
        if (livePaginationCursor) {
          dataSourceActions.cursorId = livePaginationCursor;
        } else if (livePaginationCursor === undefined && dataArray.length) {
          // no cursor passed as a prop, so we use dataArray.length as a
          // cursor (#useDataArrayLengthAsCursor)
          dataSourceActions.cursorId = dataArray.length;
        }
      }
    },
    { flush: 'post' },
  );

  onBeforeUnmount(() => {
    if (livePaginationCursorFrameId != null) {
      cancelAnimationFrame(livePaginationCursorFrameId);
    }
    if (dataLengthCursorFrameId != null) {
      cancelAnimationFrame(dataLengthCursorFrameId);
    }
  });

  // mirrors the [filterValue, filterMode, filterTypes] useMemo
  let filterMemoInputs: any[] = [];
  let filterMemoResult: any = null;
  const getComputedFilterValue = () => {
    const { filterValue, filterMode, filterTypes } = state.value;
    const inputs = [filterValue, filterMode, filterTypes];
    if (
      inputs.length !== filterMemoInputs.length ||
      inputs.some((input, index) => input !== filterMemoInputs[index])
    ) {
      filterMemoInputs = inputs;
      filterMemoResult = computeFilterValueForRemote(filterValue, {
        filterTypes,
        filterMode,
      });
    }
    return filterMemoResult;
  };

  const getDepsObject = () => {
    const {
      shouldReloadData,
      sortInfo,
      groupBy,
      pivotBy,
      refetchKey,
      livePagination,
      cursorId,
    } = state.value;

    return {
      // #sortMode_vs_shouldReloadData.sortInfo
      sortInfo: shouldReloadData.sortInfo ? sortInfo : null,
      groupBy: shouldReloadData.groupBy ? groupBy : null,
      pivotBy: shouldReloadData.pivotBy ? pivotBy : null,
      refetchKey,
      filterValue: shouldReloadData.filterValue
        ? getComputedFilterValue()
        : null,
      cursorId: livePagination ? cursorId : null,
    };
  };

  // lazyLoad batching (render-range driven loading)
  useLazyLoadRangeForVue<T>({
    state,
    getDataSourceState,
    dataSourceActions,
    getDepsObject,
  });

  // DS001 devtools warning: too many data changes in a short time
  const dataChangeTimestamps: number[] = [];

  // effect 1: (re)load plain (non-function) data whenever `data` changes
  watchWithChanges(
    () => ({ data: state.value.data }),
    () => {
      const componentState = getDataSourceState();
      const masterContext = getMasterContext();

      const { isDetail, isDetailReady } = getDetailReady(
        masterContext,
        getDataSourceState,
      );
      if (isDetail && !isDetailReady) {
        return;
      }

      const now = Date.now();
      if (dataChangeTimestamps.length >= 10) {
        dataChangeTimestamps.splice(0, 1);
      }
      dataChangeTimestamps.push(now);

      const timeDiff = now - dataChangeTimestamps[0];

      if (timeDiff < 200 && dataChangeTimestamps.length >= 10) {
        logDevToolsWarning({
          debugId: componentState.debugId,
          key: 'DS001',
        });
      }

      if (typeof componentState.data !== 'function') {
        loadData(
          componentState.data,
          componentState,
          dataSourceActions,
          undefined,
          masterContext,
        );
      }
    },
  );

  // effect 2: (re)load function data when data params change
  watchWithChanges(
    () => ({ ...getDepsObject(), data: state.value.data }),
    (changes) => {
      const keys = Object.keys(changes);
      let appendWhenLivePagination = false;

      if (keys.length === 1) {
        appendWhenLivePagination = !!changes.cursorId;

        if (
          changes.filterValue &&
          getDataSourceState().filterMode === 'local'
        ) {
          // if filter value has changed and filter mode is local
          // then we don't need to do a remote call
          return;
        }

        const originalData = getDataSourceState().data;
        if (Array.isArray(originalData) && changes.refetchKey) {
          // the data is an array, but the refetchKey has changed
          // so let's assign originalDataArray to the data array
          //@ts-ignore ignore
          dataSourceActions.originalDataArray = originalData;
          return;
        }
      }

      const masterContext = getMasterContext();
      const { isDetail, isDetailReady } = getDetailReady(
        masterContext,
        getDataSourceState,
      );

      if (isDetail && !isDetailReady) {
        return;
      }

      const componentState = getDataSourceState();
      if (typeof componentState.data === 'function') {
        loadData(
          componentState.data,
          componentState,
          dataSourceActions,
          {
            append: appendWhenLivePagination,
          },
          masterContext,
        );
      }
    },
  );

  // effect 3: initial `dataParams`, so onDataParamsChange fires once at start
  onMounted(() => {
    const componentState = getDataSourceState();
    const dataParams = buildDataSourceDataParams(
      componentState,
      undefined,
      getMasterContext(),
    );
    dataSourceActions.dataParams = dataParams;
  });
}

/**
 * Composition-level DataSource setup — usable directly (returns the context
 * value) or through the DataSource component below.
 */
export function useDataSourceForVue<T>(props: any) {
  const { contextValue: managedContextValue } = useManagedDataSourceVue(props);

  const state = managedContextValue.state as unknown as ShallowRef<
    DataSourceState<T>
  >;
  const dataSourceActions =
    managedContextValue.componentActions as unknown as DataSourceComponentActions<T>;
  const getDataSourceState = () => state.value;

  // no master-detail support yet in the Vue port
  state.value.getDataSourceMasterContextRef.current = () => undefined;

  const dataSourceApi = getDataSourceApi<T>({
    getState: getDataSourceState,
    actions: dataSourceActions,
  });

  const contextValue: DataSourceContextValueForVue<T> = {
    state,
    getDataSourceState,
    dataSourceActions,
    dataSourceApi,
    assignState: managedContextValue.assignState as (
      s: Partial<DataSourceState<T>>,
    ) => void,
  };

  provide(
    DataSourceInjectionKeyForVue,
    contextValue as DataSourceContextValueForVue<any>,
  );

  useLoadDataForVue<T>({ state, getDataSourceState, dataSourceActions });

  // onDataArrayChange / onDataMutations notifications
  watch(
    () => state.value.originalDataArrayChangedInfo,
    () => {
      const dataSourceState = state.value;

      dataSourceState.onDataArrayChange?.(
        dataSourceState.originalDataArray,
        dataSourceState.originalDataArrayChangedInfo,
      );

      if (
        dataSourceState.onDataMutations &&
        dataSourceState.originalDataArrayChangedInfo.mutations &&
        dataSourceState.originalDataArrayChangedInfo.mutations.size
      ) {
        dataSourceState.onDataMutations({
          primaryKeyField:
            typeof dataSourceState.primaryKey === 'string'
              ? dataSourceState.primaryKey
              : undefined,
          dataArray: dataSourceState.originalDataArray,
          mutations: dataSourceState.originalDataArrayChangedInfo.mutations!,
          timestamp: dataSourceState.originalDataArrayChangedInfo.timestamp,
        });
      }

      if (
        dataSourceState.onTreeDataMutations &&
        dataSourceState.originalDataArrayChangedInfo.treeMutations &&
        dataSourceState.originalDataArrayChangedInfo.treeMutations.size
      ) {
        dataSourceState.onTreeDataMutations({
          nodesKey: dataSourceState.nodesKey
            ? dataSourceState.nodesKey
            : undefined,
          dataArray: dataSourceState.originalDataArray,
          treeMutations:
            dataSourceState.originalDataArrayChangedInfo.treeMutations!,
          timestamp: dataSourceState.originalDataArrayChangedInfo.timestamp,
        });
      }
    },
    { flush: 'post' },
  );

  onMounted(() => {
    state.value.onReady?.(dataSourceApi);
  });

  onBeforeUnmount(() => {
    const dataSourceState = getDataSourceState();
    dataSourceState.onCleanup(dataSourceState);
  });

  if (__DEV__) {
    (globalThis as any).getDataSourceState = getDataSourceState;
    (globalThis as any).dataSourceActions = dataSourceActions;
    (globalThis as any).dataSourceApi = dataSourceApi;

    if (state.value.debugId) {
      (globalThis as any).dataSources = (globalThis as any).dataSources || {};
      (globalThis as any).dataSources[state.value.debugId] = {
        getState: getDataSourceState,
        actions: dataSourceActions,
        api: dataSourceApi,
      };
    }
  }

  return contextValue;
}

/**
 * Vue sibling of the DataSource component. The default slot receives the
 * current DataSourceState (mirrors React's children-as-function support).
 */
export const DataSource = defineComponent({
  name: 'DataSource',
  props: [...DATA_SOURCE_PROP_NAMES],
  setup(props, { slots }) {
    const contextValue = useDataSourceForVue(props);

    return () => slots.default?.(contextValue.state.value) ?? null;
  },
});
