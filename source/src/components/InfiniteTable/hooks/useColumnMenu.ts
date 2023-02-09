import { useEffect } from 'react';
import { useOverlay } from '../../hooks/useOverlay';
import { getMenuForColumn } from '../utils/getContextMenuForColumn';
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
        actions.columnMenuVisibleForColumnId = null;
      }

      showOverlay(() => getMenuForColumn(column.id, context, onHideIntent), {
        constrainTo: getState().domRef.current!,
        id: 'column-menu',
        alignTo: target as HTMLElement,
        alignPosition: [
          ['TopLeft', 'BottomLeft'],
          ['TopRight', 'BottomRight'],
        ],
      });

      actions.contextMenuVisibleFor = null;
      actions.cellContextMenuVisibleFor = null;
      actions.filterOperatorMenuVisibleForColumnId = null;
      actions.columnMenuVisibleForColumnId = column.id;
    });
  }, []);

  useEffect(() => {
    const {
      columnMenuVisibleForColumnId: columnContextMenuVisibleForColumnId,
    } = getState();

    if (columnContextMenuVisibleForColumnId) {
      function handleMouseDown(event: MouseEvent) {
        // @ts-ignore
        if (event.__insideMenu !== true) {
          clearAll();
          actions.columnMenuVisibleForColumnId = null;
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
  }, [getState().columnMenuVisibleForColumnId]);

  return { menuPortal };
}
