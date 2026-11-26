/**
 * Framework-neutral wiring of the grid's menus to their overlays, shared by
 * the React hooks (useColumnMenu, useContextMenu,
 * useColumnFilterOperatorMenu) and their Vue and Angular siblings: what
 * happens when a menu is asked for (a menu icon click, a contextmenu event,
 * an operator switch click), where the menu is shown, and the effect of the
 * "menu visible" state (a mousedown outside the menu closes it).
 *
 * Each framework owns the overlay (`showOverlay` / `clearAll`), renders the
 * menu content, and schedules the effects its own way.
 */
import type { AlignPositionOptions } from '../../../utils/pageGeometry/alignment';
import { Rectangle } from '../../../utils/pageGeometry/Rectangle';
import type { OverlayShowParams } from '../../hooks/useOverlay/overlayUtils';
import { menuIconSelector } from '../components/icons/menuIconAttributes';
import type { InfiniteTableStableContextValue } from '../types/InfiniteTableContextValue';
import type {
  CellContextMenuLocationWithEvent,
  ContextMenuLocationWithEvent,
  InfiniteTableState,
} from '../types/InfiniteTableState';
import { getMenuConstrainTo } from './menuOverlayTargets';

type MenuClickInfo<T> = Parameters<
  Parameters<InfiniteTableState<T>['onColumnMenuClick']['onChange']>[0]
>[0];

type FilterOperatorMenuClickInfo<T> = Parameters<
  Parameters<InfiniteTableState<T>['onFilterOperatorMenuClick']['onChange']>[0]
>[0];

/**
 * Shows a menu content with the given overlay params - `onHideIntent` is
 * what the menu calls to hide itself.
 */
export type ShowMenuFn = (
  onHideIntent: VoidFunction,
  params: OverlayShowParams,
) => void;

const CONTEXT_MENU_OFFSET = 5;

const CONTEXT_MENU_ALIGN_POSITIONS: AlignPositionOptions['alignPosition'] = [
  ['TopLeft', 'BottomLeft'],
  ['TopRight', 'BottomRight'],
  ['BottomLeft', 'BottomLeft'],
  ['BottomRight', 'BottomRight'],
  ['TopCenter', 'TopLeft'],
  ['BottomCenter', 'TopLeft'],
  ['CenterLeft', 'TopLeft'],
  ['CenterRight', 'TopLeft'],
];

const FILTER_OPERATOR_MENU_OFFSET = 10;

/**
 * Calls `close` on a mousedown outside the menu (a mousedown inside it is
 * marked with `__insideMenu`, see getMenuVisibilityProps). Returns the
 * cleanup.
 */
export function closeMenuOnOutsideMouseDown(close: VoidFunction) {
  function handleMouseDown(event: MouseEvent) {
    // @ts-ignore
    if (event.__insideMenu !== true) {
      close();
    }
  }
  document.documentElement.addEventListener('mousedown', handleMouseDown);
  return () => {
    document.documentElement.removeEventListener('mousedown', handleMouseDown);
  };
}

/**
 * The effect of a "menu visible" state (cell / table context menu, filter
 * operator menu): while visible, a mousedown outside the menu calls
 * `clearAll` and `hide`; otherwise the overlay is cleared. Returns the
 * cleanup.
 */
export function menuVisibilityEffect(
  visible: unknown,
  clearAll: VoidFunction,
  hide: VoidFunction,
): VoidFunction | undefined {
  if (visible) {
    return closeMenuOnOutsideMouseDown(() => {
      clearAll();
      hide();
    });
  }
  clearAll();
  return undefined;
}

/**
 * The `onColumnMenuClick` subscriber: shows the column menu of the clicked
 * column, aligned to the clicked element, and hides the other menus.
 */
export function getColumnMenuClickHandler<T>(
  context: InfiniteTableStableContextValue<T>,
) {
  const { getState, actions } = context;

  return (info: MenuClickInfo<T>) => {
    if (!info) {
      return;
    }
    getState().columnMenuTargetRef.current = info.target as HTMLElement;

    actions.contextMenuVisibleFor = null;
    actions.cellContextMenuVisibleFor = null;
    actions.filterOperatorMenuVisibleForColumnId = null;
    actions.columnMenuVisibleForColumnId = info.column.id;
  };
}

