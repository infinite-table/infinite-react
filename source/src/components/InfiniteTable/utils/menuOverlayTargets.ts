import type { ElementContainerGetter } from '../../hooks/useOverlay/overlayUtils';
import type { InfiniteTablePropMenuElement } from '../types/InfiniteTableProps';
import type { InfiniteTableState } from '../types/InfiniteTableState';

function resolveMenuElement(element: InfiniteTablePropMenuElement | undefined) {
  return typeof element === 'function' ? element() : element;
}

export function getMenuConstrainTo<T>(
  state: InfiniteTableState<T>,
): HTMLElement {
  return resolveMenuElement(state.menuConstrainTo) ?? state.domRef.current!;
}

/**
 * `defaultContainer` is used when no `menuPortalContainer` is configured -
 * `false` renders the menus inline, in the table's own portal element.
 */
export function getMenuPortalContainer<T>(
  getState: () => InfiniteTableState<T>,
  menuPortalContainer: InfiniteTablePropMenuElement | undefined,
  defaultContainer: HTMLElement | null | undefined | false,
): ElementContainerGetter | false {
  if (!menuPortalContainer) {
    return defaultContainer || false;
  }
  return () =>
    resolveMenuElement(menuPortalContainer) ??
    (defaultContainer || getState().portalDOMRef.current!);
}
