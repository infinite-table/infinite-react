/**
 * Angular sibling of useColumnFilterOperatorMenu.ts (and of the Vue
 * useColumnFilterOperatorMenuForVue.vue.ts) - shows/hides the filter
 * operator menu overlay in response to operator-switch clicks
 * (state.onFilterOperatorMenuClick) and the
 * filterOperatorMenuVisibleForColumnId state, through the shared wiring
 * (menuOverlayShared.ts).
 *
 * Called in the InfiniteTable root's setup; render the returned overlay
 * with `infiniteOverlayPortal` in the root's portal element.
 */
import { DestroyRef } from '@angular/core';

import { watchSignals } from '../../hooks/watchSignals.angular';
import {
  createOverlay,
  type InfiniteOverlay,
} from '../../hooks/useOverlay/OverlayForAngular.angular';
import { getFilterOperatorMenuForColumn } from '../utils/getFilterOperatorMenuForColumnForAngular.angular';

import {
  getFilterOperatorMenuClickHandler,
  menuVisibilityEffect,
} from '../utils/menuOverlayShared';
import {
  getMenuOverlayPortalContainer,
  type MenuHookParams,
} from './useColumnMenuForAngular.angular';

export function setupColumnFilterOperatorMenu<T>(
  params: MenuHookParams<T>,
): InfiniteOverlay {
  const { context, state, injector } = params;
  const { getState, actions } = context;

  const overlay = createOverlay({
    portalContainer: getMenuOverlayPortalContainer(params),
  });
  const { showOverlay, clearAll } = overlay;

  const removeOnMenuClick = getState().onFilterOperatorMenuClick.onChange(
    getFilterOperatorMenuClickHandler(context, {
      clearAll,
      show: (columnId, onHideIntent, params) =>
        showOverlay(
          () => getFilterOperatorMenuForColumn(columnId, context, onHideIntent),
          params,
        ),
    }),
  );

  watchSignals(
    () => [state().filterOperatorMenuVisibleForColumnId] as const,
    ([visibleForColumnId]) =>
      menuVisibilityEffect(visibleForColumnId, clearAll, () => {
        actions.filterOperatorMenuVisibleForColumnId = null;
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
      if (getState().filterOperatorMenuVisibleForColumnId) {
        overlay.rerenderOverlays();
      }
    },
    { injector },
  );

  injector.get(DestroyRef).onDestroy(() => {
    removeOnMenuClick();
  });

  return overlay;
}
