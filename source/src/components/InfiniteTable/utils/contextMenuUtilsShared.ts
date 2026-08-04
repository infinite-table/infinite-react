/**
 * Framework-neutral helpers for the cell/table context menus, shared by
 * contextMenuUtils.tsx (React) and the Vue menu wiring.
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

export function getMenuDefaultProps(config: {
  onHideIntent: VoidFunction | undefined;
}) {
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

  const menuDefaultProps: MenuProps = {
    columns: [],
    items: [],
    autoFocus: true,
    onShow: (state) => {
      state.domRef.current?.parentNode?.addEventListener(
        'mousedown',
        onRootMouseDown,
      );
    },
    onHide,
    onHideIntent: (state: MenuState) => {
      onHide(state);
      config.onHideIntent?.();
    },
  };

  return menuDefaultProps;
}
