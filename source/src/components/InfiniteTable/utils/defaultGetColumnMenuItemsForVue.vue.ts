/**
 * Vue sibling of defaultGetColumnMenuItems.tsx — the default column menu
 * items (menuItemsShared.ts) with Vue checkboxes.
 */
import { h } from 'vue';

import { MenuItemObject, MenuProps } from '../../Menu/MenuProps';

import { InfiniteCheckBox } from '../components/CheckBoxForVue.vue';
import { getColumnLabel } from '../components/InfiniteTableHeader/getColumnLabel';
import {
  ColumnMenuItemsParams,
  getDefaultColumnMenuItems,
} from './menuItemsShared';

export function defaultGetColumnMenuItems<T>(
  _items: MenuProps['items'],
  params: ColumnMenuItemsParams<T>,
): MenuProps['items'] {
  const CheckBoxCmp: typeof InfiniteCheckBox =
    (params.getState().components?.CheckBox as any) || InfiniteCheckBox;

  return getDefaultColumnMenuItems(params, {
    renderCheckBox: (props) => h(CheckBoxCmp, props),
    getColumnLabel: (col) =>
      getColumnLabel(col, params, 'column-menu') as MenuItemObject['label'],
  });
}
