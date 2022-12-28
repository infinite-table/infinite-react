import * as React from 'react';

import { DeepMap } from '../../utils/DeepMap';

import {
  AggregationReducerResult,
  DeepMapGroupValueType,
  GroupKeyType,
  PivotBy,
} from '../../utils/groupAndPivot';
import { GroupBy } from '../../utils/groupAndPivot/types';
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
import { DataSourceCache, DataSourceMutation } from './DataSourceCache';

import { GroupRowsState } from './GroupRowsState';
import { Indexer } from './Indexer';
import {
  RowSelectionState,
  RowSelectionStateObject,
} from './RowSelectionState';

export interface DataSourceDataParams<T> {
  originalDataArray: T[];
  sortInfo?: DataSourceSortInfo<T>;
  groupBy?: DataSourcePropGroupBy<T>;
  pivotBy?: DataSourcePropPivotBy<T>;
  filterValue?: DataSourcePropFilterValue<T>;
  refetchKey?: DataSourceProps<T>['refetchKey'];

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

export type DataSourceSingleSortInfo<T> = Omit<MultisortInfo<T>, 'field'> & {
  field?: keyof T | (keyof T)[];
  id?: string;
};
export type DataSourceGroupBy<T> = GroupBy<T, any>;
export type DataSourcePivotBy<T> = PivotBy<T, any>;

export type DataSourceSortInfo<T> =
  | null
  | DataSourceSingleSortInfo<T>
  | DataSourceSingleSortInfo<T>[];

export type DataSourcePropSortInfo<T> = DataSourceSortInfo<T>;

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
  refetchKey: NonUndefined<DataSourceProps<T>['refetchKey']>;
  isRowSelected: DataSourceProps<T>['isRowSelected'];
  onDataArrayChange: DataSourceProps<T>['onDataArrayChange'];
  onDataMutations: DataSourceProps<T>['onDataMutations'];
  onReady: DataSourceProps<T>['onReady'];

  lazyLoad: DataSourceProps<T>['lazyLoad'];
  useGroupKeysForMultiRowSelection: NonUndefined<
    DataSourceProps<T>['useGroupKeysForMultiRowSelection']
  >;

