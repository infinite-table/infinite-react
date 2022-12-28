import {
  DataSourceState,
  DataSourceComponentActions,
  DataSourceApi,
} from '../../DataSource';
import { InfiniteTableComputedValues, InfiniteTableState } from '../types';
import { InfiniteTableActions } from '../types/InfiniteTableState';

export type GetImperativeApiParam<T> = {
  getComputed: () => InfiniteTableComputedValues<T>;
  getState: () => InfiniteTableState<T>;
  getDataSourceState: () => DataSourceState<T>;
  actions: InfiniteTableActions<T>;
  dataSourceActions: DataSourceComponentActions<T>;
  dataSourceApi: DataSourceApi<T>;
};
