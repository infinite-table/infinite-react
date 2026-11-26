/**
 * Angular sibling of useContextMenu.ts (and of the Vue
 * useContextMenuForVue.vue.ts) - the cell context menu and the table
 * (body) context menu, both driven by the shared subscription callbacks
 * (state.cellContextMenu / state.contextMenu), which the root publishes the
 * body's contextmenu events into, through the shared wiring
 * (menuOverlayShared.ts).
 *
 * Called in the InfiniteTable root's setup; render the returned overlays
 * with `infiniteOverlayPortal` in the root's portal element.
 */
import { DestroyRef } from '@angular/core';

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

import {
  getCellContextMenuHandler,
  getTableContextMenuHandler,
  menuVisibilityEffect,
} from '../utils/menuOverlayShared';
import {
  getMenuOverlayPortalContainer,
  type MenuHookParams,
} from './useColumnMenuForAngular.angular';

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

export function setupCellContextMenu<T>(
  params: MenuHookParams<T>,
): InfiniteOverlay {
  const { context, state, injector } = params;
  const { getState, actions } = context;

  const overlay = createOverlay({
    portalContainer: getMenuOverlayPortalContainer(params),
  });
  const { showOverlay, clearAll } = overlay;

  const removeOnCellContextMenu = getState().cellContextMenu.onChange(
    getCellContextMenuHandler(context, {
      clearAll,
      getContent: (info, onHideIntent) =>
        getCellContextMenu(info, context, onHideIntent),
      show: (content, params) => showMenu(showOverlay, content, params),
    }),
  );

  watchSignals(
    () => [state().cellContextMenuVisibleFor] as const,
    ([cellContextMenuVisibleFor]) =>
      menuVisibilityEffect(cellContextMenuVisibleFor, clearAll, () => {
        actions.cellContextMenuVisibleFor = null;
      }),
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

  const removeOnContextMenu = getState().contextMenu.onChange(
    getTableContextMenuHandler(context, {
      clearAll,
      getContent: (info, onHideIntent) =>
        getTableContextMenu(info, context, onHideIntent),
      show: (content, params) => showMenu(showOverlay, content, params),
    }),
  );

  watchSignals(
    () => [state().contextMenuVisibleFor] as const,
    ([contextMenuVisibleFor]) =>
      menuVisibilityEffect(contextMenuVisibleFor, clearAll, () => {
        actions.contextMenuVisibleFor = null;
      }),
    { injector, flush: 'post' },
  );

  injector.get(DestroyRef).onDestroy(() => {
    removeOnContextMenu();
  });

  return overlay;
}
