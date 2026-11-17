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
    // space-around gives a fractional gap for most icon sizes (14px: 2.33px),
    // so the lines snap to uneven pixel rows (3px, then 4px apart). A gap
    // rounded to whole pixels keeps them evenly spaced: the space-around gap
    // of three 1px lines in the box (minus its 4px of padding), rounded -
    // 3px for the 16px default, the same as before
    '@supports': {
      '(width: round(1.5px, 1px))': {
        justifyContent: 'center',
        gap: `round(calc((${ThemeVars.components.HeaderCell.iconSize} - 7px) / 3), 1px)`,
      },
    },
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
