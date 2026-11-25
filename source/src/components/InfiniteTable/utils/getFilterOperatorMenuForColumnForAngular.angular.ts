/**
 * Angular sibling of getFilterOperatorMenuForColumn.tsx (and of the Vue
 * getFilterOperatorMenuForColumnForVue.vue.ts) - the filter operator menu,
 * from the shared filter operator menu props (menuItemsShared.ts) with
 * Angular icons.
 */
import { renderMenu } from '../../Menu/MenuForAngular.angular';
import { renderComponent } from '../../RawList/InfiniteRenderForAngular.angular';
import type { Renderable } from '../../types/FrameworkTypes.angular';
import { toFilterRenderable } from '../components/InfiniteTableHeader/InfiniteTableColumnHeaderFilterForAngular.angular';
import {
  ClearIcon,
  DoneIcon,
} from '../components/icons/FilterOperatorIconsForAngular.angular';
import { FilterIcon } from '../components/icons/FilterIcon/FilterIconForAngular.angular';

import { InfiniteTableStableContextValue } from '../types/InfiniteTableContextValue';
import { getFilterOperatorMenuProps } from './menuItemsShared';

const DONE_ICON = renderComponent(DoneIcon, { inputs: { size: 16 } });
const CLEAR_ICON = renderComponent(ClearIcon);
const FILTER_ICON = renderComponent(FilterIcon);

export function getFilterOperatorMenuForColumn<T>(
  columnId: string | null,
  context: InfiniteTableStableContextValue<T>,
  onHideIntent?: VoidFunction,
): Renderable {
  const menuProps = getFilterOperatorMenuProps(
    columnId,
    context,
    onHideIntent,
    {
      renderOperatorIcon: (operator) => {
        const Icon = operator.components?.Icon;
        return Icon ? toFilterRenderable(Icon as any, {}) : FILTER_ICON;
      },
      renderOperatorLabel: (label) => label,
      renderClearIcon: () => CLEAR_ICON,
      renderDoneIcon: () => DONE_ICON,
    },
  );

  return menuProps
    ? renderMenu(menuProps, context.getState().components?.Menu as any)
    : null;
}
