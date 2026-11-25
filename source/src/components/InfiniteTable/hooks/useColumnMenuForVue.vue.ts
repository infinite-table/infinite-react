/**
 * Vue sibling of useColumnMenu.ts — shows/hides the column menu overlay in
 * response to menu-icon clicks (state.onColumnMenuClick) and the
 * columnMenuVisibleForColumnId state, through the shared wiring
 * (menuOverlayShared.ts).
 *
 * Must be called inside the InfiniteTable root's setup().
 */
import { onBeforeUnmount, watch } from 'vue';
import type { ShallowRef } from 'vue';

import { useOverlay } from '../../hooks/useOverlay/useOverlayForVue.vue';
import { getMenuForColumn } from '../utils/getMenuForColumnForVue.vue';

import { getMenuPortalContainer } from '../utils/menuOverlayTargets';
import {
  columnMenuVisibilityEffect,
  getColumnMenuClickHandler,
} from '../utils/menuOverlayShared';
import { InfiniteTableStableContextValue } from '../types/InfiniteTableContextValue';
import type { InfiniteTableState } from '../types';

export function useColumnMenu<T>(params: {
  context: InfiniteTableStableContextValue<T>;
  state: ShallowRef<InfiniteTableState<T>>;
}) {
  const { context, state } = params;
  const { getState } = context;

  const {
    showOverlay,
    portal: MenuPortal,
    clearAll,
  } = useOverlay({
    // master-detail is not yet ported to Vue - when it is, this should use
    // the master state's portalDOMRef (see the React useColumnMenu)
    portalContainer: getMenuPortalContainer(
      getState,
      getState().menuPortalContainer,
      false,
    ),
  });

  const removeOnColumnMenuClick = getState().onColumnMenuClick.onChange(
    getColumnMenuClickHandler(context),
  );

  watch(
    [
      () => state.value.columnMenuVisibleForColumnId,
      () => state.value.columnMenuVisibleKey,
    ],
    (_current, _prev, onCleanup) => {
      const cleanup = columnMenuVisibilityEffect(context, {
        clearAll,
        show: (columnId, onHideIntent, params) =>
          showOverlay(
            () => getMenuForColumn(columnId, context, onHideIntent),
            params,
          ),
      });
      if (cleanup) {
        onCleanup(cleanup);
      }
    },
    { flush: 'post' },
  );

  onBeforeUnmount(() => {
    removeOnColumnMenuClick();
  });

  return { MenuPortal };
}
