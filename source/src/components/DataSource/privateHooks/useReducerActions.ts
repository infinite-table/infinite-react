import { DataSourceAction } from '../types';
import { useMemo } from 'react';
import { getReducerActions } from '../state/reducerActions';

function useReducerActions<T>(dispatch: React.Dispatch<DataSourceAction<any>>) {
  const reducerActions = useMemo(() => getReducerActions<T>(dispatch), [
    dispatch,
  ]);

  return reducerActions;
}

export default useReducerActions;
