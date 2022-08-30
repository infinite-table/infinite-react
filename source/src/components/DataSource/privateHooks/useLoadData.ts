import { useEffect, useMemo, useRef, useState } from 'react';

import { LazyGroupDataItem, LazyRowInfoGroup } from '..';
import { DeepMap } from '../../../utils/DeepMap';
import { LAZY_ROOT_KEY_FOR_GROUPS } from '../../../utils/groupAndPivot';
import { raf } from '../../../utils/raf';
import { useComponentState } from '../../hooks/useComponentState';
import { ComponentStateGeneratedActions } from '../../hooks/useComponentState/types';
import { useEffectWithChanges } from '../../hooks/useEffectWithChanges';
import { Scrollbars } from '../../InfiniteTable';
import { assignExcept } from '../../InfiniteTable/utils/assignFiltered';
import { debounce } from '../../utils/debounce';
import { RenderRange } from '../../VirtualBrain';
import {
  DataSourceDataParams,
  DataSourceData,
  DataSourceState,
  DataSourceRemoteData,
  DataSourceDataParamsChanges,
} from '../types';

import { getChangeDetect } from './getChangeDetect';

const CACHE_DEFAULT = true;

const getRafPromise = () =>
  new Promise((resolve) => {
    raf(resolve);
  });

const SKIP_DATA_CHANGES_KEYS = {
  originalDataArray: true,
  changes: true,
};

export function buildDataSourceDataParams<T>(
  componentState: DataSourceState<T>,
  overrides?: Partial<DataSourceDataParams<T>>,
): DataSourceDataParams<T> {
  const sortInfo = componentState.multiSort
    ? componentState.sortInfo
    : componentState.sortInfo?.[0] ?? null;

  const dataSourceParams: DataSourceDataParams<T> = {
    append: false,
    originalDataArray: componentState.originalDataArray,
    sortInfo,
    groupBy: componentState.groupBy,
    pivotBy: componentState.pivotBy,
    filterValue: componentState.filterValue,
    aggregationReducers: componentState.aggregationReducers,
  };

  if (dataSourceParams.groupBy) {
    dataSourceParams.groupRowsState = componentState.groupRowsState.getState();
  }

  if (componentState.livePagination !== undefined) {
    dataSourceParams.livePaginationCursor = componentState.livePaginationCursor;
    dataSourceParams.__cursorId = componentState.cursorId;
  }

  if (componentState.lazyLoad) {
    if (
      componentState.lazyLoadBatchSize != null &&
      componentState.lazyLoadBatchSize > 0
    ) {
      dataSourceParams.lazyLoadBatchSize = componentState.lazyLoadBatchSize;
      dataSourceParams.lazyLoadStartIndex = 0;
    }
    dataSourceParams.groupKeys = [];
  }

  if (overrides) {
    Object.assign(dataSourceParams, overrides);
  }

  if (dataSourceParams.filterValue && dataSourceParams.filterValue.length) {
    dataSourceParams.filterValue = dataSourceParams.filterValue.map((f) => {
      const value = { ...f };
      // delete it as it's not serializable
      // and we want to make it easier for developers to send this filterValue
      // as is on the server
      delete value.valueGetter;
      return value;
    });
  }

  const changes: DataSourceDataParamsChanges<T> = {};

  const oldDataSourceParams: Partial<DataSourceDataParams<T>> =
    componentState.dataParams || {};

  for (const k in dataSourceParams) {
    //@ts-ignore
    if (dataSourceParams.hasOwnProperty(k) && !SKIP_DATA_CHANGES_KEYS[k]) {
      const key = k as keyof DataSourceDataParams<T>;
      if (dataSourceParams[key] !== oldDataSourceParams[key]) {
        //@ts-ignore
        changes[key] = true;
      }
    }
  }

  dataSourceParams.changes = changes;

  return dataSourceParams;
}

