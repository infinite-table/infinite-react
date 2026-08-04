/**
 * Vue sibling of getMenuForColumn.tsx — builds the column menu vnode from
 * the default (or user-provided) column menu items.
 */
import { h } from 'vue';
import type { VNodeChild } from 'vue';

import { Menu } from '../../Menu/MenuForVue.vue';
import { MenuState } from '../../Menu/MenuState';
import { getColumnApiForColumn } from '../api/getColumnApi';
import { defaultGetColumnMenuItems } from './defaultGetColumnMenuItemsForVue.vue';
import { InfiniteTableStableContextValue } from '../types/InfiniteTableContextValue';

export function getMenuForColumn<T>(
  columnId: string | null,
  context: InfiniteTableStableContextValue<T>,
  onHideIntent?: VoidFunction,
): VNodeChild {
  if (columnId == null) {
    return null;
  }
  const { getComputed, getState } = context;

  const { components, getColumnMenuItems } = getState();

  const MenuCmp = (components?.Menu as any) ?? Menu;

  const column = getComputed().computedColumnsMap.get(columnId);

  if (!column) {
    return null;
  }

  const param = {
    column,
    columnApi: getColumnApiForColumn(column.id, context)!,
    ...context,
  };

  const defaultItems = defaultGetColumnMenuItems([], param)!;

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

  return h(MenuCmp, {
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
  });
}
