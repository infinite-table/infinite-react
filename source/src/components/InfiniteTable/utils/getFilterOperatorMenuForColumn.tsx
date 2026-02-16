import * as React from 'react';

import { Menu } from '../../Menu';
import { MenuState } from '../../Menu/MenuState';
import { ClearIcon } from '../components/icons/ClearIcon';

import { DoneIcon } from '../components/icons/DoneIcon';
import { FilterIcon } from '../components/icons/FilterIcon';

import { InfiniteTableStableContextValue } from '../types/InfiniteTableContextValue';

export function getFilterOperatorMenuForColumn<T>(
  columnId: string | null,
  context: InfiniteTableStableContextValue<T>,
  onHideIntent?: VoidFunction,
) {
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

  const MenuCmp = components?.Menu ?? Menu;

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

    const IconCmp = operator.components?.Icon ?? FilterIcon;

    return {
      key,
      icon: <IconCmp />,
      label: <>{operator.label ?? operator.name}</>,
      onAction: () => {
        api.setColumnFilterOperator(columnId, key);
      },
      checked: checked ? <DoneIcon size={16} /> : null,
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
      icon: <ClearIcon />,
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
    ? getFilterOperatorMenuItems(defaultItems, param)
    : defaultItems;

  return (
    <MenuCmp
      autoFocus
      columns={[
        {
          name: 'icon',
        },
        { name: 'label' },
        { name: 'checked' },
      ]}
      items={items}
      onShow={(state) => {
        state.domRef.current?.parentNode?.addEventListener(
          'mousedown',
          onRootMouseDown,
        );
      }}
      onHide={onHide}
      onHideIntent={(state: MenuState) => {
        onHide(state);
        onHideIntent?.();
      }}
    />
  );
}
