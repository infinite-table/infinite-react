import { useProperty } from '../../hooks/useProperty';

import type {
  DataSourceProps,
  DataSourceState,
  DataSourceAction,
  DataSourceSortInfo,
  DataSourceSingleSortInfo,
} from '../types';

import type { Setter } from '../../types/Setter';
import useReducerActions from '../privateHooks/useReducerActions';

export const normalizeSortInfo = <T>(
  sortInfo: DataSourceSortInfo<T>,
): DataSourceSingleSortInfo<T>[] => {
  sortInfo = sortInfo ?? [];
  return Array.isArray(sortInfo) ? sortInfo : [sortInfo];
};
function useSortInfoProp<T>({
  props,
  state,
  dispatch,
}: {
  props: DataSourceProps<T>;
  state: DataSourceState<T>;
  dispatch: React.Dispatch<DataSourceAction<any>>;
}) {
  const reducerActions = useReducerActions<T>(dispatch);

  const [sortInfo, setSortInfo] = useProperty('sortInfo', props, {
    controlledToState: true,
    normalize: normalizeSortInfo,
    fromState: () => state.sortInfo,
    setState: (sortInfo) => reducerActions.setSortInfo(sortInfo),
  });

  return [sortInfo, setSortInfo] as [
    DataSourceSingleSortInfo<T>[],
    Setter<DataSourceSortInfo<T>>,
  ];
}

export default useSortInfoProp;
