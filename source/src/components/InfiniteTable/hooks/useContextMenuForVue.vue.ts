/**
 * Vue sibling of useContextMenu.ts — the cell context menu and the table
 * (body) context menu, both driven by the shared subscription callbacks
 * (state.cellContextMenu / state.contextMenu), through the shared wiring
 * (menuOverlayShared.ts).
 *
 * Must be called inside the InfiniteTable root's setup().
 */
import { onBeforeUnmount, watch } from 'vue';
import type { ShallowRef } from 'vue';

import { useOverlay } from '../../hooks/useOverlay/useOverlayForVue.vue';
import {
  getCellContextMenu,
  getTableContextMenu,
} from '../utils/getCellContextMenuForVue.vue';

import { getMenuPortalContainer } from '../utils/menuOverlayTargets';
import {
  getCellContextMenuHandler,
  getTableContextMenuHandler,
  menuVisibilityEffect,
} from '../utils/menuOverlayShared';
import { InfiniteTableStableContextValue } from '../types/InfiniteTableContextValue';
import type { InfiniteTableState } from '../types';

export function useCellContextMenu<T>(params: {
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
    portalContainer: getMenuPortalContainer(
      getState,
      getState().menuPortalContainer,
      false,
    ),
  });

  const removeOnCellContextMenu = getState().cellContextMenu.onChange(
    getCellContextMenuHandler(context, {
      clearAll,
      getContent: (info, onHideIntent) =>
        getCellContextMenu(info, context, onHideIntent),
      show: ({ menu }, params) => showOverlay(() => menu, params),
    }),
  );

  watch(
    () => state.value.cellContextMenuVisibleFor,
    (cellContextMenuVisibleFor, _prev, onCleanup) => {
      const cleanup = menuVisibilityEffect(
        cellContextMenuVisibleFor,
        clearAll,
        () => {
          actions.cellContextMenuVisibleFor = null;
        },
      );
      if (cleanup) {
        onCleanup(cleanup);
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
    portalContainer: getMenuPortalContainer(
      getState,
      getState().menuPortalContainer,
      false,
    ),
  });

  const removeOnContextMenu = getState().contextMenu.onChange(
    getTableContextMenuHandler(context, {
      clearAll,
      getContent: (info, onHideIntent) =>
        getTableContextMenu(info, context, onHideIntent),
      show: ({ menu }, params) => showOverlay(() => menu, params),
    }),
  );

  watch(
    () => state.value.contextMenuVisibleFor,
    (contextMenuVisibleFor, _prev, onCleanup) => {
      const cleanup = menuVisibilityEffect(
        contextMenuVisibleFor,
        clearAll,
        () => {
          actions.contextMenuVisibleFor = null;
        },
      );
      if (cleanup) {
        onCleanup(cleanup);
      }
    },
    { flush: 'post' },
  );

  onBeforeUnmount(() => {
    removeOnContextMenu();
  });

  return { MenuPortal };
}
