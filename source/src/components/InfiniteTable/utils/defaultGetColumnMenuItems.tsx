import * as React from 'react';
import { MenuItemObject, MenuProps } from '../../Menu/MenuProps';

import { InfiniteCheckBox } from '../components/CheckBox';
import { getColumnLabel } from '../components/InfiniteTableHeader/getColumnLabel';
import {
  ColumnMenuItemsParams,
  getDefaultColumnMenuItems,
} from './menuItemsShared';

export function defaultGetColumnMenuItems<T>(
  _items: MenuProps['items'],
  params: ColumnMenuItemsParams<T>,
): MenuProps['items'] {
  const CheckBoxCmp =
    params.getState().components?.CheckBox || InfiniteCheckBox;

  return getDefaultColumnMenuItems(params, {
    renderCheckBox: ({ key, ...props }) => (
      <CheckBoxCmp key={key} {...props}></CheckBoxCmp>
    ),
    getColumnLabel: (col) =>
      getColumnLabel(col, params, 'column-menu') as MenuItemObject['label'],
  });
}
