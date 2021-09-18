import * as React from 'react';
import { MultisortInfo } from '../../utils/multisort';
import { DeepMap } from '../../utils/DeepMap';
import {
  AggregationReducer,
  DeepMapGroupValueType,
  GroupBy,
  GroupKeyType,
  PivotBy,
} from '../../utils/groupAndPivot';

import {
  InfiniteTableColumn,
  InfiniteTableColumnGroup,
  InfiniteTableEnhancedData,
} from '../InfiniteTable';
import { ComponentStateActions } from '../hooks/useComponentState';
import { GroupRowsState } from './GroupRowsState';
import { InfiniteTablePropPivotTotalColumnPosition } from '../InfiniteTable/types/InfiniteTableState';

export interface DataSourceDataInfo<T> {
  originalDataArray: T[];
}

export type DataSourceSingleSortInfo<T> = MultisortInfo<T> & {
  field?: keyof T;
  id?: string;
};
export type DataSourceGroupRowsBy<T> = GroupBy<T, any>;
export type DataSourcePivotBy<T> = PivotBy<T, any>;

export type DataSourceSortInfo<T> =
  | null
  | DataSourceSingleSortInfo<T>
  | DataSourceSingleSortInfo<T>[];

export type DataSourceData<T> =
  | T[]
  | Promise<
      | T[]
      | {
          data: T[];
        }
    >
  | (() =>
      | T[]
      | Promise<
          | T[]
          | {
              data: T[];
            }
        >);

export type DataSourceGroupRowsList<KeyType> = true | KeyType[][];

export type DataSourceExpandedAndCollapsedGroupRows<KeyType> = {
  expandedRows: DataSourceGroupRowsList<KeyType>;
  collapsedRows: DataSourceGroupRowsList<KeyType>;
};

export type DataSourcePropGroupRowsBy<T> = DataSourceGroupRowsBy<T>[];
export type DataSourcePropPivotBy<T> = DataSourcePivotBy<T>[];

export interface DataSourceProps<T> {
  children:
    | React.ReactNode
    | ((contextData: DataSourceComponentState<T>) => React.ReactNode);
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

  groupRowsBy?: DataSourcePropGroupRowsBy<T>;
  defaultGroupRowsBy?: DataSourcePropGroupRowsBy<T>;
  onGroupRowsByChange?: (groupBy: DataSourcePropGroupRowsBy<T>) => void;

  groupRowsState?: GroupRowsState;
  defaultGroupRowsState?: GroupRowsState;
  onGroupRowsStateChange?: (groupRowsState: GroupRowsState) => void;

  sortInfo?: DataSourceSortInfo<T>;
  defaultSortInfo?: DataSourceSortInfo<T>;
  onSortInfoChange?: (sortInfo: DataSourceSortInfo<T>) => void;
}

export interface DataSourceState<T> extends DataSourceDataInfo<T> {
  data: DataSourceData<T>;
  loading: boolean;
  sortInfo?: DataSourceSortInfo<T>;
  dataArray: InfiniteTableEnhancedData<T>[];
  groupRowsBy: DataSourcePropGroupRowsBy<T>;
  pivotBy?: DataSourcePropPivotBy<T>;
  pivotColumns?: Map<string, InfiniteTableColumn<T>>;
  pivotColumnGroups?: Map<string, InfiniteTableColumnGroup>;
  aggregationReducers?: AggregationReducer<T, any>[];
  groupRowsState: GroupRowsState;
  sortedAt: number;
  groupedAt: number;
  updatedAt: number;
  reducedAt: number;
  pivotTotalColumnPosition?: InfiniteTablePropPivotTotalColumnPosition;
}

export interface DataSourceReadOnlyState<T> {
  multiSort: boolean;
  sortInfo: DataSourceSingleSortInfo<T>[];
  primaryKey: keyof T;
  groupDeepMap?: DeepMap<GroupKeyType, DeepMapGroupValueType<T, any>>;

  lastSortDataArray?: T[];
  postSortDataArray?: T[];
  lastGroupDataArray?: InfiniteTableEnhancedData<T>[];
  postGroupDataArray?: InfiniteTableEnhancedData<T>[];
}

export interface DataSourceComponentState<T>
  extends Omit<DataSourceState<T>, 'sortInfo'>,
    DataSourceReadOnlyState<T> {}

export type DataSourceComponentActions<T> = ComponentStateActions<
  DataSourceState<T>
>;

export interface DataSourceContextValue<T> {
  getState: () => DataSourceComponentState<T>;
  componentState: DataSourceComponentState<T>;
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
