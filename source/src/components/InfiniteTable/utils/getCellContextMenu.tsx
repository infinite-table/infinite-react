import * as React from 'react';

import { Menu } from '../../Menu';
import type { MenuProps } from '../../Menu/MenuProps';

import {
  CellContextMenuLocationWithEvent,
  ContextMenuLocationWithEvent,
} from '../types/InfiniteTableState';
import { getLazyMenu } from './contextMenuUtils';
import {
  ContextMenuBinder,
  getCellContextMenuContent,
  getTableContextMenuContent,
} from './menuItemsShared';
import { InfiniteTableStableContextValue } from '../types/InfiniteTableContextValue';

function getContextMenuBinder<T>(
  context: InfiniteTableStableContextValue<T>,
): ContextMenuBinder<React.ReactNode> {
  const MenuCmp: React.ComponentType<MenuProps> =
    context.getState().components?.Menu ?? Menu;

  return {
    renderMenu: (props) => <MenuCmp {...props} />,
    renderLazyMenu: (menuDefinition, menuDefaultProps) =>
      getLazyMenu(menuDefinition, menuDefaultProps, MenuCmp),
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
