import { useEffect, useMemo, useRef, useState } from 'react';

import type {
  DataSourceComponentActions,
  DataSourceLivePaginationCursorValue,
  DataSourceMasterDetailContextValue,
  DataSourcePropFilterValue,
  DataSourcePropGroupBy,
  DataSourcePropPivotBy,
  DataSourceSingleSortInfo,
} from '..';
import { DeepMap } from '../../../utils/DeepMap';
import { useEffectWithChanges } from '../../hooks/useEffectWithChanges';
import { Scrollbars } from '../../InfiniteTable';
import { debounce } from '../../utils/debounce';
import type { RenderRange } from '../../VirtualBrain';
import { useGetMasterDetailContext } from '../publicHooks/useDataSourceMasterDetailSelector';
import { DataSourceState } from '../types';

import { logDevToolsWarning } from '../../../utils/debugModeUtils';
import { DevToolsMarker, getMarker } from '../../../utils/devTools';
import {
  buildDataSourceDataParams,
  computeFilterValueForRemote,
  getDetailReady,
  lazyLoadRange,
  loadData,
} from './loadDataShared';

export {
  buildDataSourceDataParams,
  computeFilterValueForRemote,
  loadData,
} from './loadDataShared';

type LoadDataOptions<T> = {
  dataSourceActions: DataSourceComponentActions<T>;
  dataSourceState: DataSourceState<T>;
  getDataSourceState: () => DataSourceState<T>;
};
export function useLoadData<T>(options: LoadDataOptions<T>) {
  const { getDataSourceState, dataSourceActions, dataSourceState } = options;

  const {
    data,
    dataArray,
    notifyScrollbarsChange,
    refetchKey,
    sortInfo,
    shouldReloadData,
    groupBy,
    pivotBy,
    filterValue,
    filterMode,
    livePagination,
    livePaginationCursor,
    filterTypes,
    cursorId: stateCursorId,
  } = dataSourceState;

  const [scrollbars, setScrollbars] = useState<Scrollbars>({
    vertical: false,
    horizontal: false,
  });

  const scrollbarsRef = useRef<Scrollbars>(scrollbars);

  useEffect(() => {
    notifyScrollbarsChange.onChange((scrollbars: Scrollbars | null) => {
      if (!scrollbars) {
        return;
      }

      scrollbarsRef.current = scrollbars;
      setScrollbars(scrollbars);
    });
    return () => notifyScrollbarsChange.destroy();
  }, [notifyScrollbarsChange]);

  useEffect(() => {
    if (!livePagination) {
      return;
    }
    // this is synced with - ref #lvpgn - search in codebase this ref to understand more
    const frameId = requestAnimationFrame(() => {
      if (!scrollbarsRef.current?.vertical) {
        if (livePaginationCursor) {
          // this line makes it so that when we have live pagination, with a livePaginationCursor,
          // if the data that was loaded does not fill the whole viewport, we need to keep requesting the new
          // batch of data - so this assignment here does that
          dataSourceActions.cursorId = livePaginationCursor;
        }
      }
    });

    return () => cancelAnimationFrame(frameId);
  }, [livePaginationCursor]);

  useEffect(() => {
    if (!livePagination || livePaginationCursor !== undefined) {
      // the case when `livePaginationCursor` is defined is handled in the effect above
      return;
    }

    const frameId = requestAnimationFrame(() => {
      if (!scrollbarsRef.current?.vertical) {
        // this line makes it so that when we have live pagination, with a livePaginationCursor,
        // if the data that was loaded does not fill the whole viewport, we need to keep requesting the new
        // batch of data - so this assignment here does that - basically we're using dataArray.length as the cursor
        // #useDataArrayLengthAsCursor ref

        if (stateCursorId != null && dataArray.length) {
          dataSourceActions.cursorId = dataArray.length;
        }
      }
    });

    return () => cancelAnimationFrame(frameId);
  }, [dataArray.length, livePaginationCursor]);

  useEffect(() => {
    const state = getDataSourceState();

    const { livePaginationCursor, livePagination, dataArray } = state;

    if (!scrollbars.vertical && livePagination) {
      // it had vertical scroll but now it doesn't

      // the current case is when the grid was loaded initially and had data + vertical scrollbar
      // but now the viewport has been resized to fit all the rows and there is extra vertical space
      // so we're in a position where we need to request the next batch of data

      if (livePaginationCursor) {
        // only do this if livePaginationCursor is defined and not zero
        dataSourceActions.cursorId = livePaginationCursor;
      } else if (livePaginationCursor === undefined && dataArray.length) {
        // there is no cursor passed as a prop, so we use dataArray.length as a cursor
        // so only do this if the length > 0
        // #useDataArrayLengthAsCursor ref

        dataSourceActions.cursorId = dataArray.length;
      }
    }
  }, [scrollbars.vertical]);

  const computedFilterValue = useMemo(() => {
    return computeFilterValueForRemote(filterValue, {
      filterTypes,
      filterMode,
    });
  }, [filterValue, filterMode, filterTypes]);

  const depsObject = {
    // #sortMode_vs_shouldReloadData.sortInfo
    sortInfo: shouldReloadData.sortInfo ? sortInfo : null,
    groupBy: shouldReloadData.groupBy ? groupBy : null,
    pivotBy: shouldReloadData.pivotBy ? pivotBy : null,
    refetchKey,
    filterValue: shouldReloadData.filterValue ? computedFilterValue : null,
    cursorId: livePagination ? stateCursorId : null,
  };

  const initialRef = useRef(true);

  useLazyLoadRange<T>(options, {
    sortInfo,
    groupBy,
    pivotBy,
    filterValue,
    refetchKey,
    cursorId: livePagination ? stateCursorId : null,
  });

  const getMasterContext = useGetMasterDetailContext();

  const dataChangeTimestampsRef = useRef<number[]>([]);
  useEffectWithChanges(
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
      const timestamps = dataChangeTimestampsRef.current;

      if (timestamps.length >= 10) {
        timestamps.splice(0, 1);
      }
      timestamps.push(now);

      const timeDiff = now - timestamps[0];

      if (timeDiff < 200 && timestamps.length >= 10) {
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
    { data },
  );

  useEffectWithChanges(
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

          // this is needed here - we have a test for this #data-array-with-refetchKey-advanced
          // because it's needed in a edge case that's not easy to reproduce

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
        let marker: DevToolsMarker | undefined;

        if (componentState.debugId) {
          marker = getMarker(
            componentState.debugId,
          ).track.DataSource.label.RemoteDataLoad.start();
        }
        loadData(
          componentState.data,
          componentState,
          dataSourceActions,
          {
            append: appendWhenLivePagination,
          },
          masterContext,
        ).then(() => {
          marker?.end();
        });
      }
    },
    { ...depsObject, data },
  );

  // only for initial triggering `onDataParamsChange`
  useEffectWithChanges(() => {
    const componentState = getDataSourceState();
    if (initialRef.current) {
      initialRef.current = false;

      const dataParams = buildDataSourceDataParams(
        componentState,
        undefined,
        getMasterContext() as
          | DataSourceMasterDetailContextValue<any>
          | undefined,
      );
      dataSourceActions.dataParams = dataParams;
    }
  }, depsObject);
}

