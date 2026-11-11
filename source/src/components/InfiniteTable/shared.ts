import { columnHeaderHeightName } from './vars.css';
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
  const rowHeight = Math.round(value);
  return rowHeight === state.rowHeight ? null : rowHeight;
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
