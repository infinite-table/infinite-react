import { InfiniteTableEnhancedData } from '../../InfiniteTable';
import { isControlled } from '../../utils/isControlled';
import { normalizeSortInfo } from './normalizeSortInfo';
import {
  DataSourceProps,
  DataSourceReadOnlyState,
  DataSourceSortInfo,
  DataSourceState,
} from '../types';
import { GroupRowsState } from '../GroupRowsState';

export function getInitialState<T>(params: {
  props: DataSourceProps<T>;
}): DataSourceState<T> {
  const { props: initialProps } = params;
  const dataArray: InfiniteTableEnhancedData<T>[] = [];
  const originalDataArray: T[] = [];
  const sortInfo: DataSourceSortInfo<T> = normalizeSortInfo(
    isControlled('sortInfo', initialProps)
      ? initialProps.sortInfo
      : initialProps.defaultSortInfo,
  );

  const groupRowsState =
    initialProps.groupRowsState ||
    initialProps.defaultGroupRowsState ||
    new GroupRowsState({
      expandedRows: true,
      collapsedRows: [],
    });

  const now = Date.now();

  return {
    data: initialProps.data,
    loading: initialProps.loading ?? initialProps.defaultLoading ?? false,
    dataArray,
    originalDataArray,
    sortInfo,
    // postSortDataArray,
    // postGroupDataArray,
    groupRowsState,
    updatedAt: now,
    groupedAt: 0,
    sortedAt: 0,
    reducedAt: now,

    pivotColumns: undefined,
    pivotColumnGroups: undefined,
    groupRowsBy: isControlled('groupRowsBy', initialProps)
      ? initialProps.groupRowsBy ?? []
      : initialProps.defaultGroupRowsBy ?? [],
    pivotBy: isControlled('pivotBy', initialProps)
      ? initialProps.pivotBy ?? []
      : initialProps.defaultPivotBy,

    aggregationReducers: undefined,
    pivotTotalColumnPosition: 'end',
  };
}

export function deriveReadOnlyState<T extends any>(params: {
  props: DataSourceProps<T>;
  state: DataSourceState<T>;
  updated: Partial<DataSourceState<T>> | null;
}): DataSourceReadOnlyState<T> {
  const { props, state } = params;

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
