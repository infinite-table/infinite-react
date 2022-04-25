import {
  CSSProperties,
  globalStyle,
  style,
  styleVariants,
} from '@vanilla-extract/css';

import { ThemeVars } from './theme.css';

const borderBox: CSSProperties = {
  boxSizing: 'border-box',
};
export const boxSizingBorderBox = style(borderBox);

globalStyle(`${boxSizingBorderBox}:before`, borderBox);
globalStyle(`${boxSizingBorderBox}:after`, borderBox);
globalStyle(`${boxSizingBorderBox} *`, borderBox);
globalStyle(`${boxSizingBorderBox} *:before`, borderBox);
globalStyle(`${boxSizingBorderBox} *:after`, borderBox);

export const position = styleVariants({
  relative: { position: 'relative' },
  absolute: { position: 'absolute' },
  sticky: { position: 'sticky' },
  fixed: { position: 'fixed' },
});

export const fill = styleVariants({
  currentColor: { fill: 'currentColor' },
  accentColor: { fill: ThemeVars.color.accent },
});

export const stroke = styleVariants({
  currentColor: { stroke: 'currentColor' },
  accentColor: { stroke: ThemeVars.color.accent },
});

export const background = styleVariants({
  inherit: { background: 'inherit' },
});

export const transformTranslateZero = style({
  transform: 'translate3d(0,0,0)',
});

export const transform = styleVariants({
  translateZero: { transform: 'translate3d(0,0,0)' },
  rotate90: { transform: 'rotate(90deg)' },
});

export const cursor = styleVariants({
  pointer: { cursor: 'pointer' },
});

export const flex = styleVariants({
  1: { flex: 1 },
  none: { flex: 'none' },
});
export const zIndex = styleVariants({
  1: { zIndex: 1 },
  10: { zIndex: 10 },
  1000: { zIndex: 1000 },
  10_000: { zIndex: 10_000 },
  100_000: { zIndex: 100_000 },
});

export const display = styleVariants({
  flex: { display: 'flex' },
  block: { display: 'block' },
  inlineBlock: { display: 'inline-block' },
});
export const userSelect = styleVariants({
  none: { userSelect: 'none' },
});

export const height = styleVariants({
  '100%': { height: '100%' },
  '0': { height: '0' },
});
export const width = styleVariants({
  '100%': { width: '100%' },
  '0': { width: '0' },
});
export const top = styleVariants({
  '100%': { top: '100%' },
  '0': { top: '0' },
});

export const left = styleVariants({
  '100%': { left: '100%' },
  '0': { left: '0' },
});
export const bottom = styleVariants({
  '100%': { bottom: '100%' },
  '0': { bottom: '0' },
});
export const right = styleVariants({
  '100%': { right: '100%' },
  '0': { right: '0' },
});
export const flexFlow = styleVariants({
  column: { flexFlow: 'column' },
  row: { flexFlow: 'row' },
});

export const alignItems = styleVariants({
  center: { alignItems: 'center' },
  stretch: { alignItems: 'stretch' },
});

export const justifyContent = styleVariants({
  center: { justifyContent: 'center' },
  start: { justifyContent: 'flex-start' },
  end: { justifyContent: 'flex-end' },
});

export const overflow = styleVariants({
  hidden: { overflow: 'hidden' },
  auto: { overflow: 'auto' },
  visible: { overflow: 'visible' },
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
