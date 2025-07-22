import { style } from '@vanilla-extract/css';

import { ThemeVars } from '../../vars.css';
import { recipe } from '@vanilla-extract/recipes';
import { alignItems, cursor, display, padding } from '../../utilities.css';

export const GroupingToolbarBaseCls = style(
  [
    display.flex,
    {
      gap: ThemeVars.components.GroupingToolbar.gap,
      color: ThemeVars.components.GroupingToolbar.color,
      background: ThemeVars.components.GroupingToolbar.background,
      padding: ThemeVars.components.GroupingToolbar.padding,
      border: ThemeVars.components.GroupingToolbar.border,
    },
  ],
  'GroupingToolbar',
);

export const GroupingToolbarPlaceholderCls = style({
  opacity: 0.5,
});

export const GroupingToolbarItemCls = style([
  {
    border: `1px solid ${ThemeVars.color.accent}`,
  },
  padding[2],
  alignItems.center,
  display.flex,
]);

export const GroupingToolbarItemClearCls = style([cursor.pointer]);

export const GroupingToolbarRecipe = recipe({
  base: [GroupingToolbarBaseCls],
  variants: {
    active: {
      true: {
        display: 'block',
      },
      false: {
        display: 'none',
      },
    },
  },
});
