/**
 * Vue sibling of getFilterOperatorMenuForColumn.tsx — builds the filter
 * operator menu vnode (Close/Reset + one item per operator with its icon and
 * a done-check on the active operator).
 */
import { h } from 'vue';
import type { VNodeChild } from 'vue';

import { Menu } from '../../Menu/MenuForVue.vue';
import { MenuState } from '../../Menu/MenuState';
import { ClearIcon, DoneIcon } from '../components/icons/IconForVue.vue';
import { FilterIcon } from '../components/icons/FilterIconForVue.vue';

import { InfiniteTableStableContextValue } from '../types/InfiniteTableContextValue';

export function getFilterOperatorMenuForColumn<T>(
  columnId: string | null,
  context: InfiniteTableStableContextValue<T>,
  onHideIntent?: VoidFunction,
): VNodeChild {
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

  const MenuCmp = (components?.Menu as any) ?? Menu;

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

    const IconCmp = (operator.components?.Icon as any) ?? FilterIcon;

    return {
      key,
      icon: h(IconCmp),
      label: operator.label ?? operator.name,
      onAction: () => {
        api.setColumnFilterOperator(columnId, key);
      },
      checked: checked ? h(DoneIcon, { size: 16 }) : null,
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
      icon: h(ClearIcon),
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

  return h(MenuCmp, {
    autoFocus: true,
    columns: [
      {
        name: 'icon',
      },
      { name: 'label' },
      { name: 'checked' },
    ],
    items,
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
  });
}
