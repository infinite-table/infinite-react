import * as React from 'react';

import { DeepMap } from '../../utils/DeepMap';
import {
  DeepMapGroupValueType,
  GroupBy,
  GroupKeyType,
  PivotBy,
} from '../../utils/groupAndPivot';
import { MultisortInfo } from '../../utils/multisort';
import { ComponentStateActions } from '../hooks/useComponentState/types';
import {
  InfiniteTableColumn,
  InfiniteTableColumnGroup,
  InfiniteTableRowInfo,
  Scrollbars,
} from '../InfiniteTable/types';
import {
  DiscriminatedUnion,
  InfiniteTablePivotColumn,
  InfiniteTablePivotFinalColumnVariant,
} from '../InfiniteTable/types/InfiniteTableColumn';
import { ScrollStopInfo } from '../InfiniteTable/types/InfiniteTableProps';
import {
  InfiniteTablePropPivotGrandTotalColumnPosition,
  InfiniteTablePropPivotTotalColumnPosition,
} from '../InfiniteTable/types/InfiniteTableState';
import { NonUndefined } from '../types/NonUndefined';
import { SubscriptionCallback } from '../types/SubscriptionCallback';
import { RenderRange } from '../VirtualBrain';

import { GroupRowsState } from './GroupRowsState';

export interface DataSourceDataParams<T> {
  originalDataArray: T[];
  sortInfo?: DataSourceSortInfo<T>;
  groupBy?: DataSourcePropGroupBy<T>;
  pivotBy?: DataSourcePropPivotBy<T>;
  filterValue?: DataSourcePropFilterValue<T>;

  groupRowsState?: DataSourcePropGroupRowsStateObject<any>;

  lazyLoadBatchSize?: number;
  lazyLoadStartIndex?: number;
  groupKeys?: any[];

  append?: boolean;

  aggregationReducers?: DataSourcePropAggregationReducers<T>;

  livePaginationCursor?: DataSourceLivePaginationCursorValue;
  __cursorId?: DataSourceSetupState<T>['cursorId'];

  changes?: DataSourceDataParamsChanges<T>;
}

export type DataSourceDataParamsChanges<T> = Partial<
  Record<
    keyof Omit<DataSourceDataParams<T>, 'originalDataArray' | 'changes'>,
    true
  >
>;

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
  data: T[] | LazyGroupDataItem<T>[];
  mappings?: DataSourceMappings;
  cache?: boolean;
  error?: string;
  totalCount?: number;
  totalCountUnfiltered?: number;
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

export type DataSourcePropGroupRowsStateObject<KeyType> = {
  expandedRows: DataSourceGroupRowsList<KeyType>;
  collapsedRows: DataSourceGroupRowsList<KeyType>;
};

export type DataSourcePropGroupBy<T> = DataSourceGroupBy<T>[];
export type DataSourcePropPivotBy<T> = DataSourcePivotBy<T>[];

export interface DataSourceMappedState<T> {
  aggregationReducers?: DataSourceProps<T>['aggregationReducers'];
  livePagination: DataSourceProps<T>['livePagination'];

  lazyLoad: DataSourceProps<T>['lazyLoad'];

  onDataParamsChange: DataSourceProps<T>['onDataParamsChange'];
  data: DataSourceProps<T>['data'];
  filterFunction: DataSourceProps<T>['filterFunction'];
  filterValue: DataSourceProps<T>['filterValue'];
  filterTypes: NonUndefined<DataSourceProps<T>['filterTypes']>;
  primaryKey: DataSourceProps<T>['primaryKey'];
  filterDelay: NonUndefined<DataSourceProps<T>['filterDelay']>;
  groupBy: NonUndefined<DataSourceProps<T>['groupBy']>;
  groupRowsState: GroupRowsState<T>;
  pivotBy: DataSourceProps<T>['pivotBy'];
  loading: NonUndefined<DataSourceProps<T>['loading']>;
  sortTypes: NonUndefined<DataSourceProps<T>['sortTypes']>;
  collapseGroupRowsOnDataFunctionChange: NonUndefined<
    DataSourceProps<T>['collapseGroupRowsOnDataFunctionChange']
  >;
  sortInfo: DataSourceSingleSortInfo<T>[] | null;
}

