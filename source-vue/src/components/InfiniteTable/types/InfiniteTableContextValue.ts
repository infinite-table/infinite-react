import { InfiniteTableActions, InfiniteTableState } from './InfiniteTableState';
import { InfiniteTableComputedValues } from './InfiniteTableComputedValues';
import { InfiniteTableApi, InfiniteTableColumnApi } from './InfiniteTableProps';
import {
  DataSourceApi,
  DataSourceComponentActions,
  DataSourceMasterDetailContextValue,
  DataSourceState,
} from '../../DataSource';
import { OnCellClickContext } from '../eventHandlers/onCellClick';
import { InfiniteTableComputedColumn } from './InfiniteTableColumn';
import { InfiniteTableRowInfoDataDiscriminator } from '../../../utils/groupAndPivot';

export interface InfiniteTableContextValue<T> {
  children?: React.ReactNode;
  api: InfiniteTableApi<T>;
  dataSourceApi: DataSourceApi<T>;
  state: InfiniteTableState<T>;
  actions: InfiniteTableActions<T>;
  dataSourceActions: DataSourceComponentActions<T>;
  computed: InfiniteTableComputedValues<T>;
  getComputed: () => InfiniteTableComputedValues<T>;
  getState: () => InfiniteTableState<T>;
  getDataSourceState: () => DataSourceState<T>;
  getDataSourceMasterContext: () =>
    | DataSourceMasterDetailContextValue
    | undefined;
}

export interface InfiniteTablePublicContext<T> {
  api: InfiniteTableApi<T>;
  dataSourceApi: DataSourceApi<T>;
  getState: () => InfiniteTableState<T>;
  getDataSourceState: () => DataSourceState<T>;
}

export type InfiniteTableRowContext<T> = InfiniteTablePublicContext<T> &
  InfiniteTableRowInfoDataDiscriminator<T> & {
    rowIndex: number;
  };

export interface InfiniteTableCellContext<T> {
  rowIndex: OnCellClickContext<T>['rowIndex'];
  colIndex: OnCellClickContext<T>['colIndex'];
  column: InfiniteTableComputedColumn<T>;
  columnApi: InfiniteTableColumnApi<T>;
}