function showMenuForColumn<T>(options: {
  columnId: string;
  target?: HTMLElement;
  context: InfiniteTableStableContextValue<T>;
  clearAll: VoidFunction;
  show: ShowMenuFn;
}) {
  const { columnId, context, clearAll, show } = options;
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

  show(onHideIntent, {
    constrainTo: getMenuConstrainTo(getState()),
    id: 'column-menu',
    alignTo: target,
    alignPosition: [
      ['TopLeft', 'BottomLeft'],
      ['TopRight', 'BottomRight'],
    ],
  });
}

/**
 * The effect of `columnMenuVisibleForColumnId` / `columnMenuVisibleKey`:
 * shows the column menu of that column (aligned to the clicked element, or
 * to the column's menu icon), which a mousedown outside it closes; clears
 * the overlay when no column menu is visible. Returns the cleanup.
 */
export function columnMenuVisibilityEffect<T>(
  context: InfiniteTableStableContextValue<T>,
  overlay: {
    clearAll: VoidFunction;
    /** shows the column menu of the given column */
    show: (
      columnId: string,
      onHideIntent: VoidFunction,
      params: OverlayShowParams,
    ) => void;
  },
): VoidFunction | undefined {
  const { getState, actions } = context;
  const { clearAll } = overlay;
  const { columnMenuVisibleForColumnId, columnMenuTargetRef } = getState();

  if (columnMenuVisibleForColumnId) {
    const cleanup = closeMenuOnOutsideMouseDown(() => {
      clearAll();
      actions.columnMenuVisibleForColumnId = null;
    });

    showMenuForColumn({
      columnId: columnMenuVisibleForColumnId,
      context,
      clearAll,
      show: (onHideIntent, params) =>
        overlay.show(columnMenuVisibleForColumnId, onHideIntent, params),
    });

    return cleanup;
  }

  columnMenuTargetRef.current = null;
  clearAll();
  return undefined;
}

function getContextMenuRect(event: { clientX: number; clientY: number }) {
  const point = {
    top: event.clientY,
    left: event.clientX,
  };
  const rect = Rectangle.fromPoint(point);

  rect.width += CONTEXT_MENU_OFFSET;
  rect.height += CONTEXT_MENU_OFFSET;

  return { point, rect };
}

/**
 * The content of a context menu, as the framework built it.
 */
type ContextMenuContentLike = {
  cellContext: any;
  preventDefault: boolean;
};

/**
 * The `cellContextMenu` subscriber: builds the cell context menu (with
 * `getContent`), shows it at the pointer, prevents the native context menu
 * when there is a menu, and calls `onCellContextMenu`.
 */
export function getCellContextMenuHandler<
  T,
  CONTENT extends ContextMenuContentLike,
>(
  context: InfiniteTableStableContextValue<T>,
  overlay: {
    clearAll: VoidFunction;
    getContent: (
      info: CellContextMenuLocationWithEvent,
      onHideIntent: VoidFunction,
    ) => CONTENT;
    show: (content: CONTENT, params: OverlayShowParams) => void;
  },
) {
  const { actions, getState, getDataSourceState } = context;
  const { clearAll } = overlay;

  return (info: CellContextMenuLocationWithEvent | null) => {
    if (!info) {
      return;
    }
    const { event } = info;

    function onHideIntent() {
      clearAll();
      actions.cellContextMenuVisibleFor = null;
    }

    const content = overlay.getContent(info, onHideIntent);
    const { cellContext, preventDefault } = content;

    const { rect } = getContextMenuRect(event);

    overlay.show(content, {
      constrainTo: getMenuConstrainTo(getState()),
      id: 'cell-context-menu',
      alignTo: rect,
      alignPosition: CONTEXT_MENU_ALIGN_POSITIONS,
    });

    if (preventDefault) {
      event.preventDefault();
    }

    actions.cellContextMenuVisibleFor = {
      columnId: info.columnId,
      rowId: info.rowId,
      rowIndex: info.rowIndex,
      colIndex: info.colIndex,
    };

    const { onCellContextMenu } = getState();
    if (onCellContextMenu) {
      onCellContextMenu(
        {
          ...cellContext,
          getState,
          getDataSourceState,
        },
        event,
      );
    }
  };
}

