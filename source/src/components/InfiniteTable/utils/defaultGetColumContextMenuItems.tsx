import * as React from 'react';
import {
  DataSourceApi,
  DataSourceComponentActions,
  DataSourceState,
} from '../../DataSource';
import { MenuItemObject, MenuProps } from '../../Menu/MenuProps';

import { InfiniteCheckBox } from '../components/CheckBox';
import { getColumnLabel } from '../components/InfiniteTableHeader/getColumnLabel';
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
    dataSourceApi: DataSourceApi<T>;
    getState: () => InfiniteTableState<T>;
    getDataSourceState: () => DataSourceState<T>;
    getComputed: () => InfiniteTableComputedValues<T>;

    actions: InfiniteTableActions<T>;
    dataSourceActions: DataSourceComponentActions<T>;
  },
): MenuProps['items'] {
  const { column, getComputed, api } = params;

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

        computed.computedColumnsMapInInitialOrder.forEach((col, id) => {
          const label = getColumnLabel(col, params);

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
