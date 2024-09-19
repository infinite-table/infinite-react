import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { ThemeVars } from '../../vars.css';

export const RowHoverCls = style({
  vars: {
    [ThemeVars.components.Row.background]:
      ThemeVars.components.Row.hoverBackground,
    [ThemeVars.components.Row.selectedBackground]:
      ThemeVars.components.Row.selectedHoverBackground,
    [ThemeVars.components.Row.oddBackground]:
      ThemeVars.components.Row.hoverBackground,
  },
});

export const GroupRowExpanderCls = recipe({
  variants: {
    align: {
      start: {
        paddingInlineStart: `calc(${ThemeVars.components.Row.groupNesting} * ${ThemeVars.components.Row.groupRowColumnNesting})`,
      },
      center: {
        paddingInlineStart: `calc(${ThemeVars.components.Row.groupNesting} * ${ThemeVars.components.Row.groupRowColumnNesting})`,
      },
      end: {
        paddingInlineEnd: `calc(${ThemeVars.components.Row.groupNesting} * ${ThemeVars.components.Row.groupRowColumnNesting})`,
      },
    },
  },
});
