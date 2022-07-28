import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { ThemeVars } from '../../theme.css';

const RowCls = style({
  willChange: 'transform',
  position: 'absolute',
  top: 0,
  left: 0,
  pointerEvents: ThemeVars.components.Row.pointerEventsWhileScrolling,
  [ThemeVars.components.ColumnCell.background.slice(4, -1)]:
    ThemeVars.components.Row.background,
});

const groupRowStyle = {
  zIndex: 100,
};

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

export const RowClsRecipe = recipe({
  base: RowCls,
  variants: {
    zebra: {
      false: {},
      even: {
        background: ThemeVars.components.Row.background,
      },
      odd: {
        background: ThemeVars.components.Row.oddBackground,
      },
    },
    groupRow: {
      true: {
        ...groupRowStyle,
      },
      false: {},
    },
    inlineGroupRow: {
      true: { ...groupRowStyle },
      false: {},
    },
    showHoverRows: {
      true: {},
      false: {},
    },
  },
});

export const GroupRowExpanderCls = style({
  paddingInlineStart: `calc(${ThemeVars.components.Row.groupNesting} * ${ThemeVars.components.Row.groupRowColumnNesting})`,
});
