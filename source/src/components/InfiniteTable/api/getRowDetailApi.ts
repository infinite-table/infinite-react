import { DataSourceApi } from '../../DataSource';
import { RowDetailState } from '../../DataSource/RowDetailState';
import { InfiniteTableState } from '../types';
import { InfiniteTableActions } from '../types/InfiniteTableState';

export type InfiniteTableRowDetailApi = {
  isRowDetailExpanded(pk: any): boolean;
  isRowDetailCollapsed(pk: any): boolean;

  expandRowDetail(pk: any): void;
  collapseRowDetail(pk: any): void;
  toggleRowDetail(pk: any): void;

  collapseAllDetails(): void;
  expandAllDetails(): void;
};

export type GetRowDetailApiParam<T> = {
  getState: () => InfiniteTableState<T>;
  dataSourceApi: DataSourceApi<T>;
  actions: {
    rowDetailState: InfiniteTableActions<T>['rowDetailState'];
  };
};

export function getRowDetailApi<T>(
  param: GetRowDetailApiParam<T>,
): InfiniteTableRowDetailApi {
  const {
    dataSourceApi,
    getState,

    actions,
  } = param;

  const rowDetailApi: InfiniteTableRowDetailApi = {
    collapseAllDetails() {
      actions.rowDetailState = new RowDetailState<T>({
        collapsedRows: true,
        expandedRows: [],
      });
    },
    expandAllDetails() {
      actions.rowDetailState = new RowDetailState<T>({
        expandedRows: true,
        collapsedRows: [],
      });
    },
    isRowDetailCollapsed(pk: any) {
      const isRowDetailExpanded = getState().isRowDetailExpanded;

      if (!isRowDetailExpanded) {
        return true;
      }
      const rowInfo = dataSourceApi.getRowInfoByPrimaryKey(pk);
      if (!rowInfo) {
        return true;
      }
      const expanded = isRowDetailExpanded(rowInfo);

      return !expanded;
    },
    isRowDetailExpanded(pk: any) {
      return !rowDetailApi.isRowDetailCollapsed(pk);
    },
    collapseRowDetail(pk: any) {
      const currentState = getState().rowDetailState;
      if (!currentState) {
        console.error(
          `Cannot collapse row details via rowDetailState, as no props.rowDetailState is provided.`,
        );
        return;
      }
      const state = new RowDetailState<T>(currentState);
      state.collapseRowDetails(pk);
      actions.rowDetailState = state;
    },
    expandRowDetail(pk: any) {
      const currentState = getState().rowDetailState;
      if (!currentState) {
        console.error(
          `Cannot expand row details via rowDetailState, as no props.rowDetailState is provided.`,
        );
        return;
      }
      const state = new RowDetailState<T>(currentState);
      state.expandRowDetails(pk);
      actions.rowDetailState = state;
    },
    toggleRowDetail(pk: any) {
      if (rowDetailApi.isRowDetailExpanded(pk)) {
        rowDetailApi.collapseRowDetail(pk);
      } else {
        rowDetailApi.expandRowDetail(pk);
      }
    },
  };
  return rowDetailApi;
}