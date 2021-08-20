import * as React from 'react';
import { MultisortInfo } from '../../utils/multisort';
import { DeepMap } from '../../utils/DeepMap';
import {
  AggregationReducer,
  GroupBy,
  GroupKeyType,
} from '../../utils/groupAndPivot';

import { InfiniteTableEnhancedData } from '../InfiniteTable';
import { ComponentStateActions } from '../hooks/useComponentState';

export interface DataSourceDataInfo<T> {
  originalDataArray: T[];
}

export type DataSourceSingleSortInfo<T> = MultisortInfo<T> & {
  field?: keyof T;
  id?: string;
};
export type DataSourceGroupBy<T> = GroupBy<T>;

export type DataSourceSortInfo<T> =
  | null
  | undefined
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

  groupRowsBy?: DataSourceGroupBy<T>[];
  defaultGroupRowsBy?: DataSourceGroupBy<T>[];
  onGroupRowsByChange?: (groupBy: DataSourceGroupBy<T>[]) => void;

  sortInfo?: DataSourceSortInfo<T>;
  defaultSortInfo?: DataSourceSortInfo<T>;
  onSortInfoChange?: (sortInfo: DataSourceSortInfo<T>) => void;
}

export interface DataSourceState<T> extends DataSourceDataInfo<T> {
  data: DataSourceData<T>;
  loading: boolean;
  sortInfo: DataSourceSingleSortInfo<T>[];
  dataArray: InfiniteTableEnhancedData<T>[];
  groupRowsBy: DataSourceGroupBy<T>[];
  aggregationReducers?: AggregationReducer<T, any>[];
}

export interface DataSourceReadOnlyState<T> {
  primaryKey: keyof T;
  groupDeepMap?: DeepMap<GroupKeyType, T[]>;

  postSortDataArray?: T[];
  postGroupDataArray?: InfiniteTableEnhancedData<T>[];
}

export interface DataSourceComponentState<T>
  extends DataSourceState<T>,
    DataSourceReadOnlyState<T> {}

export type DataSourceComponentActions<T> = ComponentStateActions<
  DataSourceState<T>
>;

export interface DataSourceContextValue<T> {
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
