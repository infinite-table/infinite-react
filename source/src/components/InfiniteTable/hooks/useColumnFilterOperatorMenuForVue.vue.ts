/**
 * Vue sibling of useColumnFilterOperatorMenu.ts — shows/hides the filter
 * operator menu overlay in response to operator-switch clicks
 * (state.onFilterOperatorMenuClick) and the
 * filterOperatorMenuVisibleForColumnId state.
 *
 * Must be called inside the InfiniteTable root's setup().
 */
import { onBeforeUnmount, watch } from 'vue';
import type { ShallowRef } from 'vue';

import { Rectangle } from '../../../utils/pageGeometry/Rectangle';
import { useOverlay } from '../../hooks/useOverlay/useOverlayForVue.vue';
import { getFilterOperatorMenuForColumn } from '../utils/getFilterOperatorMenuForColumnForVue.vue';

import { InfiniteTableStableContextValue } from '../types/InfiniteTableContextValue';
import type { InfiniteTableState } from '../types';

const OFFSET = 10;

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
    portalContainer: false,
  });

  const removeOnMenuClick = getState().onFilterOperatorMenuClick.onChange(
    (info) => {
      if (!info) {
        return;
      }
      const { target, column } = info;

      function onHideIntent() {
        clearAll();
        actions.filterOperatorMenuVisibleForColumnId = null;
      }

      const alignTo = (((target as HTMLElement)
        ?.parentElement as HTMLElement) || target) as HTMLElement;

      const rect = Rectangle.from(alignTo.getBoundingClientRect());

      // shift and increase the rect so we get some offset for the alignment
      rect.top -= OFFSET;
      rect.left -= OFFSET;

      rect.width += 2 * OFFSET;
      rect.height += 2 * OFFSET;

      showOverlay(
        () => getFilterOperatorMenuForColumn(column.id, context, onHideIntent),
        {
          constrainTo: getState().domRef.current!,
          id: 'filter-operator-menu',
          alignTo: rect,

          alignPosition: [
            ['TopLeft', 'BottomLeft'],
            ['TopRight', 'BottomRight'],
          ],
        },
      );

      actions.contextMenuVisibleFor = null;
      actions.cellContextMenuVisibleFor = null;
      actions.columnMenuVisibleForColumnId = null;
      actions.filterOperatorMenuVisibleForColumnId = column.id;
    },
  );

  watch(
    () => state.value.filterOperatorMenuVisibleForColumnId,
    (visibleForColumnId, _prev, onCleanup) => {
      if (visibleForColumnId) {
        function handleMouseDown(event: MouseEvent) {
          // @ts-ignore
          if (event.__insideMenu !== true) {
            clearAll();
            actions.filterOperatorMenuVisibleForColumnId = null;
          }
        }
        document.documentElement.addEventListener('mousedown', handleMouseDown);
        onCleanup(() => {
          document.documentElement.removeEventListener(
            'mousedown',
            handleMouseDown,
          );
        });
      } else {
        clearAll();
      }
    },
    { flush: 'post' },
  );

  onBeforeUnmount(() => {
    removeOnMenuClick();
  });

  return { MenuPortal };
}
