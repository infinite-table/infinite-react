import * as React from 'react';
import { MultisortInfo } from '../../utils/multisort';
import { DeepMap } from '../../utils/DeepMap';
import {
  DeepMapGroupValueType,
  GroupBy,
  GroupKeyType,
  PivotBy,
} from '../../utils/groupAndPivot';

import {
  InfiniteTableColumn,
  InfiniteTableColumnGroup,
  InfiniteTableRowInfo,
  Scrollbars,
} from '../InfiniteTable';
import { ComponentStateActions } from '../hooks/useComponentState';
import { GroupRowsState } from './GroupRowsState';
import { InfiniteTablePropPivotTotalColumnPosition } from '../InfiniteTable/types/InfiniteTableState';
import { NonUndefined } from '../types/NonUndefined';
import { SubscriptionCallback } from '../types/SubscriptionCallback';

export interface DataSourceDataParams<T> {
  originalDataArray: T[];
  sortInfo?: DataSourceSortInfo<T>;
  groupBy?: DataSourcePropGroupBy<T>;
  pivotBy?: DataSourcePropPivotBy<T>;

  livePaginationCursor?: DataSourceLivePaginationCursorValue;
}

export type DataSourceSingleSortInfo<T> = MultisortInfo<T> & {
  field?: keyof T;
  id?: string;
};
export type DataSourceGroupBy<T> = GroupBy<T, any>;
export type DataSourcePivotBy<T> = PivotBy<T, any>;

export type DataSourceSortInfo<T> =
  | null
  | DataSourceSingleSortInfo<T>
  | DataSourceSingleSortInfo<T>[];

export type DataSourceRemoteData<T> = {
  data: T[];
  livePaginationCursor?: DataSourceLivePaginationCursorValue;
};

export type DataSourceData<T> =
  | T[]
  | DataSourceRemoteData<T>
  | Promise<T[] | DataSourceRemoteData<T>>
  | ((
      dataInfo: DataSourceDataParams<T>,
    ) => T[] | Promise<T[] | DataSourceRemoteData<T>>);

export type DataSourceGroupRowsList<KeyType> = true | KeyType[][];

export type DataSourceExpandedAndCollapsedGroupRows<KeyType> = {
  expandedRows: DataSourceGroupRowsList<KeyType>;
  collapsedRows: DataSourceGroupRowsList<KeyType>;
};

export type DataSourcePropGroupBy<T> = DataSourceGroupBy<T>[];
export type DataSourcePropPivotBy<T> = DataSourcePivotBy<T>[];

export interface DataSourceMappedState<T> {
  aggregationReducers?: DataSourceProps<T>['aggregationReducers'];
  livePagination: DataSourceProps<T>['livePagination'];
  livePaginationCursor: DataSourceProps<T>['livePaginationCursor'];
  onDataParamsChange: DataSourceProps<T>['onDataParamsChange'];
  data: DataSourceProps<T>['data'];
  primaryKey: DataSourceProps<T>['primaryKey'];
  groupBy: NonUndefined<DataSourceProps<T>['groupBy']>;
  groupRowsState: NonUndefined<DataSourceProps<T>['groupRowsState']>;
  pivotBy: DataSourceProps<T>['pivotBy'];
  loading: NonUndefined<DataSourceProps<T>['loading']>;
  sortInfo: DataSourceSingleSortInfo<T>[] | null;
}

export type DataSourceAggregationReducer<T, AggregationResultType> = {
  field?: keyof T;
  initialValue: AggregationResultType;
  getter?: (data: T) => any;
  reducer: (
    accumulator: any,
    value: any,
    data: T,
  ) => AggregationResultType | any;
  done?: (
    accumulatedValue: AggregationResultType | any,
    array: T[],
  ) => AggregationResultType;
};

export interface DataSourceSetupState<T> {
  showSeparatePivotColumnForSingleAggregation: boolean;
  dataParams?: DataSourceDataParams<T>;
  notifyScrollbarsChange: SubscriptionCallback<Scrollbars>;
  originalDataArray: T[];
  lastSortDataArray?: T[];
  lastGroupDataArray?: InfiniteTableRowInfo<T>[];
  dataArray: InfiniteTableRowInfo<T>[];
  groupDeepMap?: DeepMap<GroupKeyType, DeepMapGroupValueType<T, any>>;
  pivotTotalColumnPosition: InfiniteTablePropPivotTotalColumnPosition;
  scrollBottomId: number | Symbol | DataSourceLivePaginationCursorValue;

  updatedAt: number;
  reducedAt: number;
  groupedAt: number;
  sortedAt: number;
  generateGroupRows: boolean;

  postSortDataArray?: T[];
  postGroupDataArray?: InfiniteTableRowInfo<T>[];
  pivotColumns?: Map<string, InfiniteTableColumn<T>>;
  pivotColumnGroups?: Map<string, InfiniteTableColumnGroup>;
}

export type DataSourcePropAggregationReducers<T> = Record<
  string,
  DataSourceAggregationReducer<T, any>
>;

export interface DataSourceProps<T> {
  children:
    | React.ReactNode
    | ((contextData: DataSourceState<T>) => React.ReactNode);
  primaryKey: keyof T;
  fields?: (keyof T)[];

  data: DataSourceData<T>;

  // other properties, each with controlled and uncontrolled  variant
  loading?: boolean;
  defaultLoading?: boolean;
  onLoadingChange?: (loading: boolean) => void;

  pivotBy?: DataSourcePropPivotBy<T>;
  defaultPivotBy?: DataSourcePropPivotBy<T>;
  onPivotByChange?: (pivotBy: DataSourcePropPivotBy<T>) => void;

  aggregationReducers?: DataSourcePropAggregationReducers<T>;
  defaultAggregationReducers?: DataSourcePropAggregationReducers<T>;

  groupBy?: DataSourcePropGroupBy<T>;
  defaultGroupBy?: DataSourcePropGroupBy<T>;
  onGroupByChange?: (groupBy: DataSourcePropGroupBy<T>) => void;

  groupRowsState?: GroupRowsState;
  defaultGroupRowsState?: GroupRowsState;
  onGroupRowsStateChange?: (groupRowsState: GroupRowsState) => void;

  sortInfo?: DataSourceSortInfo<T>;
  defaultSortInfo?: DataSourceSortInfo<T>;
  onSortInfoChange?:
    | ((sortInfo: DataSourceSingleSortInfo<T> | null) => void)
    | ((sortInfo: DataSourceSingleSortInfo<T>[]) => void);

  onDataParamsChange?: (dataParamsChange: DataSourceDataParams<T>) => void;
  livePagination?: boolean;
  livePaginationCursor?: DataSourceLivePaginationCursorValue;
}

export type DataSourceLivePaginationCursorValue = string | number;

export interface DataSourceState<T>
  extends DataSourceSetupState<T>,
    DataSourceDerivedState<T>,
    DataSourceMappedState<T> {}

export interface DataSourceDerivedState<_T> {
  multiSort: boolean;
  controlledSort: boolean;
}

export type DataSourceComponentActions<T> = ComponentStateActions<
  DataSourceState<T>
>;

export interface DataSourceContextValue<T> {
  getState: () => DataSourceState<T>;
  componentState: DataSourceState<T>;
  componentActions: DataSourceComponentActions<T>;
}

export enum DataSourceActionType {
  INIT = 'INIT',
}

export interface DataSourceAction<T> {
  type: DataSourceActionType;
  payload: T;
}

export interface DataSourceReducer<T> {
  (
    state: DataSourceState<T>,
    action: DataSourceAction<any>,
  ): DataSourceState<T>;
}
