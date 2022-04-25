import { useCallback } from 'react';

import { GroupRowsState } from '../../DataSource';
import { loadData } from '../../DataSource/privateHooks/useLoadData';
import { useDataSourceContextValue } from '../../DataSource/publicHooks/useDataSource';
import { useLoadingGroupRow } from './useLoadingGroupRow';
import { LAZY_ROOT_KEY_FOR_GROUPS } from '../../../utils/groupAndPivot';

export type ToggleGroupRowFn = (groupKeys: any[]) => void;

export function useToggleGroupRow<T>() {
  const { getState: getDataSourceState, componentActions: dataSourceActions } =
    useDataSourceContextValue<T>();

  const setGroupRowLoading = useLoadingGroupRow();

  const toggleGroupRow = useCallback<ToggleGroupRowFn>((groupKeys: any[]) => {
    const state = getDataSourceState();
    const newState = new GroupRowsState(state.groupRowsState);
    newState.toggleGroupRow(groupKeys);

    dataSourceActions.groupRowsState = newState;
    if (state.lazyLoad && newState.isGroupRowExpanded(groupKeys)) {
      // set loading state only if lazy load is enabled and group data was not loaded yet
      const groupKeysWithRoot = [
        LAZY_ROOT_KEY_FOR_GROUPS,
        ...(groupKeys || []),
      ];
      const alreadyLoadedGroup =
        state.originalLazyGroupData.has(groupKeysWithRoot);
      if (!alreadyLoadedGroup) {
        setGroupRowLoading(groupKeys, true);
      }

      loadData(state.data, state, dataSourceActions, {
        groupKeys,
      });
    }
  }, []);

  return toggleGroupRow;
}
