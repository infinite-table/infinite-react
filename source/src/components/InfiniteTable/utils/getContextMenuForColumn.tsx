import * as React from 'react';
import { useCallback } from 'react';

import { Menu } from '../../Menu';
import { MenuState } from '../../Menu/MenuState';
import { InfiniteTableContextValue } from '../types';
import { defaultGetColumContextMenuItems } from './defaultGetColumContextMenuItems';

export function getContextMenuForColumn<T>(
  columnId: string | null,
  context: InfiniteTableContextValue<T>,
  onHideIntent?: VoidFunction,
) {
  if (columnId == null) {
    return null;
  }
  const {
    getComputed,
    getState,
    getDataSourceState,

    dataSourceActions,
    api,
    dataSourceApi,
    actions: actions,
  } = context;

  const { components, getColumContextMenuItems } = getState();

  const MenuCmp = components?.Menu ?? Menu;

  const column = getComputed().computedColumnsMap.get(columnId);

  if (!column) {
    return null;
  }

  const param = {
    column,
    api,
    getState,
    getDataSourceState,
    getComputed,
    actions,
    dataSourceApi,
    dataSourceActions,
  };

  const defaultItems = defaultGetColumContextMenuItems([], param)!;

  const items = getColumContextMenuItems
    ? getColumContextMenuItems(defaultItems, param)
    : defaultItems;

  const onRootMouseDown: EventListener = React.useCallback((event: Event) => {
    //@ts-ignore
    event.__insideMenu = true;
  }, []);

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
      onHideIntent={useCallback((state: MenuState) => {
        onHide(state);
        onHideIntent?.();
      }, [])}
    />
  );
}
