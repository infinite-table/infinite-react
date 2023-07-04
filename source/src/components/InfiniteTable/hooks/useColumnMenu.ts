import { useEffect } from 'react';
import { ShowOverlayFn, useOverlay } from '../../hooks/useOverlay';
import {
  MenuIconDataAttributes,
  MenuIconDataAttributesValues,
} from '../components/icons/MenuIcon';
import { InfiniteHeaderCellDataAttributes } from '../components/InfiniteTableHeader/InfiniteTableHeaderCell';
import { InfiniteTableContextValue } from '../types';
import { getMenuForColumn } from '../utils/getMenuForColumn';
import { useInfiniteTable } from './useInfiniteTable';

const menuIconSelector = `[${MenuIconDataAttributes['data-name']}="${MenuIconDataAttributesValues['data-name']}"]`;

function showMenuForColumn<T>(options: {
  columnId: string;
  target?: HTMLElement;
  context: InfiniteTableContextValue<T>;
  clearAll: VoidFunction;
  showOverlay: ShowOverlayFn;
}) {
  const { columnId, context, clearAll, showOverlay } = options;
  const { getState, actions } = context;

  function onHideIntent() {
    clearAll();
    actions.columnMenuVisibleForColumnId = null;
  }

  let target = options.target;

  if (!target) {
    const iconSelector = `[${InfiniteHeaderCellDataAttributes['data-column-id']}="${columnId}"] ${menuIconSelector}`;

    target = getState().domRef.current!.querySelector(
      iconSelector,
    ) as HTMLElement;

    if (!target) {
      target = getState().columnMenuTargetRef.current ?? undefined;
      // if not in DOM
      if (!target?.parentElement) {
        target = undefined;
      }
    }
  }

  if (!target) {
    console.warn(`Cannot show column menu for column "${columnId}"`);
    return;
  }

  showOverlay(() => getMenuForColumn(columnId, context, onHideIntent), {
    constrainTo: getState().domRef.current!,
    id: 'column-menu',
    alignTo: target,
    alignPosition: [
      ['TopLeft', 'BottomLeft'],
      ['TopRight', 'BottomRight'],
    ],
  });
}

export function useColumnMenu<T>() {
  const context = useInfiniteTable<T>();
  const { getState, actions } = context;
  const {
    showOverlay,
    portal: menuPortal,
    clearAll,
  } = useOverlay({
    portalContainer: false,
  });

  useEffect(() => {
    const { actions: actions, getState } = context;
    const state = getState();

    return state.onColumnMenuClick.onChange((info) => {
      if (!info) {
        return;
      }
      state.columnMenuTargetRef.current = info.target as HTMLElement;

      actions.contextMenuVisibleFor = null;
      actions.cellContextMenuVisibleFor = null;
      actions.filterOperatorMenuVisibleForColumnId = null;
      actions.columnMenuVisibleForColumnId = info.column.id;
    });
  }, []);

  const { columnMenuVisibleForColumnId, columnMenuVisibleKey } = getState();

  useEffect(() => {
    const { columnMenuVisibleForColumnId, columnMenuTargetRef } = getState();

    if (columnMenuVisibleForColumnId) {
      function handleMouseDown(event: MouseEvent) {
        // @ts-ignore
        if (event.__insideMenu !== true) {
          clearAll();
          actions.columnMenuVisibleForColumnId = null;
        }
      }
      document.documentElement.addEventListener('mousedown', handleMouseDown);

      showMenuForColumn({
        columnId: columnMenuVisibleForColumnId,
        context,
        clearAll,
        showOverlay,
      });

      return () => {
        document.documentElement.removeEventListener(
          'mousedown',
          handleMouseDown,
        );
      };
    } else {
      columnMenuTargetRef.current = null;
      clearAll();
    }

    return () => {};
  }, [columnMenuVisibleForColumnId, columnMenuVisibleKey]);

  return { menuPortal };
}
