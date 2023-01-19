import { useEffect, useState } from 'react';
import { useOverlay } from '../../hooks/useOverlay';
import { getFilterOperatorMenuForColumn } from '../utils/getFilterOperatorMenuForColumn';

import { useInfiniteTable } from './useInfiniteTable';

export function useColumnFilterOperatorMenu<T>() {
  const context = useInfiniteTable<T>();
  const { getState, actions } = context;
  const {
    showOverlay,
    portal: menuPortal,
    clearAll,
  } = useOverlay({
    portalContainer: false,
  });

  useState(() => {
    const { actions: actions, state } = context;
    const { domRef } = state;
    state.onFilterOperatorMenuClick.onChange((info) => {
      if (!info) {
        return;
      }
      const { target, column } = info;

      function onHideIntent() {
        clearAll();
        actions.filterOperatorMenuVisibleForColumnId = null;
      }

      showOverlay(
        () => getFilterOperatorMenuForColumn(column.id, context, onHideIntent),
        {
          constrainTo: domRef.current!,
          id: 'filter-operator-menu',
          alignTo: target as HTMLElement,
          alignPosition: [
            ['TopLeft', 'BottomLeft'],
            ['TopRight', 'BottomRight'],
          ],
        },
      );

      actions.columnContextMenuVisibleForColumnId = null;
      actions.filterOperatorMenuVisibleForColumnId = column.id;
    });
  });

  useEffect(() => {
    const { filterOperatorMenuVisibleForColumnId } = getState();

    if (filterOperatorMenuVisibleForColumnId) {
      function handleMouseDown(event: MouseEvent) {
        // @ts-ignore
        if (event.__insideMenu !== true) {
          clearAll();
          actions.filterOperatorMenuVisibleForColumnId = null;
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
  }, [getState().filterOperatorMenuVisibleForColumnId]);

  return { menuPortal };
}
