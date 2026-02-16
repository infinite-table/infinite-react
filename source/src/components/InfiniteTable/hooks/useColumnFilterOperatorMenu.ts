import { useEffect } from 'react';
import { Rectangle } from '../../../utils/pageGeometry/Rectangle';
import { useOverlay } from '../../hooks/useOverlay';
import { getFilterOperatorMenuForColumn } from '../utils/getFilterOperatorMenuForColumn';

import { useInfiniteTableStableContext } from './useInfiniteTableSelector';
import { useDataSourceMasterDetailSelector } from '../../DataSource/publicHooks/useDataSourceMasterDetailSelector';

const OFFSET = 10;

export function useColumnFilterOperatorMenu<T>() {
  const { portalDOMRef } =
    useDataSourceMasterDetailSelector((ctx) => {
      return {
        portalDOMRef: ctx.getMasterState().portalDOMRef,
      };
    }) || {};
  const stableContext = useInfiniteTableStableContext<T>();
  const { getState, actions } = stableContext;
  const {
    showOverlay,
    portal: menuPortal,
    clearAll,
  } = useOverlay({
    portalContainer: portalDOMRef?.current ?? false,
  });

  useEffect(() => {
    const state = getState();

    return state.onFilterOperatorMenuClick.onChange((info) => {
      if (!info) {
        return;
      }
      const { target, column } = info;

      function onHideIntent() {
        clearAll();
        actions.filterOperatorMenuVisibleForColumnId = null;
      }

      let alignTo = (((target as HTMLElement)?.parentElement as HTMLElement) ||
        target) as HTMLElement;

      const rect = Rectangle.from(alignTo.getBoundingClientRect());

      // shift and increase the rect so we get some offset for the alignment
      rect.top -= OFFSET;
      rect.left -= OFFSET;

      rect.width += 2 * OFFSET;
      rect.height += 2 * OFFSET;

      showOverlay(
        () =>
          getFilterOperatorMenuForColumn(
            column.id,
            stableContext,
            onHideIntent,
          ),
        {
          constrainTo: getState().domRef.current!,
          id: 'filter-operator-menu',
          alignTo: rect,

          alignPosition: [
            ['TopLeft', 'BottomLeft'],
            ['TopRight', 'BottomRight'],
          ],
        },
      );

      actions.contextMenuVisibleFor = null;
      actions.cellContextMenuVisibleFor = null;
      actions.columnMenuVisibleForColumnId = null;
      actions.filterOperatorMenuVisibleForColumnId = column.id;
    });
  }, []);

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
