/**
 * Angular sibling of useColumnMenu.ts (and of the Vue
 * useColumnMenuForVue.vue.ts) - shows/hides the column menu overlay in
 * response to menu-icon clicks (state.onColumnMenuClick, which
 * `columnApi.toggleContextMenu()` publishes) and the
 * columnMenuVisibleForColumnId state.
 *
 * Called in the InfiniteTable root's setup; render the returned overlay
 * with `infiniteOverlayPortal` in the root's portal element.
 */
import { DestroyRef, Injector, Signal } from '@angular/core';

import { watchSignals } from '../../hooks/watchSignals.angular';
import {
  createOverlay,
  type InfiniteOverlay,
  type ShowOverlayFn,
} from '../../hooks/useOverlay/OverlayForAngular.angular';
import { menuIconSelector } from '../components/icons/menuIconAttributes';
import { getMenuForColumn } from '../utils/getMenuForColumnForAngular.angular';

import {
  getMenuConstrainTo,
  getMenuPortalContainer,
} from '../utils/menuOverlayTargets';
import { InfiniteTableStableContextValue } from '../types/InfiniteTableContextValue';
import type { InfiniteTableState } from '../types';

export type MenuHookParams<T> = {
  context: InfiniteTableStableContextValue<T>;
  state: Signal<InfiniteTableState<T>>;
  injector: Injector;
  /**
   * In a row detail: the master grid's portal element, the default
   * container of the menus (they would be clipped by the detail row)
   */
  getMasterPortalElement?: () => HTMLElement | null | undefined;
};

export function getMenuOverlayPortalContainer<T>(params: MenuHookParams<T>) {
  const { getState } = params.context;
  return getMenuPortalContainer(
    getState,
    getState().menuPortalContainer,
    params.getMasterPortalElement?.() ?? false,
  );
}

function showMenuForColumn<T>(options: {
  columnId: string;
  target?: HTMLElement;
  context: InfiniteTableStableContextValue<T>;
  clearAll: VoidFunction;
  showOverlay: ShowOverlayFn;
  injector: Injector;
}) {
  const { columnId, context, clearAll, showOverlay, injector } = options;
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

  showOverlay(
    () => getMenuForColumn(columnId, context, onHideIntent, injector),
    {
      constrainTo: getMenuConstrainTo(getState()),
      id: 'column-menu',
      alignTo: target,
      alignPosition: [
        ['TopLeft', 'BottomLeft'],
        ['TopRight', 'BottomRight'],
      ],
    },
  );
}

export function setupColumnMenu<T>(params: MenuHookParams<T>): InfiniteOverlay {
  const { context, state, injector } = params;
  const { getState, actions } = context;

  const overlay = createOverlay({
    portalContainer: getMenuOverlayPortalContainer(params),
  });
  const { showOverlay, clearAll } = overlay;

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

  watchSignals(
    () =>
      [
        state().columnMenuVisibleForColumnId,
        state().columnMenuVisibleKey,
      ] as const,
    () => {
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
          injector,
        });

        return () => {
          document.documentElement.removeEventListener(
            'mousedown',
            handleMouseDown,
          );
        };
      }
      columnMenuTargetRef.current = null;
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
      if (getState().columnMenuVisibleForColumnId) {
        overlay.rerenderOverlays();
      }
    },
    { injector },
  );

  injector.get(DestroyRef).onDestroy(() => {
    removeOnColumnMenuClick();
  });

  return overlay;
}
