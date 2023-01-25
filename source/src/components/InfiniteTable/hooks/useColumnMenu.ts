import { useEffect } from 'react';
import { useOverlay } from '../../hooks/useOverlay';
import { getContextMenuForColumn } from '../utils/getContextMenuForColumn';
import { useInfiniteTable } from './useInfiniteTable';

export function useColumnMenu<T>() {
  const context = useInfiniteTable<T>();
  const { getState, actions } = context;
  const {
    showOverlay,
    portal: menuPortal,
    clearAll,
  } = useOverlay({
    portalContainer: false,
  });

  useEffect(() => {
    const { actions: actions, getState } = context;
    const state = getState();

    return state.onColumnMenuClick.onChange((info) => {
      if (!info) {
        return;
      }
      const { target, column } = info;

      function onHideIntent() {
        clearAll();
        actions.columnContextMenuVisibleForColumnId = null;
      }

      showOverlay(
        () => getContextMenuForColumn(column.id, context, onHideIntent),
        {
          constrainTo: getState().domRef.current!,
          id: 'column-menu',
          alignTo: target as HTMLElement,
          alignPosition: [
            ['TopLeft', 'BottomLeft'],
            ['TopRight', 'BottomRight'],
          ],
        },
      );

      actions.filterOperatorMenuVisibleForColumnId = null;
      actions.columnContextMenuVisibleForColumnId = column.id;
    });
  }, []);

  useEffect(() => {
    const { columnContextMenuVisibleForColumnId } = getState();

    if (columnContextMenuVisibleForColumnId) {
      function handleMouseDown(event: MouseEvent) {
        // @ts-ignore
        if (event.__insideMenu !== true) {
          clearAll();
          actions.columnContextMenuVisibleForColumnId = null;
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
