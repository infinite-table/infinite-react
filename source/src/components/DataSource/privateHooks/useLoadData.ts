import { useEffect, useMemo, useRef, useState } from 'react';
import { LazyGroupDataItem, LazyGroupRowInfo } from '..';
import { DeepMap } from '../../../utils/DeepMap';
import { getGlobal } from '../../../utils/getGlobal';
import { LAZY_ROOT_KEY_FOR_GROUPS } from '../../../utils/groupAndPivot';

import {
  ComponentStateGeneratedActions,
  useComponentState,
} from '../../hooks/useComponentState';
import { useEffectWithChanges } from '../../hooks/useEffectWithChanges';

import { Scrollbars } from '../../InfiniteTable';
import { debounce } from '../../utils/debounce';
import { RenderRange } from '../../VirtualBrain';

import {
  DataSourceDataParams,
  DataSourceData,
  DataSourceState,
  DataSourceRemoteData,
  DataSourceDataParamsChanges,
} from '../types';

const getRafPromise = () =>
  new Promise((resolve) => {
    requestAnimationFrame(resolve);
  });

const SKIP_DATA_CHANGES_KEYS = {
  originalDataArray: true,
  changes: true,
};

function getChangeDetect() {
  const perfNow = getGlobal().performance?.now();

  return `${Date.now()}:${perfNow}`;
}

