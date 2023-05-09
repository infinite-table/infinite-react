import { SortDir } from '../../../utils/multisort';
import { getFormattedValueContextForCell } from '../components/InfiniteTableRow/columnRendering';

import { InfiniteTableComputedColumn } from '../types';
import {
  InfiniteTableApi,
  InfiniteTableColumnApi,
} from '../types/InfiniteTableProps';

import { GetImperativeApiParam } from './type';

export function getColumnApiForColumn<T>(
  colOrColId: string | number | InfiniteTableComputedColumn<T>,
  param: GetImperativeApiParam<T> & {
    api: InfiniteTableApi<T>;
  },
) {
  const { getComputed, getState, actions, api } = param;

  if (typeof colOrColId === 'number') {
    colOrColId = getComputed().computedVisibleColumns[colOrColId];
  }
  const column =
    typeof colOrColId === 'string'
      ? getComputed().computedColumnsMap.get(colOrColId)
      : colOrColId;

  if (!column) {
    return null;
  }

  const columnApi: InfiniteTableColumnApi<T> = {
    getValuesByPrimaryKey(id: any) {
      const { dataSourceApi } = param;

      const rowInfo = dataSourceApi.getRowInfoByIndex(id);

      if (!rowInfo) {
        return null;
      }

      const valueContext = getFormattedValueContextForCell({
        column,
        rowInfo,
        columnsMap: getComputed().computedColumnsMap,
        context: param,
      });

      return {
        value: valueContext.formattedValueContext.value,
        formattedValue: valueContext.formattedValue,
        rawValue: valueContext.formattedValueContext.rawValue,
      };
    },

    getValueByPrimaryKey(id: any) {
      return columnApi.getValuesByPrimaryKey(id)?.value ?? null;
    },

    toggleContextMenu(target: EventTarget | HTMLElement) {
      if (getState().columnMenuVisibleForColumnId === column.id) {
        this.hideContextMenu();
      } else {
        this.showContextMenu(target);
      }
    },

    toggleFilterOperatorMenu(target: EventTarget | HTMLElement) {
      if (getState().filterOperatorMenuVisibleForColumnId === column.id) {
        this.hideFilterOperatorMenu();
      } else {
        this.showFilterOperatorMenu(target);
      }
    },

    showFilterOperatorMenu(target: EventTarget | HTMLElement) {
      getState().onFilterOperatorMenuClick({ target, column });
    },

    hideFilterOperatorMenu() {
      actions.filterOperatorMenuVisibleForColumnId = null;
    },

    showContextMenu(target: EventTarget | HTMLElement) {
      getState().onColumnMenuClick({ target, column });
    },

    hideContextMenu() {
      actions.columnMenuVisibleForColumnId = null;
    },

    toggleSort() {
      column.toggleSort();
    },

    setFilter(value: any) {
      return api.setColumnFilter(column.id, value);
    },

    clearFilter() {
      return api.clearColumnFilter(column.id);
    },

    setSort(sort: SortDir | null) {
      if (!sort) {
        api.setSortInfoForColumn(column.id, null);
      } else {
        api.setSortingForColumn(column.id, sort);
      }
    },
    clearSort() {
      this.setSort(null);
    },
  };

  return columnApi;
}
