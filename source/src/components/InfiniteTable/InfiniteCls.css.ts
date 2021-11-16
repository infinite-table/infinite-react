import { style } from '@vanilla-extract/css';
import { ThemeVars } from './theme.css';
import { boxSizingBorderBox } from './utilities.css';

export const InfiniteCls = style([
  {
    fontFamily: ThemeVars.fontFamily,
    color: ThemeVars.color.color,
    position: 'relative',
    display: 'flex',
    flexFlow: 'column',
  },
  boxSizingBorderBox,
]);

export const InfiniteClsShiftingColumns = style({
  userSelect: 'none',
});

export const FooterCls = style({
  position: 'relative',
});
