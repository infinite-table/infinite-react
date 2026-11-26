import { style } from '@vanilla-extract/css';

import { ThemeVars } from '../../vars.css';
import {
  defineHideWhenIconSpecified,
  defineMaskIconOverlay,
  evenlySpacedLinesStyle,
  ROUND_SUPPORTS_QUERY,
} from './iconStyles';

/**
 * Applied on the menu icon only when it renders the default lines
 * (not custom children).
 */
export const MenuIconWithDefaultLinesCls = style({
  // evenly spaced lines at any icon size. Only for the default lines, so
  // custom children keep their layout; `&&` wins over the space-around of
  // HeaderMenuIconCls whatever the CSS order
  '@supports': {
    [ROUND_SUPPORTS_QUERY]: {
      selectors: {
        '&&': evenlySpacedLinesStyle(
          ThemeVars.components.HeaderCell.menuIconLineWidth,
        ),
      },
    },
  },
});
export const MenuIconLineCls = style({});

// by default, the menu icon is made of lines - when the theme specifies
// --infinite-icon-menu, that icon is painted instead
defineMaskIconOverlay(`.${MenuIconWithDefaultLinesCls}`, ThemeVars.icons.menu);
defineHideWhenIconSpecified(
  `.${MenuIconWithDefaultLinesCls} > .${MenuIconLineCls}`,
  ThemeVars.icons.menu,
);
