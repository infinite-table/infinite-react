import { columnHeaderHeightName, CSS_LOADED_VALUE } from './vars.css';
import { toCSSVarName } from './utils/toCSSVarName';

export const DEFAULT_ROW_HEIGHT = 40;
export const DEFAULT_COLUMN_HEADER_HEIGHT = toCSSVarName(
  columnHeaderHeightName,
);

const DENSITY_SCALE = `var(${toCSSVarName('density-scale')}, 1)`;

/**
 * The value used for `rowHeight` when the prop is not specified:
 * the theme row height (`--infinite-row-height`), scaled by the density.
 *
 * It's watched via a CSS variable watcher, just like a CSS var name passed
 * as `rowHeight`. The initial row height is still DEFAULT_ROW_HEIGHT, so
 * the first render is the same as when `rowHeight` was a number.
 */
export const DEFAULT_ROW_HEIGHT_CSS_VALUE = `calc(var(${toCSSVarName(
  'row-height',
)}, ${DEFAULT_ROW_HEIGHT}px) * ${DENSITY_SCALE})`;

/**
 * The CSS value watched for the column header height when the
 * `columnHeaderHeight` prop is not specified (it defaults to the
 * DEFAULT_COLUMN_HEADER_HEIGHT var name): the theme value, scaled by the density.
 */
export const DEFAULT_COLUMN_HEADER_HEIGHT_CSS_VALUE = `calc(var(${DEFAULT_COLUMN_HEADER_HEIGHT}) * ${DENSITY_SCALE})`;

/**
 * Called when the watched row height CSS value changes. Returns the row height
 * to set, or `null` if nothing should be set.
 *
 * For the default (theme + density) value, the result is rounded, so we don't
 * end up with fractional row heights - and since the initial row height is
 * DEFAULT_ROW_HEIGHT, nothing is set when the CSS value is the same (so
 * `onRowHeightChange` is not called, just like when the default was a number).
 */
export function getRowHeightFromCSSValue(
  value: number | null,
  state: { rowHeightCSSVar: string; rowHeight: unknown },
): number | null {
  if (!value) {
    return null;
  }
  if (state.rowHeightCSSVar !== DEFAULT_ROW_HEIGHT_CSS_VALUE) {
    return value;
  }
  // the default row height only comes from the theme when the theme CSS is
  // loaded - eg: in jsdom (unit tests) with a mocked getBoundingClientRect,
  // the watcher would otherwise "measure" the mocked size - keep the old default
  if (!isThemeCSSLoaded()) {
    return null;
  }
  const rowHeight = Math.round(value);
  return rowHeight === state.rowHeight ? null : rowHeight;
}

const CSS_LOADED_VAR_NAME = toCSSVarName('loaded');

// the default theme (included in the main CSS file) declares this var on :root
function isThemeCSSLoaded() {
  if (
    typeof document === 'undefined' ||
    typeof getComputedStyle !== 'function'
  ) {
    return false;
  }
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue(CSS_LOADED_VAR_NAME)
      .trim() === CSS_LOADED_VALUE
  );
}

/**
 * Called when the watched column header height CSS value changes. Returns the
 * height to set, or `null` if nothing should be set. The default (theme +
 * density) value is rounded.
 */
export function getColumnHeaderHeightFromCSSValue(
  value: number | null,
  state: { columnHeaderHeightCSSVar: string },
): number | null {
  if (!value) {
    return null;
  }
  return state.columnHeaderHeightCSSVar ===
    DEFAULT_COLUMN_HEADER_HEIGHT_CSS_VALUE
    ? Math.round(value)
    : value;
}
