import { SortDir } from '../../../utils/multisort';

import { InfiniteTableComputedColumn } from '../types';
import {
  InfiniteTableApi,
  InfiniteTableColumnApi,
} from '../types/InfiniteTableProps';

import { GetImperativeApiParam } from './type';

export function getColumnApiForColumn<T>(
  colOrColId: string | InfiniteTableComputedColumn<T>,
  param: GetImperativeApiParam<T> & { api: InfiniteTableApi<T> },
) {
  const { getComputed, getState, actions, api } = param;

  const column =
    typeof colOrColId === 'string'
      ? getComputed().computedColumnsMap.get(colOrColId)
      : colOrColId;

  if (!column) {
    return null;
  }

  const columnApi: InfiniteTableColumnApi<T> = {
    toggleContextMenu(target: EventTarget | HTMLElement) {
      if (getState().columnContextMenuVisibleForColumnId === column.id) {
        this.hideContextMenu();
      } else {
        this.showContextMenu(target);
      }
    },

    showContextMenu(target: EventTarget | HTMLElement) {
      getState().onColumnMenuClick({ target, column });
    },

    hideContextMenu() {
      actions.columnContextMenuVisibleForColumnId = null;
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
