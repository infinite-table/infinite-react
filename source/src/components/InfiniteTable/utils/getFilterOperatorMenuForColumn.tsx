import * as React from 'react';

import { Menu } from '../../Menu';
import { ClearIcon } from '../components/icons/ClearIcon';

import { DoneIcon } from '../components/icons/DoneIcon';
import { FilterIcon } from '../components/icons/FilterIcon';

import { InfiniteTableStableContextValue } from '../types/InfiniteTableContextValue';
import { getFilterOperatorMenuProps } from './menuItemsShared';

export function getFilterOperatorMenuForColumn<T>(
  columnId: string | null,
  context: InfiniteTableStableContextValue<T>,
  onHideIntent?: VoidFunction,
) {
  const MenuCmp = context.getState().components?.Menu ?? Menu;

  const menuProps = getFilterOperatorMenuProps(
    columnId,
    context,
    onHideIntent,
    {
      renderOperatorIcon: (operator) => {
        const IconCmp = operator.components?.Icon ?? FilterIcon;
        return <IconCmp />;
      },
      renderOperatorLabel: (label) => <>{label}</>,
      renderClearIcon: () => <ClearIcon />,
      renderDoneIcon: () => <DoneIcon size={16} />,
    },
  );

  return menuProps ? <MenuCmp {...menuProps} /> : null;
}
