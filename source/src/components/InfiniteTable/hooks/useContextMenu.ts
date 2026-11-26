import { useEffect } from 'react';
import { useOverlay } from '../../hooks/useOverlay';
import {
  getCellContextMenu,
  getTableContextMenu,
} from '../utils/getCellContextMenu';

import { useInfiniteTableStableContext } from './useInfiniteTableSelector';
import {
  getCellContextMenuHandler,
  getTableContextMenuHandler,
  menuVisibilityEffect,
} from '../utils/menuOverlayShared';
import { useMenuPortalContainer } from './useMenuPortalContainer';

export function useCellContextMenu<T>() {
  const context = useInfiniteTableStableContext<T>();
  const { getState, actions } = context;
  const {
    showOverlay,
    portal: menuPortal,
    clearAll,
  } = useOverlay({
    portalContainer: useMenuPortalContainer(),
  });

  useEffect(() => {
    return getState().cellContextMenu.onChange(
      getCellContextMenuHandler(context, {
        clearAll,
        getContent: (info, onHideIntent) =>
          getCellContextMenu(info, context, onHideIntent),
        show: ({ menu }, params) => showOverlay(menu, params),
      }),
    );
  }, []);

  useEffect(() => {
    return menuVisibilityEffect(
      getState().cellContextMenuVisibleFor,
      clearAll,
      () => {
        actions.cellContextMenuVisibleFor = null;
      },
    );
  }, [getState().cellContextMenuVisibleFor]);

  return { menuPortal };
}

export function useTableContextMenu<T>() {
  const context = useInfiniteTableStableContext<T>();

  const { getState, actions } = context;
  const {
    showOverlay,
    portal: menuPortal,
    clearAll,
  } = useOverlay({
    portalContainer: useMenuPortalContainer(),
  });

  useEffect(() => {
    return getState().contextMenu.onChange(
      getTableContextMenuHandler(context, {
        clearAll,
        getContent: (info, onHideIntent) =>
          getTableContextMenu(info, context, onHideIntent),
        show: ({ menu }, params) => showOverlay(menu, params),
      }),
    );
  }, []);

  useEffect(() => {
    return menuVisibilityEffect(
      getState().contextMenuVisibleFor,
      clearAll,
      () => {
        actions.contextMenuVisibleFor = null;
      },
    );
  }, [getState().contextMenuVisibleFor]);

  return { menuPortal };
}
