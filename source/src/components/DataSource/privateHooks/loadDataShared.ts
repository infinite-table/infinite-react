import type {
  DataSourceMasterDetailContextValue,
  LazyGroupDataItem,
  LazyRowInfoGroup,
} from '..';
import { LAZY_ROOT_KEY_FOR_GROUPS } from '../../../utils/groupAndPivot';
import { ComponentStateGeneratedActions } from '../../hooks/useComponentState/types';
import { assignExcept } from '../../InfiniteTable/utils/assignFiltered';
import { cleanupEmptyFilterValues } from '../state/reducer';
import {
  DataSourceDataParams,
  DataSourceData,
  DataSourceState,
  DataSourceRemoteData,
  DataSourceDataParamsChanges,
} from '../types';

import { getChangeDetect } from './getChangeDetect';
import { DeepMap } from '../../../utils/DeepMap';
import { raf } from '../../../utils/raf';

/**
 * Framework-neutral data-loading logic, extracted from useLoadData.ts (which
 * keeps the React hooks and re-exports these). Used directly by the Vue
 * DataSource sibling.
 */

const CACHE_DEFAULT = true;

const SKIP_DATA_CHANGES_KEYS = {
  originalDataArray: true,
  changes: true,
};

const DATA_CHANGES_COMPARE_FUNCTIONS: Record<
  string,
  (a: any, b: any) => boolean
> = {
  filterValue: (a: any, b: any) => {
    return JSON.stringify(a) === JSON.stringify(b);
  },
  groupRowsState: (a: any, b: any) => {
    return JSON.stringify(a) === JSON.stringify(b);
  },
};

type DataSourceStateForDataParams<T> = Pick<
  DataSourceState<T>,
  | 'multiSort'
  | 'sortInfo'
  | 'originalDataArray'
  | 'refetchKey'
  | 'groupBy'
  | 'pivotBy'
  | 'filterValue'
  | 'aggregationReducers'
  | 'livePagination'
  | 'livePaginationCursor'
  | 'cursorId'
  | 'lazyLoad'
  | 'lazyLoadBatchSize'
  | 'groupRowsState'
  | 'dataParams'
  | 'filterMode'
  | 'filterTypes'
>;

export function buildDataSourceDataParams<T>(
  componentState: DataSourceStateForDataParams<T>,
  overrides?: Partial<DataSourceDataParams<T>>,
  masterContext?: {
    masterRowInfo: DataSourceMasterDetailContextValue<any>['masterRowInfo'];
  },
): DataSourceDataParams<T> {
  const sortInfo = componentState.multiSort
    ? componentState.sortInfo
    : componentState.sortInfo?.[0] ?? null;

  const dataSourceParams: DataSourceDataParams<T> = {
    append: false,
    originalDataArray: componentState.originalDataArray,
    sortInfo,
    refetchKey: componentState.refetchKey,
    groupBy: componentState.groupBy,
    pivotBy: componentState.pivotBy,
    filterValue: componentState.filterValue,
    aggregationReducers: componentState.aggregationReducers,
  };

  if (masterContext) {
    dataSourceParams.masterRowInfo = masterContext.masterRowInfo;
  }

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
    const newFilterValue = computeFilterValueForRemote(
      dataSourceParams.filterValue,
      {
        filterMode: componentState.filterMode,
        filterTypes: componentState.filterTypes,
      },
    );
    if (newFilterValue && newFilterValue.length) {
      dataSourceParams.filterValue = newFilterValue;
    }
  }

  const changes: DataSourceDataParamsChanges<T> = {};

  const oldDataSourceParams: Partial<DataSourceDataParams<T>> =
    componentState.dataParams || {};

  for (const k in dataSourceParams) {
    //@ts-ignore
    if (dataSourceParams.hasOwnProperty(k) && !SKIP_DATA_CHANGES_KEYS[k]) {
      const key = k as keyof DataSourceDataParams<T>;
      const compareFn = DATA_CHANGES_COMPARE_FUNCTIONS[key];

      const a = dataSourceParams[key];
      const b = oldDataSourceParams[key];
      const equals = compareFn ? compareFn(a, b) : a === b;

      if (!equals) {
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
  masterContext?: DataSourceMasterDetailContextValue<any> | undefined,
) {
  const dataParams = buildDataSourceDataParams(
    componentState,
    overrides,
    masterContext,
  );
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

  if (
    dataIsPromise &&
    (!componentState.lazyLoad || (componentState.lazyLoad && !append))
  ) {
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
            cache: remoteData.cache ?? CACHE_DEFAULT,
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

    if (
      dataIsPromise &&
      (!componentState.lazyLoad || (componentState.lazyLoad && !append))
    ) {
      // if on the same raf as the actions.loading = true above
      // this could fail if #samevaluecheckfailswhennotflushed is present
      actions.loading = false;
    }
  });
}

export function computeFilterValueForRemote<T>(
  filterValue: DataSourceState<T>['filterValue'],
  {
    filterTypes,
    filterMode,
  }: {
    filterTypes: DataSourceState<T>['filterTypes'];
    filterMode: DataSourceState<T>['filterMode'];
  },
) {
  if (filterMode === 'local') {
    return filterValue;
  }

  return (cleanupEmptyFilterValues(filterValue, filterTypes) || []).map(
    (filterValue) => {
      const value = { ...filterValue };
      // delete it as it's not serializable
      // and we want to make it easier for developers to send this filterValue
      // as is on the server
      delete value.valueGetter;

      return value;
    },
  );
}

const getRafPromise = () =>
  new Promise((resolve) => {
    raf(resolve);
  });

export function getDetailReady(
  masterContext: DataSourceMasterDetailContextValue | undefined,
  getDataSourceState: () => DataSourceState<any>,
) {
  const isDetail = !!masterContext;

  const { stateReadyAsDetails } = getDataSourceState();

  const isDetailReady = isDetail
    ? masterContext.shouldRestoreState
      ? stateReadyAsDetails
      : true
    : true;

  return {
    isDetail,
    isDetailReady,
  };
}

export function lazyLoadRange<T>(
  options: {
    startIndex: number;
    endIndex: number;
    lazyLoadBatchSize: number | undefined;
    componentState: DataSourceState<T>;
    componentActions: ComponentStateGeneratedActions<DataSourceState<T>>;
    dismissLoadedRows?: boolean;
  },
  cache?: DeepMap<string, true>,
) {
  const {
    startIndex,
    endIndex,
    lazyLoadBatchSize,
    componentState,
    componentActions,
    dismissLoadedRows,
  } = options;

  const { dataArray } = componentState;

  const isRowLoaded = dismissLoadedRows
    ? () => false
    : (index: number) => {
        const rowInfo = dataArray[index];

        return rowInfo.data != null;
      };

  type FnCall = {
    lazyLoadStartIndex: number;
    lazyLoadBatchSize: number | undefined;
    groupKeys: any[];
    append: boolean;
  };

  const append = !dismissLoadedRows;

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
        append,
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
        append,
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
    // TODO should replace raf with setTimeout
    return promise.then(() => getRafPromise()).then(() => loadData(...args));
  }, initialPromise);
}
