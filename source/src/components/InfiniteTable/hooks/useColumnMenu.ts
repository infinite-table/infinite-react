import { useEffect, useState } from 'react';
import { useOverlay } from '../../hooks/useOverlay';
import { getContextMenuForColumn } from '../utils/getContextMenuForColumn';
import { useInfiniteTable } from './useInfiniteTable';

export function useColumnMenu<T>() {
  const context = useInfiniteTable<T>();
  const { getState, componentActions } = context;
  const {
    showOverlay,
    portal: menuPortal,
    clearAll,
  } = useOverlay({
    portalContainer: false,
  });

  useState(() => {
    const { componentActions: actions, componentState } = context;
    const { domRef } = componentState;
    componentState.onColumnMenuClick.onChange((info) => {
      if (!info) {
        return;
      }
      const { target, column } = info;

      function onHideIntent() {
        clearAll();
        componentActions.columnContextMenuVisibleForColumnId = null;
      }

      showOverlay(
        () => getContextMenuForColumn(column.id, context, onHideIntent),
        {
          constrainTo: domRef.current!,
          id: 'column-menu',
          alignTo: target as HTMLElement,
          alignPosition: [
            ['TopLeft', 'BottomLeft'],
            ['TopRight', 'BottomRight'],
          ],
        },
      );

      actions.columnContextMenuVisibleForColumnId = column.id;
    });
  });

  useEffect(() => {
    const { columnContextMenuVisibleForColumnId } = getState();

    if (columnContextMenuVisibleForColumnId) {
      function handleMouseDown(event: MouseEvent) {
        // @ts-ignore
        if (event.__insideMenu !== true) {
          clearAll();
          componentActions.columnContextMenuVisibleForColumnId = null;
        }
      }
      document.documentElement.addEventListener('mousedown', handleMouseDown);
      return () => {
        document.documentElement.removeEventListener(
          'mousedown',
          handleMouseDown,
        );
      };
    } else {
      clearAll();
    }

    return () => {};
  }, [getState().columnContextMenuVisibleForColumnId]);

  return { menuPortal };
}