  onDataParamsChange: DataSourceProps<T>['onDataParamsChange'];
  data: DataSourceProps<T>['data'];
  sortMode: DataSourceProps<T>['sortMode'];
  filterFunction: DataSourceProps<T>['filterFunction'];
  filterValue: DataSourceProps<T>['filterValue'];
  filterTypes: NonUndefined<DataSourceProps<T>['filterTypes']>;
  primaryKey: DataSourceProps<T>['primaryKey'];
  filterDelay: NonUndefined<DataSourceProps<T>['filterDelay']>;
  groupBy: NonUndefined<DataSourceProps<T>['groupBy']>;

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
    | ((
        accumulator: any,
        value: any,
        data: T,
        index: number,
        groupKeys: any[] | undefined,
      ) => AggregationResultType | any);
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
  totalChildrenCount?: number;
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
  indexer: Indexer<T, any>;
  cache?: DataSourceCache<T>;
  unfilteredCount: number;
  filteredCount: number;
  originalDataArrayChanged: boolean;
  originalDataArrayChangedInfo: {
    timestamp: number;
    mutations?: Map<string, DataSourceMutation<T>[]>;
  };
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
  groupRowsIndexesInDataArray?: number[];
  reducerResults?: Record<string, AggregationReducerResult>;
  allRowsSelected: boolean;
  // selectedRowCount: number;
  someRowsSelected: boolean;
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
export type DataSourcePropMultiRowSelectionChangeParamType =
  RowSelectionStateObject;

export type DataSourcePropRowSelection =
  | DataSourcePropRowSelection_MultiRow
  | DataSourcePropRowSelection_SingleRow;

export type DataSourcePropRowSelection_MultiRow = RowSelectionStateObject;
export type DataSourcePropRowSelection_SingleRow = null | string | number;

export type DataSourcePropCellSelection = any;

export type DataSourcePropSelectionMode =
  | false
  | 'single-cell'
  | 'single-row'
  | 'multi-cell'
  | 'multi-row';

// export type DataSourcePropOnRowSelectionChange_MultiRow = (params: {
//   rowSelection: DataSourcePropRowSelection_MultiRow;
//   rowSelectionState: RowSelectionState;
//   selectionMode: 'multi-row';
// }) => void;
// export type DataSourcePropOnRowSelectionChange_SingleRow = (params: {
//   rowSelection: DataSourcePropRowSelection_SingleRow;
//   selectionMode: 'single-row';
// }) => void;

export type DataSourcePropOnRowSelectionChange_MultiRow = (
  rowSelection: DataSourcePropRowSelection_MultiRow,
  selectionMode: 'multi-row',
) => void;
export type DataSourcePropOnRowSelectionChange_SingleRow = (
  rowSelection: DataSourcePropRowSelection_SingleRow,
  selectionMode: 'single-row',
) => void;

export type DataSourcePropOnRowSelectionChange =
  | DataSourcePropOnRowSelectionChange_SingleRow
  | DataSourcePropOnRowSelectionChange_MultiRow;
export type DataSourcePropOnCellSelectionChange = (
  cellSelectionParams: any,
) => void;

export type DataSourcePropIsRowSelected<T> = (
  rowInfo: InfiniteTableRowInfo<T>,
  rowSelectionState: RowSelectionState,
  selectionMode: 'multi-row',
) => boolean | null;

export type DataSourceCRUDParam = {
  flush?: boolean;
};

export type DataSourceInsertParam = DataSourceCRUDParam &
  (
    | {
        position: 'before' | 'after';
        primaryKey: any;
      }
    | {
        position: 'start' | 'end';
      }
  );

export interface DataSourceApi<T> {
  getRowInfoArray: () => InfiniteTableRowInfo<T>[];
  getDataByPrimaryKey(id: any): T | undefined;

  // TODO return promise - also for more than one call in the same batch
  // it should return the same promise
  updateData(data: Partial<T>, options?: DataSourceCRUDParam): Promise<any>;
  updateDataArray(
    data: Partial<T>[],
    options?: DataSourceCRUDParam,
  ): Promise<any>;

  removeDataByPrimaryKey(id: any, options?: DataSourceCRUDParam): Promise<any>;
  removeDataArrayByPrimaryKeys(
    id: any[],
    options?: DataSourceCRUDParam,
  ): Promise<any>;

  removeData(data: Partial<T>, options?: DataSourceCRUDParam): Promise<any>;
  removeDataArray(
    data: Partial<T>[],
    options?: DataSourceCRUDParam,
  ): Promise<any>;

  addData(data: T, options?: DataSourceCRUDParam): Promise<any>;
  addDataArray(data: T[], options?: DataSourceCRUDParam): Promise<any>;

