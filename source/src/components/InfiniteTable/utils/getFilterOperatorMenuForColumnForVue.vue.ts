/**
 * Vue sibling of getFilterOperatorMenuForColumn.tsx — the filter operator
 * menu vnode, from the shared filter operator menu props
 * (menuItemsShared.ts) with Vue icons.
 */
import { h } from 'vue';
import type { VNodeChild } from 'vue';

import { Menu } from '../../Menu/MenuForVue.vue';
import { ClearIcon, DoneIcon } from '../components/icons/IconForVue.vue';
import { FilterIcon } from '../components/icons/FilterIcon/FilterIconForVue.vue';

import { InfiniteTableStableContextValue } from '../types/InfiniteTableContextValue';
import { getFilterOperatorMenuProps } from './menuItemsShared';

export function getFilterOperatorMenuForColumn<T>(
  columnId: string | null,
  context: InfiniteTableStableContextValue<T>,
  onHideIntent?: VoidFunction,
): VNodeChild {
  const MenuCmp = (context.getState().components?.Menu as any) ?? Menu;

  const menuProps = getFilterOperatorMenuProps(
    columnId,
    context,
    onHideIntent,
    {
      renderOperatorIcon: (operator) =>
        h((operator.components?.Icon as any) ?? FilterIcon),
      renderOperatorLabel: (label) => label,
      renderClearIcon: () => h(ClearIcon),
      renderDoneIcon: () => h(DoneIcon, { size: 16 }),
    },
  );

  return menuProps ? h(MenuCmp, menuProps) : null;
}
