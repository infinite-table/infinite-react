import { style } from '@vanilla-extract/css';

import { ThemeVars } from '../../vars.css';
import { recipe } from '@vanilla-extract/recipes';
import { display } from '../../utilities.css';

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

export const GroupingToolbarItemCls = style({
  display: 'flex',
  alignItems: 'center',
  border: `1px solid ${ThemeVars.color.accent}`,
  padding: ThemeVars.spacing[2],
});

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