export type DataSourceAggregationReducer<T, AggregationResultType> = {
  name?: string;
  field?: keyof T;
  initialValue?: AggregationResultType;
  getter?: (data: T) => any;
  reducer:
    | string
    | ((accumulator: any, value: any, data: T) => AggregationResultType | any);
  done?: (
    accumulatedValue: AggregationResultType | any,
    array: T[],
  ) => AggregationResultType;
  pivotColumn?:
    | ColumnTypeWithInherit<Partial<InfiniteTableColumn<T>>>
    | (({
        column,
      }: {
        column: InfiniteTablePivotFinalColumnVariant<T>;
      }) => ColumnTypeWithInherit<Partial<InfiniteTablePivotColumn<T>>>);
};

export type ColumnTypeWithInherit<COL_TYPE> = COL_TYPE & {
  inheritFromColumn?: string | boolean;
};

export type DataSourceMappings = Record<'totals' | 'values', string>;

export type LazyGroupDataItem<DataType> = {
  data: Partial<DataType>;
  keys: any[];
  aggregations?: Record<string, any>;
  dataset?: DataSourceRemoteData<DataType>;
  pivot?: {
    values: Record<string, any>;
    totals?: Record<string, any>;
  };
};

export type LazyRowInfoGroup<DataType> = {
  /**
   * Those are direct children of the current lazy group row
   */
  children: LazyGroupDataItem<DataType>[];
  childrenLoading: boolean;
  childrenAvailable: boolean;
  cache: boolean;
  totalCount: number;
  // TODO make sure this is properly implemented
  totalCountUnfiltered: number;
  error?: string;
};

export type LazyGroupDataDeepMap<DataType, KeyType = string> = DeepMap<
  KeyType,
  LazyRowInfoGroup<DataType>
>;

export interface DataSourceSetupState<T> {
  unfilteredCount: number;
  filteredCount: number;
  lazyLoadCacheOfLoadedBatches: DeepMap<string, true>;
  pivotMappings?: DataSourceMappings;
  propsCache: Map<keyof DataSourceProps<T>, WeakMap<any, any>>;
  showSeparatePivotColumnForSingleAggregation: boolean;
  dataParams?: DataSourceDataParams<T>;
  originalLazyGroupData: LazyGroupDataDeepMap<T>;
  originalLazyGroupDataChangeDetect: number | string;
  scrollStopDelayUpdatedByTable: number;

  notifyScrollbarsChange: SubscriptionCallback<Scrollbars>;
  notifyScrollStop: SubscriptionCallback<ScrollStopInfo>;
  notifyRenderRangeChange: SubscriptionCallback<RenderRange>;
  originalDataArray: T[];
  lastFilterDataArray?: T[];
  lastSortDataArray?: T[];
  lastGroupDataArray?: InfiniteTableRowInfo<T>[];
  dataArray: InfiniteTableRowInfo<T>[];
  groupDeepMap?: DeepMap<GroupKeyType, DeepMapGroupValueType<T, any>>;
  pivotTotalColumnPosition: InfiniteTablePropPivotTotalColumnPosition;
  pivotGrandTotalColumnPosition: InfiniteTablePropPivotGrandTotalColumnPosition;
  cursorId: number | symbol | DataSourceLivePaginationCursorValue;

  updatedAt: number;
  reducedAt: number;
  groupedAt: number;
  sortedAt: number;
  filteredAt: number;
  generateGroupRows: boolean;

  postFilterDataArray?: T[];
  postSortDataArray?: T[];
  postGroupDataArray?: InfiniteTableRowInfo<T>[];
  pivotColumns?: Map<string, InfiniteTableColumn<T>>;
  pivotColumnGroups?: Map<string, InfiniteTableColumnGroup>;
}

export type DataSourcePropAggregationReducers<T> = Record<
  string,
  DataSourceAggregationReducer<T, any>
>;

