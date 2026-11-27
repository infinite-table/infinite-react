/**
 * The DataSource effects that don't depend on a UI framework: data loading
 * (plain and function data, initial data params), lazy-load batching,
 * livePagination cursor advancement, master-detail registration and the
 * data-change callbacks.
 *
 * The React DataSource has them as hooks (useLoadData, useDataSourceInternal);
 * the Vue and Angular ones run this list (see hooks/controllerEffects.ts) with
 * their own scheduling, so the logic is written once for both.
 */
import { DeepMap } from '../../utils/DeepMap';
import { logDevToolsWarning } from '../../utils/debugModeUtils';
import type { ControllerEffect } from '../hooks/controllerEffects';
import type { Scrollbars } from '../InfiniteTable/types/InfiniteTableProps';
import { debounce } from '../utils/debounce';
import type { RenderRange } from '../VirtualBrain';
import {
  buildDataSourceDataParams,
  createRemoteFilterValueMemo,
  getDetailReady,
  isRootLazyBatchRequested,
  lazyLoadRange,
  loadData,
  releaseFailedLazyBatches,
} from './privateHooks/loadDataShared';
import type {
  DataSourceApi,
  DataSourceComponentActions,
  DataSourceContextValue,
  DataSourceMasterDetailContextValue,
  DataSourceState,
} from './types';

export type DataSourceEffectsContext<T> = {
  /** reads the state in a reactive context: changes re-run the effects that read it */
  state: () => DataSourceState<T>;
  /** reads the state without tracking */
  getState: () => DataSourceState<T>;
  actions: DataSourceComponentActions<T>;
  api: DataSourceApi<T>;
  assignState: (state: Partial<DataSourceState<T>>) => void;
  getDataSourceMasterContext: () => DataSourceMasterDetailContextValue | undefined;
  /**
   * A reactive cell for the scrollbars of the table: `get` tracks, `set`
   * makes the effects reading it re-run.
   */
  scrollbars: { get: () => Scrollbars; set: (scrollbars: Scrollbars) => void };
};

/**
 * Creates the effects of one DataSource instance. Call `destroy()` when the
 * DataSource is destroyed.
 */
