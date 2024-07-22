import {
  DataSourceComponentActions,
  DataSourceContextValue,
  DataSourceMasterDetailContextValue,
  DataSourceState,
  RowDetailCache,
} from '../../../../components/DataSource';
import { useDataSourceContextValue } from '../../../../components/DataSource/publicHooks/useDataSourceState';
import { useMemo, useRef } from 'react';

import {
  DataSourceStateRestoreForDetail,
  getDataSourceStateRestoreForDetails,
  RowDetailCacheEntry,
} from '../../../../components/DataSource/state/getInitialState';
import { InfiniteTableRowInfo } from '../../types';
import { once } from '../../../../utils/DeepMap/once';
import { useInfiniteTable } from '../../hooks/useInfiniteTable';

type UseRegisterDetailProps<T> = {
  rowDetailsCache: RowDetailCache;
  rowInfo: InfiniteTableRowInfo<T>;
};

function restoreDetailStateForRowId<T>(
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

function updateDetailStateToRestoreForRowId<T>(
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

function useCurrentRowCache(
  rowId: string | number,
  rowDetailsCache: RowDetailCache,
) {
  const cacheCalledByRowDetailRenderer = useRef(false);
  const currentRowCache = useMemo(() => {
    return {
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
  }, [rowDetailsCache, rowId]);

  return { currentRowCache, cacheCalledByRowDetailRenderer };
}

export function useRegisterDetail<T>(props: UseRegisterDetailProps<T>) {
  const { rowDetailsCache, rowInfo } = props;
  const {
    getState: getMasterDataSourceState,
    componentActions: masterActions,
  } = useDataSourceContextValue<T>();

  const { getState: getMasterState } = useInfiniteTable<T>();

  const { currentRowCache, cacheCalledByRowDetailRenderer } =
    useCurrentRowCache(rowInfo.id, rowDetailsCache);

  const masterDetailContextValue: DataSourceMasterDetailContextValue<T> =
    useMemo(() => {
      const shouldRestoreState =
        getMasterDataSourceState().detailDataSourcesStateToRestore.has(
          rowInfo.id,
        ) && currentRowCache.has();

      const registerDetail = once(
        (detailContext: DataSourceContextValue<any>) => {
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
              if (detailContext.componentState.destroyedRef.current) {
                return;
              }
              detailContext.componentActions.stateReadyAsDetails = true;
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
            if (detailContext.componentState.destroyedRef.current) {
              return;
            }
            detailContext.componentActions.stateReadyAsDetails = true;
          });

          detailContext.componentState.onCleanup.onChange(() => {
            const cacheEntryForRow = currentRowCache.get();

            if (!cacheEntryForRow) {
              // if there's no cache description entry for this row
              // we don't need to restore the state
              return;
            }

            updateDetailStateToRestoreForRowId(rowInfo.id, {
              detailState: detailContext.getState(),
              masterActions,
              masterState: getMasterDataSourceState(),
              cacheEntryForRow,
            });
          });
        },
      );

      return {
        registerDetail,
        shouldRestoreState,
      } as DataSourceMasterDetailContextValue<T>;
    }, [rowInfo.id, currentRowCache]);

  masterDetailContextValue.masterRowInfo = rowInfo;
  masterDetailContextValue.getMasterDataSourceState = getMasterDataSourceState;
  masterDetailContextValue.getMasterState = getMasterState;

  return { masterDetailContextValue, currentRowCache };
}
