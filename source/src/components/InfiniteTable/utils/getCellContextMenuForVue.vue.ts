/**
 * Vue sibling of getCellContextMenu.tsx — builds the cell/table context
 * menu vnodes from the user-provided getCellContextMenuItems /
 * getContextMenuItems props (including the lazy/Promise variants).
 */
import { h } from 'vue';
import type { VNodeChild } from 'vue';

import { Menu } from '../../Menu/MenuForVue.vue';
import { RenderSlot } from '../../RawList/RenderSlot.vue';
import { buildSubscriptionCallback } from '../../utils/buildSubscriptionCallback';
import type { Renderable } from '../../types/Renderable';
import { getCellContext } from '../components/InfiniteTableRow/columnRendering';

import {
  CellContextMenuLocationWithEvent,
  ContextMenuLocationWithEvent,
} from '../types/InfiniteTableState';
import type { GetContextMenuItemsReturnType } from '../types/InfiniteTableProps';
import type { MenuProps } from '../../Menu/MenuProps';
import {
  getMenuDefaultProps,
  getMenuItemsAndColumns,
} from './contextMenuUtilsShared';
import { InfiniteTableStableContextValue } from '../types/InfiniteTableContextValue';

function getLazyMenu(
  menuDefinition: Promise<GetContextMenuItemsReturnType>,
  menuDefaultProps: MenuProps,
  MenuCmp: any,
): VNodeChild {
  if (!menuDefinition) {
    return null;
  }

  const updater = buildSubscriptionCallback<Renderable>();

  menuDefinition.then((menuDefinition) => {
    const { items, columns } = getMenuItemsAndColumns(menuDefinition);
    if (items && items.length) {
      updater(
        h(MenuCmp, {
          ...menuDefaultProps,
          items: items || [],
          columns,
        }) as unknown as Renderable,
      );
    }
  });

  return h(RenderSlot, { updater });
}

export function getCellContextMenu<T>(
  cellLocation: CellContextMenuLocationWithEvent,
  context: InfiniteTableStableContextValue<T>,
  onHideIntent?: VoidFunction,
) {
  const { columnId, rowIndex, event } = cellLocation;
  const { getComputed, getState } = context;

  const { components, getCellContextMenuItems } = getState();

  const MenuCmp = (components?.Menu as any) ?? Menu;

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
    menu: h(MenuCmp, { ...menuDefaultProps, columns, items }) as VNodeChild,
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

  const MenuCmp = (components?.Menu as any) ?? Menu;

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
  const menuDefinition = getContextMenuItems(cellContext as any, context);

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
    menu: h(MenuCmp, { ...menuDefaultProps, columns, items }) as VNodeChild,
    cellContext,
  };
}
