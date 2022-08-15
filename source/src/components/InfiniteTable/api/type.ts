import { DataSourceState, DataSourceComponentActions } from '../../DataSource';
import { InfiniteTableComputedValues, InfiniteTableState } from '../types';
import { InfiniteTableActions } from '../types/InfiniteTableState';

export type GetImperativeApiParam<T> = {
  getComputed: () => InfiniteTableComputedValues<T>;
  getState: () => InfiniteTableState<T>;
  getDataSourceState: () => DataSourceState<T>;
  componentActions: InfiniteTableActions<T>;
  dataSourceActions: DataSourceComponentActions<T>;
};
