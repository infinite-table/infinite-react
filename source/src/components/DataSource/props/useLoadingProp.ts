import { useProperty } from '../../hooks/useProperty';

import type {
  DataSourceProps,
  DataSourceState,
  DataSourceAction,
} from '../types';

import { Setter } from '../../types/Setter';

import useReducerActions from '../privateHooks/useReducerActions';

function useLoadingProp<T>({
  props,
  state,
  dispatch,
}: {
  props: DataSourceProps<T>;
  state: DataSourceState<T>;
  dispatch: React.Dispatch<DataSourceAction<any>>;
}) {
  const reducerActions = useReducerActions<T>(dispatch);

  const [loading, setLoading] = useProperty('loading', props, {
    fromState: () => state.loading,
    normalize: (loading?: boolean) => !!loading,
    setState: (loading: boolean | undefined) =>
      reducerActions.setLoading(!!loading),
  });

  return [!!loading, setLoading] as [boolean, Setter<boolean>];
}

export default useLoadingProp;
