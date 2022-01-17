import { InfiniteTableRowInfo, Scrollbars } from '../../InfiniteTable';
import { normalizeSortInfo } from './normalizeSortInfo';
import {
  DataSourceMappedState,
  DataSourceProps,
  DataSourceDerivedState,
  DataSourceSetupState,
  DataSourceState,
} from '../types';
import { GroupRowsState } from '../GroupRowsState';
import {
  ComponentInterceptedActions,
  ForwardPropsToStateFnResult,
} from '../../hooks/useComponentState';
import { isControlledValue } from '../../utils/isControlledValue';

import { buildSubscriptionCallback } from '../../utils/buildSubscriptionCallback';
import { buildDataSourceDataParams } from '../privateHooks/useLoadData';
import { discardCallsWithEqualArg } from '../../utils/discardCallsWithEqualArg';
import { DataSourceDataParams } from '..';

export function initSetupState<T>(): DataSourceSetupState<T> {
  const now = Date.now();
  const originalDataArray: T[] = [];
  const dataArray: InfiniteTableRowInfo<T>[] = [];

  return {
    dataParams: undefined,
    notifyScrollbarsChange: buildSubscriptionCallback<Scrollbars>(),
    pivotTotalColumnPosition: 'end',
    originalDataArray,
    scrollBottomId: Symbol('scrollBottomId'),
    showSeparatePivotColumnForSingleAggregation: false,

    propsCache: new Map<keyof DataSourceProps<T>, WeakMap<any, any>>([
      ['sortInfo', new WeakMap()],
    ]),

    pivotColumns: undefined,
    pivotColumnGroups: undefined,
    dataArray,

    updatedAt: now,
    groupedAt: 0,
    sortedAt: 0,
    reducedAt: now,
    generateGroupRows: true,
    groupDeepMap: undefined,
    postSortDataArray: undefined,
    postGroupDataArray: undefined,
    lastSortDataArray: undefined,
    lastGroupDataArray: undefined,
  };
}

function getCompareObject<T>(
  dataParams: DataSourceDataParams<T>,
): Partial<DataSourceDataParams<T>> {
  const obj: Partial<DataSourceDataParams<T>> = {
    ...dataParams,
  };

  delete obj.originalDataArray;

  return obj;
}
export const forwardProps = <T>(
  setupState: DataSourceSetupState<T>,
): ForwardPropsToStateFnResult<
  DataSourceProps<T>,
  DataSourceMappedState<T>
> => {
  return {
    onDataParamsChange: (fn) =>
      fn ? discardCallsWithEqualArg(fn, 100, getCompareObject) : undefined,
    data: 1,
    pivotBy: 1,
    primaryKey: 1,
    livePagination: 1,
    aggregationReducers: 1,

    loading: (loading) => loading ?? false,
    sortInfo: (sortInfo) =>
      normalizeSortInfo(sortInfo, setupState.propsCache.get('sortInfo')),
    groupBy: (groupBy) => groupBy ?? [],
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
  const { props, state } = params;

  const controlledSort = isControlledValue(props.sortInfo);

  const result: DataSourceDerivedState<T> = {
    controlledSort,
    multiSort: Array.isArray(
      controlledSort ? props.sortInfo : props.defaultSortInfo,
    ),
  };

  if (props.livePagination) {
    const livePaginationCursor =
      typeof props.livePaginationCursor === 'function'
        ? props.livePaginationCursor({
            array: state.originalDataArray,
            length: state.originalDataArray.length,
            lastItem:
              state.originalDataArray[state.originalDataArray.length - 1],
          })
        : props.livePaginationCursor;

    result.livePaginationCursor = livePaginationCursor;
  }

  return result;
}

export function getInterceptActions<T>(): ComponentInterceptedActions<
  DataSourceState<T>
  // DataSourceProps<T>
> {
  return {
    sortInfo: (sortInfo, { actions, state }) => {
      const dataParams = buildDataSourceDataParams(state);
      dataParams.sortInfo = sortInfo;

      actions.dataParams = dataParams;
    },
  };
}
