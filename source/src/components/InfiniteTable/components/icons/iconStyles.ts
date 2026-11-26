import { fallbackVar, globalStyle } from '@vanilla-extract/css';

import { ThemeVars } from '../../vars.css';

/**
 * Style helpers for the themeable icons. Only imported by .css.ts files
 * (which can only export plain values, not functions).
 */

const LINE_ICON_PADDING_BLOCK = '2px';
const LINE_ICON_SIZE = ThemeVars.components.HeaderCell.iconSize;
const LINE_ICON_LINE_COUNT = 3;

/**
 * The box of the header icons drawn with lines (the menu and sort icons):
 * a flex column of the header icon size, the lines spread with space-around
 */
export const lineIconBoxStyle = {
  display: 'flex',
  flexFlow: 'column',
  justifyContent: 'space-around',
  paddingBlockStart: LINE_ICON_PADDING_BLOCK,
  paddingBlockEnd: LINE_ICON_PADDING_BLOCK,
  minWidth: LINE_ICON_SIZE,
  height: LINE_ICON_SIZE,
} as const;

export const ROUND_SUPPORTS_QUERY = '(width: round(1.5px, 1px))';

/**
 * Evenly spaced lines in a lineIconBoxStyle box, at any icon size: for most
 * sizes `space-around` gives a fractional gap (a 14px icon: 2.33px), so the
 * lines snap to uneven pixel rows (3px, then 4px apart). Instead, the lines
 * are centered with the gap space-around would give (the free space in the
 * box, minus its padding, split by the line count) rounded to whole pixels -
 * 3px for the 16px default, the same as space-around.
 * Needs `round()` - use it under an `@supports` of ROUND_SUPPORTS_QUERY.
 */
export function evenlySpacedLinesStyle(lineWidth: string) {
  return {
    justifyContent: 'center',
    gap: `round(calc((${LINE_ICON_SIZE} - 2 * ${LINE_ICON_PADDING_BLOCK} - ${LINE_ICON_LINE_COUNT} * ${lineWidth}) / ${LINE_ICON_LINE_COUNT}), 1px)`,
  } as const;
}

const forcedColors = {
  // in forced colors mode, background-color is forced to the Canvas color,
  // which would make the icons invisible - so paint them with the text color
  '(forced-colors: active)': {
    forcedColorAdjust: 'none',
    backgroundColor: 'CanvasText',
  },
} as const;

// only the -webkit- prefixed mask properties are used: they're supported by
// all browsers (in Chrome and Firefox they're aliases of the unprefixed
// ones), and declaring both would double the var() references per icon,
// which have a (small) style recalc cost
export const maskLayout = {
  WebkitMaskRepeat: 'no-repeat',
  WebkitMaskPosition: 'center',
  WebkitMaskSize: 'contain',
} as const;

/**
 * Overlays the icon image (masked, painted with currentColor) on top of an
 * icon that is rendered with DOM lines by default (`selector` matches the icon
 * container). Only rendered when the given icon variable is specified.
 */
export function defineMaskIconOverlay(selector: string, iconVar: string) {
  globalStyle(`${selector}::after`, {
    content: '""',
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    // not displayed when the variable is not specified - when it is (with a
    // url()), the declaration is invalid at computed-value time, so it
    // computes to the initial value (inline - blockified, as it's absolute)
    display: fallbackVar(iconVar, 'none'),
    backgroundColor: 'currentColor',
    ...maskLayout,
    WebkitMaskImage: iconVar,
    '@media': forcedColors,
  });
}

/**
 * Hides the default lines of an icon (`selector` matches the lines) when the
 * given icon variable is specified: when the variable is not specified, the
 * mask image is `none`, so nothing changes; when it is, the mask layer has a
 * zero size, so it masks out the whole element.
 */
export function defineHideWhenIconSpecified(selector: string, iconVar: string) {
  const mask = `${fallbackVar(iconVar, 'none')} 0 0 / 0 0 no-repeat`;
  globalStyle(selector, {
    WebkitMask: mask,
  });
}
