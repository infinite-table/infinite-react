import { useProperty } from '../../hooks/useProperty';

import type {
  DataSourceProps,
  DataSourceState,
  DataSourceAction,
  DataSourceGroupBy,
} from '../types';

import type { Setter } from '../../types/Setter';
import useReducerActions from '../privateHooks/useReducerActions';

function useGroupByProp<T>({
  props,
  state,
  dispatch,
}: {
  props: DataSourceProps<T>;
  state: DataSourceState<T>;
  dispatch: React.Dispatch<DataSourceAction<any>>;
}) {
  const reducerActions = useReducerActions<T>(dispatch);

  const [groupBy, setGroupBy] = useProperty('groupBy', props, {
    controlledToState: true,
    fromState: () => state.groupBy,
    setState: (groupBy) => reducerActions.setGroupBy(groupBy),
  });

  return [groupBy, setGroupBy] as [
    DataSourceGroupBy<T>,
    Setter<DataSourceGroupBy<T>>,
  ];
}

export default useGroupByProp;
