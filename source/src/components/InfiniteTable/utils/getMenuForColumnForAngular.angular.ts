/**
 * Angular sibling of getMenuForColumn.tsx (and of the Vue
 * getMenuForColumnForVue.vue.ts) - the column menu content, from the
 * default (or user-provided) column menu items.
 */
import type { Injector } from '@angular/core';

import { renderMenu } from '../../Menu/MenuForAngular.angular';
import { MenuState } from '../../Menu/MenuState';
import type { Renderable } from '../../types/FrameworkTypes.angular';
import { getColumnApiForColumn } from '../api/getColumnApi';
import { defaultGetColumnMenuItems } from './defaultGetColumnMenuItemsForAngular.angular';
import { InfiniteTableStableContextValue } from '../types/InfiniteTableContextValue';

export function getMenuForColumn<T>(
  columnId: string | null,
  context: InfiniteTableStableContextValue<T>,
  onHideIntent?: VoidFunction,
  /** the grid's injector (header labels in the Columns submenu) */
  injector?: Injector,
): Renderable {
  if (columnId == null) {
    return null;
  }
  const { getComputed, getState } = context;

  const { components, getColumnMenuItems } = getState();

  const column = getComputed().computedColumnsMap.get(columnId);

  if (!column) {
    return null;
  }

  const param = {
    column,
    columnApi: getColumnApiForColumn(column.id, context)!,
    ...context,
  };

  const defaultItems = defaultGetColumnMenuItems([], param, injector)!;

  const items = getColumnMenuItems
    ? getColumnMenuItems(defaultItems, param)
    : defaultItems;

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
    return null;
  }

  return renderMenu(
    {
      autoFocus: true,
      items,
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
    },
    components?.Menu as any,
  );
}