export type DataSourceProps<T> = {
  children:
    | React.ReactNode
    | ((contextData: DataSourceState<T>) => React.ReactNode);
  primaryKey:
    | keyof T
    | (({ data, index }: { data: T; index: number }) => string);
  fields?: (keyof T)[];

  data: DataSourceData<T>;

  lazyLoad?: boolean | { batchSize?: number };

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

  groupRowsState?: GroupRowsState | DataSourcePropGroupRowsStateObject<any>;
  defaultGroupRowsState?:
    | GroupRowsState
    | DataSourcePropGroupRowsStateObject<keyof T>;
  onGroupRowsStateChange?: (groupRowsState: GroupRowsState) => void;

  collapseGroupRowsOnDataFunctionChange?: boolean;

  sortInfo?: DataSourceSortInfo<T>;
  defaultSortInfo?: DataSourceSortInfo<T>;
  onSortInfoChange?:
    | ((sortInfo: DataSourceSingleSortInfo<T> | null) => void)
    | ((sortInfo: DataSourceSingleSortInfo<T>[]) => void);

  onDataParamsChange?: (dataParamsChange: DataSourceDataParams<T>) => void;
  livePagination?: boolean;
  livePaginationCursor?: DataSourcePropLivePaginationCursor<T>;
  onLivePaginationCursorChange?: (
    livePaginationCursor: DataSourceLivePaginationCursorValue,
  ) => void;

  filterFunction?: DataSourcePropFilterFunction<T>;

  filterMode?: 'client' | 'server';
  filterValue?: DataSourcePropFilterValue<T>;
  defaultFilterValue?: DataSourcePropFilterValue<T>;
  onFilterValueChange?: (filterValue: DataSourcePropFilterValue<T>) => void;

  filterDelay?: number;
  filterTypes?: DataSourcePropFilterTypes<T>;

  sortTypes?: DataSourcePropSortTypes;
};

export type DataSourcePropSortTypes = Record<
  string,
  (first: any, second: any) => number
>;

export type DataSourcePropFilterTypes<T> = Record<
  string,
  DataSourceFilterType<T>
>;

export type DataSourceFilterFunctionParam<T> = {
  data: T;
  index: number;
  dataArray: T[];
  primaryKey: any;
};
export type DataSourcePropFilterFunction<T> = (
  filterParam: DataSourceFilterFunctionParam<T>,
) => boolean;

export type DataSourcePropFilterValue<T> = DataSourceFilterValueItem<T>[];

export type DataSourceFilterValueItem<T> = DiscriminatedUnion<
  {
    field: keyof T;
  },
  { id: string }
> & {
  valueGetter?: DataSourceFilterValueItemValueGetter<T>;
  filterValue: any;
  disabled?: boolean;
  filterType: string;
  operator: string;
};

export type DataSourceFilterValueItemValueGetter<T> = (
  param: DataSourceFilterFunctionParam<T>,
) => any;

export type DataSourceFilterType<T> = {
  emptyValues: Set<any>;
  label?: string;
  defaultOperator: string;
  operators: DataSourceFilterOperator<T>[];
};

export type DataSourceFilterOperator<T> = {
  name: string;
  label?: string;
  fn: DataSourceFilterOperatorFunction<T>;
};

export type DataSourceFilterOperatorFunction<T> = (
  filterOperatorFunctionParam: DataSourceFilterOperatorFunctionParam<T>,
) => boolean;

export type DataSourceFilterOperatorFunctionParam<T> = {
  currentValue: any;
  filterValue: any;
  emptyValues: Set<any>;
} & DataSourceFilterFunctionParam<T>;

export type DataSourcePropLivePaginationCursor<T> =
  | DataSourceLivePaginationCursorValue
  | DataSourceLivePaginationCursorFn<T>;

export type DataSourceLivePaginationCursorFn<T> = (
  params: DataSourceLivePaginationCursorParams<T>,
) => DataSourceLivePaginationCursorValue;
export type DataSourceLivePaginationCursorParams<T> = {
  array: T[];
  lastItem: T | Partial<T> | null;
  length: number;
};
export type DataSourceLivePaginationCursorValue = string | number | null;

export interface DataSourceState<T>
  extends DataSourceSetupState<T>,
    DataSourceDerivedState<T>,
    DataSourceMappedState<T> {}

export interface DataSourceDerivedState<T> {
  operatorsByFilterType: Record<
    string,
    Record<string, DataSourceFilterOperator<T>>
  >;
  filterMode: NonUndefined<DataSourceProps<T>['filterMode']>;

  multiSort: boolean;
  controlledSort: boolean;
  controlledFilter: boolean;
  livePaginationCursor?: DataSourceLivePaginationCursorValue;
  lazyLoadBatchSize?: number;
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
