/**
 * Angular sibling of useContextMenu.ts (and of the Vue
 * useContextMenuForVue.vue.ts) - the cell context menu and the table
 * (body) context menu, both driven by the shared subscription callbacks
 * (state.cellContextMenu / state.contextMenu), which the root publishes the
 * body's contextmenu events into.
 *
 * Called in the InfiniteTable root's setup; render the returned overlays
 * with `infiniteOverlayPortal` in the root's portal element.
 */
import { DestroyRef } from '@angular/core';

import { AlignPositionOptions } from '../../../utils/pageGeometry/alignment';
import { Rectangle } from '../../../utils/pageGeometry/Rectangle';
import { watchSignals } from '../../hooks/watchSignals.angular';
import {
  createOverlay,
  type InfiniteOverlay,
  type UpdateOverlayContentFn,
} from '../../hooks/useOverlay/OverlayForAngular.angular';
import type { Renderable } from '../../types/FrameworkTypes.angular';
import {
  getCellContextMenu,
  getTableContextMenu,
} from '../utils/getCellContextMenuForAngular.angular';

import { getMenuConstrainTo } from '../utils/menuOverlayTargets';
import {
  getMenuOverlayPortalContainer,
  type MenuHookParams,
} from './useColumnMenuForAngular.angular';

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

/**
 * Shows the menu; a lazy one is shown once its promise resolves (if the
 * overlay is still the one shown then).
 */
function showMenu(
  showOverlay: InfiniteOverlay['showOverlay'],
  content: { menu: Renderable; lazyMenu?: Promise<Renderable> },
  params: Parameters<InfiniteOverlay['showOverlay']>[1],
) {
  const update: UpdateOverlayContentFn = showOverlay(
    () => content.menu,
    params,
  );
  if (content.lazyMenu) {
    content.lazyMenu.then((menu) => {
      if (menu != null) {
        update(() => menu);
      }
    });
  }
}

/**
 * Closes the menu on a mousedown outside it, while it is visible.
 */
function closeOnOutsideMouseDown(close: VoidFunction) {
  function handleMouseDown(event: MouseEvent) {
    // @ts-ignore
    if (event.__insideMenu !== true) {
      close();
    }
  }
  document.documentElement.addEventListener('mousedown', handleMouseDown);
  return () => {
    document.documentElement.removeEventListener('mousedown', handleMouseDown);
  };
}

export function setupCellContextMenu<T>(
  params: MenuHookParams<T>,
): InfiniteOverlay {
  const { context, state, injector } = params;
  const { getState, actions, getDataSourceState } = context;

  const overlay = createOverlay({
    portalContainer: getMenuOverlayPortalContainer(params),
  });
  const { showOverlay, clearAll } = overlay;

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

      const content = getCellContextMenu(info, context, onHideIntent);
      const { cellContext, preventDefault } = content;

      const rect = Rectangle.fromPoint({
        top: event.clientY,
        left: event.clientX,
      });

      rect.width += OFFSET;
      rect.height += OFFSET;

      showMenu(showOverlay, content, {
        constrainTo: getMenuConstrainTo(getState()),
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
          } as any,
          event,
        );
      }
    },
  );

  watchSignals(
    () => [state().cellContextMenuVisibleFor] as const,
    ([cellContextMenuVisibleFor]) => {
      if (cellContextMenuVisibleFor) {
        return closeOnOutsideMouseDown(() => {
          clearAll();
          actions.cellContextMenuVisibleFor = null;
        });
      }
      clearAll();
      return undefined;
    },
    { injector, flush: 'post' },
  );

  injector.get(DestroyRef).onDestroy(() => {
    removeOnCellContextMenu();
  });

  return overlay;
}

export function setupTableContextMenu<T>(
  params: MenuHookParams<T>,
): InfiniteOverlay {
  const { context, state, injector } = params;
  const { getState, actions } = context;

  const overlay = createOverlay({
    portalContainer: getMenuOverlayPortalContainer(params),
  });
  const { showOverlay, clearAll } = overlay;

  const removeOnContextMenu = getState().contextMenu.onChange((info) => {
    if (!info) {
      return;
    }
    const { event } = info;

    function onHideIntent() {
      clearAll();
      actions.contextMenuVisibleFor = null;
    }

    const content = getTableContextMenu(info, context, onHideIntent);
    const { cellContext, preventDefault } = content;

    const point = {
      top: event.clientY,
      left: event.clientX,
    };
    const rect = Rectangle.fromPoint(point);

    rect.width += OFFSET;
    rect.height += OFFSET;

    showMenu(showOverlay, content, {
      constrainTo: getMenuConstrainTo(getState()),
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
        } as any,
        event,
      );
    }
  });

  watchSignals(
    () => [state().contextMenuVisibleFor] as const,
    ([contextMenuVisibleFor]) => {
      if (contextMenuVisibleFor) {
        return closeOnOutsideMouseDown(() => {
          clearAll();
          actions.contextMenuVisibleFor = null;
        });
      }
      clearAll();
      return undefined;
    },
    { injector, flush: 'post' },
  );

  injector.get(DestroyRef).onDestroy(() => {
    removeOnContextMenu();
  });

  return overlay;
}
