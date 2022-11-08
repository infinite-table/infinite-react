import { DataSourceState } from '../../../DataSource';
import { InfiniteTableApi, InfiniteTableState } from '../../types';
import { InfiniteTableActions } from '../../types/InfiniteTableState';

export type InfiniteTableColumnRenderingContext<T> = {
  getState: () => InfiniteTableState<T>;
  getDataSourceState: () => DataSourceState<T>;
  actions: InfiniteTableActions<T>;
  api: InfiniteTableApi<T>;
};
