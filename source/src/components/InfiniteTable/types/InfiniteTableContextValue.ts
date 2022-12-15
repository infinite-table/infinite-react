import { InfiniteTableActions, InfiniteTableState } from './InfiniteTableState';
import { InfiniteTableComputedValues } from './InfiniteTableComputedValues';
import { InfiniteTableApi } from './InfiniteTableProps';
import {
  DataSourceApi,
  DataSourceComponentActions,
  DataSourceState,
} from '../../DataSource';

export interface InfiniteTableContextValue<T> {
  api: InfiniteTableApi<T>;
  dataSourceApi: DataSourceApi<T>;
  state: InfiniteTableState<T>;
  actions: InfiniteTableActions<T>;
  dataSourceActions: DataSourceComponentActions<T>;
  computed: InfiniteTableComputedValues<T>;
  getComputed: () => InfiniteTableComputedValues<T>;
  getState: () => InfiniteTableState<T>;
  getDataSourceState: () => DataSourceState<T>;
}
