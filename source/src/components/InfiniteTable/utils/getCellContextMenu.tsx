import * as React from 'react';

import { Menu } from '../../Menu';
import { getCellContext } from '../components/InfiniteTableRow/columnRendering';

import {
  CellContextMenuLocationWithEvent,
  ContextMenuLocationWithEvent,
} from '../types/InfiniteTableState';
import {
  getLazyMenu,
  getMenuDefaultProps,
  getMenuItemsAndColumns,
} from './contextMenuUtils';
import { InfiniteTableStableContextValue } from '../types/InfiniteTableContextValue';

export function getCellContextMenu<T>(
  cellLocation: CellContextMenuLocationWithEvent,
  context: InfiniteTableStableContextValue<T>,
  onHideIntent?: VoidFunction,
) {
  const { columnId, rowIndex, event } = cellLocation;
  const { getComputed, getState } = context;

  const { components, getCellContextMenuItems } = getState();

  const MenuCmp = components?.Menu ?? Menu;

  const { computedColumnsMap } = getComputed();

  const column = computedColumnsMap.get(columnId)!;

  const cellContext = {
    ...getCellContext({
      ...context,
      rowIndex,
      columnId: column.id,
    }),
    event,
  };

  if (!column || !getCellContextMenuItems) {
    return {
      cellContext,
      menu: null,
      preventDefault: false,
    };
  }

  const menuDefaultProps = getMenuDefaultProps({
    onHideIntent,
  });

  const menuDefinition = getCellContextMenuItems(cellContext, context);

  const preventDefault =
    menuDefinition instanceof Promise
      ? true
      : Array.isArray(menuDefinition)
      ? true
      : !!(menuDefinition && Array.isArray(menuDefinition.items));

  if (menuDefinition instanceof Promise) {
    return {
      cellContext,
      menu: getLazyMenu(menuDefinition, menuDefaultProps, MenuCmp),
      preventDefault,
    };
  }

  const { items, columns } = getMenuItemsAndColumns(menuDefinition);

  if (!items || !items.length) {
    return { cellContext, menu: null, preventDefault: Array.isArray(items) };
  }

  return {
    preventDefault,
    menu: <MenuCmp {...menuDefaultProps} columns={columns} items={items} />,
    cellContext,
  };
}

export function getTableContextMenu<T>(
  menuLocation: ContextMenuLocationWithEvent,
  context: InfiniteTableStableContextValue<T>,
  onHideIntent?: VoidFunction,
) {
  const { getState, getComputed } = context;
  const { components, getContextMenuItems } = getState();

  const MenuCmp = components?.Menu ?? Menu;

  const { computedColumnsMap } = getComputed();

  const column = menuLocation.columnId
    ? computedColumnsMap.get(menuLocation.columnId)
    : undefined;

  const cellContext = column
    ? {
        ...menuLocation,
        ...getCellContext({
          ...context,
          rowIndex: menuLocation.rowIndex!,
          columnId: column.id,
        }),
      }
    : menuLocation;

  if (!getContextMenuItems) {
    return { cellContext, menu: null, preventDefault: false };
  }

  const menuDefaultProps = getMenuDefaultProps({
    onHideIntent,
  });
  const menuDefinition = getContextMenuItems(cellContext, context);

  const preventDefault =
    menuDefinition instanceof Promise
      ? true
      : Array.isArray(menuDefinition)
      ? true
      : !!(menuDefinition && Array.isArray(menuDefinition.items));

  if (menuDefinition instanceof Promise) {
    return {
      cellContext,
      menu: getLazyMenu(menuDefinition, menuDefaultProps, MenuCmp),
      preventDefault,
    };
  }

  const { items, columns } = getMenuItemsAndColumns(menuDefinition);
  if (!items || !items.length) {
    return { cellContext, menu: null, preventDefault: Array.isArray(items) };
  }

  return {
    preventDefault,
    menu: <MenuCmp {...menuDefaultProps} columns={columns} items={items} />,
    cellContext,
  };
}
