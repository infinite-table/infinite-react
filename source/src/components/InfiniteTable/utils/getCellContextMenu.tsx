import * as React from 'react';

import { Menu } from '../../Menu';
import { MenuState } from '../../Menu/MenuState';
import { getCellContext } from '../components/InfiniteTableRow/columnRendering';
import { InfiniteTableContextValue } from '../types';
import {
  CellContextMenuLocationWithEvent,
  ContextMenuLocationWithEvent,
} from '../types/InfiniteTableState';

export function getCellContextMenu<T>(
  cellLocation: CellContextMenuLocationWithEvent,
  context: InfiniteTableContextValue<T>,
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

  const menuDefinition = getCellContextMenuItems(cellContext, context);
  let items = menuDefinition
    ? Array.isArray(menuDefinition)
      ? menuDefinition
      : menuDefinition.items
    : null;
  const menuColumns =
    menuDefinition && !Array.isArray(menuDefinition)
      ? menuDefinition.columns
      : undefined;

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

  if (!items || !items.length) {
    return { cellContext, menu: null, preventDefault: Array.isArray(items) };
  }

  return {
    preventDefault: true,
    menu: (
      <MenuCmp
        columns={menuColumns}
        autoFocus
        items={items}
        onShow={(state) => {
          state.domRef.current?.parentNode?.addEventListener(
            'mousedown',
            onRootMouseDown,
          );
        }}
        onHide={onHide}
        onHideIntent={(state: MenuState) => {
          onHide(state);
          onHideIntent?.();
        }}
      />
    ),
    cellContext,
  };
}

export function getTableContextMenu<T>(
  menuLocation: ContextMenuLocationWithEvent,
  context: InfiniteTableContextValue<T>,
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

  let menuDefinition = getContextMenuItems(cellContext, context);

  let items = menuDefinition
    ? Array.isArray(menuDefinition)
      ? menuDefinition
      : menuDefinition.items
    : null;
  const menuColumns =
    menuDefinition && !Array.isArray(menuDefinition)
      ? menuDefinition.columns
      : undefined;

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

  if (!items || !items.length) {
    return { cellContext, menu: null, preventDefault: Array.isArray(items) };
  }

  return {
    preventDefault: true,
    menu: (
      <MenuCmp
        columns={menuColumns}
        autoFocus
        items={items}
        onShow={(state) => {
          state.domRef.current?.parentNode?.addEventListener(
            'mousedown',
            onRootMouseDown,
          );
        }}
        onHide={onHide}
        onHideIntent={(state: MenuState) => {
          onHide(state);
          onHideIntent?.();
        }}
      />
    ),
    cellContext,
  };
}
