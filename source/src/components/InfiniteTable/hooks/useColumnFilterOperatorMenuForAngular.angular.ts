/**
 * Angular sibling of useColumnFilterOperatorMenu.ts (and of the Vue
 * useColumnFilterOperatorMenuForVue.vue.ts) - shows/hides the filter
 * operator menu overlay in response to operator-switch clicks
 * (state.onFilterOperatorMenuClick) and the
 * filterOperatorMenuVisibleForColumnId state.
 *
 * Called in the InfiniteTable root's setup; render the returned overlay
 * with `infiniteOverlayPortal` in the root's portal element.
 */
import { DestroyRef } from '@angular/core';

import { Rectangle } from '../../../utils/pageGeometry/Rectangle';
import { watchSignals } from '../../hooks/watchSignals.angular';
import {
  createOverlay,
  type InfiniteOverlay,
} from '../../hooks/useOverlay/OverlayForAngular.angular';
import { getFilterOperatorMenuForColumn } from '../utils/getFilterOperatorMenuForColumnForAngular.angular';

import { getMenuConstrainTo } from '../utils/menuOverlayTargets';
import {
  getMenuOverlayPortalContainer,
  type MenuHookParams,
} from './useColumnMenuForAngular.angular';

const OFFSET = 10;

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
          constrainTo: getMenuConstrainTo(getState()),
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

  watchSignals(
    () => [state().filterOperatorMenuVisibleForColumnId] as const,
    ([visibleForColumnId]) => {
      if (visibleForColumnId) {
        function handleMouseDown(event: MouseEvent) {
          // @ts-ignore
          if (event.__insideMenu !== true) {
            clearAll();
            actions.filterOperatorMenuVisibleForColumnId = null;
          }
        }
        document.documentElement.addEventListener('mousedown', handleMouseDown);
        return () => {
          document.documentElement.removeEventListener(
            'mousedown',
            handleMouseDown,
          );
        };
      }
      clearAll();
      return undefined;
    },
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
