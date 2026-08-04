/**
 * Vue sibling of useContextMenu.ts — the cell context menu and the table
 * (body) context menu, both driven by the shared subscription callbacks
 * (state.cellContextMenu / state.contextMenu).
 *
 * Must be called inside the InfiniteTable root's setup().
 */
import { onBeforeUnmount, watch } from 'vue';
import type { ShallowRef } from 'vue';

import { AlignPositionOptions } from '../../../utils/pageGeometry/alignment';
import { Rectangle } from '../../../utils/pageGeometry/Rectangle';
import { useOverlay } from '../../hooks/useOverlay/useOverlayForVue.vue';
import {
  getCellContextMenu,
  getTableContextMenu,
} from '../utils/getCellContextMenuForVue.vue';

import { InfiniteTableStableContextValue } from '../types/InfiniteTableContextValue';
import type { InfiniteTableState } from '../types';

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

export function useCellContextMenu<T>(params: {
  context: InfiniteTableStableContextValue<T>;
  state: ShallowRef<InfiniteTableState<T>>;
}) {
  const { context, state } = params;
  const { getState, actions, getDataSourceState } = context;

  const {
    showOverlay,
    portal: MenuPortal,
    clearAll,
  } = useOverlay({
    portalContainer: false,
  });

  const removeOnCellContextMenu = getState().cellContextMenu.onChange(
    (info) => {
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

      showOverlay(() => menu, {
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
    },
  );

  watch(
    () => state.value.cellContextMenuVisibleFor,
    (cellContextMenuVisibleFor, _prev, onCleanup) => {
      if (cellContextMenuVisibleFor) {
        function handleMouseDown(event: MouseEvent) {
          // @ts-ignore
          if (event.__insideMenu !== true) {
            clearAll();
            actions.cellContextMenuVisibleFor = null;
          }
        }
        document.documentElement.addEventListener('mousedown', handleMouseDown);
        onCleanup(() => {
          document.documentElement.removeEventListener(
            'mousedown',
            handleMouseDown,
          );
        });
      } else {
        clearAll();
      }
    },
    { flush: 'post' },
  );

  onBeforeUnmount(() => {
    removeOnCellContextMenu();
  });

  return { MenuPortal };
}

export function useTableContextMenu<T>(params: {
  context: InfiniteTableStableContextValue<T>;
  state: ShallowRef<InfiniteTableState<T>>;
}) {
  const { context, state } = params;
  const { getState, actions } = context;

  const {
    showOverlay,
    portal: MenuPortal,
    clearAll,
  } = useOverlay({
    portalContainer: false,
  });

  const removeOnContextMenu = getState().contextMenu.onChange((info) => {
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

    showOverlay(() => menu, {
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

  watch(
    () => state.value.contextMenuVisibleFor,
    (contextMenuVisibleFor, _prev, onCleanup) => {
      if (contextMenuVisibleFor) {
        function handleMouseDown(event: MouseEvent) {
          // @ts-ignore
          if (event.__insideMenu !== true) {
            clearAll();
            actions.contextMenuVisibleFor = null;
          }
        }
        document.documentElement.addEventListener('mousedown', handleMouseDown);
        onCleanup(() => {
          document.documentElement.removeEventListener(
            'mousedown',
            handleMouseDown,
          );
        });
      } else {
        clearAll();
      }
    },
    { flush: 'post' },
  );

  onBeforeUnmount(() => {
    removeOnContextMenu();
  });

  return { MenuPortal };
}
