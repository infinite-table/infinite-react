import { style, styleVariants } from '@vanilla-extract/css';
import { ThemeVars } from '../../theme.css';

export const RowCls = style({
  color: ThemeVars.components.Row.color,
  willChange: 'transform',
  [ThemeVars.components.ColumnCell.background]:
    ThemeVars.components.Row.background,

  // [ThemeVars.components.ce]
});

const groupRowStyle = {
  zIndex: 100,
};

export const RowClsVariants = styleVariants({
  even: {
    background: ThemeVars.components.Row.background,
  },
  odd: {
    background: ThemeVars.components.Row.oddBackground,
  },
  groupRow: { ...groupRowStyle },
  inlineGroupRow: {
    ...groupRowStyle,
  },
  normal: {},
});
