/**
 * Vue sibling of getMenuForColumn.tsx — the column menu vnode, from the
 * shared column menu props (menuItemsShared.ts).
 */
import { h } from 'vue';
import type { VNodeChild } from 'vue';

import { Menu } from '../../Menu/MenuForVue.vue';
import { defaultGetColumnMenuItems } from './defaultGetColumnMenuItemsForVue.vue';
import { getColumnMenuProps } from './menuItemsShared';
import { InfiniteTableStableContextValue } from '../types/InfiniteTableContextValue';

export function getMenuForColumn<T>(
  columnId: string | null,
  context: InfiniteTableStableContextValue<T>,
  onHideIntent?: VoidFunction,
): VNodeChild {
  const MenuCmp = (context.getState().components?.Menu as any) ?? Menu;

  const menuProps = getColumnMenuProps(
    columnId,
    context,
    onHideIntent,
    (param) => defaultGetColumnMenuItems([], param),
  );

  return menuProps ? h(MenuCmp, menuProps) : null;
}
