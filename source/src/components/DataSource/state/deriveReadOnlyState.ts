import { DataSourceProps, DataSourceReadOnlyState, DataSourceState } from '..';
import { isControlled } from '../../utils/isControlled';
import { normalizeSortInfo } from './normalizeSortInfo';

export function deriveReadOnlyState<T extends any>(
  props: DataSourceProps<T>,
  state: DataSourceState<T>,
): DataSourceReadOnlyState<T> {
  const sortInfo = isControlled('sortInfo', props)
    ? props.sortInfo
    : props.defaultSortInfo ?? null;
  return {
    multiSort: Array.isArray(sortInfo),
    sortInfo: normalizeSortInfo(state.sortInfo),
    primaryKey: props.primaryKey,
    groupDeepMap: undefined,
    postSortDataArray: undefined,
    postGroupDataArray: undefined,
  };
}
