import * as React from 'react';
import { MenuSeparatorCls } from './MenuCls.css';
import {
  MenuDecoration,
  MenuItemDefinition,
  MenuItemObject,
  MenuRuntimeItem,
} from './MenuProps';
import { MenuRuntimeItemContext } from './MenuState';

const SEPARATOR: MenuItemDefinition = '-';

function MenuSeparator() {
  return <hr className={MenuSeparatorCls} />;
}

export const toRuntimeItem = (
  {
    columns,
    keyboardActiveItemKey,
    activeItemKey,
    menuId,
  }: MenuRuntimeItemContext,
  item: MenuItemDefinition,
) => {
  const menuItem =
    item &&
    ((item as MenuItemObject).key != null ||
      (item as MenuItemObject).label != null)
      ? (item as MenuItemObject)
      : null;

  const menuDecoration =
    menuItem === null ? (
      item === SEPARATOR ? (
        <MenuSeparator />
      ) : (
        (item as MenuDecoration)
      )
    ) : null;

  const runtimeItem: MenuRuntimeItem =
    menuItem != null
      ? {
          type: 'item',
          parentMenuId: menuId,
          disabled: !!menuItem.disabled,
          keyboardActive: menuItem.key === keyboardActiveItemKey,
          active: menuItem.key === activeItemKey,
          value: menuItem,
          span: menuItem.span || 1,
          key: menuItem.key,
          menu: menuItem.menu || null,
          style: menuItem.style,
          className: menuItem.className,
          originalMenuItem: menuItem,
        }
      : {
          type: 'decoration',
          value: menuDecoration,
          span: columns.length,
          style: {
            gridColumnStart: 1,
            gridColumnEnd: columns.length + 10, // it should have been +1, but we might introduce an additional col for submenu icons
            // so we make this bigger
          },
        };

  return runtimeItem;
};

export function childrenToRuntimeItems(
  context: MenuRuntimeItemContext,
  children: React.ReactNode,
) {
  // items are passed as children
  // so we iterate over all children
  return (
    React.Children.map(children, (child) => {
      // to find <MenuItem /> components
      //@ts-ignore
      if (child?.props.__is_menu_item) {
        //@ts-ignore
        const itemProps = { ...child.props };
        if (!itemProps.key) {
          //@ts-ignore
          itemProps.key = child.key as string;
        }
        if (!itemProps.description) {
          //@ts-ignore
          itemProps.description = child.props.children;
        }

        if (!itemProps.label) {
          itemProps.label = itemProps.children;
        }
        return toRuntimeItem(context, itemProps);
      }
      // and other decorative elements
      return toRuntimeItem(context, child as MenuItemDefinition);
    }) || []
  );
}
