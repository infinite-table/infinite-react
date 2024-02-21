import {
  DataSourceApi,
  DataSourceComponentActions,
  DataSourceMasterDetailContextValue,
  DataSourceState,
} from '../../../DataSource';
import { InfiniteTableApi, InfiniteTableState } from '../../types';
import { InfiniteTableActions } from '../../types/InfiniteTableState';

export type InfiniteTableColumnRenderingContext<T> = {
  getState: () => InfiniteTableState<T>;
  getDataSourceState: () => DataSourceState<T>;
  getDataSourceMasterContext: () =>
    | DataSourceMasterDetailContextValue
    | undefined;
  actions: InfiniteTableActions<T>;
  dataSourceActions: DataSourceComponentActions<T>;
  api: InfiniteTableApi<T>;
  dataSourceApi: DataSourceApi<T>;
};
