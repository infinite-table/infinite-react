import { createVar, style, styleVariants } from '@vanilla-extract/css';
import { ThemeVars } from '../../../vars.css';
import { position } from '../../../utilities.css';
import { cssVarName } from '../../../utils/cssVarName';
import {
  defineHideWhenIconSpecified,
  defineMaskIconOverlay,
  evenlySpacedLinesStyle,
  lineIconBoxStyle,
  ROUND_SUPPORTS_QUERY,
} from '../iconStyles';

// the lineWidth prop of the sort icon, for the line gap - set inline
const SortIconLineWidthVar = createVar();

/**
 * The custom property name (`--x`) to set the sort icon line width with
 */
export const SortIconLineWidthVarName = cssVarName(SortIconLineWidthVar);

export const SortIconCls = style([
  position.relative,
  {
    ...lineIconBoxStyle,
    vars: {
      [SortIconLineWidthVar]: '1px',
    },
    // evenly spaced lines at any icon size
    '@supports': {
      [ROUND_SUPPORTS_QUERY]: evenlySpacedLinesStyle(SortIconLineWidthVar),
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
