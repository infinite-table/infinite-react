import * as React from 'react';

import { DeepMap } from '../../utils/DeepMap';

import {
  AggregationReducerResult,
  DeepMapGroupValueType,
  GroupKeyType,
  PivotBy,
} from '../../utils/groupAndPivot';
import { GroupBy } from '../../utils/groupAndPivot/types';
import { MultisortInfoAllowMultipleFields } from '../../utils/multisort';
import { ComponentStateActions } from '../hooks/useComponentState/types';
export { RowDetailCache } from './RowDetailCache';
export type { CellSelectionStateObject } from './CellSelectionState';
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
  InfiniteTableState,
} from '../InfiniteTable/types/InfiniteTableState';
import { NonUndefined } from '../types/NonUndefined';

import { SubscriptionCallback } from '../types/SubscriptionCallback';
import { RenderRange } from '../VirtualBrain';
import {
  CellSelectionState,
  CellSelectionStateObject,
  CellSelectionPosition,
} from './CellSelectionState';
import { DataSourceCache, DataSourceMutation } from './DataSourceCache';

import { GroupRowsState } from './GroupRowsState';
import { Indexer } from './Indexer';
export { RowDetailState } from './RowDetailState';
import {
  RowSelectionState,
  RowSelectionStateObject,
} from './RowSelectionState';
import { DataSourceStateRestoreForDetail } from './state/getInitialState';

