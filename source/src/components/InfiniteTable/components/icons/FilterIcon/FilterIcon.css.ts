import { style } from '@vanilla-extract/css';
import { ThemeVars } from '../../../vars.css';
import {
  alignItems,
  display,
  flexFlow,
  justifyContent,
  position,
} from '../../../utilities.css';
import {
  defineHideWhenIconSpecified,
  defineMaskIconOverlay,
} from '../iconStyles';

export const FilterIconCls = style([
  display.flex,
  flexFlow.column,
  position.relative,
  justifyContent.spaceAround,
  alignItems.center,
  {
    paddingBlockStart: '2px',
    paddingBlockEnd: '2px',
    minWidth: ThemeVars.components.HeaderCell.iconSize,
    height: ThemeVars.components.HeaderCell.iconSize,
  },
]);

export const FilterIconLineCls = style({});

// by default, the filter icon is made of lines - when the theme specifies
// --infinite-icon-filter, that icon is painted instead
defineMaskIconOverlay(`.${FilterIconCls}`, ThemeVars.icons.filter);
defineHideWhenIconSpecified(
  `.${FilterIconCls} > .${FilterIconLineCls}`,
  ThemeVars.icons.filter,
);
