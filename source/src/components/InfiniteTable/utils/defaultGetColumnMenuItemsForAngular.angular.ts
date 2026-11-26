/**
 * Angular sibling of defaultGetColumnMenuItems.tsx (and of the Vue
 * defaultGetColumnMenuItemsForVue.vue.ts) - the default column menu items
 * (menuItemsShared.ts) with Angular checkboxes, and column labels bound to
 * their header param.
 */
import { Injector, TemplateRef } from '@angular/core';

import { MenuItemObject, MenuProps } from '../../Menu/MenuProps';
import {
  renderComponent,
  renderTemplate,
} from '../../RawList/InfiniteRenderForAngular.angular';

import { InfiniteCheckBox } from '../components/CheckBoxForAngular.angular';
import { getColumnLabelForAngular } from './getColumnLabelForAngular.angular';
import {
  ColumnMenuItemsParams,
  getDefaultColumnMenuItems,
} from './menuItemsShared';

function renderCheckBox(
  CheckBoxCmp: unknown,
  inputs: {
    checked: boolean;
    disabled: boolean;
    onChange: (checked: boolean | null) => void;
  },
) {
  if (CheckBoxCmp instanceof TemplateRef) {
    // a template override gets the props as its context
    return renderTemplate(CheckBoxCmp, { $implicit: inputs, ...inputs });
  }
  return renderComponent(CheckBoxCmp as any, { inputs });
}

export function defaultGetColumnMenuItems<T>(
  _items: MenuProps['items'],
  params: ColumnMenuItemsParams<T>,
  /** the grid's injector: header labels can `injectHeaderCell()` */
  injector?: Injector,
): MenuProps['items'] {
  const CheckBoxCmp: unknown =
    params.getState().components?.CheckBox || InfiniteCheckBox;

  return getDefaultColumnMenuItems(params, {
    // no key: Angular checkboxes are not keyed
    renderCheckBox: ({ key: _key, ...inputs }) =>
      renderCheckBox(CheckBoxCmp, inputs),
    getColumnLabel: (col) =>
      getColumnLabelForAngular(
        col,
        params,
        'column-menu',
        injector,
      ) as MenuItemObject['label'],
  });
}
