import { DataSourceProps, DataSourceReadOnlyState, DataSourceState } from '..';

export function deriveReadOnlyState<T extends any>(
  props: DataSourceProps<T>,
  _state: DataSourceState<T>,
): DataSourceReadOnlyState<T> {
  return {
    primaryKey: props.primaryKey,
    groupDeepMap: undefined,
    postSortDataArray: undefined,
    postGroupDataArray: undefined,
  };
}
