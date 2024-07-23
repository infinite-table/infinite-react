import { useEffect } from 'react';
import { AlignPositionOptions } from '../../../utils/pageGeometry/alignment';
import { Rectangle } from '../../../utils/pageGeometry/Rectangle';
import { useMasterDetailContext } from '../../DataSource/publicHooks/useDataSourceState';
import { useOverlay } from '../../hooks/useOverlay';
import {
  getCellContextMenu,
  getTableContextMenu,
} from '../utils/getCellContextMenu';

import { useInfiniteTable } from './useInfiniteTable';

const OFFSET = 5;

const ALIGN_POSITIONS: AlignPositionOptions['alignPosition'] = [
  ['TopLeft', 'BottomLeft'],
  ['TopRight', 'BottomRight'],
  ['BottomLeft', 'BottomLeft'],
  ['BottomRight', 'BottomRight'],
  ['TopCenter', 'TopLeft'],
  ['BottomCenter', 'TopLeft'],
  ['CenterLeft', 'TopLeft'],
  ['CenterRight', 'TopLeft'],
];

export function useCellContextMenu<T>() {
  const context = useInfiniteTable<T>();
  const masterContext = useMasterDetailContext();
  const { getState, actions } = context;
  const {
    showOverlay,
    portal: menuPortal,
    clearAll,
  } = useOverlay({
    portalContainer: masterContext
      ? masterContext.getMasterState().portalDOMRef.current
      : false,
  });

  useEffect(() => {
    const { actions, getState, getDataSourceState } = context;
    const state = getState();

    return state.cellContextMenu.onChange((info) => {
      if (!info) {
        return;
      }
      const { event } = info;

      function onHideIntent() {
        clearAll();
        actions.cellContextMenuVisibleFor = null;
      }

      const { menu, cellContext, preventDefault } = getCellContextMenu(
        info,
        context,
        onHideIntent,
      );

      const rect = Rectangle.fromPoint({
        top: event.clientY,
        left: event.clientX,
      });

      rect.width += OFFSET;
      rect.height += OFFSET;

      showOverlay(menu, {
        constrainTo: getState().domRef.current!,
        id: 'cell-context-menu',
        alignTo: rect,
        alignPosition: ALIGN_POSITIONS,
      });

      if (preventDefault) {
        event.preventDefault();
      }

      actions.cellContextMenuVisibleFor = {
        columnId: info.columnId,
        rowId: info.rowId,
        rowIndex: info.rowIndex,
        colIndex: info.colIndex,
      };

      const { onCellContextMenu } = getState();
      if (onCellContextMenu) {
        onCellContextMenu(
          {
            ...cellContext,
            getState,
            getDataSourceState,
          },
          event,
        );
      }
    });
  }, []);

  useEffect(() => {
    const { cellContextMenuVisibleFor } = getState();

    if (cellContextMenuVisibleFor) {
      function handleMouseDown(event: MouseEvent) {
        // @ts-ignore
        if (event.__insideMenu !== true) {
          clearAll();
          actions.cellContextMenuVisibleFor = null;
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
  }, [getState().cellContextMenuVisibleFor]);

  return { menuPortal };
}

export function useTableContextMenu<T>() {
  const context = useInfiniteTable<T>();
  const masterContext = useMasterDetailContext();
  const { getState, actions } = context;
  const {
    showOverlay,
    portal: menuPortal,
    clearAll,
  } = useOverlay({
    portalContainer: masterContext
      ? masterContext.getMasterState().portalDOMRef.current
      : false,
  });

  useEffect(() => {
    const { actions: actions, getState } = context;
    const state = getState();

    return state.contextMenu.onChange((info) => {
      if (!info) {
        return;
      }
      const { event } = info;

      function onHideIntent() {
        clearAll();
        actions.contextMenuVisibleFor = null;
      }

      const { menu, cellContext, preventDefault } = getTableContextMenu(
        info,
        context,
        onHideIntent,
      );

      const point = {
        top: event.clientY,
        left: event.clientX,
      };
      const rect = Rectangle.fromPoint(point);

      rect.width += OFFSET;
      rect.height += OFFSET;

      showOverlay(menu, {
        constrainTo: getState().domRef.current!,
        id: 'table-context-menu',
        alignTo: rect,
        alignPosition: ALIGN_POSITIONS,
      });

      if (preventDefault) {
        event.preventDefault();
      }

      actions.contextMenuVisibleFor = {
        point,
        ...info,
      };

      const { onContextMenu } = getState();
      if (onContextMenu) {
        onContextMenu(
          {
            ...context,
            ...cellContext,
          },
          event,
        );
      }
    });
  }, []);

  useEffect(() => {
    const { contextMenuVisibleFor } = getState();

    if (contextMenuVisibleFor) {
      function handleMouseDown(event: MouseEvent) {
        // @ts-ignore
        if (event.__insideMenu !== true) {
          clearAll();
          actions.contextMenuVisibleFor = null;
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
  }, [getState().contextMenuVisibleFor]);

  return { menuPortal };
}
