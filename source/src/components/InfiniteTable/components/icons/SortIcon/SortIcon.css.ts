import { style, styleVariants } from '@vanilla-extract/css';
import { ThemeVars } from '../../../vars.css';
import {
  display,
  flexFlow,
  justifyContent,
  position,
} from '../../../utilities.css';
import {
  defineHideWhenIconSpecified,
  defineMaskIconOverlay,
} from '../iconStyles';

export const SortIconCls = style([
  display.flex,
  flexFlow.column,
  position.relative,
  justifyContent.spaceAround,
  {
    paddingBlockStart: '2px',
    paddingBlockEnd: '2px',
    minWidth: ThemeVars.components.HeaderCell.iconSize,
    height: ThemeVars.components.HeaderCell.iconSize,
  },
]);

export const SortIconDirectionCls = styleVariants({
  asc: {},
  desc: {},
  none: {},
});

export const SortIconLineCls = style({});

// by default, the sort icon is made of (animated) lines - when the theme
// specifies --infinite-icon-sort-asc/desc, that icon is painted instead
defineMaskIconOverlay(
  `.${SortIconCls}.${SortIconDirectionCls.asc}`,
  ThemeVars.icons.sortAsc,
);
defineMaskIconOverlay(
  `.${SortIconCls}.${SortIconDirectionCls.desc}`,
  ThemeVars.icons.sortDesc,
);
defineHideWhenIconSpecified(
  `.${SortIconDirectionCls.asc} > .${SortIconLineCls}`,
  ThemeVars.icons.sortAsc,
);
defineHideWhenIconSpecified(
  `.${SortIconDirectionCls.desc} > .${SortIconLineCls}`,
  ThemeVars.icons.sortDesc,
);
