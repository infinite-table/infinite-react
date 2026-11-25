/**
 * Angular sibling of getCellContextMenu.tsx (and of the Vue
 * getCellContextMenuForVue.vue.ts) - the cell / table context menu content,
 * from the shared context menu content (menuItemsShared.ts).
 *
 * A lazy menu is returned as `lazyMenu` (a promise of the content): the
 * caller shows nothing and updates the overlay when it resolves (React and
 * Vue render a slot that fills itself in).
 */
import { renderMenu } from '../../Menu/MenuForAngular.angular';
import type { Renderable } from '../../types/FrameworkTypes.angular';

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

export type ContextMenuContent = {
  menu: Renderable;
  /** set for a lazy menu: resolves with the menu (null for no items) */
  lazyMenu?: Promise<Renderable>;
  preventDefault: boolean;
};

/**
 * A lazy menu is rendered as the promise of the menu.
 */
type AngularContextMenu = Renderable | Promise<Renderable>;

function getContextMenuBinder<T>(
  context: InfiniteTableStableContextValue<T>,
): ContextMenuBinder<AngularContextMenu> {
  const MenuCmp = context.getState().components?.Menu as any;

  return {
    renderMenu: (props) => renderMenu(props, MenuCmp),
    renderLazyMenu: (menuDefinition, menuDefaultProps) =>
      menuDefinition.then((menuDefinition) => {
        const menuProps = getLazyMenuProps(menuDefinition, menuDefaultProps);
        return menuProps ? renderMenu(menuProps, MenuCmp) : null;
      }),
  };
}

function toContextMenuContent<C>(content: {
  cellContext: C;
  menu: AngularContextMenu | null;
  preventDefault: boolean;
}): ContextMenuContent & { cellContext: C } {
  const { cellContext, menu, preventDefault } = content;
  return menu instanceof Promise
    ? { cellContext, menu: null, lazyMenu: menu, preventDefault }
    : { cellContext, menu, preventDefault };
}

export function getCellContextMenu<T>(
  cellLocation: CellContextMenuLocationWithEvent,
  context: InfiniteTableStableContextValue<T>,
  onHideIntent?: VoidFunction,
) {
  return toContextMenuContent(
    getCellContextMenuContent(
      cellLocation,
      context,
      onHideIntent,
      getContextMenuBinder(context),
    ),
  );
}

export function getTableContextMenu<T>(
  menuLocation: ContextMenuLocationWithEvent,
  context: InfiniteTableStableContextValue<T>,
  onHideIntent?: VoidFunction,
) {
  return toContextMenuContent(
    getTableContextMenuContent(
      menuLocation,
      context,
      onHideIntent,
      getContextMenuBinder(context),
    ),
  );
}
