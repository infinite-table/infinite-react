import { fallbackVar, globalStyle } from '@vanilla-extract/css';

/**
 * Style helpers for the themeable icons. Only imported by .css.ts files
 * (which can only export plain values, not functions).
 */

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