/**
 * The `contextMenu` subscriber (a contextmenu event on the table body):
 * builds the table context menu (with `getContent`), shows it at the
 * pointer, prevents the native context menu when there is a menu, and
 * calls `onContextMenu`.
 */
export function getTableContextMenuHandler<
  T,
  CONTENT extends ContextMenuContentLike,
>(
  context: InfiniteTableStableContextValue<T>,
  overlay: {
    clearAll: VoidFunction;
    getContent: (
      info: ContextMenuLocationWithEvent,
      onHideIntent: VoidFunction,
    ) => CONTENT;
    show: (content: CONTENT, params: OverlayShowParams) => void;
  },
) {
  const { actions, getState } = context;
  const { clearAll } = overlay;

  return (info: ContextMenuLocationWithEvent | null) => {
    if (!info) {
      return;
    }
    const { event } = info;

    function onHideIntent() {
      clearAll();
      actions.contextMenuVisibleFor = null;
    }

    const content = overlay.getContent(info, onHideIntent);
    const { cellContext, preventDefault } = content;

    const { point, rect } = getContextMenuRect(event);

    overlay.show(content, {
      constrainTo: getMenuConstrainTo(getState()),
      id: 'table-context-menu',
      alignTo: rect,
      alignPosition: CONTEXT_MENU_ALIGN_POSITIONS,
    });

    if (preventDefault) {
      event.preventDefault();
    }

    actions.contextMenuVisibleFor = {
      point,
      ...info,
    };

    const { onContextMenu } = getState();
    if (onContextMenu) {
      onContextMenu(
        {
          ...context,
          ...cellContext,
        },
        event,
      );
    }
  };
}

/**
 * The `onFilterOperatorMenuClick` subscriber: shows the filter operator
 * menu of the column, around the clicked operator switch, and hides the
 * other menus.
 */
export function getFilterOperatorMenuClickHandler<T>(
  context: InfiniteTableStableContextValue<T>,
  overlay: {
    clearAll: VoidFunction;
    /** shows the filter operator menu of the given column */
    show: (
      columnId: string,
      onHideIntent: VoidFunction,
      params: OverlayShowParams,
    ) => void;
  },
) {
  const { getState, actions } = context;
  const { clearAll } = overlay;

  return (info: FilterOperatorMenuClickInfo<T>) => {
    if (!info) {
      return;
    }
    const { target, column } = info;

    function onHideIntent() {
      clearAll();
      actions.filterOperatorMenuVisibleForColumnId = null;
    }

    const alignTo = (((target as HTMLElement)?.parentElement as HTMLElement) ||
      target) as HTMLElement;

    const rect = Rectangle.from(alignTo.getBoundingClientRect());

    // shift and increase the rect so we get some offset for the alignment
    rect.top -= FILTER_OPERATOR_MENU_OFFSET;
    rect.left -= FILTER_OPERATOR_MENU_OFFSET;

    rect.width += 2 * FILTER_OPERATOR_MENU_OFFSET;
    rect.height += 2 * FILTER_OPERATOR_MENU_OFFSET;

    overlay.show(column.id, onHideIntent, {
      constrainTo: getMenuConstrainTo(getState()),
      id: 'filter-operator-menu',
      alignTo: rect,

      alignPosition: [
        ['TopLeft', 'BottomLeft'],
        ['TopRight', 'BottomRight'],
      ],
    });

    actions.contextMenuVisibleFor = null;
    actions.cellContextMenuVisibleFor = null;
    actions.columnMenuVisibleForColumnId = null;
    actions.filterOperatorMenuVisibleForColumnId = column.id;
  };
}
