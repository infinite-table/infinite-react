import { useEffect } from 'react';
import { useOverlay } from '../../hooks/useOverlay';
import { getFilterOperatorMenuForColumn } from '../utils/getFilterOperatorMenuForColumn';

import { useInfiniteTableStableContext } from './useInfiniteTableSelector';
import {
  getFilterOperatorMenuClickHandler,
  menuVisibilityEffect,
} from '../utils/menuOverlayShared';
import { useMenuPortalContainer } from './useMenuPortalContainer';

export function useColumnFilterOperatorMenu<T>() {
  const stableContext = useInfiniteTableStableContext<T>();
  const { getState, actions } = stableContext;
  const {
    showOverlay,
    portal: menuPortal,
    clearAll,
  } = useOverlay({
    portalContainer: useMenuPortalContainer(),
  });

  useEffect(() => {
    return getState().onFilterOperatorMenuClick.onChange(
      getFilterOperatorMenuClickHandler(stableContext, {
        clearAll,
        show: (columnId, onHideIntent, params) =>
          showOverlay(
            () =>
              getFilterOperatorMenuForColumn(
                columnId,
                stableContext,
                onHideIntent,
              ),
            params,
          ),
      }),
    );
  }, []);

  useEffect(() => {
    return menuVisibilityEffect(
      getState().filterOperatorMenuVisibleForColumnId,
      clearAll,
      () => {
        actions.filterOperatorMenuVisibleForColumnId = null;
      },
    );
  }, [getState().filterOperatorMenuVisibleForColumnId]);

  return { menuPortal };
}