export function createDataSourceEffects<T>(ctx: DataSourceEffectsContext<T>): {
  /** in this order, like the React hooks */
  effects: ControllerEffect<any>[];
  /**
   * Once the component is mounted, BEFORE the effects' mount runs: the
   * detail registration (data loading checks it)
   */
  beforeEffectsMount: () => void;
  /** once the component is mounted, AFTER the effects' mount runs */
  afterEffectsMount: () => void;
  destroy: () => void;
} {
  const { state, getState, actions } = ctx;

  const getMasterContext = (): DataSourceMasterDetailContextValue | undefined =>
    getState().getDataSourceMasterContextRef.current?.() ?? undefined;

  const effects: ControllerEffect<any>[] = [];
  const cleanups: VoidFunction[] = [];

  // ---- scrollbars tracking (React: the notifyScrollbarsChange subscription in useLoadData)
  cleanups.push(
    getState().notifyScrollbarsChange.onChange(
      (scrollbars: Scrollbars | null) => {
        if (scrollbars) {
          ctx.scrollbars.set(scrollbars);
        }
      },
    ),
  );

  // ---- livePagination cursor advancement (the three livePagination effects of useLoadData)

  // livePaginationCursor changed - if the data doesn't fill the viewport (no
  // vertical scrollbar), keep requesting the next batch (ref #lvpgn)
  let livePaginationCursorFrameId: number | null = null;
  effects.push({
    name: 'livePaginationCursor',
    deps: () => ({ livePaginationCursor: state().livePaginationCursor }),
    run: ({ current: { livePaginationCursor } }) => {
      if (!getState().livePagination) {
        return;
      }
      if (livePaginationCursorFrameId != null) {
        cancelAnimationFrame(livePaginationCursorFrameId);
      }
      livePaginationCursorFrameId = requestAnimationFrame(() => {
        livePaginationCursorFrameId = null;
        if (!ctx.scrollbars.get()?.vertical) {
          if (livePaginationCursor) {
            actions.cursorId = livePaginationCursor;
          }
        }
      });
    },
  });

  // no livePaginationCursor prop - use dataArray.length as cursor
  // (#useDataArrayLengthAsCursor)
  let dataLengthCursorFrameId: number | null = null;
  effects.push({
    name: 'dataArrayLengthAsCursor',
    deps: () => {
      const s = state();
      return {
        dataArrayLength: s.dataArray.length,
        livePaginationCursor: s.livePaginationCursor,
      };
    },
    run: () => {
      const { livePagination, livePaginationCursor, cursorId, dataArray } =
        getState();
      if (!livePagination || livePaginationCursor !== undefined) {
        // the case when `livePaginationCursor` is defined is handled above
        return;
      }
      if (dataLengthCursorFrameId != null) {
        cancelAnimationFrame(dataLengthCursorFrameId);
      }
      dataLengthCursorFrameId = requestAnimationFrame(() => {
        dataLengthCursorFrameId = null;
        if (!ctx.scrollbars.get()?.vertical) {
          if (cursorId != null && dataArray.length) {
            actions.cursorId = dataArray.length;
          }
        }
      });
    },
  });

  // the vertical scrollbar disappeared (eg viewport resized to fit all rows)
  // - request the next batch
  effects.push({
    name: 'verticalScrollbar',
    deps: () => ({ vertical: ctx.scrollbars.get().vertical }),
    run: ({ current: { vertical } }) => {
      const { livePaginationCursor, livePagination, dataArray } = getState();

      if (!vertical && livePagination) {
        if (livePaginationCursor) {
          actions.cursorId = livePaginationCursor;
        } else if (livePaginationCursor === undefined && dataArray.length) {
          // no cursor passed as a prop, so we use dataArray.length as a
          // cursor (#useDataArrayLengthAsCursor)
          actions.cursorId = dataArray.length;
        }
      }
    },
  });

  cleanups.push(() => {
    if (livePaginationCursorFrameId != null) {
      cancelAnimationFrame(livePaginationCursorFrameId);
    }
    if (dataLengthCursorFrameId != null) {
      cancelAnimationFrame(dataLengthCursorFrameId);
    }
  });

  const getRemoteFilterValue = createRemoteFilterValueMemo<T>();
  const getComputedFilterValue = (s: DataSourceState<T>) => {
    const { filterValue, filterMode, filterTypes } = s;
    return getRemoteFilterValue(filterValue, filterTypes, filterMode);
  };

  const getDepsObject = (s: DataSourceState<T>) => {
    const {
      shouldReloadData,
      sortInfo,
      groupBy,
      pivotBy,
      refetchKey,
      livePagination,
      cursorId,
    } = s;

    return {
      // #sortMode_vs_shouldReloadData.sortInfo
      sortInfo: shouldReloadData.sortInfo ? sortInfo : null,
      groupBy: shouldReloadData.groupBy ? groupBy : null,
      pivotBy: shouldReloadData.pivotBy ? pivotBy : null,
      refetchKey,
      filterValue: shouldReloadData.filterValue
        ? getComputedFilterValue(s)
        : null,
      cursorId: livePagination ? cursorId : null,
    };
  };

  // set by the lazy-range effect when it reloads batches in the current flush
  const lazyRangeReloaded = { current: false };

  // ---- lazyLoad batching (React: useLazyLoadRange)

  // cache reset on data/dataParams changes
  effects.push({
    name: 'lazyLoadCacheReset',
    runOnMount: true,
    deps: () => {
      const s = state();
      return { data: s.data, dataParams: s.dataParams };
    },
    run: () => {
      actions.lazyLoadCacheOfLoadedBatches = new DeepMap<
        string,
        true | 'failed'
      >();
    },
  });

  let latestRenderRange: RenderRange | null = null;

  const loadRange = (
    renderRange?: RenderRange | null,
    options?: { dismissLoadedRows?: boolean },
    cache: DeepMap<string, true | 'failed'> = getState()
      .lazyLoadCacheOfLoadedBatches,
  ) => {
    const componentState = getState();
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
        componentActions: actions,
        dismissLoadedRows: options?.dismissLoadedRows ?? false,
      },
      cache,
    );
  };

  // the debounced loadRange (recreated when the scroll stop delay changes)
  let debouncedLoadRangeEntry: {
    wait: number;
    fn: () => void;
  } | null = null;
  const getDebouncedLoadRange = () => {
    const wait = getState().scrollStopDelayUpdatedByTable;
    if (!debouncedLoadRangeEntry || debouncedLoadRangeEntry.wait !== wait) {
      debouncedLoadRangeEntry = {
        wait,
        fn: debounce(loadRange, { wait }),
      };
    }
    return debouncedLoadRangeEntry.fn;
  };

  let removeRenderRangeSubscription: VoidFunction | null = null;
  cleanups.push(() => {
    removeRenderRangeSubscription?.();
    removeRenderRangeSubscription = null;
  });

  effects.push({
    name: 'lazyLoadRange',
    runOnMount: true,
    deps: () => {
      const s = state();
      // NOTE: unlike the data-loading effect (which uses getDepsObject and
      // nulls out deps when shouldReloadData.* is false), the lazy-range
      // effect uses the RAW sortInfo/groupBy/pivotBy/filterValue - just like
      // React's useLazyLoadRange - since lazily loaded data must always be
      // refetched on such changes, even when eg sortMode is 'local'
      return {
        sortInfo: s.sortInfo,
        filterValue: s.filterValue,
        groupBy: s.groupBy,
        pivotBy: s.pivotBy,
        refetchKey: s.refetchKey,
        cursorId: s.livePagination ? s.cursorId : null,
        lazyLoadBatchSize: s.lazyLoadBatchSize,
        lazyLoad: s.lazyLoad,
        originalLazyGroupDataChangeDetect: s.originalLazyGroupDataChangeDetect,
        groupRowsState: s.groupRowsState,
      };
    },
    run: ({ changes }) => {
      removeRenderRangeSubscription?.();
      removeRenderRangeSubscription = null;

      const { lazyLoad, notifyRenderRangeChange } = getState();

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
        getState().lazyLoadCacheOfLoadedBatches.clear();

        // it's crucial to also clear the originalLazyGroupData
        // as otherwise, previously loaded data will be kept in memory
        // see #make-sure-old-lazy-data-is-cleared
        getState().originalLazyGroupData.clear();

        loadRange(notifyRenderRangeChange.get(), {
          dismissLoadedRows: true,
        });
        // only for the data-loading effect of the current flush
        lazyRangeReloaded.current = true;
        Promise.resolve().then(() => {
          lazyRangeReloaded.current = false;
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
          releaseFailedLazyBatches(getState().lazyLoadCacheOfLoadedBatches);
          loadRange(renderRange);
        },
      );
    },
  });

  effects.push({
    name: 'lazyLoadOnDataArrayChange',
    deps: () => ({ dataArray: state().dataArray }),
    run: () => {
      const { lazyLoadBatchSize } = getState();
      if (lazyLoadBatchSize && lazyLoadBatchSize > 0) {
        getDebouncedLoadRange()();
      }
    },
  });

  // ---- data loading (React: useLoadData)

  // DS001 devtools warning: too many data changes in a short time
  const dataChangeTimestamps: number[] = [];

  // (re)load plain (non-function) data whenever `data` changes
  effects.push({
    name: 'loadPlainData',
    runOnMount: true,
    deps: () => ({ data: state().data }),
    run: () => {
      const componentState = getState();
      const masterContext = getMasterContext();

      const { isDetail, isDetailReady } = getDetailReady(
        masterContext,
        getState,
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
          actions,
          undefined,
          masterContext,
        );
      }
    },
  });

  // (re)load function data when data params change
  effects.push({
    name: 'loadFunctionData',
    runOnMount: true,
    deps: () => {
      const s = state();
      return { ...getDepsObject(s), data: s.data };
    },
    run: ({ changes }) => {
      const keys = Object.keys(changes);
      let appendWhenLivePagination = false;

      if (keys.length === 1) {
        appendWhenLivePagination = !!changes.cursorId;

        const originalData = getState().data;
        if (Array.isArray(originalData) && changes.refetchKey) {
          // the data is an array, but the refetchKey has changed
          // so let's assign originalDataArray to the data array
          //@ts-ignore ignore
          actions.originalDataArray = originalData;
          return;
        }
      }

      const masterContext = getMasterContext();
      const { isDetail, isDetailReady } = getDetailReady(
        masterContext,
        getState,
      );

      if (isDetail && !isDetailReady) {
        return;
      }

      const componentState = getState();
      if (typeof componentState.data === 'function') {
        // the lazy-range reload of this flush already requested the top-level
        // batches in view - requesting the first batch too would be one call too many
        if (
          lazyRangeReloaded.current &&
          !appendWhenLivePagination &&
          isRootLazyBatchRequested(componentState)
        ) {
          return;
        }
        loadData(
          componentState.data,
          componentState,
          actions,
          {
            append: appendWhenLivePagination,
          },
          masterContext,
        );
      }
    },
  });

  // ---- data change notifications: onDataArrayChange / onDataMutations
  // React has them in an effect on originalDataArrayChangedInfo, which reads
  // the state of the render it runs after - so it also runs on mount, with
  // the state the DataSource was first rendered with (the empty array it
  // starts with, or a detail DataSource before its cached state is
  // restored). Here that first run happens in afterEffectsMount, with the
  // state from before the effects' mount runs; the watcher below reports
  // the changes after that. An info is reported once.
  let firstRenderState: DataSourceState<T> | null = null;
  let notifiedInfo: DataSourceState<T>['originalDataArrayChangedInfo'] | null =
    null;

  const notifyDataChange = (dataSourceState: DataSourceState<T>) => {
    if (dataSourceState.originalDataArrayChangedInfo === notifiedInfo) {
      return;
    }
    notifiedInfo = dataSourceState.originalDataArrayChangedInfo;

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
  };

  effects.push({
    name: 'dataChangeCallbacks',
    deps: () => ({
      originalDataArrayChangedInfo: state().originalDataArrayChangedInfo,
    }),
    run: () => notifyDataChange(getState()),
  });

  const beforeEffectsMount = () => {
    firstRenderState = getState();

    // register with the master (React: the useLayoutEffect in
    // useDataSourceInternal) - registerDetail restores cached detail state
    // and flips stateReadyAsDetails so data loading can start
    const masterContext = ctx.getDataSourceMasterContext();
    if (masterContext) {
      const contextValue: DataSourceContextValue<T> = {
        dataSourceState: getState(),
        dataSourceActions: actions,
        getDataSourceMasterContext: ctx.getDataSourceMasterContext,
        getDataSourceState: getState,
        assignState: ctx.assignState,
        dataSourceApi: ctx.api,
      };
      masterContext.registerDetail(contextValue);
    }
  };

  const afterEffectsMount = () => {
    // the initial `dataParams`, so onDataParamsChange fires once at start
    actions.dataParams = buildDataSourceDataParams(
      getState(),
      undefined,
      getMasterContext(),
    );

    // the mount run of React's data change effect (see notifyDataChange):
    // after the initial dataParams, before onReady, like the React hooks
    const initialState = firstRenderState ?? getState();
    firstRenderState = null;
    notifyDataChange(initialState);

    getState().onReady?.(ctx.api);
  };

  return {
    effects,
    beforeEffectsMount,
    afterEffectsMount,
    destroy: () => {
      cleanups.forEach((cleanup) => cleanup());
      cleanups.length = 0;
    },
  };
}
