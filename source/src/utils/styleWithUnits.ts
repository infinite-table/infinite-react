/**
 * React appends `px` to numeric inline style values (`height: 900`), except
 * for unitless properties (`zIndex`, `flex`, `opacity`, ...) and CSS custom
 * properties. Shared code and the props people pass (domProps.style,
 * rowStyle, cellStyle) are written that way, so frameworks whose style
 * bindings don't do it (Angular) normalize the style objects with this.
 */
const UNITLESS = new Set([
  'animationIterationCount',
  'aspectRatio',
  'borderImageOutset',
  'borderImageSlice',
  'borderImageWidth',
  'boxFlex',
  'boxFlexGroup',
  'boxOrdinalGroup',
  'columnCount',
  'columns',
  'flex',
  'flexGrow',
  'flexPositive',
  'flexShrink',
  'flexNegative',
  'flexOrder',
  'gridArea',
  'gridRow',
  'gridRowEnd',
  'gridRowSpan',
  'gridRowStart',
  'gridColumn',
  'gridColumnEnd',
  'gridColumnSpan',
  'gridColumnStart',
  'fontWeight',
  'lineClamp',
  'lineHeight',
  'opacity',
  'order',
  'orphans',
  'scale',
  'tabSize',
  'widows',
  'zIndex',
  'zoom',
  'fillOpacity',
  'floodOpacity',
  'stopOpacity',
  'strokeDasharray',
  'strokeDashoffset',
  'strokeMiterlimit',
  'strokeOpacity',
  'strokeWidth',
]);

export function styleWithUnits<T extends Record<string, any> | null | undefined>(
  style: T,
): T {
  if (!style) {
    return style;
  }
  let result: Record<string, any> | null = null;
  for (const key in style) {
    const value = style[key];
    if (
      typeof value === 'number' &&
      value !== 0 &&
      !UNITLESS.has(key) &&
      !key.startsWith('--')
    ) {
      result ??= { ...style };
      result[key] = `${value}px`;
    }
  }
  return (result ?? style) as T;
}
