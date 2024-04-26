import { style, styleVariants } from '@vanilla-extract/css';

import { ThemeVars } from '../vars.css';
import { absoluteCover } from '../utilities.css';

const LoadMaskBaseCls = style([
  {
    flexFlow: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  absoluteCover,
]);

export const LoadMaskCls = styleVariants({
  visible: [LoadMaskBaseCls, { display: 'flex' }],
  hidden: [LoadMaskBaseCls, { display: 'none' }],
});
export const LoadMaskOverlayCls = style([
  absoluteCover,
  {
    background: ThemeVars.components.LoadMask.overlayBackground,
    opacity: ThemeVars.components.LoadMask.overlayOpacity,
  },
]);

export const LoadMaskTextCls = style({
  position: 'relative',

  padding: ThemeVars.components.LoadMask.padding,
  color: ThemeVars.components.LoadMask.color,
  background: ThemeVars.components.LoadMask.textBackground,
  borderRadius: ThemeVars.components.LoadMask.borderRadius,
});
