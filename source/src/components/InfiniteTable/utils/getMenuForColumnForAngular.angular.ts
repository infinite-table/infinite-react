/**
 * Angular sibling of getMenuForColumn.tsx (and of the Vue
 * getMenuForColumnForVue.vue.ts) - the column menu content, from the
 * shared column menu props (menuItemsShared.ts).
 */
import type { Injector } from '@angular/core';

import { renderMenu } from '../../Menu/MenuForAngular.angular';
import type { Renderable } from '../../types/FrameworkTypes.angular';
import { defaultGetColumnMenuItems } from './defaultGetColumnMenuItemsForAngular.angular';
import { getColumnMenuProps } from './menuItemsShared';
import { InfiniteTableStableContextValue } from '../types/InfiniteTableContextValue';

export function getMenuForColumn<T>(
  columnId: string | null,
  context: InfiniteTableStableContextValue<T>,
  onHideIntent?: VoidFunction,
  /** the grid's injector (header labels in the Columns submenu) */
  injector?: Injector,
): Renderable {
  const menuProps = getColumnMenuProps(
    columnId,
    context,
    onHideIntent,
    (param) => defaultGetColumnMenuItems([], param, injector),
  );

  return menuProps
    ? renderMenu(menuProps, context.getState().components?.Menu as any)
    : null;
}
