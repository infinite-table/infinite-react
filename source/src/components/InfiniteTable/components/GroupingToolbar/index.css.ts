import { style } from '@vanilla-extract/css';

import { ThemeVars } from '../../vars.css';
import { recipe } from '@vanilla-extract/recipes';
import { alignItems, cursor, display, padding } from '../../utilities.css';

const GroupingToolbarBaseCls = style(
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

export const GroupingToolbarItemRecipe = recipe({
  base: [
    {
      border: `1px solid ${ThemeVars.color.accent}`,
    },
    padding[2],
    alignItems.center,
    display.flex,
  ],
  variants: {
    draggingInProgress: {
      true: [
        cursor.grabbing,
        {
          background: ThemeVars.components.GroupingToolbar.background,
        },
      ],
      false: [cursor.grab],
    },
  },
});

export const GroupingToolbarItemClearCls = style([cursor.pointer]);

export const GroupingToolbarRecipe = recipe({
  base: [GroupingToolbarBaseCls],
  variants: {
    draggingInProgress: {
      true: {
        background: ThemeVars.components.GroupingToolbar.activeBackground,
      },
      false: {
        background: ThemeVars.components.GroupingToolbar.background,
      },
    },
  },
});
