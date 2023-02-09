import * as React from 'react';
import { useCallback } from 'react';

import { Menu } from '../../Menu';
import { MenuState } from '../../Menu/MenuState';
import { getColumnApiForColumn } from '../api/getColumnApi';
import { InfiniteTableContextValue } from '../types';

export function getRowContextMenu<T>(
  rowId: any,
  rowIndex: number,
  columnId: string | null,
  context: InfiniteTableContextValue<T>,
  onHideIntent?: VoidFunction,
) {
  if (columnId == null || rowId == null) {
    return null;
  }
  const { getComputed, getState, getDataSourceState } = context;

  const { components, getCellContextMenuItems } = getState();

  const MenuCmp = components?.Menu ?? Menu;

  const { computedColumnsMap } = getComputed();

  const column = computedColumnsMap.get(columnId);

  if (!column || !getCellContextMenuItems) {
    return null;
  }

  const rowInfo = getDataSourceState().dataArray[rowIndex];

  const param = {
    column,
    columnApi: getColumnApiForColumn(column.id, context)!,
    ...context,
  };

  const items = getCellContextMenuItems({ ...rowInfo, column }, param);

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
