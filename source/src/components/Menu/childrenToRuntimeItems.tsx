import * as React from 'react';
import { MenuItem } from './MenuItem';
import { MenuItemDefinition, MenuRuntimeItem } from './MenuProps';
import { MenuRuntimeItemContext } from './MenuState';
import { toRuntimeItemShared } from './menuStateShared';
import { MenuSeparator, reactMenuRenderAdapters } from './reactMenuAdapters';

export { MenuSeparator };

export const toRuntimeItem = (
  context: MenuRuntimeItemContext,
  item: MenuItemDefinition,
): MenuRuntimeItem =>
  toRuntimeItemShared(context, item, reactMenuRenderAdapters);

export function childrenToRuntimeItems(
  context: MenuRuntimeItemContext,
  children: React.ReactNode,
) {
  // items are passed as children
  // so we iterate over all children
  return (
    React.Children.map(children, (child) => {
      // to find <MenuItem /> components

      if (child) {
        //@ts-ignore
        if (child.props.__is_menu_item || child.type === MenuItem) {
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
      }
      // and other decorative elements
      return toRuntimeItem(context, child as MenuItemDefinition);
    }) || []
  );
}
