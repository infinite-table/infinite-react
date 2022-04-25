import { useCallback } from 'react';
import { useDataSourceContextValue } from '../../DataSource/publicHooks/useDataSource';
import { GroupRowsLoadingState } from '../../DataSource/GroupRowsLoadingState';
import { DataSourceState } from '../../DataSource';
import { ComponentStateGeneratedActions } from '../../hooks/useComponentState/types';

export type LoadingGroupRowFn = (groupKeys: any[], isLoading: boolean) => void;

export function useLoadingGroupRow<T>() {
  const { getState: getDataSourceState, componentActions: dataSourceActions } =
    useDataSourceContextValue<T>();

  const setGroupRowLoading = useCallback<LoadingGroupRowFn>(
    (groupKeys: any[], isLoading: boolean) => {
      const state = getDataSourceState();
      updateGroupRowLoadingState(
        groupKeys,
        isLoading,
        state,
        dataSourceActions,
      );
    },
    [],
  );

  return setGroupRowLoading;
}

export const updateGroupRowLoadingState = (
  groupKeys: any[],
  isLoading: boolean,
  componentState: DataSourceState<any>,
  dataSourceActions: ComponentStateGeneratedActions<DataSourceState<any>>,
) => {
  const newState = new GroupRowsLoadingState(
    componentState.groupRowsLoadingState,
  );
  newState.setGroupRowLoading(groupKeys, isLoading);

  dataSourceActions.groupRowsLoadingState = newState;
};