export function loadData<T>(
  data: DataSourceData<T>,
  componentState: DataSourceState<T>,
  actions: ComponentStateGeneratedActions<DataSourceState<T>>,
  overrides?: Partial<DataSourceDataParams<T>>,
) {
  const dataParams = buildDataSourceDataParams(componentState, overrides);
  const append = dataParams.append;

  if (componentState.lazyLoad) {
    const lazyGroupData = componentState.originalLazyGroupData;
    const key = [LAZY_ROOT_KEY_FOR_GROUPS, ...(dataParams.groupKeys || [])];
    const existingGroupRowInfo = lazyGroupData.get(key);

    if (!existingGroupRowInfo) {
      const groupCacheKeys = [
        ...(dataParams.groupKeys || []),
        dataParams.lazyLoadStartIndex,
      ];
      componentState.lazyLoadCacheOfLoadedBatches.set(groupCacheKeys, true);
    }

    if (existingGroupRowInfo && existingGroupRowInfo.cache && key.length > 1) {
      const items = existingGroupRowInfo.children;
      const len = items.length;
      let allLoaded = true;
      for (let i = 0; i < len; i++) {
        if (items[i] == null) {
          allLoaded = false;
          break;
        }
      }
      if (allLoaded) {
        return Promise.resolve<any>(true);
      }
    }

    if (existingGroupRowInfo) {
      // if there's a group row already, make sure it's marked as loading its children
      if (!existingGroupRowInfo.childrenLoading) {
        existingGroupRowInfo.childrenLoading = true;
      }
    } else {
      // there's no info for this group yet, so create it
      // #creategroupdatabeforeload
      lazyGroupData.set(key, {
        error: undefined,
        children: [],
        childrenLoading: true,
        childrenAvailable: false,
        cache: CACHE_DEFAULT,
        totalCount: 0,
        totalCountUnfiltered: 0,
      });
    }
    actions.originalLazyGroupDataChangeDetect = getChangeDetect();
  }

  if (typeof data === 'function') {
    data = data(dataParams);
  }

  const dataIsPromise =
    //@ts-ignore
    typeof data === 'object' && typeof data.then === 'function';

  if (dataIsPromise && !componentState.lazyLoad) {
    actions.loading = true;
  }

  return Promise.resolve(data).then((dataParam) => {
    // dataParam can either be an array or an object with a `data` array property
    let dataArray: T[] | LazyGroupDataItem<T>[] = [] as T[];
    let skipAssign = false;

    if (Array.isArray((dataParam as DataSourceRemoteData<T>).data)) {
      const remoteData = dataParam as DataSourceRemoteData<T>;
      dataArray = remoteData.data;

      if (remoteData.livePaginationCursor !== undefined) {
        actions.livePaginationCursor = remoteData.livePaginationCursor;
      }
      if (remoteData.mappings) {
        actions.pivotMappings = remoteData.mappings;
      }
      if (remoteData.totalCountUnfiltered) {
        actions.unfilteredCount = remoteData.totalCountUnfiltered;
      }

      if (componentState.lazyLoad) {
        // #staleLazyGroupData
        // because cloning would make a copy of it and
        // multiple promised calls can be concurrent
        // they would act on clones of the data
        // and the last one will win and override
        // previous ones (in the same concurrency window)
        // therefore we use originalLazyGroupDataChangeDetect
        // to trigger re-renders and in hooks (useEffect, etc)
        // whenever we want to check if originalLazyGroupData has changed

        // const lazyGroupData = DeepMap.clone(
        //   componentState.originalLazyGroupData,
        // );

        const lazyGroupData = componentState.originalLazyGroupData;

        function resolveRemoteData(
          keys: any[],
          remoteData: DataSourceRemoteData<T>,
          parentKeys?: any[],
        ) {
          const theKey = [LAZY_ROOT_KEY_FOR_GROUPS, ...keys];
          const dataArray = remoteData.data as LazyGroupDataItem<T>[];
          const newGroupRowInfo: LazyRowInfoGroup<T> = {
            cache: !!remoteData.cache ?? CACHE_DEFAULT,
            childrenLoading: false,
            childrenAvailable: true,
            totalCount: remoteData.totalCount ?? dataArray.length,
            totalCountUnfiltered: remoteData.totalCount ?? dataArray.length,
            children: dataArray,
            error: remoteData.error,
          };

          const childDatasets: {
            keys: KeyType[];
            dataset: DataSourceRemoteData<T>;
          }[] = [];

          if (dataParams.lazyLoadBatchSize && !parentKeys) {
            const existingGroupRowInfo = lazyGroupData.get(theKey);
            const isGroupNew = !existingGroupRowInfo;

            // make sure we update the existing info with what we received from the server
            // because the existing one was probably created artificially
            // even before the initial response is received - see #creategroupdatabeforeload
            // so the totalCount was not set correctly
            const currentGroupRowInfo = assignExcept(
              {
                children: true,
              },
              existingGroupRowInfo || {},
              newGroupRowInfo,
            );

            if (isGroupNew) {
              currentGroupRowInfo.chidren = [];
            }

            currentGroupRowInfo.children.length =
              currentGroupRowInfo.totalCount;

            const start = dataParams.lazyLoadStartIndex ?? 0;
            const end = Math.min(
              remoteData.totalCount ?? dataArray.length,
              start + dataParams.lazyLoadBatchSize,
            );

            for (let i = start; i < end; i++) {
              const it = newGroupRowInfo.children[i - start];
              if (!it) {
                throw `lazily loaded item not found at index ${i - start}`;
              }
              currentGroupRowInfo.children[i] = it;

              if (it.dataset) {
                childDatasets.push({
                  keys: it.keys,
                  dataset: it.dataset,
                });
              }
            }
            if (isGroupNew) {
              lazyGroupData.set(theKey, currentGroupRowInfo);
            }
          } else {
            // if (parentKeys) {
            newGroupRowInfo.children.forEach((child) => {
              if (child && child.dataset) {
                childDatasets.push({
                  keys: child.keys,
                  dataset: child.dataset,
                });
              }
            });

            // we need this assignment, in order to make the group
            // accomodate all children that will potentially be lazily loaded
            newGroupRowInfo.children.length = newGroupRowInfo.totalCount;
            // }

            lazyGroupData.set(theKey, newGroupRowInfo);
          }

          let skipTriggerChangeAsAlreadyOriginalArrayWasUpdated = false;

          if (!keys || !keys.length) {
            const topLevelLazyGroupData = lazyGroupData.get([
              LAZY_ROOT_KEY_FOR_GROUPS,
            ]);

            //@ts-ignore
            actions.originalDataArray = [...topLevelLazyGroupData.children];
            skipTriggerChangeAsAlreadyOriginalArrayWasUpdated = true;
          }
          // actions.originalLazyGroupData = lazyGroupData;
          // see above #staleLazyGroupData
          if (!skipTriggerChangeAsAlreadyOriginalArrayWasUpdated) {
            actions.originalLazyGroupDataChangeDetect = getChangeDetect();
          }

          if (childDatasets.length) {
            const parentKeys = keys;
            childDatasets.forEach(({ keys, dataset }) => {
              resolveRemoteData(keys, dataset, parentKeys);
            });
          }
        }

        skipAssign = true;
        resolveRemoteData(dataParams.groupKeys || [], remoteData);
      }
    } else {
      dataArray = dataParam as T[];
    }

    if (!skipAssign) {
      actions.originalDataArray = append
        ? componentState.originalDataArray.concat(dataArray as any as T[])
        : (dataArray as any as T[]);
    }
    if (dataIsPromise && !componentState.lazyLoad) {
      actions.loading = false;
    }
  });
}