export interface DataSourceDataParams<T> {
  originalDataArray: T[];
  masterRowInfo?: InfiniteTableRowInfo<any>;
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

export type DataSourceSingleSortInfo<T> =
  MultisortInfoAllowMultipleFields<T> & {
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

export type DataSourceGroupRowsList<KeyType = any> = true | KeyType[][];

export type DataSourcePropGroupRowsStateObject<KeyType = any> = {
  expandedRows: DataSourceGroupRowsList<KeyType>;
  collapsedRows: DataSourceGroupRowsList<KeyType>;
};

export type RowDetailStateObject<KeyType = any> = {
  expandedRows: true | KeyType[];
  collapsedRows: true | KeyType[];
};

export type DataSourcePropGroupBy<T> = DataSourceGroupBy<T>[];
export type DataSourcePropPivotBy<T> = DataSourcePivotBy<T>[];

export interface DataSourceMappedState<T> {
  aggregationReducers?: DataSourceProps<T>['aggregationReducers'];
  livePagination: DataSourceProps<T>['livePagination'];
  refetchKey: NonUndefined<DataSourceProps<T>['refetchKey']>;
  isRowSelected: DataSourceProps<T>['isRowSelected'];
  debugId: DataSourceProps<T>['debugId'];

  onDataArrayChange: DataSourceProps<T>['onDataArrayChange'];
  onDataMutations: DataSourceProps<T>['onDataMutations'];
  onReady: DataSourceProps<T>['onReady'];
  rowInfoReducers: DataSourceProps<T>['rowInfoReducers'];

  lazyLoad: DataSourceProps<T>['lazyLoad'];
  useGroupKeysForMultiRowSelection: NonUndefined<
    DataSourceProps<T>['useGroupKeysForMultiRowSelection']
  >;

  onDataParamsChange: DataSourceProps<T>['onDataParamsChange'];
  data: DataSourceProps<T>['data'];
  sortFunction: DataSourceProps<T>['sortFunction'];

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

export type DataSourceRawReducer<T, RESULT_TYPE> = {
  initialValue?: RESULT_TYPE | (() => RESULT_TYPE);
  reducer: (accumulator: any, value: T) => RESULT_TYPE;
  done?: (
    accumulatedValue: RESULT_TYPE,
    array: T[] /*, TODO also provide the rowInfo (can be undefined), if the agg is happening for a group row - */,
  ) => RESULT_TYPE;
};

export type DataSourceAggregationReducer<T, AggregationResultType> = {
  name?: string;
  field?: keyof T;
  initialValue?: AggregationResultType | (() => any);
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
  getDataSourceMasterContextRef: React.MutableRefObject<
    () => DataSourceMasterDetailContextValue | undefined
  >;
  destroyedRef: React.MutableRefObject<boolean>;
  idToIndexMap: Map<any, number>;
  detailDataSourcesStateToRestore: Map<
    any,
    Partial<DataSourceStateRestoreForDetail<any>>
  >;
  stateReadyAsDetails: boolean;
  cache?: DataSourceCache<T>;
  unfilteredCount: number;
  filteredCount: number;
  rowInfoReducerResults?: Record<string, any>;
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

  onCleanup: SubscriptionCallback<DataSourceState<T>>;
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
  pivotColumns?: Record<string, InfiniteTableColumn<T>>;
  pivotColumnGroups?: Record<string, InfiniteTableColumnGroup>;
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

export type DataSourcePropCellSelection_MultiCell =
  | CellSelectionStateObject
  | CellSelectionState;
export type DataSourcePropCellSelection_SingleCell =
  null | CellSelectionPosition;

export type DataSourcePropCellSelection =
  | DataSourcePropCellSelection_MultiCell
  | DataSourcePropCellSelection_SingleCell;

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

export type DataSourcePropOnCellSelectionChange_MultiCell = (
  cellSelection: DataSourcePropCellSelection_MultiCell,
  selectionMode: 'multi-cell',
) => void;

export type DataSourcePropOnCellSelectionChange_SingleCell = (
  cellSelection: DataSourcePropCellSelection_SingleCell,
  selectionMode: 'single-cell',
) => void;

export type DataSourcePropOnCellSelectionChange =
  | DataSourcePropOnCellSelectionChange_MultiCell
  | DataSourcePropOnCellSelectionChange_SingleCell;

export type DataSourcePropIsRowSelected<T> = (
  rowInfo: InfiniteTableRowInfo<T>,
  rowSelectionState: RowSelectionState,
  selectionMode: 'multi-row',
) => boolean | null;

// export type DataSourcePropIsCellSelected<T> = ( // TODO implement this
//   rowInfo: InfiniteTableRowInfo<T>,
//   cellSelectionState: any,
//   selectionMode: 'multi-cell',
// ) => boolean | null;

export type DataSourcePropSortFn<T> = (
  sortInfo: MultisortInfoAllowMultipleFields<T>[],
  array: T[],
  get?: (item: any) => T,
) => T[];

export type DataSourceCRUDParam = {
  flush?: boolean;
  metadata?: any;
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
  getOriginalDataArray: () => T[];
  getRowInfoArray: () => InfiniteTableRowInfo<T>[];
  getDataByPrimaryKey(id: any): T | null;
  getRowInfoByIndex(index: number): InfiniteTableRowInfo<T> | null;
  getRowInfoByPrimaryKey(id: any): InfiniteTableRowInfo<T> | null;
  getIndexByPrimaryKey(id: any): number;
  getPrimaryKeyByIndex(id: any): any;

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

  setSortInfo(sortInfo: null | DataSourceSingleSortInfo<T>[]): void;
}

export type DataSourcePropRowInfoReducers<T> = Record<
  string,
  DataSourceRowInfoReducer<T>
>;

export type DataSourceRowInfoReducer<T> = DataSourceRawReducer<
  InfiniteTableRowInfo<T>,
  any
>;

export type DataSourcePropShouldReloadDataObject<T> = {
  [key in keyof Pick<
    DataSourceDataParams<T>,
    'sortInfo' | 'pivotBy' | 'groupBy' | 'filterValue'
  >]: boolean;
};
// export type DataSourcePropShouldReloadDataFn<T> = (options: {
//   oldDataParams: DataSourceDataParams<T>;
//   newDataParams: DataSourceDataParams<T>;
//   changes: DataSourceDataParamsChanges<T>;
// }) => boolean;
export type DataSourcePropShouldReloadData<T> =
  DataSourcePropShouldReloadDataObject<T>;
// | DataSourcePropShouldReloadDataFn<T>;

export type DataSourceProps<T> = {
  debugId?: string;
  children?:
    | React.ReactNode
    | ((contextData: DataSourceState<T>) => React.ReactNode);
  // TODO important #introduce-primaryKey-field-even-with-primaryKeyFn
  // even when we have primaryKey as fn, it would be useful to specify a `primaryKeyField`
  // so when we compute the primary key (via a fn), it can be assigned to the `primaryKeyField` field in
  // each data object - eg this is useful when editing, see #introduce-primaryKey-field-even-with-primaryKeyFn

  primaryKey: keyof T | ((data: T) => string);
  /**
   * @deprecated for now
   */
  fields?: (keyof T)[];
  refetchKey?: number | string | object;

  rowInfoReducers?: DataSourcePropRowInfoReducers<T>;

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

  cellSelection?:
    | DataSourcePropCellSelection_MultiCell
    | DataSourcePropCellSelection_SingleCell;
  defaultCellSelection?:
    | DataSourcePropCellSelection_MultiCell
    | DataSourcePropCellSelection_SingleCell;
  onCellSelectionChange?: DataSourcePropOnCellSelectionChange;

  isRowSelected?: DataSourcePropIsRowSelected<T>;
  // TODO maybe implement isCellSelected?: DataSourcePropIsCellSelected<T>;

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

  sortFunction?: DataSourcePropSortFn<T>;
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
    primaryKeyField,
  }: {
    primaryKeyField: undefined | keyof T;
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

  /**
   * @deprecated Use shouldReloadData.sortInfo instead
   */
  sortMode?: 'local' | 'remote';
  /**
   * @deprecated Use shouldReloadData.filterValue instead
   */
  filterMode?: 'local' | 'remote';

  /**
   * @deprecated Use shouldReloadData.groupBy instead
   */
  groupMode?: 'local' | 'remote';

  // TODO in the future if shouldReloadData.sortInfo== true and sortFn is defined, show a warning - same for filterMode/filterFunction
  shouldReloadData?: DataSourcePropShouldReloadData<T>;

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
      cellSelection?: DataSourcePropCellSelection_SingleCell;
      defaultCellSelection?: DataSourcePropCellSelection_SingleCell;
      onCellSelectionChange?: DataSourcePropOnCellSelectionChange_SingleCell;
    }
  | {
      selectionMode?: 'multi-cell';
      cellSelection?: DataSourcePropCellSelection_MultiCell;
      defaultCellSelection?: DataSourcePropCellSelection_MultiCell;
      onCellSelectionChange?: DataSourcePropOnCellSelectionChange_MultiCell;
    }
  | {
      selectionMode?: false;
    }
);
export type DataSourcePropsWithChildren<T> = DataSourceProps<T> & {
  children: NonUndefined<DataSourceProps<T>['children']>;
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
  filter: {
    type: string;
    operator: string;
    value: any;
  };

  disabled?: boolean;
};

export type DataSourceFilterValueItemValueGetter<T> = (
  param: DataSourceFilterFunctionParam<T> & { field?: keyof T },
) => any;

export type DataSourceFilterType<T> = {
  emptyValues: any[];
  label?: string;
  defaultOperator: string;
  valueGetter?: DataSourceFilterValueItemValueGetter<T>;
  components?: {
    FilterEditor?: () => React.JSX.Element | null;
    FilterOperatorSwitch?: () => React.JSX.Element | null;
  };
  operators: DataSourceFilterOperator<T>[];
};

export type DataSourceFilterOperator<T> = {
  name: string;
  label?: string;

  components?: {
    FilterEditor?: () => React.JSX.Element | null;
    Icon?: (props: any) => React.JSX.Element | null;
  };

  fn: DataSourceFilterOperatorFunction<T>;
  defaultFilterValue?: any;
};

export type DataSourceFilterOperatorFunction<T> = (
  filterOperatorFunctionParam: DataSourceFilterOperatorFunctionParam<T>,
) => boolean;

export type DataSourceFilterOperatorFunctionParam<T> = {
  currentValue: any;
  filterValue: any;
  emptyValues: any[];
  field?: keyof T;
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

  sortMode: 'local' | 'remote';
  filterMode: 'local' | 'remote';
  groupMode: 'local' | 'remote';
  pivotMode: 'local' | 'remote';
  shouldReloadData: NonUndefined<Required<DataSourcePropShouldReloadData<T>>>;
  groupRowsState: GroupRowsState<T>;

  multiSort: boolean;
  controlledSort: boolean;
  controlledFilter: boolean;
  livePaginationCursor?: DataSourceLivePaginationCursorValue;
  lazyLoadBatchSize?: number;
  rowSelection: RowSelectionState | null | number | string;
  cellSelection: CellSelectionState | null;
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
  assignState: (state: Partial<DataSourceState<T>>) => void;
  getDataSourceMasterContext: () =>
    | DataSourceMasterDetailContextValue<any>
    | undefined;
  componentState: DataSourceState<T>;
  componentActions: DataSourceComponentActions<T>;
}

export interface DataSourceMasterDetailContextValue<MASTER_TYPE = any> {
  registerDetail: (detail: DataSourceContextValue<any>) => void;
  getMasterState: () => InfiniteTableState<MASTER_TYPE>;
  getMasterDataSourceState: () => DataSourceState<MASTER_TYPE>;
  shouldRestoreState: boolean;
  masterRowInfo: InfiniteTableRowInfo<MASTER_TYPE>;
}

export enum DataSourceActionType {
  INIT = 'INIT',
}

export interface DataSourceAction<T> {
  type: DataSourceActionType;
  payload: T;
}
