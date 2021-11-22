import { InfiniteTableRowInfo } from '../../InfiniteTable';
import { normalizeSortInfo } from './normalizeSortInfo';
import {
  DataSourceMappedState,
  DataSourceProps,
  DataSourceDerivedState,
  DataSourceSetupState,
  DataSourceState,
} from '../types';
import { GroupRowsState } from '../GroupRowsState';
import { ForwardPropsToStateFnResult } from '../../hooks/useComponentState';

export function initSetupState<T>(): DataSourceSetupState<T> {
  const now = Date.now();
  const originalDataArray: T[] = [];
  const dataArray: InfiniteTableRowInfo<T>[] = [];
  return {
    pivotTotalColumnPosition: 'end',
    originalDataArray,

    pivotColumns: undefined,
    pivotColumnGroups: undefined,
    dataArray,

    updatedAt: now,
    groupedAt: 0,
    sortedAt: 0,
    reducedAt: now,
    generateGroupRows: true,
    aggregationReducers: undefined,
    groupDeepMap: undefined,
    postSortDataArray: undefined,
    postGroupDataArray: undefined,
    lastSortDataArray: undefined,
    lastGroupDataArray: undefined,
  };
}
export const forwardProps = <T>(): ForwardPropsToStateFnResult<
  DataSourceProps<T>,
  DataSourceMappedState<T>
> => {
  return {
    remoteCount: 1,
    data: 1,
    pivotBy: 1,
    primaryKey: 1,
    loading: (loading) => loading ?? false,
    sortInfo: (sortInfo) => normalizeSortInfo(sortInfo),
    groupRowsBy: (groupRowsBy) => groupRowsBy ?? [],
    groupRowsState: (groupRowsState) => {
      return (
        groupRowsState ||
        new GroupRowsState({
          expandedRows: true,
          collapsedRows: [],
        })
      );
    },
  };
};

export function mapPropsToState<T extends any>(params: {
  props: DataSourceProps<T>;
  state: DataSourceState<T>;
}): DataSourceDerivedState<T> {
  const { props } = params;

  return {
    multiSort: Array.isArray(props.sortInfo ?? props.defaultSortInfo),
  };
}
