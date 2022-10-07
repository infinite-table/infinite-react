import * as React from 'react';
import { MenuItemObject, MenuProps } from '../../Menu/MenuProps';
import { InfiniteCheckBox } from '../components/CheckBox';
import {
  InfiniteTableApi,
  InfiniteTableComputedColumn,
  InfiniteTableComputedValues,
  InfiniteTableState,
} from '../types';
import { InfiniteTableActions } from '../types/InfiniteTableState';

export function defaultGetColumContextMenuItems<T>(params: {
  column: InfiniteTableComputedColumn<T>;
  api: InfiniteTableApi<T>;
  getState: () => InfiniteTableState<T>;
  getComputed: () => InfiniteTableComputedValues<T>;
  actions: InfiniteTableActions<T>;
}): MenuProps['items'] {
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

        getComputed().computedColumnsMapInInitialOrder.forEach((col, id) => {
          colItems.push({
            key: id,
            label: col.name || id || '',

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
