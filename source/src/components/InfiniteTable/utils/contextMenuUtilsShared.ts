/**
 * Framework-neutral helpers for the grid's menus (column menu, filter
 * operator menu, cell / table context menus), shared by the React, Vue and
 * Angular menu builders.
 */
import type { MenuProps } from '../../Menu/MenuProps';
import type { MenuState } from '../../Menu/MenuState';
import type { GetContextMenuItemsReturnType } from '../types/InfiniteTableProps';

export function getMenuItemsAndColumns(
  menuDefinition: GetContextMenuItemsReturnType,
) {
  let items = menuDefinition
    ? Array.isArray(menuDefinition)
      ? menuDefinition
      : menuDefinition.items
    : null;

  const columns =
    menuDefinition && !Array.isArray(menuDefinition)
      ? menuDefinition.columns
      : undefined;

  return {
    items,
    columns,
  };
}

/**
 * The `onShow` / `onHide` / `onHideIntent` props of a grid menu: a mousedown
 * inside the menu is marked (`event.__insideMenu`), so the grid's
 * document mousedown listener only closes the menu on a mousedown outside
 * it; `onHideIntent` (Escape, an action that hides the menu) also calls the
 * given `onHideIntent`.
 */
export function getMenuVisibilityProps(
  onHideIntent: VoidFunction | undefined,
): Pick<MenuProps, 'onShow' | 'onHide' | 'onHideIntent'> {
  const onRootMouseDown: EventListener = (event: Event) => {
    //@ts-ignore
    event.__insideMenu = true;
  };

  const onHide = (state: MenuState) => {
    state.domRef.current?.parentNode?.removeEventListener(
      'mousedown',
      onRootMouseDown,
    );
  };

  return {
    onShow: (state: MenuState) => {
      state.domRef.current?.parentNode?.addEventListener(
        'mousedown',
        onRootMouseDown,
      );
    },
    onHide,
    onHideIntent: (state: MenuState) => {
      onHide(state);
      onHideIntent?.();
    },
  };
}

export function getMenuDefaultProps(config: {
  onHideIntent: VoidFunction | undefined;
}) {
  const menuDefaultProps: MenuProps = {
    columns: [],
    items: [],
    autoFocus: true,
    ...getMenuVisibilityProps(config.onHideIntent),
  };

  return menuDefaultProps;
}

/**
 * The props of a lazy context menu once its definition resolved - null
 * when it has no items (nothing is shown then).
 */
export function getLazyMenuProps(
  menuDefinition: GetContextMenuItemsReturnType,
  menuDefaultProps: MenuProps,
): MenuProps | null {
  const { items, columns } = getMenuItemsAndColumns(menuDefinition);
  if (items && items.length) {
    return {
      ...menuDefaultProps,
      items: items || [],
      columns,
    };
  }
  return null;
}
