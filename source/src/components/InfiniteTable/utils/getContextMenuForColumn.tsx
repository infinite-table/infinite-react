import * as React from 'react';

import { Menu } from '../../Menu';
import { MenuState } from '../../Menu/MenuState';
import { getColumnApiForColumn } from '../api/getColumnApi';
import { InfiniteTableContextValue } from '../types';
import { defaultGetColumMenuItems } from './defaultGetColumMenuItems';

export function getMenuForColumn<T>(
  columnId: string | null,
  context: InfiniteTableContextValue<T>,
  onHideIntent?: VoidFunction,
) {
  if (columnId == null) {
    return null;
  }
  const { getComputed, getState } = context;

  const { components, getColumMenuItems } = getState();

  const MenuCmp = components?.Menu ?? Menu;

  const column = getComputed().computedColumnsMap.get(columnId);

  if (!column) {
    return null;
  }

  const param = {
    column,
    columnApi: getColumnApiForColumn(column.id, context)!,
    ...context,
  };

  const defaultItems = defaultGetColumMenuItems([], param)!;

  const items = getColumMenuItems
    ? getColumMenuItems(defaultItems, param)
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

  return (
    <MenuCmp
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
  );
}
