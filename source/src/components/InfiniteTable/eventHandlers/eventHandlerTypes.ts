import {
  DataSourceState,
  DataSourceComponentActions,
  RowSelectionState,
  DataSourceApi,
  DataSourceMasterDetailContextValue,
} from '../../DataSource';
import { TreeSelectionState } from '../../DataSource/TreeSelectionState';
import { InfiniteTableCellSelectionApi } from '../api/getCellSelectionApi';
import { InfiniteTableRowSelectionApi } from '../api/getRowSelectionApi';
import {
  InfiniteTableApi,
  InfiniteTableColumnApi,
  InfiniteTableComputedColumn,
  InfiniteTableComputedValues,
  InfiniteTableState,
} from '../types';
import { InfiniteTableActions } from '../types/InfiniteTableState';

export type InfiniteTableEventHandlerAbstractContext<T> = {
  getComputed: () => InfiniteTableComputedValues<T>;
  getState: () => {
    wrapRowsHorizontally: InfiniteTableState<T>['wrapRowsHorizontally'];
    activeRowIndex: InfiniteTableState<T>['activeRowIndex'];
    activeCellIndex: InfiniteTableState<T>['activeCellIndex'];
    keyboardNavigation: InfiniteTableState<T>['keyboardNavigation'];
    keyboardSelection: InfiniteTableState<T>['keyboardSelection'];
    brain: InfiniteTableState<T>['brain'];
  };
  actions: InfiniteTableActions<T>;
  cloneRowSelection: (
    rowSelection: RowSelectionState<T>,
  ) => RowSelectionState<T>;
  cloneTreeSelection: (
    treeSelection: TreeSelectionState<T>,
  ) => TreeSelectionState<T>;
  getDataSourceState: () => {
    rowSelection: DataSourceState<T>['rowSelection'];
    treeSelectionState?: DataSourceState<T>['treeSelection'];
    cellSelection: DataSourceState<T>['cellSelection'];
    groupBy: DataSourceState<T>['groupBy'];
    selectionMode: DataSourceState<T>['selectionMode'];
    isTree: DataSourceState<T>['isTree'];
    dataArray: {
      id: string;
      isGroupRow: boolean;
      isTreeNode: boolean;
      nodePath?: any[];
      groupKeys?: any[];
      rowDisabled: boolean;
    }[];
  };
  dataSourceActions: DataSourceComponentActions<T>;
  dataSourceApi: DataSourceApi<T>;
  api: {
    rowSelectionApi: InfiniteTableRowSelectionApi;
    cellSelectionApi: InfiniteTableCellSelectionApi<T>;
  };
};

export type InfiniteTableEventHandlerContext<T> = {
  getComputed: () => InfiniteTableComputedValues<T>;
  getState: () => InfiniteTableState<T>;
  actions: InfiniteTableActions<T>;
  cloneRowSelection: (
    rowSelection: RowSelectionState<T>,
  ) => RowSelectionState<T>;
  cloneTreeSelection: (
    treeSelection: TreeSelectionState<T>,
  ) => TreeSelectionState<T>;
  getDataSourceState: () => DataSourceState<T>;
  getDataSourceMasterContext: () =>
    | DataSourceMasterDetailContextValue
    | undefined;
  dataSourceActions: DataSourceComponentActions<T>;
  api: InfiniteTableApi<T>;
  dataSourceApi: DataSourceApi<T>;
};

export type InfiniteTableKeyboardEventHandlerContext<T> =
  InfiniteTableEventHandlerContext<T>;

export type InfiniteTableCellClickEventHandlerContext<T> =
  InfiniteTableEventHandlerContext<T> & {
    rowIndex: number;
    colIndex: number;
    column: InfiniteTableComputedColumn<T>;
    columnApi: InfiniteTableColumnApi<T>;
  };