export function useLoadData<T>() {
  const {
    getComponentState,
    componentActions: actions,
    componentState,
  } = useComponentState<DataSourceState<T>>();

  const {
    data,
    dataArray,
    notifyScrollbarsChange,
    sortInfo,
    groupBy,
    pivotBy,
    filterValue,
    livePagination,
    livePaginationCursor,
    cursorId: stateCursorId,
  } = componentState;

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
          actions.cursorId = livePaginationCursor;
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
        // batch of data - so this assignment here does that - basically we're use dataArray.length as the cursor
        // #useDataArrayLengthAsCursor ref

        if (stateCursorId != null && dataArray.length) {
          actions.cursorId = dataArray.length;
        }
      }
    });

    return () => cancelAnimationFrame(frameId);
  }, [dataArray.length, livePaginationCursor]);

  useEffect(() => {
    const state = getComponentState();

    const { livePaginationCursor, livePagination, dataArray } = state;

    if (!scrollbars.vertical && livePagination) {
      // it had vertical scroll but now it doesn't

      // the current case is when the grid was loaded initially and had data + vertical scrollbar
      // but now the viewport has been resized to fit all the rows and there is extra vertical space
      // so we're in a position where we need to request the next batch of data

      if (livePaginationCursor) {
        // only do this if livePaginationCursor is defined and not zero
        actions.cursorId = livePaginationCursor;
      } else if (livePaginationCursor === undefined && dataArray.length) {
        // there is no cursor passed as a prop, so we use dataArray.length as a cursor
        // so only do this if the length > 0
        // #useDataArrayLengthAsCursor ref

        actions.cursorId = dataArray.length;
      }
    }
  }, [scrollbars.vertical]);

  const depsObject = {
    sortInfo,
    groupBy,
    pivotBy,
    filterValue,
    cursorId: livePagination ? stateCursorId : null,
  };

  const initialRef = useRef(true);

  useLazyLoadRange<T>();

  useEffectWithChanges(
    () => {
      const componentState = getComponentState();
      if (typeof componentState.data !== 'function') {
        loadData(componentState.data, componentState, actions);
      }
    },
    { data },
  );

  useEffectWithChanges(
    (changes) => {
      const appendWhenLivePagination =
        Object.keys(changes).length === 1 && !!changes.cursorId;

      const componentState = getComponentState();
      if (typeof componentState.data === 'function') {
        loadData(componentState.data, componentState, actions, {
          append: appendWhenLivePagination,
        });
      }
    },
    { ...depsObject, data },
  );

  // only for initial triggering `onDataParamsChange`
  useEffectWithChanges((_changes, _prevValues) => {
    const componentState = getComponentState();
    if (initialRef.current) {
      initialRef.current = false;

      const dataParams = buildDataSourceDataParams(componentState);
      actions.dataParams = dataParams;
    }
  }, depsObject);
}

