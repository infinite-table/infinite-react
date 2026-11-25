/**
 * Angular sibling of getFilterOperatorMenuForColumn.tsx (and of the Vue
 * getFilterOperatorMenuForColumnForVue.vue.ts) - the filter operator menu
 * (Close/Reset + one item per operator with its icon and a done-check on
 * the active operator).
 */
import { renderMenu } from '../../Menu/MenuForAngular.angular';
import { MenuState } from '../../Menu/MenuState';
import { renderComponent } from '../../RawList/InfiniteRenderForAngular.angular';
import type { Renderable } from '../../types/FrameworkTypes.angular';
import { toFilterRenderable } from '../components/InfiniteTableHeader/InfiniteTableColumnHeaderFilterForAngular.angular';
import {
  ClearIcon,
  DoneIcon,
} from '../components/icons/FilterOperatorIconsForAngular.angular';
import { FilterIcon } from '../components/icons/FilterIcon/FilterIconForAngular.angular';

import { InfiniteTableStableContextValue } from '../types/InfiniteTableContextValue';

const DONE_ICON = renderComponent(DoneIcon, { inputs: { size: 16 } });
const CLEAR_ICON = renderComponent(ClearIcon);
const FILTER_ICON = renderComponent(FilterIcon);

export function getFilterOperatorMenuForColumn<T>(
  columnId: string | null,
  context: InfiniteTableStableContextValue<T>,
  onHideIntent?: VoidFunction,
): Renderable {
  if (columnId == null) {
    return null;
  }
  const {
    getComputed,
    getState,
    getDataSourceState,
    actions,
    dataSourceApi,
    dataSourceActions,
    api,
  } = context;

  const { components, getFilterOperatorMenuItems } = getState();

  const column = getComputed().computedColumnsMap.get(columnId);

  if (!column) {
    return null;
  }

  const onRootMouseDown: EventListener = (event: Event) => {
    //@ts-ignore
    event.__insideMenu = true;
  };

  const onHide = (state: MenuState) => {
    state.domRef.current?.parentNode?.removeEventListener(
      'mousedown',
      onRootMouseDown,
    );
  };

  const { filterTypes } = getDataSourceState();

  const columnFilterType = filterTypes[column.computedFilterType];

  if (!columnFilterType) {
    return null;
  }

  const operatorItems = columnFilterType.operators.map((operator) => {
    const key = operator.name;
    const checked = column.computedFilterValue
      ? column.computedFilterValue.filter.operator === key
      : key === columnFilterType.defaultOperator;

    const Icon = operator.components?.Icon;

    return {
      key,
      icon: Icon ? toFilterRenderable(Icon as any, {}) : FILTER_ICON,
      label: operator.label ?? operator.name,
      onAction: () => {
        api.setColumnFilterOperator(columnId, key);
      },
      checked: checked ? DONE_ICON : null,
    };
  });

  const firstItems = [
    {
      key: 'close',
      label: 'Close Menu',
      icon: null,

      onAction: () => {
        api.hideFilterOperatorMenu();
      },
    },
    {
      key: 'reset',
      label: 'Reset',
      icon: CLEAR_ICON,
      disabled: !column.computedFiltered,
      onAction: () => {
        api.clearColumnFilter(columnId);
      },
    },
    '-',
  ];

  const defaultItems = [...firstItems, ...operatorItems];

  const param = {
    column,
    api,
    getState,
    getDataSourceState,
    getComputed,
    actions,
    dataSourceApi,
    dataSourceActions,
    columnFilterValue: column.computedFilterValue,
    filterTypes,
  };

  const items = getFilterOperatorMenuItems
    ? getFilterOperatorMenuItems(defaultItems as any, param as any)
    : defaultItems;

  return renderMenu(
    {
      autoFocus: true,
      columns: [
        {
          name: 'icon',
        },
        { name: 'label' },
        { name: 'checked' },
      ],
      items: items as any,
      onShow: (state: MenuState) => {
        state.domRef.current?.parentNode?.addEventListener(
          'mousedown',
          onRootMouseDown,
        );
      },
      onHide,
      onHideIntent: (state: MenuState) => {
        onHide(state);
        onHideIntent?.();
      },
    },
    components?.Menu as any,
  );
}
