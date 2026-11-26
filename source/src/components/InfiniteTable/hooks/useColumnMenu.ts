import { useEffect } from 'react';

import { useOverlay } from '../../hooks/useOverlay';
import { getMenuForColumn } from '../utils/getMenuForColumn';

import {
  useInfiniteTableSelector,
  useInfiniteTableStableContext,
} from './useInfiniteTableSelector';
import {
  columnMenuVisibilityEffect,
  getColumnMenuClickHandler,
} from '../utils/menuOverlayShared';
import { useMenuPortalContainer } from './useMenuPortalContainer';

export function useColumnMenu<T>() {
  const context = useInfiniteTableStableContext<T>();
  const { columnMenuVisibleForColumnId, columnMenuVisibleKey } =
    useInfiniteTableSelector((ctx) => {
      return {
        columnMenuVisibleForColumnId: ctx.state.columnMenuVisibleForColumnId,
        columnMenuVisibleKey: ctx.state.columnMenuVisibleKey,
      };
    });

  const {
    showOverlay,
    portal: menuPortal,
    clearAll,
  } = useOverlay({
    portalContainer: useMenuPortalContainer(),
  });

  useEffect(() => {
    return context
      .getState()
      .onColumnMenuClick.onChange(getColumnMenuClickHandler(context));
  }, []);

  useEffect(() => {
    return columnMenuVisibilityEffect(context, {
      clearAll,
      show: (columnId, onHideIntent, params) =>
        showOverlay(
          () => getMenuForColumn(columnId, context, onHideIntent),
          params,
        ),
    });
  }, [columnMenuVisibleForColumnId, columnMenuVisibleKey]);

  return { menuPortal };
}
