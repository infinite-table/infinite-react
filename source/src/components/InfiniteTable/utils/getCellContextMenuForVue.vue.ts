/**
 * Vue sibling of getCellContextMenu.tsx — the cell/table context menu
 * vnodes, from the shared context menu content (menuItemsShared.ts): a lazy
 * (Promise) menu is a slot that fills itself in when it resolves.
 */
import { h } from 'vue';
import type { VNodeChild } from 'vue';

import { Menu } from '../../Menu/MenuForVue.vue';
import { RenderSlot } from '../../RawList/RenderSlot.vue';
import { buildSubscriptionCallback } from '../../utils/buildSubscriptionCallback';
import type { Renderable } from '../../types/Renderable';

import {
  CellContextMenuLocationWithEvent,
  ContextMenuLocationWithEvent,
} from '../types/InfiniteTableState';
import { getLazyMenuProps } from './contextMenuUtilsShared';
import {
  ContextMenuBinder,
  getCellContextMenuContent,
  getTableContextMenuContent,
} from './menuItemsShared';
import { InfiniteTableStableContextValue } from '../types/InfiniteTableContextValue';

function getContextMenuBinder<T>(
  context: InfiniteTableStableContextValue<T>,
): ContextMenuBinder<VNodeChild> {
  const MenuCmp = (context.getState().components?.Menu as any) ?? Menu;

  return {
    renderMenu: (props) => h(MenuCmp, props) as VNodeChild,
    renderLazyMenu: (menuDefinition, menuDefaultProps) => {
      const updater = buildSubscriptionCallback<Renderable>();

      menuDefinition.then((menuDefinition) => {
        const menuProps = getLazyMenuProps(menuDefinition, menuDefaultProps);
        if (menuProps) {
          updater(h(MenuCmp, menuProps) as unknown as Renderable);
        }
      });

      return h(RenderSlot, { updater });
    },
  };
}

export function getCellContextMenu<T>(
  cellLocation: CellContextMenuLocationWithEvent,
  context: InfiniteTableStableContextValue<T>,
  onHideIntent?: VoidFunction,
) {
  return getCellContextMenuContent(
    cellLocation,
    context,
    onHideIntent,
    getContextMenuBinder(context),
  );
}

export function getTableContextMenu<T>(
  menuLocation: ContextMenuLocationWithEvent,
  context: InfiniteTableStableContextValue<T>,
  onHideIntent?: VoidFunction,
) {
  return getTableContextMenuContent(
    menuLocation,
    context,
    onHideIntent,
    getContextMenuBinder(context),
  );
}
