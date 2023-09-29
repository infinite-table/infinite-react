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

export type CellPositionOptions =
  | {
      rowIndex: number;
      colIndex: number;
      rowId?: never;
      colId?: never;
    }
  | {
      rowIndex?: never;
      colIndex?: never;
      rowId: any;
      colId: string;
    }
  | {
      rowIndex: number;
      colIndex?: never;
      rowId?: never;
      colId: string;
    }
  | {
      rowIndex?: never;
      colIndex: number;
      rowId: any;
      colId?: never;
    };