export function buildDataSourceDataParams<T>(
  componentState: DataSourceState<T>,
  overrides?: Partial<DataSourceDataParams<T>>,
): DataSourceDataParams<T> {
  const sortInfo = componentState.multiSort
    ? componentState.sortInfo
    : componentState.sortInfo?.[0] ?? null;

  const dataSourceParams: DataSourceDataParams<T> = {
    originalDataArray: componentState.originalDataArray,
    sortInfo,
    groupBy: componentState.groupBy,
    pivotBy: componentState.pivotBy,
    aggregationReducers: componentState.aggregationReducers,
  };

  if (componentState.livePagination !== undefined) {
    dataSourceParams.livePaginationCursor = componentState.livePaginationCursor;
    dataSourceParams.cursorId = componentState.cursorId;
  }

  if (componentState.fullLazyLoad) {
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

  const changes: DataSourceDataParamsChanges<T> = {};

  const oldDataSourceParams: Partial<DataSourceDataParams<T>> =
    componentState.dataParams || {};

  for (let k in dataSourceParams) {
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

  if (componentState.fullLazyLoad && dataParams.groupKeys) {
    const lazyGroupData = componentState.originalLazyGroupData;
    const key = [LAZY_ROOT_KEY_FOR_GROUPS, ...dataParams.groupKeys];
    const existingGroupRowInfo = lazyGroupData.get(key);

    if (existingGroupRowInfo && existingGroupRowInfo.cache) {
      const items = existingGroupRowInfo.items;
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
  }

  if (typeof data === 'function') {
    data = data(dataParams);
  }

  const dataIsPromise =
    //@ts-ignore
    typeof data === 'object' && typeof data.then === 'function';

  if (dataIsPromise && !componentState.fullLazyLoad) {
    actions.loading = true;
  }

  return Promise.resolve(data).then((dataParam) => {
    // dataParam can either be an array or an object with a `data` array property
    let dataArray: T[] = [] as T[];
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

      if (componentState.fullLazyLoad && dataParams.groupKeys) {
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
        const key = [LAZY_ROOT_KEY_FOR_GROUPS, ...dataParams.groupKeys];

        const newGroupRowInfo: LazyGroupRowInfo<T> = {
          cache: !!remoteData.cache ?? true,
          totalCount: remoteData.totalCount ?? dataArray.length,
          items: dataArray as any as LazyGroupDataItem<T>[],
        };
        if (dataParams.lazyLoadBatchSize) {
          const existingGroupRowInfo = lazyGroupData.get(key);

          const currentGroupRowInfo =
            existingGroupRowInfo ??
            ({
              items: [],
              totalCount: newGroupRowInfo.totalCount,
              cache: newGroupRowInfo.cache!! ?? true,
            } as LazyGroupRowInfo<T>);
          if (existingGroupRowInfo) {
            existingGroupRowInfo.cache = newGroupRowInfo.cache!!;
          }
          currentGroupRowInfo.items.length = currentGroupRowInfo.totalCount;

          const start = dataParams.lazyLoadStartIndex ?? 0;
          const end = Math.min(
            remoteData.totalCount ?? start + dataParams.lazyLoadBatchSize,
          );

          for (let i = start; i < end; i++) {
            currentGroupRowInfo.items[i] = newGroupRowInfo.items[i - start];
          }
          if (!existingGroupRowInfo) {
            lazyGroupData.set(key, currentGroupRowInfo);
          }
        } else {
          lazyGroupData.set(key, newGroupRowInfo);
        }
        skipAssign = true;
        // actions.originalLazyGroupData = lazyGroupData;
        // see above #staleLazyGroupData
        actions.originalLazyGroupDataChangeDetect = getChangeDetect();
      }
    } else {
      dataArray = dataParam as T[];
    }

    if (!skipAssign) {
      actions.originalDataArray = dataArray;
    }
    if (dataIsPromise && !componentState.fullLazyLoad) {
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
    notifyScrollbarsChange,
    sortInfo,
    groupBy,
    pivotBy,
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
    // this is synced with - ref #lvpgn - search in codebase this ref to understand more
    const frameId = requestAnimationFrame(() => {
      if (!scrollbarsRef.current?.vertical && livePaginationCursor) {
        actions.cursorId = livePaginationCursor;
      }
    });

    return () => cancelAnimationFrame(frameId);
  }, [livePaginationCursor]);

  useEffect(() => {
    const { livePaginationCursor, livePagination } = getComponentState();
    if (!scrollbars.vertical && livePagination) {
      // it had vertical scroll but now it doesn't

      // updateCursorId(livePaginationCursor);
      if (livePaginationCursor) {
        actions.cursorId = livePaginationCursor;
      }
    }
  }, [scrollbars.vertical]);

  const depsObject = {
    sortInfo,
    groupBy,
    pivotBy,
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
    () => {
      const componentState = getComponentState();
      if (typeof componentState.data === 'function') {
        loadData(componentState.data, componentState, actions);
      }
    },
    { ...depsObject, data },
  );

  useEffectWithChanges((_changes, _prevValues) => {
    const componentState = getComponentState();
    if (initialRef.current) {
      initialRef.current = false;
      actions.dataParams = buildDataSourceDataParams(componentState);
    }
  }, depsObject);
}

function useLazyLoadRange<T>() {
  const {
    getComponentState,
    componentActions: actions,
    componentState,
  } = useComponentState<DataSourceState<T>>();

  const loadingCache = useMemo<Map<string, true>>(() => {
    return new Map();
  }, [componentState.data]);

  (globalThis as any).loadingCache = loadingCache;

  const {
    lazyLoadBatchSize,
    notifyRenderRangeChange,
    dataArray,
    scrollStopDelayUpdatedByTable,
  } = componentState;

  const latestRenderRangeRef = useRef<RenderRange | null>(null);

  const loadRange = (
    param?: RenderRange | null,
    cache: Map<string, true> = loadingCache,
  ) => {
    const componentState = getComponentState();
    param = param || latestRenderRangeRef.current;
    if (!param) {
      return;
    }
    const { renderStartIndex: startIndex, renderEndIndex: endIndex } = param;
    if (!lazyLoadBatchSize || lazyLoadBatchSize <= 0) {
      return;
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

  useEffect(() => {
    if (lazyLoadBatchSize && lazyLoadBatchSize > 0) {
      return notifyRenderRangeChange.onChange((param: RenderRange | null) => {
        latestRenderRangeRef.current = param;
        loadRange(param, loadingCache);
      });
    }
    return;
  }, [lazyLoadBatchSize, loadingCache]);

  useEffect(() => {
    if (lazyLoadBatchSize && lazyLoadBatchSize > 0) {
      debouncedLoadRange();
    }
    return;
  }, [dataArray]);
}

function lazyLoadRange<T>(
  options: {
    startIndex: number;
    endIndex: number;
    lazyLoadBatchSize: number;
    componentState: DataSourceState<T>;
    componentActions: ComponentStateGeneratedActions<DataSourceState<T>>;
  },
  cache?: Map<string, true>,
) {
  const {
    startIndex,
    endIndex,
    lazyLoadBatchSize,
    componentState,
    componentActions,
  } = options;

  const { dataArray } = componentState;
  const isRowLoaded = (index: number) => dataArray[index].data != null;

  type FnCall = {
    lazyLoadStartIndex: number;
    lazyLoadBatchSize: number;
    groupKeys: any[];
  };

  const perGroupFnCalls = new DeepMap<any, Record<any, FnCall>>();

  // TODO remove this hack when DeepMap supports empty arrays as keys
  const rootGroupKeys = ['_______xxx______'];

  for (let i = startIndex; i <= endIndex; i++) {
    const rowInfo = dataArray[i];
    if (!rowInfo) {
      continue;
    }
    const rowLoaded = rowInfo.data != null;
    const parentGroupKeys = rowInfo.groupKeys ? [...rowInfo.groupKeys] : [];
    if (rowInfo.groupKeys) {
      parentGroupKeys.pop();
    }
    const cacheKeys = parentGroupKeys.length ? parentGroupKeys : rootGroupKeys;
    const indexInGroup = rowInfo.indexInGroup;

    if (!rowLoaded) {
      let fnCalls = perGroupFnCalls.get(cacheKeys);

      const batchStartIndexInGroup =
        Math.floor(indexInGroup / lazyLoadBatchSize) * lazyLoadBatchSize;
      const offset = rowInfo.indexInGroup - batchStartIndexInGroup;
      const absoluteIndexOfBatchStart =
        dataArray[rowInfo.indexInAll - offset].indexInAll;

      const batchStartRowLoaded = isRowLoaded(absoluteIndexOfBatchStart);
      const batchStartRowId = dataArray[absoluteIndexOfBatchStart].id;

      if (batchStartRowLoaded || fnCalls?.[batchStartRowId]) {
        continue;
      }
      const shouldSetFnCalls = !fnCalls;

      fnCalls = fnCalls || {};

      const currentFnCall: FnCall = {
        lazyLoadStartIndex: batchStartIndexInGroup,
        lazyLoadBatchSize,
        groupKeys: parentGroupKeys,
      };

      // const cacheKey = `${parentGroupKeys.join('-')}:${batchStartIndexInGroup}`;
      // const cached = cache ? cache.get(cacheKey) : false;

      if (!fnCalls[batchStartRowId]) {
        fnCalls[batchStartRowId] = currentFnCall;
        // cache?.set(cacheKey, true);
      }

      if (shouldSetFnCalls) {
        perGroupFnCalls.set(cacheKeys, fnCalls);
      }
    }
  }

  let initialPromise: Promise<any> = Promise.resolve(true);

  const allFnCalls: FnCall[] = [];
  perGroupFnCalls.topDownValues().forEach((record) => {
    allFnCalls.push(...Object.values(record));
  });

  allFnCalls.reduce((promise, fnCall: FnCall) => {
    const cacheKey = `${fnCall.groupKeys.join('-')}:${
      fnCall.lazyLoadStartIndex
    }`;

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

    return promise
      .then(() => getRafPromise())
      .then(() => loadData(...args))
      .then(() => {
        requestAnimationFrame(() => {
          cache?.delete(cacheKey);
        });
      });
  }, initialPromise);
}
