import { style } from '@vanilla-extract/css';

import { ThemeVars } from '../../vars.css';
import {
  defineHideWhenIconSpecified,
  defineMaskIconOverlay,
} from './iconStyles';

/**
 * Applied on the menu icon only when it renders the default lines
 * (not custom children).
 */
export const MenuIconWithDefaultLinesCls = style({});
export const MenuIconLineCls = style({});

// by default, the menu icon is made of lines - when the theme specifies
// --infinite-icon-menu, that icon is painted instead
defineMaskIconOverlay(`.${MenuIconWithDefaultLinesCls}`, ThemeVars.icons.menu);
defineHideWhenIconSpecified(
  `.${MenuIconWithDefaultLinesCls} > .${MenuIconLineCls}`,
  ThemeVars.icons.menu,
);