  insertData(data: T, options: DataSourceInsertParam): Promise<any>;
  insertDataArray(data: T[], options: DataSourceInsertParam): Promise<any>;
}

export type DataSourceProps<T> = {
  children:
    | React.ReactNode
    | ((contextData: DataSourceState<T>) => React.ReactNode);
  primaryKey: keyof T | ((data: T) => string);
  fields?: (keyof T)[];
  refetchKey?: number | string | object;

  // TODO move this on the DataSourceAPI? I think so
  // updateDelay?: number;

  data: DataSourceData<T>;

  selectionMode?: DataSourcePropSelectionMode;
  useGroupKeysForMultiRowSelection?: boolean;

  rowSelection?:
    | DataSourcePropRowSelection_MultiRow
    | DataSourcePropRowSelection_SingleRow;

  defaultRowSelection?:
    | DataSourcePropRowSelection_MultiRow
    | DataSourcePropRowSelection_SingleRow;

  cellSelection?: DataSourcePropCellSelection;
  defaultCellSelection?: DataSourcePropCellSelection;
  onCellSelectionChange?: DataSourcePropOnCellSelectionChange;

  isRowSelected?: DataSourcePropIsRowSelected<T>;

  lazyLoad?: boolean | { batchSize?: number };

  // other properties, each with controlled and uncontrolled  variant
  loading?: boolean;
  defaultLoading?: boolean;
  onLoadingChange?: (loading: boolean) => void;

  onReady?: (api: DataSourceApi<T>) => void;

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
  onDataArrayChange?: (
    dataArray: DataSourceState<T>['originalDataArray'],
    info: DataSourceState<T>['originalDataArrayChangedInfo'],
  ) => void;
  onDataMutations?: ({
    dataArray,
    timestamp,
    mutations,
  }: {
    dataArray: DataSourceState<T>['originalDataArray'];
    timestamp: number;
    mutations: NonUndefined<
      DataSourceState<T>['originalDataArrayChangedInfo']['mutations']
    >;
  }) => void;
  livePagination?: boolean;
  livePaginationCursor?: DataSourcePropLivePaginationCursor<T>;
  onLivePaginationCursorChange?: (
    livePaginationCursor: DataSourceLivePaginationCursorValue,
  ) => void;

  filterFunction?: DataSourcePropFilterFunction<T>;

  sortMode?: 'local' | 'remote';
  filterMode?: 'local' | 'remote';
  filterValue?: DataSourcePropFilterValue<T>;
  defaultFilterValue?: DataSourcePropFilterValue<T>;
  onFilterValueChange?: (filterValue: DataSourcePropFilterValue<T>) => void;

  filterDelay?: number;
  filterTypes?: DataSourcePropFilterTypes<T>;

  sortTypes?: DataSourcePropSortTypes;
} & (
  | {
      selectionMode?: 'multi-row';
      rowSelection?: DataSourcePropRowSelection_MultiRow;
      defaultRowSelection?: DataSourcePropRowSelection_MultiRow;
      onRowSelectionChange?: DataSourcePropOnRowSelectionChange_MultiRow;
    }
  | {
      selectionMode?: 'single-row';
      rowSelection?: DataSourcePropRowSelection_SingleRow;
      defaultRowSelection?: DataSourcePropRowSelection_SingleRow;
      onRowSelectionChange?: DataSourcePropOnRowSelectionChange_SingleRow;
    }
  | {
      selectionMode?: 'single-cell';
    }
  | {
      selectionMode?: 'multi-cell';
    }
  | {
      selectionMode?: false;
    }
);

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

// export type DataSourceState<T> = DataSourceSetupState<T> &
//   DataSourceDerivedState<T> &
//   DataSourceMappedState<T>;

export interface DataSourceState<T>
  extends DataSourceSetupState<T>,
    DataSourceDerivedState<T>,
    DataSourceMappedState<T> {}

export type DataSourceDerivedState<T> = {
  // TODO pass as second arg the index
  toPrimaryKey: (data: T) => any;
  operatorsByFilterType: Record<
    string,
    Record<string, DataSourceFilterOperator<T>>
  >;

  filterMode: NonUndefined<DataSourceProps<T>['filterMode']>;
  groupRowsState: GroupRowsState<T>;
  multiSort: boolean;
  controlledSort: boolean;
  controlledFilter: boolean;
  livePaginationCursor?: DataSourceLivePaginationCursorValue;
  lazyLoadBatchSize?: number;
  rowSelection: RowSelectionState | null | number | string;
  selectionMode: NonUndefined<DataSourceProps<T>['selectionMode']>;
};
// & (
//   | {
//       rowSelection: RowSelectionState;
//       selectionMode: 'multi-row';
//     }
//   | {
//       rowSelection: null | number | string;
//       selectionMode: 'single-row';
//     }
//   | {
//       selectionMode: false | 'single-cell' | 'multi-cell';
//       rowSelection: null;
//     }
// );

export type DataSourceComponentActions<T> = ComponentStateActions<
  DataSourceState<T>
>;

export interface DataSourceContextValue<T> {
  api: DataSourceApi<T>;
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
