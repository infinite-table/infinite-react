import {
  DataSourceState,
  DataSourceComponentActions,
  RowSelectionState,
} from '../../DataSource';
import { InfiniteTableSelectionApi } from '../api/getSelectionApi';
import {
  InfiniteTableApi,
  InfiniteTableComputedValues,
  InfiniteTableState,
} from '../types';
import { InfiniteTableActions } from '../types/InfiniteTableState';

export type InfiniteTableEventHandlerAbstractContext<T> = {
  getComputed: () => InfiniteTableComputedValues<T>;
  getState: () => {
    activeRowIndex: InfiniteTableState<T>['activeRowIndex'];
    activeCellIndex: InfiniteTableState<T>['activeCellIndex'];
    keyboardNavigation: InfiniteTableState<T>['keyboardNavigation'];
    keyboardSelection: InfiniteTableState<T>['keyboardSelection'];
  };
  actions: InfiniteTableActions<T>;
  cloneRowSelection: (
    rowSelection: RowSelectionState<T>,
  ) => RowSelectionState<T>;
  getDataSourceState: () => {
    rowSelection: DataSourceState<T>['rowSelection'];
    groupBy: DataSourceState<T>['groupBy'];
    selectionMode: DataSourceState<T>['selectionMode'];
    dataArray: { id: string; isGroupRow: boolean; groupKeys?: any[] }[];
  };
  dataSourceActions: DataSourceComponentActions<T>;
  api: {
    selectionApi: InfiniteTableSelectionApi;
  };
};

export type InfiniteTableEventHandlerContext<T> = {
  getComputed: () => InfiniteTableComputedValues<T>;
  getState: () => InfiniteTableState<T>;
  actions: InfiniteTableActions<T>;
  cloneRowSelection: (
    rowSelection: RowSelectionState<T>,
  ) => RowSelectionState<T>;
  getDataSourceState: () => DataSourceState<T>;
  dataSourceActions: DataSourceComponentActions<T>;
  api: InfiniteTableApi<T>;
};

export type InfiniteTableKeyboardEventHandlerContext<T> =
  InfiniteTableEventHandlerContext<T>;

export type InfiniteTableCellClickEventHandlerContext<T> =
  InfiniteTableEventHandlerContext<T> & {
    rowIndex: number;
    colIndex: number;
  };
