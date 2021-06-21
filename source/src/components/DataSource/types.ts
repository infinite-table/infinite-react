import { ReactNode, Dispatch } from 'react';
import { Setter } from '../types/Setter';
import { MultisortInfo } from '../../utils/multisort';
import { InfiniteTableEnhancedData } from '../InfiniteTable';

export type DataSourceEnhancedData<T> = {
  data: T | null;
};
export interface DataSourceDataInfo<T> {
  // dataArray: EnhancedData<T>[];
  originalDataArray: T[];
}

export type DataSourceSingleSortInfo<T> = MultisortInfo<T> & {
  field?: keyof T;
  id?: string;
};
export type DataSourceGroupBy<T> = (keyof T)[];

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
    | ReactNode
    | ((contextData: DataSourceComputedValues<T>) => ReactNode);
  primaryKey: keyof T;
  fields?: (keyof T)[];

  data: DataSourceData<T>;

  // other properties, each with controlled and uncontrolled  variant
  loading?: boolean;
  defaultLoading?: boolean;
  onLoadingChange?: (loading: boolean) => void;

  groupBy?: DataSourceGroupBy<T>;
  defaultGroupBy?: DataSourceGroupBy<T>;
  onGroupByChange?: (groupBy: DataSourceGroupBy<T>) => void;

  sortInfo?: DataSourceSortInfo<T>;
  defaultSortInfo?: DataSourceSortInfo<T>;
  onSortInfoChange?: (sortInfo: DataSourceSortInfo<T>) => void;
}

export interface DataSourceState<T> extends DataSourceDataInfo<T> {
  loading: boolean;
  sortInfo: DataSourceSingleSortInfo<T>[];
  originalDataArray: T[];
  dataArray: InfiniteTableEnhancedData<T>[];
  groupBy: DataSourceGroupBy<T>;
}

// export interface DataSourceComputedState<T> extends DataSourceState<T> {
//   setLoading: (loading: boolean) => void;
//   dispatch: Dispatch<DataSourceAction>;
// }

export interface DataSourceComputedValues<T> extends DataSourceState<T> {
  loading: boolean; // mentioned here, for completness, since it's already inherited
  dataArray: DataSourceEnhancedData<T>[]; // mentioned here, for completeness, since it's already inherited
  originalDataArray: T[]; // mentioned here, for completeness, since it's already inherited
  primaryKey: keyof T;
  // fields: (keyof T)[];
  sortInfo: DataSourceSingleSortInfo<T>[];
}

export interface DataSourceContextValue<T> {
  computed: DataSourceComputedValues<T>;
  props: DataSourceProps<T>;
  state: DataSourceState<T>;
  actions: DataSourceActions<T>;
  dispatch: Dispatch<DataSourceAction<any>>;
}

export interface DataSourceActions<T> {
  setLoading: Setter<boolean>;
  setDataSourceInfo: Setter<DataSourceDataInfo<T>>;
  setSortInfo: Setter<DataSourceSortInfo<T>>;
  setGroupBy: Setter<DataSourceGroupBy<T>>;
}

export enum DataSourceActionType {
  INIT = 'INIT',
  SET_LOADING = 'SET_LOADING',
  SET_GROUP_BY = 'SET_GROUP_BY',
  // SET_DATA,
  SET_DATA_SOURCE_INFO = 'SET_DATA_SOURCE_INFO',
  SET_SORT_INFO = 'SET_SORT_INFO',
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
