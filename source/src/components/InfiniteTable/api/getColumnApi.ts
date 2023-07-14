import { SortDir } from '../../../utils/multisort';

import { InfiniteTableComputedColumn } from '../types';
import {
  InfiniteTableColumnSortable,
  InfiniteTableColumnSortableFn,
} from '../types/InfiniteTableColumn';
import {
  InfiniteTableApi,
  InfiniteTableColumnApi,
  InfiniteTablePropSortable,
  MultiSortBehaviorOptions,
} from '../types/InfiniteTableProps';
import {
  DEFAULT_SORTABLE,
  UNKNOWN_SORT_TYPE,
} from '../utils/getComputedColumns';

import { GetImperativeApiParam } from './type';

export function isGroupColumnSortable<T>(
  column: InfiniteTableComputedColumn<T>,
  options: {
    columnDefaultSortable?: boolean;
    sortable?: InfiniteTablePropSortable<T>;

    fieldsToColumn: Map<keyof T, InfiniteTableComputedColumn<T>>;
  },
): InfiniteTableColumnSortable<T> {
  const { sortable, fieldsToColumn, columnDefaultSortable } = options;

  if (sortable) {
    return sortable;
  }

  let sortableColumnOrType =
    column.defaultSortable ?? column.colType.defaultSortable;

  if (sortableColumnOrType != null) {
    return sortableColumnOrType;
  }

  const defaultSortable = columnDefaultSortable ?? DEFAULT_SORTABLE;
  if (column.computedSortType !== UNKNOWN_SORT_TYPE && defaultSortable) {
    return true;
  }

  const isSortable: InfiniteTableColumnSortableFn<T> = (params) => {
    const { column, api } = params;

    let groupByForColumn = column.groupByForColumn || [];

    if (groupByForColumn != null && !Array.isArray(groupByForColumn)) {
      groupByForColumn = [groupByForColumn];
    }
    return (groupByForColumn || []).reduce((acc, groupBy) => {
      if (!acc) {
        return false;
      }
      const field: string | undefined =
        (groupBy.field as string) || groupBy.groupField;

      let colSortable: boolean | undefined = undefined;

      if (field) {
        const foundCol = fieldsToColumn.get(field as keyof T);
        const foundColApi = foundCol
          ? api.getColumnApi(foundCol.id)
          : undefined;
        if (foundCol && foundColApi) {
          colSortable = foundColApi.isSortable();
        } else {
          // we cannot sort the group column
          // as we don't have info on one of the groupBy items
          // eg: we can't know the sort type
          colSortable = false;
        }
      }
      if (colSortable === undefined && groupBy.valueGetter) {
        colSortable = true;
      }

      return colSortable ?? columnDefaultSortable ?? DEFAULT_SORTABLE;
    }, true as boolean);
  };

  return isSortable;
}

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
    getCellValuesByPrimaryKey(id: any) {
      return param.api.getCellValues({
        columnId: column.id,
        primaryKey: id,
      });
    },

    getCellValueByPrimaryKey(id: any) {
      return columnApi.getCellValuesByPrimaryKey(id)?.value ?? null;
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

    isVisible() {
      return getComputed().computedVisibleColumnsMap.has(column.id);
    },

    toggleSort(
      params: MultiSortBehaviorOptions = {
        multiSortBehavior: 'replace',
      },
    ) {
      return api.toggleSortingForColumn(column.id, params);
    },

    isSortable() {
      const { computedColumnsMap } = getComputed();

      return typeof column.computedSortable === 'function'
        ? column.computedSortable({
            api,
            columnApi,
            column,
            columns: computedColumnsMap,
          })
        : column.computedSortable;
    },

    getSortDir() {
      return api.getSortingForColumn(column.id);
    },

    setFilter(value: any) {
      return api.setColumnFilter(column.id, value);
    },

    clearFilter() {
      return api.clearColumnFilter(column.id);
    },

    getSortInfo() {
      return api.getSortInfoForColumn(column.id);
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
