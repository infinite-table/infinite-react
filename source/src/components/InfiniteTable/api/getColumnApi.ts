import { SortDir } from '../../../utils/multisort';

import { InfiniteTableComputedColumn } from '../types';
import { InfiniteTableColumnApi } from '../types/InfiniteTableProps';

import { GetImperativeApiParam } from './type';
import { getImperativeApi } from './getImperativeApi';

export function getColumnApiForColumn<T>(
  colOrColId: string | InfiniteTableComputedColumn<T>,
  param: GetImperativeApiParam<T>,
) {
  const { getComputed, getState, componentActions } = param;

  const column =
    typeof colOrColId === 'string'
      ? getComputed().computedColumnsMap.get(colOrColId)
      : colOrColId;

  if (!column) {
    return null;
  }

  const api = getImperativeApi(param);

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
      componentActions.columnContextMenuVisibleForColumnId = null;
    },

    toggleSort() {
      column.toggleSort();
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
