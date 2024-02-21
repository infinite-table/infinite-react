import { DataSourceApi } from '../../DataSource';
import { RowDetailsState } from '../../DataSource/RowDetailsState';
import { InfiniteTableState } from '../types';
import { InfiniteTableActions } from '../types/InfiniteTableState';

export type InfiniteTableRowDetailsApi = {
  isRowDetailsExpanded(pk: any): boolean;
  isRowDetailsCollapsed(pk: any): boolean;

  expandRowDetails(pk: any): void;
  collapseRowDetails(pk: any): void;
  toggleRowDetails(pk: any): void;

  collapseAllDetails(): void;
  expandAllDetails(): void;
};

export type GetRowDetailsApiParam<T> = {
  getState: () => InfiniteTableState<T>;
  dataSourceApi: DataSourceApi<T>;
  actions: {
    rowDetailsState: InfiniteTableActions<T>['rowDetailsState'];
  };
};

export function getRowDetailsApi<T>(
  param: GetRowDetailsApiParam<T>,
): InfiniteTableRowDetailsApi {
  const {
    dataSourceApi,
    getState,

    actions,
  } = param;

  const rowDetailsApi: InfiniteTableRowDetailsApi = {
    collapseAllDetails() {
      actions.rowDetailsState = new RowDetailsState<T>({
        collapsedRows: true,
        expandedRows: [],
      });
    },
    expandAllDetails() {
      actions.rowDetailsState = new RowDetailsState<T>({
        expandedRows: true,
        collapsedRows: [],
      });
    },
    isRowDetailsCollapsed(pk: any) {
      const isRowDetailsExpanded = getState().isRowDetailsExpanded;

      if (!isRowDetailsExpanded) {
        return true;
      }
      const rowInfo = dataSourceApi.getRowInfoByPrimaryKey(pk);
      if (!rowInfo) {
        return true;
      }
      const expanded = isRowDetailsExpanded(rowInfo);

      return !expanded;
    },
    isRowDetailsExpanded(pk: any) {
      return !rowDetailsApi.isRowDetailsCollapsed(pk);
    },
    collapseRowDetails(pk: any) {
      const currentState = getState().rowDetailsState;
      if (!currentState) {
        console.error(
          `Cannot collapse row details via rowDetailsState, as no props.rowDetailsState is provided.`,
        );
        return;
      }
      const state = new RowDetailsState<T>(currentState);
      state.collapseRowDetails(pk);
      actions.rowDetailsState = state;
    },
    expandRowDetails(pk: any) {
      const currentState = getState().rowDetailsState;
      if (!currentState) {
        console.error(
          `Cannot expand row details via rowDetailsState, as no props.rowDetailsState is provided.`,
        );
        return;
      }
      const state = new RowDetailsState<T>(currentState);
      state.expandRowDetails(pk);
      actions.rowDetailsState = state;
    },
    toggleRowDetails(pk: any) {
      if (rowDetailsApi.isRowDetailsExpanded(pk)) {
        rowDetailsApi.collapseRowDetails(pk);
      } else {
        rowDetailsApi.expandRowDetails(pk);
      }
    },
  };
  return rowDetailsApi;
}
