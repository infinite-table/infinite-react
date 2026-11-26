/**
 * Angular sibling of useColumnMenu.ts (and of the Vue
 * useColumnMenuForVue.vue.ts) - shows/hides the column menu overlay in
 * response to menu-icon clicks (state.onColumnMenuClick, which
 * `columnApi.toggleContextMenu()` publishes) and the
 * columnMenuVisibleForColumnId state, through the shared wiring
 * (menuOverlayShared.ts).
 *
 * Called in the InfiniteTable root's setup; render the returned overlay
 * with `infiniteOverlayPortal` in the root's portal element.
 */
import { DestroyRef, Injector, Signal } from '@angular/core';

import { watchSignals } from '../../hooks/watchSignals.angular';
import {
  createOverlay,
  type InfiniteOverlay,
} from '../../hooks/useOverlay/OverlayForAngular.angular';
import { getMenuForColumn } from '../utils/getMenuForColumnForAngular.angular';

import { getMenuPortalContainer } from '../utils/menuOverlayTargets';
import {
  columnMenuVisibilityEffect,
  getColumnMenuClickHandler,
} from '../utils/menuOverlayShared';
import { InfiniteTableStableContextValue } from '../types/InfiniteTableContextValue';
import type { InfiniteTableState } from '../types';

export type MenuHookParams<T> = {
  context: InfiniteTableStableContextValue<T>;
  state: Signal<InfiniteTableState<T>>;
  injector: Injector;
  /**
   * In a row detail: the master grid's portal element, the default
   * container of the menus (they would be clipped by the detail row)
   */
  getMasterPortalElement?: () => HTMLElement | null | undefined;
};

export function getMenuOverlayPortalContainer<T>(params: MenuHookParams<T>) {
  const { getState } = params.context;
  return getMenuPortalContainer(
    getState,
    getState().menuPortalContainer,
    params.getMasterPortalElement?.() ?? false,
  );
}

export function setupColumnMenu<T>(params: MenuHookParams<T>): InfiniteOverlay {
  const { context, state, injector } = params;
  const { getState } = context;

  const overlay = createOverlay({
    portalContainer: getMenuOverlayPortalContainer(params),
  });
  const { showOverlay, clearAll } = overlay;

  const removeOnColumnMenuClick = getState().onColumnMenuClick.onChange(
    getColumnMenuClickHandler(context),
  );

  watchSignals(
    () =>
      [
        state().columnMenuVisibleForColumnId,
        state().columnMenuVisibleKey,
      ] as const,
    () =>
      columnMenuVisibilityEffect(context, {
        clearAll,
        show: (columnId, onHideIntent, params) =>
          showOverlay(
            () => getMenuForColumn(columnId, context, onHideIntent, injector),
            params,
          ),
      }),
    { injector, flush: 'post' },
  );

  // React renders the menu again with the grid (eg Sort Ascending gets
  // disabled after sorting, the checkboxes of the Columns submenu and the
  // check of the operator follow the state): render the content again when
  // the state changes
  watchSignals(
    () => [state()] as const,
    () => {
      if (getState().columnMenuVisibleForColumnId) {
        overlay.rerenderOverlays();
      }
    },
    { injector },
  );

  injector.get(DestroyRef).onDestroy(() => {
    removeOnColumnMenuClick();
  });

  return overlay;
}
