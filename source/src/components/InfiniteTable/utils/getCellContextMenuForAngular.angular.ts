/**
 * Angular sibling of getCellContextMenu.tsx (and of the Vue
 * getCellContextMenuForVue.vue.ts) - the cell / table context menu content,
 * from the user-provided getCellContextMenuItems / getContextMenuItems
 * props (including the lazy, Promise-returning variants).
 *
 * A lazy menu is returned as `lazyMenu` (a promise of the content): the
 * caller shows nothing and updates the overlay when it resolves (React and
 * Vue render a slot that fills itself in).
 */
import { renderMenu } from '../../Menu/MenuForAngular.angular';
import type { MenuProps } from '../../Menu/MenuProps';
import type { Renderable } from '../../types/FrameworkTypes.angular';
import { getCellContext } from '../components/InfiniteTableRow/columnRendering';

import {
  CellContextMenuLocationWithEvent,
  ContextMenuLocationWithEvent,
} from '../types/InfiniteTableState';
import type { GetContextMenuItemsReturnType } from '../types/InfiniteTableProps';
import {
  getMenuDefaultProps,
  getMenuItemsAndColumns,
} from './contextMenuUtilsShared';
import { InfiniteTableStableContextValue } from '../types/InfiniteTableContextValue';

export type ContextMenuContent = {
  menu: Renderable;
  /** set for a lazy menu: resolves with the menu (null for no items) */
  lazyMenu?: Promise<Renderable>;
  preventDefault: boolean;
};

function getLazyMenu(
  menuDefinition: Promise<GetContextMenuItemsReturnType>,
  menuDefaultProps: MenuProps,
  MenuCmp: any,
): Promise<Renderable> {
  return menuDefinition.then((menuDefinition) => {
    const { items, columns } = getMenuItemsAndColumns(menuDefinition);
    if (items && items.length) {
      return renderMenu(
        {
          ...menuDefaultProps,
          items: items || [],
          columns,
        },
        MenuCmp,
      );
    }
    return null;
  });
}

function getMenu(
  menuDefinition:
    | GetContextMenuItemsReturnType
    | Promise<GetContextMenuItemsReturnType>,
  menuDefaultProps: MenuProps,
  MenuCmp: any,
): ContextMenuContent {
  const preventDefault =
    menuDefinition instanceof Promise
      ? true
      : Array.isArray(menuDefinition)
      ? true
      : !!(menuDefinition && Array.isArray(menuDefinition.items));

  if (menuDefinition instanceof Promise) {
    return {
      menu: null,
      lazyMenu: getLazyMenu(menuDefinition, menuDefaultProps, MenuCmp),
      preventDefault,
    };
  }

  const { items, columns } = getMenuItemsAndColumns(menuDefinition);

  if (!items || !items.length) {
    return { menu: null, preventDefault: Array.isArray(items) };
  }

  return {
    preventDefault,
    menu: renderMenu({ ...menuDefaultProps, columns, items }, MenuCmp),
  };
}

export function getCellContextMenu<T>(
  cellLocation: CellContextMenuLocationWithEvent,
  context: InfiniteTableStableContextValue<T>,
  onHideIntent?: VoidFunction,
) {
  const { columnId, rowIndex, event } = cellLocation;
  const { getComputed, getState } = context;

  const { components, getCellContextMenuItems } = getState();

  const MenuCmp = components?.Menu as any;

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
      menu: null as Renderable,
      preventDefault: false,
    } as ContextMenuContent & { cellContext: typeof cellContext };
  }

  const menuDefaultProps = getMenuDefaultProps({
    onHideIntent,
  });

  const menuDefinition = getCellContextMenuItems(cellContext, context);

  return {
    cellContext,
    ...getMenu(menuDefinition, menuDefaultProps, MenuCmp),
  };
}

export function getTableContextMenu<T>(
  menuLocation: ContextMenuLocationWithEvent,
  context: InfiniteTableStableContextValue<T>,
  onHideIntent?: VoidFunction,
) {
  const { getState, getComputed } = context;
  const { components, getContextMenuItems } = getState();

  const MenuCmp = components?.Menu as any;

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
    return {
      cellContext,
      menu: null as Renderable,
      preventDefault: false,
    } as ContextMenuContent & { cellContext: typeof cellContext };
  }

  const menuDefaultProps = getMenuDefaultProps({
    onHideIntent,
  });
  const menuDefinition = getContextMenuItems(cellContext as any, context);

  return {
    cellContext,
    ...getMenu(menuDefinition, menuDefaultProps, MenuCmp),
  };
}
