import { keyframes, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

export const DevToolsOverlay = recipe({
  base: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 1000,
    opacity: 0,
    display: 'none',
  },
  variants: {
    active: {
      true: {
        opacity: 1,
        display: 'block',
      },
      false: {},
    },
  },
});
export const DevToolsOverlayText = style({
  backgroundColor: 'white',
  color: 'black',
  padding: '5px',
  fontFamily: 'monospace',
  fontSize: '12px',
  position: 'absolute',
  top: 0,
  right: 0,
  zIndex: 100,
});

const opacityPulse = keyframes({
  '0%': {
    opacity: 0,
  },
  '25%': {
    opacity: 0.3,
  },
  '50%': {
    opacity: 0,
  },
  '75%': {
    opacity: 0.3,
  },

  '100%': {
    opacity: 0,
  },
});
export const DevToolsOverlayBg = style({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: 'red',
  selectors: {
    [`.${DevToolsOverlay.classNames.variants.active.true} &`]: {
      animation: `${opacityPulse} 1s forwards`,
    },
  },
});
