import { DataSourceState, DataSourceComponentActions } from '../../DataSource';
import {
  InfiniteTableComputedValues,
  InfiniteTableState,
  InfiniteTableApi,
} from '../types';
import { InfiniteTableActions } from '../types/InfiniteTableState';

export type InfiniteTableEventHandlerContext<T> = {
  getComputed: () => InfiniteTableComputedValues<T>;
  getState: () => InfiniteTableState<T>;
  actions: InfiniteTableActions<T>;
  getDataSourceState: () => DataSourceState<T>;
  dataSourceActions: DataSourceComponentActions<T>;
  api: InfiniteTableApi<T>;
};

export type InfiniteTableKeyboardEventHandlerContext<T> =
  InfiniteTableEventHandlerContext<T> & {
    key: string;
    metaKey: boolean;
    ctrlKey: boolean;
    shiftKey: boolean;
    preventDefault: VoidFunction;
  };

export type InfiniteTableCellClickEventHandlerContext<T> =
  InfiniteTableEventHandlerContext<T> & {
    rowIndex: number;
    colIndex: number;
  };
