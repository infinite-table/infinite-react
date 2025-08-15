import {
  CSSProperties,
  globalStyle,
  style,
  styleVariants,
} from '@vanilla-extract/css';

import { ThemeVars } from './vars.css';

const borderBox: CSSProperties = {
  boxSizing: 'border-box',
};
export const boxSizingBorderBox = style(borderBox);

globalStyle(`${boxSizingBorderBox}:before`, borderBox);
globalStyle(`${boxSizingBorderBox}:after`, borderBox);
globalStyle(`${boxSizingBorderBox} *`, borderBox);
// globalStyle(`${boxSizingBorderBox} *:before`, borderBox);
// globalStyle(`${boxSizingBorderBox} *:after`, borderBox);

export const position = styleVariants({
  relative: { position: 'relative' },
  absolute: { position: 'absolute' },
  static: { position: 'static' },
  sticky: { position: 'sticky' },
  fixed: { position: 'fixed' },
});

export const fill = styleVariants({
  currentColor: { fill: 'currentColor' },
  accentColor: { fill: ThemeVars.color.accent },
});

export const margin = styleVariants({
  none: { margin: 0 },
});
export const verticalAlign = styleVariants({
  middle: { verticalAlign: 'middle' },
});

export const stroke = styleVariants({
  currentColor: { stroke: 'currentColor' },
  accentColor: { stroke: ThemeVars.color.accent },
});

export const background = styleVariants({
  inherit: { background: 'inherit' },
});

export const outline = styleVariants({
  none: { outline: 'none' },
});

export const transformTranslateZero = style({
  transform: 'translate3d(0,0,0)',
});

export const color = styleVariants({
  currentColor: { color: 'currentColor' },
});

export const transform = styleVariants({
  translateZero: { transform: 'translate3d(0,0,0)' },
  'translate-50%Y': { transform: 'translate3d(0,-50%,0)' },
  rotate90: { transform: 'rotate(90deg)' },
  rotate180: { transform: 'rotate(180deg)' },
});

export const cursor = styleVariants({
  pointer: { cursor: 'pointer' },
  default: { cursor: 'default' },
  colResize: { cursor: 'col-resize' },
  grabbing: { cursor: 'grabbing' },
  grab: { cursor: 'grab' },
});

export const borderRadius = styleVariants({
  none: { borderRadius: 0 },
  default: { borderRadius: ThemeVars.borderRadius },
  full: { borderRadius: '100%' },
  '1': { borderRadius: ThemeVars.spacing[1] },
  '2': { borderRadius: ThemeVars.spacing[2] },
  '3': { borderRadius: ThemeVars.spacing[3] },
  '4': { borderRadius: ThemeVars.spacing[4] },
  '5': { borderRadius: ThemeVars.spacing[5] },
  '6': { borderRadius: ThemeVars.spacing[6] },
  '7': { borderRadius: ThemeVars.spacing[7] },
});

export const pointerEvents = styleVariants({
  none: { pointerEvents: 'none' },
});

export const padding = styleVariants({
  none: { padding: 0 },
  0: { padding: 0 },
  '1': { padding: ThemeVars.spacing[1] },
  '2': { padding: ThemeVars.spacing[2] },
  '3': { padding: ThemeVars.spacing[3] },
  '4': { padding: ThemeVars.spacing[4] },
  '5': { padding: ThemeVars.spacing[5] },
  '6': { padding: ThemeVars.spacing[6] },
  '7': { padding: ThemeVars.spacing[7] },
  '8': { padding: ThemeVars.spacing[8] },
  '9': { padding: ThemeVars.spacing[9] },
  '10': { padding: ThemeVars.spacing[10] },
});

