import { useCallback } from 'react';
import { GroupRowsState } from '../../DataSource';
import { useDataSourceContextValue } from '../../DataSource/publicHooks/useDataSource';

export type ToggleGrouRowFn = (groupKeys: any[]) => void;

export function useToggleGroupRow<T>() {
  const { getState: getDataSourceState, componentActions: dataSourceActions } =
    useDataSourceContextValue<T>();

  const toggleGroupRow = useCallback<ToggleGrouRowFn>((groupKeys: any[]) => {
    const newState = new GroupRowsState(getDataSourceState().groupRowsState);
    newState.toggleGroupRow(groupKeys);

    dataSourceActions.groupRowsState = newState;
  }, []);

  return toggleGroupRow;
}
