/**
 * Vue sibling of useColumnFilterOperatorMenu.ts — shows/hides the filter
 * operator menu overlay in response to operator-switch clicks
 * (state.onFilterOperatorMenuClick) and the
 * filterOperatorMenuVisibleForColumnId state, through the shared wiring
 * (menuOverlayShared.ts).
 *
 * Must be called inside the InfiniteTable root's setup().
 */
import { onBeforeUnmount, watch } from 'vue';
import type { ShallowRef } from 'vue';

import { useOverlay } from '../../hooks/useOverlay/useOverlayForVue.vue';
import { getFilterOperatorMenuForColumn } from '../utils/getFilterOperatorMenuForColumnForVue.vue';

import { getMenuPortalContainer } from '../utils/menuOverlayTargets';
import {
  getFilterOperatorMenuClickHandler,
  menuVisibilityEffect,
} from '../utils/menuOverlayShared';
import { InfiniteTableStableContextValue } from '../types/InfiniteTableContextValue';
import type { InfiniteTableState } from '../types';

export function useColumnFilterOperatorMenu<T>(params: {
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
    // master-detail is not yet ported to Vue - when it is, this should use
    // the master state's portalDOMRef (see the React hook)
    portalContainer: getMenuPortalContainer(
      getState,
      getState().menuPortalContainer,
      false,
    ),
  });

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

  watch(
    () => state.value.filterOperatorMenuVisibleForColumnId,
    (visibleForColumnId, _prev, onCleanup) => {
      const cleanup = menuVisibilityEffect(visibleForColumnId, clearAll, () => {
        actions.filterOperatorMenuVisibleForColumnId = null;
      });
      if (cleanup) {
        onCleanup(cleanup);
      }
    },
    { flush: 'post' },
  );

  onBeforeUnmount(() => {
    removeOnMenuClick();
  });

  return { MenuPortal };
}
