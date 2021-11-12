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
import { NonUndefined } from '../types/NonUndefined';

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

export interface DataSourceMappedState<T> {
  remoteCount: DataSourceProps<T>['remoteCount'];
  data: DataSourceProps<T>['data'];
  primaryKey: DataSourceProps<T>['primaryKey'];
  groupRowsBy: NonUndefined<DataSourceProps<T>['groupRowsBy']>;
  groupRowsState: NonUndefined<DataSourceProps<T>['groupRowsState']>;
  pivotBy: DataSourceProps<T>['pivotBy'];
  loading: NonUndefined<DataSourceProps<T>['loading']>;
  sortInfo: DataSourceSingleSortInfo<T>[] | null;
}

export interface DataSourceSetupState<T> {
  originalDataArray: T[];
  lastSortDataArray?: T[];
  lastGroupDataArray?: InfiniteTableEnhancedData<T>[];
  dataArray: InfiniteTableEnhancedData<T>[];
  groupDeepMap?: DeepMap<GroupKeyType, DeepMapGroupValueType<T, any>>;
  pivotTotalColumnPosition: InfiniteTablePropPivotTotalColumnPosition;
  updatedAt: number;
  reducedAt: number;
  groupedAt: number;
  sortedAt: number;
  generateGroupRows: boolean;
  aggregationReducers?: AggregationReducer<T, any>[];
  postSortDataArray?: T[];
  postGroupDataArray?: InfiniteTableEnhancedData<T>[];
  pivotColumns?: Map<string, InfiniteTableColumn<T>>;
  pivotColumnGroups?: Map<string, InfiniteTableColumnGroup>;
}
export interface DataSourceProps<T> {
  children:
    | React.ReactNode
    | ((contextData: DataSourceState<T>) => React.ReactNode);
  primaryKey: keyof T;
  fields?: (keyof T)[];

  remoteCount?: number;
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

export interface DataSourceState<T>
  extends DataSourceSetupState<T>,
    DataSourceDerivedState<T>,
    DataSourceMappedState<T> {}

export interface DataSourceDerivedState<_T> {
  multiSort: boolean;
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
