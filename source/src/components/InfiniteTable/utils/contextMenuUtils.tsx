import * as React from 'react';

import type { MenuProps } from '../../Menu/MenuProps';
import type { MenuState } from '../../Menu/MenuState';
import { AvoidReactDiff } from '../../RawList/AvoidReactDiff';
import type { Renderable } from '../../types/Renderable';
import { buildSubscriptionCallback } from '../../utils/buildSubscriptionCallback';
import type { GetContextMenuItemsReturnType } from '../types/InfiniteTableProps';

export function getMenuItemsAndColumns(
  menuDefinition: GetContextMenuItemsReturnType,
) {
  let items = menuDefinition
    ? Array.isArray(menuDefinition)
      ? menuDefinition
      : menuDefinition.items
    : null;

  const columns =
    menuDefinition && !Array.isArray(menuDefinition)
      ? menuDefinition.columns
      : undefined;

  return {
    items,
    columns,
  };
}

export function getMenuDefaultProps(config: {
  onHideIntent: VoidFunction | undefined;
}) {
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

  const menuDefaultProps: MenuProps = {
    columns: [],
    items: [],
    autoFocus: true,
    onShow: (state) => {
      state.domRef.current?.parentNode?.addEventListener(
        'mousedown',
        onRootMouseDown,
      );
    },
    onHide,
    onHideIntent: (state: MenuState) => {
      onHide(state);
      config.onHideIntent?.();
    },
  };

  return menuDefaultProps;
}

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
