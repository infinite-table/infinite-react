import { InfiniteTableRowInfo, Scrollbars } from '../../InfiniteTable';
import { normalizeSortInfo } from './normalizeSortInfo';
import {
  DataSourceMappedState,
  DataSourceProps,
  DataSourceDerivedState,
  DataSourceSetupState,
  DataSourceState,
  LazyGroupDataItem,
  LazyGroupDataDeepMap,
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
import { DataSourceComponentActions, DataSourceDataParams } from '..';
import { dbg } from '../../../utils/debug';
import { shallowEqualObjects } from '../../../utils/shallowEqualObjects';
import { DeepMap } from '../../../utils/DeepMap';

export const defaultCursorId = Symbol('cursorId');

const debug = dbg('DataSource:dataParams');

export function initSetupState<T>(): DataSourceSetupState<T> {
  const now = Date.now();
  const originalDataArray: T[] = [];
  const dataArray: InfiniteTableRowInfo<T>[] = [];

  const originalLazyGroupData: LazyGroupDataDeepMap<T> = new DeepMap<
    string,
    LazyGroupDataItem<T>[]
  >();

  return {
    dataParams: undefined,
    notifyScrollbarsChange: buildSubscriptionCallback<Scrollbars>(),
    pivotTotalColumnPosition: 'end',
    originalLazyGroupData,
    originalDataArray,
    cursorId: defaultCursorId,
    showSeparatePivotColumnForSingleAggregation: false,

    propsCache: new Map<keyof DataSourceProps<T>, WeakMap<any, any>>([
      ['sortInfo', new WeakMap()],
    ]),

    pivotMappings: undefined,

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

function getCompareObjectForDataParams<T>(
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
      fn
        ? discardCallsWithEqualArg(fn, 100, getCompareObjectForDataParams)
        : undefined,
    fullLazyLoad: 1,
    data: 1,
    pivotBy: 1,
    primaryKey: 1,
    livePagination: 1,
    lazyLoadBatchSize: (lazyLoadBatchSize) => lazyLoadBatchSize ?? 50,
    aggregationReducers: 1,
    collapseGroupRowsOnDataFunctionChange: (
      collapseGroupRowsOnDataFunctionChange,
    ) => collapseGroupRowsOnDataFunctionChange ?? true,

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

function getLivePaginationCursorValue<T>(
  livePaginationCursorProp: DataSourceProps<T>['livePaginationCursor'],
  state: DataSourceState<T>,
) {
  const livePaginationCursor =
    typeof livePaginationCursorProp === 'function'
      ? livePaginationCursorProp({
          array: state.originalDataArray,
          length: state.originalDataArray.length,
          lastItem: state.originalDataArray[state.originalDataArray.length - 1],
        })
      : livePaginationCursorProp;

  return livePaginationCursor;
}

export function mapPropsToState<T extends any>(params: {
  props: DataSourceProps<T>;

  state: DataSourceState<T>;
  oldState: DataSourceState<T> | null;
}): DataSourceDerivedState<T> {
  const { props, state, oldState } = params;

  const controlledSort = isControlledValue(props.sortInfo);

  if (oldState && oldState.data != state.data) {
    state.originalLazyGroupData = new DeepMap<string, LazyGroupDataItem<T>[]>();

    if (
      typeof state.data === 'function' &&
      state.collapseGroupRowsOnDataFunctionChange
    ) {
      state.groupRowsState = new GroupRowsState({
        collapsedRows: [],
        expandedRows: true,
      });
    }
  }

  const result: DataSourceDerivedState<T> = {
    controlledSort,
    multiSort: Array.isArray(
      controlledSort ? props.sortInfo : props.defaultSortInfo,
    ),
  };

  if (props.livePagination) {
    const dataArrayChanged =
      !oldState || oldState.originalDataArray !== state.originalDataArray;

    const livePaginationCursor =
      typeof props.livePaginationCursor === 'function'
        ? dataArrayChanged
          ? getLivePaginationCursorValue(props.livePaginationCursor, state)
          : state.livePaginationCursor
        : props.livePaginationCursor;

    result.livePaginationCursor = livePaginationCursor;
  }

  return result;
}

export function onPropChange<T>(
  params: { name: keyof T; newValue: any },
  actions: DataSourceComponentActions<T>,
) {
  const { name, newValue } = params;

  if (name === 'data' && typeof newValue === 'function') {
  }
}

export function getInterceptActions<T>(): ComponentInterceptedActions<
  DataSourceState<T>
  // DataSourceProps<T>
> {
  return {
    sortInfo: (sortInfo, { actions, state }) => {
      const dataParams = buildDataSourceDataParams(state, {
        sortInfo,
        livePaginationCursor: null,
      });

      actions.dataParams = dataParams;

      if (state.livePagination) {
        // #waitforupdate do it on raf, since it also does actions.dataParams assignment
        // so we allow dataParams to be updated (the call 3 lines above) in state

        requestAnimationFrame(() => {
          actions.livePaginationCursor = null;
        });
      }
    },
    groupBy: (groupBy, { actions, state }) => {
      const dataParams = buildDataSourceDataParams(state, {
        groupBy,
        livePaginationCursor: null,
      });

      actions.dataParams = dataParams;

      if (state.livePagination) {
        // see #waitforupdate above

        requestAnimationFrame(() => {
          actions.livePaginationCursor = null;
        });
      }
    },
    pivotBy: (pivotBy, { actions, state }) => {
      const dataParams = buildDataSourceDataParams(state, {
        pivotBy,
        livePaginationCursor: null,
      });

      actions.dataParams = dataParams;

      if (state.livePagination) {
        // see #waitforupdate above

        requestAnimationFrame(() => {
          actions.livePaginationCursor = null;
        });
      }
    },
    cursorId: (cursorId, { actions, state }) => {
      const dataParams = buildDataSourceDataParams(state, {
        cursorId,
      });
      actions.dataParams = dataParams;
    },
    livePaginationCursor: (livePaginationCursor, { actions, state }) => {
      const dataParams = buildDataSourceDataParams(state, {
        livePaginationCursor,
      });

      actions.dataParams = dataParams;
    },
    dataParams: (dataParams, { state }) => {
      if (
        shallowEqualObjects(
          dataParams!,
          state.dataParams!,
          new Set<keyof DataSourceDataParams<T>>([
            'changes',
            'originalDataArray',
          ]),
        )
      ) {
        return false;
      }

      debug(
        'onDataParamsChange triggered because the following values have changed',
        dataParams?.changes,
      );

      return true;
    },
  };
}
