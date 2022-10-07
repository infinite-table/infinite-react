import * as React from 'react';
import { Menu } from '../../Menu';
import { InfiniteTableContextValue } from '../types';
import { defaultGetColumContextMenuItems } from './defaultGetColumContextMenuItems';

export function getContextMenuForColumn<T>(
  columnId: string | null,
  context: InfiniteTableContextValue<T>,
) {
  if (columnId == null) {
    return null;
  }
  const {
    getComputed,
    getState,
    imperativeApi,
    componentActions: actions,
  } = context;

  const { components, getColumContextMenuItems } = getState();

  const MenuCmp = components?.Menu ?? Menu;

  const column = getComputed().computedColumnsMap.get(columnId);

  if (!column) {
    return null;
  }

  const getItems = getColumContextMenuItems || defaultGetColumContextMenuItems;

  const items = getItems({
    column,
    api: imperativeApi,
    getState,
    getComputed,
    actions,
  });

  const onRootMouseDown: EventListener = React.useCallback((event: Event) => {
    //@ts-ignore
    event.__insideMenu = true;
  }, []);

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
      onHide={(state) => {
        state.domRef.current?.parentNode?.removeEventListener(
          'mousedown',
          onRootMouseDown,
        );
      }}
    />
  );
}
