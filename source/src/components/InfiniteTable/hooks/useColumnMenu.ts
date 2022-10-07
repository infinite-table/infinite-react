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

      showOverlay(() => getContextMenuForColumn(column.id, context), {
        constrainTo: () => domRef.current!,
        id: 'column-menu',
        alignTo: target,
        alignPosition: [
          ['TopLeft', 'BottomLeft'],
          ['TopRight', 'BottomRight'],
        ],
      });

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
      window.addEventListener('mousedown', handleMouseDown);
      return () => {
        window.removeEventListener('mousedown', handleMouseDown);
      };
    }

    return () => {};
  }, [getState().columnContextMenuVisibleForColumnId]);

  return { menuPortal };
}
