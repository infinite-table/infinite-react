import { useCallback } from 'react';

import { DeepMap } from '../../../utils/DeepMap';
import { LAZY_ROOT_KEY_FOR_GROUPS } from '../../../utils/groupAndPivot';
import {
  DataSourceState,
  GroupRowsState,
  useDataSourceSelector,
} from '../../DataSource';
import { getChangeDetect } from '../../DataSource/privateHooks/getChangeDetect';
import { loadData } from '../../DataSource/privateHooks/useLoadData';

export type ToggleGroupRowFn = (groupKeys: any[]) => void;

export function useToggleGroupRow<T>() {
  const { getDataSourceState, dataSourceActions, getDataSourceMasterContext } =
    useDataSourceSelector((ctx) => {
      return {
        getDataSourceState: ctx.getDataSourceState as () => DataSourceState<T>,
        dataSourceActions: ctx.dataSourceActions,
        getDataSourceMasterContext: ctx.getDataSourceMasterContext,
      };
    });

  const toggleGroupRow = useCallback<ToggleGroupRowFn>((groupKeys: any[]) => {
    // todo this  is duplicated in imperative api

    const state = getDataSourceState();
    const newState = new GroupRowsState(state.groupRowsState);
    newState.toggleGroupRow(groupKeys);

    dataSourceActions.groupRowsState = newState;
    if (state.lazyLoad) {
      const dataKeys = [LAZY_ROOT_KEY_FOR_GROUPS, ...groupKeys];
      const currentData = state.originalLazyGroupData.get(dataKeys);

      if (newState.isGroupRowExpanded(groupKeys)) {
        if (!currentData?.cache) {
          loadData(
            state.data,
            state,
            dataSourceActions,
            {
              groupKeys,
            },
            getDataSourceMasterContext(),
          );
        }
      } else {
        if (!currentData?.cache) {
          const keysToDelete =
            state.lazyLoadCacheOfLoadedBatches.getKeysStartingWith(groupKeys);
          keysToDelete.forEach((keys) => {
            state.lazyLoadCacheOfLoadedBatches.delete(keys);
          });

          dataSourceActions.lazyLoadCacheOfLoadedBatches = DeepMap.clone(
            state.lazyLoadCacheOfLoadedBatches,
          );

          state.originalLazyGroupData.delete(dataKeys);

          dataSourceActions.originalLazyGroupDataChangeDetect =
            getChangeDetect();
        }
      }
    }
  }, []);

  return toggleGroupRow;
}
