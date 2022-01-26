import { useCallback } from 'react';
import { GroupRowsState } from '../../DataSource';
import { loadData } from '../../DataSource/privateHooks/useLoadData';
import { useDataSourceContextValue } from '../../DataSource/publicHooks/useDataSource';

export type ToggleGrouRowFn = (groupKeys: any[]) => void;

export function useToggleGroupRow<T>() {
  const { getState: getDataSourceState, componentActions: dataSourceActions } =
    useDataSourceContextValue<T>();

  const toggleGroupRow = useCallback<ToggleGrouRowFn>((groupKeys: any[]) => {
    const state = getDataSourceState();
    const newState = new GroupRowsState(state.groupRowsState);
    newState.toggleGroupRow(groupKeys);

    dataSourceActions.groupRowsState = newState;
    if (state.fullLazyLoad && newState.isGroupRowExpanded(groupKeys)) {
      console.log(groupKeys, '!!!');

      loadData(state.data, state, dataSourceActions, {
        groupKeys,
      });
      // dataSourceActions.groupKeysForDataParams = groupKeys;
    }
  }, []);

  return toggleGroupRow;
}