export const flex = styleVariants({
  1: { flex: 1 },
  none: { flex: 'none' },
});
export const zIndex = styleVariants({
  1: { zIndex: 1 },
  10: { zIndex: 10 },
  100: { zIndex: 100 },
  1000: { zIndex: 1000 },
  '1k': { zIndex: 1000 },
  10_000: { zIndex: 10_000 },
  '10k': { zIndex: 10_000 },
  100_000: { zIndex: 100_000 },
  '100k': { zIndex: 100_000 },
  1_000_000: { zIndex: 1_000_000 },
  10_000_000: { zIndex: 10_000_000 },
});

export const display = styleVariants({
  flex: { display: 'flex' },
  contents: { display: 'contents' },
  none: { display: 'none' },
  block: { display: 'block' },
  grid: { display: 'grid' },
  inlineBlock: { display: 'inline-block' },
  inlineFlex: { display: 'inline-flex' },
  inlineGrid: { display: 'inline-grid' },
});
export const userSelect = styleVariants({
  none: { userSelect: 'none' },
});

export const height = styleVariants({
  '100%': { height: '100%' },
  '50%': { height: '50%' },
  '0': { height: '0' },
});
export const width = styleVariants({
  '100%': { width: '100%' },
  '0': { width: '0' },
});
export const top = styleVariants({
  '100%': { top: '100%' },
  '50%': { top: '50%' },
  '0': { top: '0' },
});

export const left = styleVariants({
  '100%': { left: '100%' },
  '50%': { left: '50%' },
  '0': { left: '0' },
  auto: { left: 'auto' },
});
export const bottom = styleVariants({
  '100%': { bottom: '100%' },
  '0': { bottom: '0' },
});
export const right = styleVariants({
  '100%': { right: '100%' },
  '0': { right: '0' },
  auto: { right: 'auto' },
});
export const flexFlow = styleVariants({
  column: { flexFlow: 'column' },
  columnReverse: { flexFlow: 'column-reverse' },
  row: { flexFlow: 'row' },
  rowReverse: { flexFlow: 'row-reverse' },
});

export const alignItems = styleVariants({
  center: { alignItems: 'center' },
  stretch: { alignItems: 'stretch' },
  start: { alignItems: 'flex-start' },
  end: { alignItems: 'flex-end' },
});

export const alignSelf = styleVariants({
  end: { alignSelf: 'end' },
});

export const gap = styleVariants({
  none: { gap: 0 },
  '0': { gap: 0 },
  '1': { gap: ThemeVars.spacing[1] },
  '2': { gap: ThemeVars.spacing[2] },
  '3': { gap: ThemeVars.spacing[3] },
  '4': { gap: ThemeVars.spacing[4] },
  '5': { gap: ThemeVars.spacing[5] },
  '6': { gap: ThemeVars.spacing[6] },
  '7': { gap: ThemeVars.spacing[7] },
  '8': { gap: ThemeVars.spacing[8] },
  '9': { gap: ThemeVars.spacing[9] },
  '10': { gap: ThemeVars.spacing[10] },
});

export const justifyContent = styleVariants({
  center: { justifyContent: 'center' },
  spaceBetween: { justifyContent: 'space-between' },
  spaceAround: { justifyContent: 'space-around' },
  start: { justifyContent: 'flex-start' },
  end: { justifyContent: 'flex-end' },
});

export const overflow = styleVariants({
  hidden: { overflow: 'hidden' },
  auto: { overflow: 'auto' },
  visible: { overflow: 'visible' },
});

export const visibility = styleVariants({
  visible: { visibility: 'visible' },
  hidden: { visibility: 'hidden' },
});

export const willChange = styleVariants({
  transform: { willChange: 'transform' },
});

export const whiteSpace = styleVariants({
  nowrap: { whiteSpace: 'nowrap' },
});
export const textOverflow = styleVariants({
  ellipsis: { textOverflow: 'ellipsis' },
});

export const cssEllipsisClassName = style([
  whiteSpace.nowrap,
  textOverflow.ellipsis,
  overflow.hidden,
]);

export const absoluteCover = style([
  position.absolute,
  top[0],
  left[0],
  right[0],
  bottom[0],
]);
