/**
 * The icons rendered as inline svg (paths) that themes can replace via a
 * `--infinite-icon-<name>` CSS variable (see Icon.css.ts for how).
 * Maps the ThemeVars.icons key to the suffix of the icon className
 * (`InfiniteIcon-<suffix>`).
 */
export const CUSTOMIZABLE_ICONS = {
  expandCollapse: 'expand-collapse',
  loading: 'loading',
  done: 'done',
  clear: 'clear',
  hidden: 'hidden',
  filterOperatorContains: 'filter-operator-contains',
  filterOperatorStartsWith: 'filter-operator-starts-with',
  filterOperatorEndsWith: 'filter-operator-ends-with',
  filterOperatorEq: 'filter-operator-eq',
  filterOperatorNeq: 'filter-operator-neq',
  filterOperatorGt: 'filter-operator-gt',
  filterOperatorGte: 'filter-operator-gte',
  filterOperatorLt: 'filter-operator-lt',
  filterOperatorLte: 'filter-operator-lte',
} as const;

export type CustomizableIconName = keyof typeof CUSTOMIZABLE_ICONS;

/**
 * The geometry of the custom icon layer - a rect covering the whole viewBox.
 */
export function getCustomIconLayerRect(viewBox: string) {
  const [x, y, width, height] = viewBox.split(/[\s,]+/).map(Number);
  return { x, y, width, height };
}
