import * as React from 'react';

import type { MenuProps } from '../../Menu/MenuProps';
import { AvoidReactDiff } from '../../RawList/AvoidReactDiff';
import type { Renderable } from '../../types/Renderable';
import { buildSubscriptionCallback } from '../../utils/buildSubscriptionCallback';
import type { GetContextMenuItemsReturnType } from '../types/InfiniteTableProps';

import {
  getMenuDefaultProps,
  getMenuItemsAndColumns,
} from './contextMenuUtilsShared';

export { getMenuDefaultProps, getMenuItemsAndColumns };

export function getLazyMenu(
  menuDefinition: Promise<GetContextMenuItemsReturnType>,
  menuDefaultProps: MenuProps,
  MenuCmp: React.ComponentType<MenuProps>,
) {
  if (!menuDefinition) {
    return null;
  }

  const updater = buildSubscriptionCallback<Renderable>();

  menuDefinition.then((menuDefinition) => {
    const { items, columns } = getMenuItemsAndColumns(menuDefinition);
    if (items && items.length) {
      updater(
        <MenuCmp {...menuDefaultProps} items={items || []} columns={columns} />,
      );
    }
  });

  return <AvoidReactDiff updater={updater} />;
}
