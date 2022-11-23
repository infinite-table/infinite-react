import * as React from 'react';
import { DataSourceComponentActions, DataSourceState } from '../../DataSource';
import { MenuItemObject, MenuProps } from '../../Menu/MenuProps';
import { Renderable } from '../../types/Renderable';
import { getColumnApiForColumn } from '../api/getColumnApi';
import { InfiniteCheckBox } from '../components/CheckBox';
import {
  InfiniteTableApi,
  InfiniteTableComputedColumn,
  InfiniteTableComputedValues,
  InfiniteTableState,
} from '../types';
import { InfiniteTableActions } from '../types/InfiniteTableState';

export function defaultGetColumContextMenuItems<T>(
  _items: MenuProps['items'],
  params: {
    column: InfiniteTableComputedColumn<T>;
    api: InfiniteTableApi<T>;
    getState: () => InfiniteTableState<T>;
    getDataSourceState: () => DataSourceState<T>;
    getComputed: () => InfiniteTableComputedValues<T>;

    actions: InfiniteTableActions<T>;
    dataSourceActions: DataSourceComponentActions<T>;
  },
): MenuProps['items'] {
  const {
    column,
    getComputed,
    api,
    getDataSourceState,
    actions,
    dataSourceActions,
  } = params;

  return [
    {
      key: 'sort-asc',
      label: 'Sort Ascending',
      disabled: column.computedSortedAsc,
      onAction: () => {
        api.setSortingForColumn(column.id, 1);
      },
    },
    {
      key: 'sort-desc',
      label: 'Sort Descending',
      disabled: column.computedSortedDesc,
      onAction: () => {
        api.setSortingForColumn(column.id, -1);
      },
    },
    {
      key: 'sort-none',
      label: 'Unsort',
      disabled: !column.computedSorted,
      onAction: () => {
        api.setSortingForColumn(column.id, null);
      },
    },
    '-',
    {
      key: 'pin-start',
      label: 'Pin to start',
      disabled: column.computedPinned === 'start',
      onAction: () => {
        api.setPinningForColumn(column.id, 'start');
      },
    },
    // {
    //   key: 'pin-end',
    //   label: 'Pin to end',
    //   disabled: column.computedPinned === 'end',
    //   onAction: () => {},
    // },
    {
      key: 'unpin',
      label: 'Unpin',
      disabled: !column.computedPinned,
      onAction: () => {
        api.setPinningForColumn(column.id, false);
      },
    },
    '-',
    {
      key: 'columns',
      label: 'Columns',
      menu: () => {
        const colItems: MenuItemObject[] = [];

        const computed = getComputed();
        const dataSourceState = getDataSourceState();
        const { allRowsSelected, someRowsSelected, selectionMode } =
          dataSourceState;

        computed.computedColumnsMapInInitialOrder.forEach((col, id) => {
          const columnApi = getColumnApiForColumn(id, {
            ...params,
            componentActions: actions,
            dataSourceActions,
          })!;
          let label: Renderable =
            col.header && typeof col.header !== 'function'
              ? col.header
              : col.name || id || '';

          if (typeof col.header === 'function') {
            label =
              col.header({
                column: col,
                columnApi,
                insideColumnMenu: true,
                dragging: false,
                columnsMap: computed.computedColumnsMap,
                columnSortInfo: col.computedSortInfo,
                columnFilterValue: col.computedFilterValue,
                allRowsSelected,
                someRowsSelected,
                selectionMode,
                api,
                renderBag: {
                  header: label,
                },
              }) ?? null;
          }
          colItems.push({
            key: id,
            label,

            check: (
              <InfiniteCheckBox
                key={col.id}
                disabled={
                  col.computedVisible && api.getVisibleColumnsCount() === 1
                }
                checked={col.computedVisible}
                onChange={(checked) => {
                  api.setVisibilityForColumn(col.id, !!checked);
                }}
              ></InfiniteCheckBox>
            ),
          });
        });

        return {
          columns: [
            {
              name: 'check',
            },
            { name: 'label' },
          ],
          items: colItems,
        };
      },
    },
  ];
}
