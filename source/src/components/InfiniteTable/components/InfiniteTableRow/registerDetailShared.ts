/**
 * Framework-neutral master-detail registration logic, extracted from
 * useRegisterDetail.ts (which keeps the React hooks and delegates here).
 * Used by the Vue detail row sibling as well.
 */
import type {
  DataSourceComponentActions,
  DataSourceContextValue,
  DataSourceMasterDetailContextValue,
  DataSourceState,
} from '../../../DataSource/types';
import type { RowDetailCache } from '../../../DataSource/RowDetailCache';
import {
  DataSourceStateRestoreForDetail,
  getDataSourceStateRestoreForDetails,
  RowDetailCacheEntry,
} from '../../../DataSource/state/getInitialState';
import { once } from '../../../../utils/DeepMap/once';
import type { InfiniteTableRowInfo, InfiniteTableState } from '../../types';

export function restoreDetailStateForRowId<T>(
  rowId: string | number,
  options: {
    masterState: DataSourceState<T>;
    detailContext: DataSourceContextValue<any>;
  },
) {
  const { masterState, detailContext } = options;
  const detailDataSourcesMap = masterState.detailDataSourcesStateToRestore;

  if (detailDataSourcesMap.has(rowId)) {
    // set the state in the detail context
    // to be what we have in the cache
    const currentCachedState = detailDataSourcesMap.get(
      rowId,
    ) as DataSourceStateRestoreForDetail<any>;

    detailContext.assignState(currentCachedState);

    return true;
  }
  return false;
}

export function updateDetailStateToRestoreForRowId<T>(
  rowId: string | number,
  options: {
    detailState: DataSourceState<T>;
    masterActions: DataSourceComponentActions<T>;
    masterState: DataSourceState<T>;
    cacheEntryForRow: RowDetailCacheEntry;
  },
) {
  const { detailState, masterState, masterActions, cacheEntryForRow } = options;

  // when the detail <DataSource/> is unmounted
  // we save the state in the cache
  const cacheMap = new Map(masterState.detailDataSourcesStateToRestore);
  const cacheValue = getDataSourceStateRestoreForDetails<any>(detailState);

  if (!cacheEntryForRow.all) {
    if (!cacheEntryForRow.groupBy) {
      delete cacheValue.groupBy;
    }
    if (!cacheEntryForRow.sortInfo) {
      delete cacheValue.sortInfo;
    }
    if (!cacheEntryForRow.filterValue) {
      delete cacheValue.filterValue;
    }
    if (!cacheEntryForRow.data) {
      delete cacheValue.originalDataArray;
    }
  }
  cacheMap.set(rowId, cacheValue);
  masterActions.detailDataSourcesStateToRestore = cacheMap;
}

export type CurrentRowCache = {
  getRowId: () => string | number;
  add: (value: RowDetailCacheEntry) => void;
  get: () => RowDetailCacheEntry | undefined;
  delete: () => void;
  has: () => boolean;
};

export function createCurrentRowCache(
  rowId: string | number,
  rowDetailsCache: RowDetailCache,
) {
  const cacheCalledByRowDetailRenderer = { current: false };
  const currentRowCache: CurrentRowCache = {
    getRowId: () => rowId,
    add: (value: RowDetailCacheEntry) => {
      cacheCalledByRowDetailRenderer.current = true;
      rowDetailsCache.add(rowId, value);
    },
    get: () => rowDetailsCache.get(rowId),
    delete: () => {
      cacheCalledByRowDetailRenderer.current = true;
      return rowDetailsCache.delete(rowId);
    },
    has: () => rowDetailsCache.has(rowId),
  };

  return { currentRowCache, cacheCalledByRowDetailRenderer };
}

export function createMasterDetailContextValue<T>(options: {
  rowInfo: InfiniteTableRowInfo<T>;
  currentRowCache: CurrentRowCache;
  cacheCalledByRowDetailRenderer: { current: boolean };
  getMasterDataSourceState: () => DataSourceState<T>;
  masterActions: DataSourceComponentActions<T>;
  getMasterState: () => InfiniteTableState<T>;
}): DataSourceMasterDetailContextValue<T> {
  const {
    rowInfo,
    currentRowCache,
    cacheCalledByRowDetailRenderer,
    getMasterDataSourceState,
    masterActions,
    getMasterState,
  } = options;

  const shouldRestoreState =
    getMasterDataSourceState().detailDataSourcesStateToRestore.has(
      rowInfo.id,
    ) && currentRowCache.has();

  const registerDetail = once((detailContext: DataSourceContextValue<any>) => {
    // if the user has not registered the row details in the cache
    // we register it with the default value
    if (!cacheCalledByRowDetailRenderer.current) {
      currentRowCache.add({ all: true });
    }

    // though we added the row to the cache
    // it can be a "nocache" policy, so we'll return a noop
    if (!currentRowCache.has()) {
      // wait a bit when assigning stateReadyAsDetails
      // to allow sortInfo/filterValue and other state props
      // to be set - if we won't, they can trigger a data load,
      // which we want to avoid
      requestAnimationFrame(() => {
        if (detailContext.dataSourceState.destroyedRef.current) {
          return;
        }
        detailContext.dataSourceActions.stateReadyAsDetails = true;
      });
      return;
    }

    restoreDetailStateForRowId(rowInfo.id, {
      masterState: getMasterDataSourceState(),
      detailContext,
    });

    // wait a bit when assigning stateReadyAsDetails
    // to allow sortInfo/filterValue and other state props
    // to be set - if we won't, they can trigger a data load,
    // which we want to avoid
    requestAnimationFrame(() => {
      if (detailContext.dataSourceState.destroyedRef.current) {
        return;
      }
      detailContext.dataSourceActions.stateReadyAsDetails = true;
    });

    detailContext.dataSourceState.onCleanup.onChange(() => {
      const cacheEntryForRow = currentRowCache.get();

      if (!cacheEntryForRow) {
        // if there's no cache description entry for this row
        // we don't need to restore the state
        return;
      }

      updateDetailStateToRestoreForRowId(rowInfo.id, {
        detailState: detailContext.getDataSourceState(),
        masterActions,
        masterState: getMasterDataSourceState(),
        cacheEntryForRow,
      });
    });
  });

  const masterDetailContextValue = {
    registerDetail,
    shouldRestoreState,
  } as DataSourceMasterDetailContextValue<T>;

  masterDetailContextValue.masterRowInfo = rowInfo;
  masterDetailContextValue.getMasterDataSourceState = getMasterDataSourceState;
  masterDetailContextValue.getMasterState = getMasterState;

  return masterDetailContextValue;
}
