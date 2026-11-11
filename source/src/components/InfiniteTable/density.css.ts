import { fallbackVar, globalStyle } from '@vanilla-extract/css';

import { rootClassName } from './internalProps';
import { ThemeVars } from './vars.css';

/**
 * Density is a unitless multiplier (`--infinite-density-scale`) that the
 * `infinite-density--*` classNames set. It can be applied on the table or on
 * any ancestor, independently of the theme.
 *
 * The scale is applied here, in rules that match elements inside the table
 * (cells, header cells, the root font size) - and in the row/column header
 * height CSS watchers - and not in the theme vars. A custom property that
 * references another custom property is resolved on the element where it's
 * declared, so if themes declared `--infinite-cell-padding: calc(... * scale)`
 * on :root (or on the theme element), a density className applied on a
 * descendant would have no effect.
 */
export const densityClassNames = {
  compact: 'infinite-density--compact',
  comfortable: 'infinite-density--comfortable',
  spacious: 'infinite-density--spacious',
} as const;

export const densityScales = {
  compact: '0.8',
  comfortable: '1',
  spacious: '1.2',
} as const;

(Object.keys(densityClassNames) as (keyof typeof densityClassNames)[]).forEach(
  (density) => {
    globalStyle(`.${densityClassNames[density]}`, {
      vars: {
        [ThemeVars.densityScale]: densityScales[density],
      },
    });
  },
);

export const DensityScale = fallbackVar(ThemeVars.densityScale, '1');

const scaled = (value: string) => `calc(${value} * ${DensityScale})`;

/**
 * Used by cells - if `--infinite-cell-padding` is specified (by the user),
 * it's used as is, otherwise paddingY/paddingX are scaled by the density.
 */
export const CellPaddingWithDensity = fallbackVar(
  ThemeVars.components.Cell.padding,
  `${scaled(ThemeVars.components.Cell.paddingY)} ${scaled(
    ThemeVars.components.Cell.paddingX,
  )}`,
);

/**
 * Same as above, but for header cells.
 */
export const HeaderCellPaddingWithDensity = fallbackVar(
  ThemeVars.components.HeaderCell.padding,
  `${scaled(ThemeVars.components.HeaderCell.paddingY)} ${scaled(
    ThemeVars.components.HeaderCell.paddingX,
  )}`,
);

// The font size (`--infinite-font-size`, which defaults to the inherited
// font size) is scaled by a third of the density difference
// (0.8 => ~93%, 1.2 => ~107%). When neither is specified this is exactly
// `1em`, so it's a no-op. `:where()` gives it zero specificity, so a
// font-size specified by the user for the table (via a className) always wins.
globalStyle(`:where(.${rootClassName})`, {
  fontSize: `calc(${fallbackVar(
    ThemeVars.baseFontSize,
    '1em',
  )} * (2 + ${DensityScale}) / 3)`,
});