function useLazyLoadRange<T>() {
  const {
    getComponentState,
    componentActions: actions,
    componentState,
  } = useComponentState<DataSourceState<T>>();

  useEffect(() => {
    actions.lazyLoadCacheOfLoadedBatches = new DeepMap<string, true>();
  }, [componentState.data, componentState.dataParams]);

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
  } = componentState;

  const latestRenderRangeRef = useRef<RenderRange | null>(null);

  const loadRange = (
    renderRange?: RenderRange | null,
    cache: DeepMap<string, true> = getComponentState()
      .lazyLoadCacheOfLoadedBatches,
  ) => {
    const componentState = getComponentState();
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
        componentActions: actions,
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
        // when there is changes in lazily loaded data or group row state
        // we need to trigger another loadRange immediately,

        if (
          changes.originalLazyGroupDataChangeDetect ||
          changes.groupRowsState
        ) {
          loadRange(notifyRenderRangeChange.get());
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

function lazyLoadRange<T>(
  options: {
    startIndex: number;
    endIndex: number;
    lazyLoadBatchSize: number | undefined;
    componentState: DataSourceState<T>;
    componentActions: ComponentStateGeneratedActions<DataSourceState<T>>;
  },
  cache?: DeepMap<string, true>,
) {
  const {
    startIndex,
    endIndex,
    lazyLoadBatchSize,
    componentState,
    componentActions,
  } = options;

  const { dataArray } = componentState;
  const isRowLoaded = (index: number) => {
    const rowInfo = dataArray[index];

    // if (
    //   rowInfo.isGroupRow &&
    //   rowInfo.dataSourceHasGrouping &&
    //   !rowInfo.collapsed && rowInfo.childrenAvailable
    // ) {
    //   return rowInfo.childrenAvailable;
    // }

    return rowInfo.data != null;
  };

  type FnCall = {
    lazyLoadStartIndex: number;
    lazyLoadBatchSize: number | undefined;
    groupKeys: any[];
  };

  const perGroupFnCalls = new DeepMap<any, Record<any, FnCall>>();

  // TODO remove this hack when DeepMap supports empty arrays as keys
  const rootGroupKeys = ['_______xxx______'];

  /**
   * We're iterating on all rows from start to end indexes
   */
  for (let i = startIndex; i <= endIndex; i++) {
    const rowInfo = dataArray[i];
    if (!rowInfo) {
      continue;
    }
    const rowLoaded = isRowLoaded(i);
    const theGroupKeys =
      rowInfo.dataSourceHasGrouping && rowInfo.groupKeys
        ? [...rowInfo.groupKeys]
        : [];

    if (
      rowInfo.isGroupRow &&
      rowInfo.dataSourceHasGrouping &&
      rowInfo.groupKeys
    ) {
      theGroupKeys.pop();
    }
    const cacheKeys = theGroupKeys.length ? theGroupKeys : rootGroupKeys;
    const indexInGroup = rowInfo.dataSourceHasGrouping
      ? rowInfo.indexInGroup
      : rowInfo.indexInAll;

    if (
      rowInfo.isGroupRow &&
      !rowInfo.collapsed &&
      !rowInfo.childrenAvailable
    ) {
      // we might have expanded groups that have never been loaded
      // so we need to try load them as well - not their batch in the parent group
      // but rather the group they are expanding

      const currentFnCall: FnCall = {
        lazyLoadStartIndex: 0,
        lazyLoadBatchSize,
        groupKeys: rowInfo.groupKeys,
      };
      const cacheKeys = rowInfo.groupKeys;
      let cachedFnCalls = perGroupFnCalls.get(cacheKeys);

      if (!cachedFnCalls?.[rowInfo.id]) {
        const shouldSetFnCalls = !cachedFnCalls;

        cachedFnCalls = cachedFnCalls || {};

        if (!cachedFnCalls[rowInfo.id]) {
          cachedFnCalls[rowInfo.id] = currentFnCall;
        }

        if (shouldSetFnCalls) {
          perGroupFnCalls.set(cacheKeys, cachedFnCalls);
        }
      }
    }

    if (!rowLoaded && lazyLoadBatchSize != undefined) {
      let cachedFnCalls = perGroupFnCalls.get(cacheKeys);

      const batchStartIndexInGroup =
        Math.floor(indexInGroup / lazyLoadBatchSize) * lazyLoadBatchSize;
      const offset = indexInGroup - batchStartIndexInGroup;
      const absoluteIndexOfBatchStart =
        dataArray[rowInfo.indexInAll - offset].indexInAll;

      const batchStartRowLoaded = isRowLoaded(absoluteIndexOfBatchStart);
      const batchStartRowId = dataArray[absoluteIndexOfBatchStart].id;

      if (batchStartRowLoaded || cachedFnCalls?.[batchStartRowId]) {
        continue;
      }

      const shouldSetFnCalls = !cachedFnCalls;

      cachedFnCalls = cachedFnCalls || {};

      const currentFnCall: FnCall = {
        lazyLoadStartIndex: batchStartIndexInGroup,
        lazyLoadBatchSize,
        groupKeys: theGroupKeys,
      };

      if (!cachedFnCalls[batchStartRowId]) {
        cachedFnCalls[batchStartRowId] = currentFnCall;
      }

      if (shouldSetFnCalls) {
        perGroupFnCalls.set(cacheKeys, cachedFnCalls);
      }
    }
  }

  const initialPromise: Promise<any> = Promise.resolve(true);

  const allFnCalls: FnCall[] = [];
  perGroupFnCalls.topDownValues().forEach((record) => {
    allFnCalls.push(...Object.values(record));
  });

  allFnCalls.reduce((promise, fnCall: FnCall) => {
    const cacheKey = [...fnCall.groupKeys, fnCall.lazyLoadStartIndex];

    if (cache && cache.has(cacheKey)) {
      return promise;
    }

    cache?.set(cacheKey, true);
    const args: [
      DataSourceData<T>,
      DataSourceState<T>,
      ComponentStateGeneratedActions<DataSourceState<T>>,
      Partial<DataSourceDataParams<T>>,
    ] = [componentState.data, componentState, componentActions, fnCall];

    // TODO make this whole function testable, so we can properly test multiple calls are not issued for the same batch (in the same group)

    return promise.then(() => getRafPromise()).then(() => loadData(...args));
  }, initialPromise);
}
