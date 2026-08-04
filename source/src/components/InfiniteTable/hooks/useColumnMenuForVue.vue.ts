/**
 * Vue sibling of useColumnMenu.ts — shows/hides the column menu overlay in
 * response to menu-icon clicks (state.onColumnMenuClick) and the
 * columnMenuVisibleForColumnId state.
 *
 * Must be called inside the InfiniteTable root's setup().
 */
import { onBeforeUnmount, watch } from 'vue';
import type { ShallowRef } from 'vue';

import {
  useOverlay,
  type ShowOverlayFn,
} from '../../hooks/useOverlay/useOverlayForVue.vue';
import { menuIconSelector } from '../components/icons/menuIconAttributes';
import { getMenuForColumn } from '../utils/getMenuForColumnForVue.vue';

import { InfiniteTableStableContextValue } from '../types/InfiniteTableContextValue';
import type { InfiniteTableState } from '../types';

function showMenuForColumn<T>(options: {
  columnId: string;
  target?: HTMLElement;
  context: InfiniteTableStableContextValue<T>;
  clearAll: VoidFunction;
  showOverlay: ShowOverlayFn;
}) {
  const { columnId, context, clearAll, showOverlay } = options;
  const { getState, actions } = context;
  const { columnMenuTargetRef, domRef } = getState();

  function onHideIntent() {
    clearAll();
    actions.columnMenuVisibleForColumnId = null;
  }

  let target = options.target;

  if (!target) {
    target = columnMenuTargetRef.current ?? undefined;

    if (target && !domRef.current!.contains(target)) {
      // if not in DOM anymore, clear it
      target = undefined;
    }
  }

  if (!target) {
    const iconSelector = `[data-column-id="${columnId}"] ${menuIconSelector}`;

    target = getState().domRef.current!.querySelector(
      iconSelector,
    ) as HTMLElement;
  }

  if (!target) {
    console.warn(`Cannot show column menu for column "${columnId}"`);
    return;
  }

  // clear this so it won't become stale
  columnMenuTargetRef.current = null;

  showOverlay(() => getMenuForColumn(columnId, context, onHideIntent), {
    constrainTo: domRef.current!,
    id: 'column-menu',
    alignTo: target,
    alignPosition: [
      ['TopLeft', 'BottomLeft'],
      ['TopRight', 'BottomRight'],
    ],
  });
}

export function useColumnMenu<T>(params: {
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
    // the master state's portalDOMRef (see the React useColumnMenu)
    portalContainer: false,
  });

  const removeOnColumnMenuClick = getState().onColumnMenuClick.onChange(
    (info) => {
      if (!info) {
        return;
      }
      getState().columnMenuTargetRef.current = info.target as HTMLElement;

      actions.contextMenuVisibleFor = null;
      actions.cellContextMenuVisibleFor = null;
      actions.filterOperatorMenuVisibleForColumnId = null;
      actions.columnMenuVisibleForColumnId = info.column.id;
    },
  );

  watch(
    [
      () => state.value.columnMenuVisibleForColumnId,
      () => state.value.columnMenuVisibleKey,
    ],
    (_current, _prev, onCleanup) => {
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

        onCleanup(() => {
          document.documentElement.removeEventListener(
            'mousedown',
            handleMouseDown,
          );
        });
      } else {
        columnMenuTargetRef.current = null;
        clearAll();
      }
    },
    { flush: 'post' },
  );

  onBeforeUnmount(() => {
    removeOnColumnMenuClick();
  });

  return { MenuPortal };
}
