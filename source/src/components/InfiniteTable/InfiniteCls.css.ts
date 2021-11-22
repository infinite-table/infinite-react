import { style, styleVariants } from '@vanilla-extract/css';
import { ThemeVars } from './theme.css';
import { boxSizingBorderBox } from './utilities.css';

export const InfiniteCls = style([
  {
    fontFamily: ThemeVars.fontFamily,
    color: ThemeVars.color.color,
    background: ThemeVars.background,
    minHeight: ThemeVars.minHeight,
    position: 'relative',
    display: 'flex',
    flexFlow: 'column',
  },
  boxSizingBorderBox,
]);

export const PinnedRowsContainer = styleVariants({
  pinnedStart: {},
});

export const InfiniteClsShiftingColumns = style({
  userSelect: 'none',
});

export const FooterCls = style({
  position: 'relative',
});
