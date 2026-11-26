import * as React from 'react';

import { Menu } from '../../Menu';
import { defaultGetColumnMenuItems } from './defaultGetColumnMenuItems';
import { getColumnMenuProps } from './menuItemsShared';
import { InfiniteTableStableContextValue } from '../types/InfiniteTableContextValue';

export function getMenuForColumn<T>(
  columnId: string | null,
  context: InfiniteTableStableContextValue<T>,
  onHideIntent?: VoidFunction,
) {
  const MenuCmp = context.getState().components?.Menu ?? Menu;

  const menuProps = getColumnMenuProps(
    columnId,
    context,
    onHideIntent,
    (param) => defaultGetColumnMenuItems([], param),
  );

  return menuProps ? <MenuCmp {...menuProps} /> : null;
}