type LazyLoadDeps<T> = Partial<{
  sortInfo: DataSourceSingleSortInfo<T>[] | null;
  groupBy: DataSourcePropGroupBy<T> | null;
  pivotBy: DataSourcePropPivotBy<T> | null;
  filterValue: DataSourcePropFilterValue<T> | null;
  cursorId: symbol | DataSourceLivePaginationCursorValue;
  refetchKey: string | number | object;
}>;
function useLazyLoadRange<T>(
  options: LoadDataOptions<T>,
  dependencies: LazyLoadDeps<T>,
) {
  const { getDataSourceState, dataSourceActions, dataSourceState } = options;

  useEffect(() => {
    dataSourceActions.lazyLoadCacheOfLoadedBatches = new DeepMap<
      string,
      true
    >();
  }, [dataSourceState.data, dataSourceState.dataParams]);

  // const loadingCache = useMemo<Map<string, true>>(() => {
  //   return new Map();
  // }, [componentState.data, componentState.dataParams]);

  const {
    lazyLoadBatchSize,
    lazyLoad,
    originalLazyGroupDataChangeDetect,
    notifyRenderRangeChange,
    dataArray,
    groupRowsState,
    scrollStopDelayUpdatedByTable,
  } = dataSourceState;

  const latestRenderRangeRef = useRef<RenderRange | null>(null);

  const loadRange = (
    renderRange?: RenderRange | null,
    options?: { dismissLoadedRows?: boolean },
    cache: DeepMap<string, true> = getDataSourceState()
      .lazyLoadCacheOfLoadedBatches,
  ) => {
    const componentState = getDataSourceState();
    renderRange = renderRange || latestRenderRangeRef.current;
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
      // when the batch size is not defined
      // we could still have rows that should be lazily loaded
      // eg: some rows are defined as expanded in the `groupRowsState`, so
      // if we detect some rows like this, we need to try and lazily load them

      // but if there is no grouping, there will be no such rows,
      // so we can safely return
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

  const debouncedLoadRange = useMemo(
    () => debounce(loadRange, { wait: scrollStopDelayUpdatedByTable }),
    [scrollStopDelayUpdatedByTable],
  );

  useEffectWithChanges(
    (changes) => {
      if (lazyLoad) {
        if (
          changes.sortInfo ||
          changes.filterValue ||
          changes.groupBy ||
          changes.pivotBy ||
          changes.refetchKey ||
          changes.cursorId
        ) {
          // clear the cache of loaded batches
          // as the changes in sorting/filtering/grouping/pivoting
          // need to reload new data, but they won't if we don't clear the cache
          getDataSourceState().lazyLoadCacheOfLoadedBatches.clear();

          // it's crucial to also clear the originalLazyGroupData
          // as otherwise, previously loaded data will be kept in memory
          // eg - from another sort/group configuration
          // see #make-sure-old-lazy-data-is-cleared
          getDataSourceState().originalLazyGroupData.clear();
          //
          loadRange(notifyRenderRangeChange.get(), {
            dismissLoadedRows: true,
          });
        } else {
          // when there is changes in lazily loaded data or group row state
          // we need to trigger another loadRange immediately,

          if (
            changes.originalLazyGroupDataChangeDetect ||
            changes.groupRowsState
          ) {
            loadRange(notifyRenderRangeChange.get());
          }
        }
        // even before waiting for the render range change, as that will only
        // happen on user scroll or table viewport resize

        // though loading a new range when the render range has changed is needed
        return notifyRenderRangeChange.onChange(
          (renderRange: RenderRange | null) => {
            latestRenderRangeRef.current = renderRange;
            loadRange(renderRange);
          },
        );
      }
      return;
    },
    {
      sortInfo: dependencies.sortInfo,
      filterValue: dependencies.filterValue,
      groupBy: dependencies.groupBy,
      pivotBy: dependencies.pivotBy,
      refetchKey: dependencies.refetchKey,
      cursorId: dependencies.cursorId,
      lazyLoadBatchSize,
      lazyLoad,
      originalLazyGroupDataChangeDetect,
      groupRowsState,
    },
  );

  useEffect(() => {
    if (lazyLoadBatchSize && lazyLoadBatchSize > 0) {
      debouncedLoadRange();
    }
  }, [dataArray]);
}
