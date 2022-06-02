import { fallbackVar, style, styleVariants } from '@vanilla-extract/css';

import { ThemeVars } from '../theme.css';
import { left, top, pointerEvents, position, width } from '../utilities.css';

export const ActiveRowIndicatorBaseCls = style(
  [
    pointerEvents.none,
    position.sticky,
    width['100%'],
    top['0'],
    left['0'],
    {
      border: ThemeVars.components.Row.activeBorder,
      background: fallbackVar(
        ThemeVars.components.Row.activeBackground,
        ThemeVars.components.Row.activeBackgroundFromBorder,
      ),
    },
  ],
  'ActiveRowIndicator',
);

export const ActiveRowIndicatorCls = styleVariants({
  visible: [ActiveRowIndicatorBaseCls, { display: 'block' }],
  hidden: [ActiveRowIndicatorBaseCls, { display: 'none' }],
});
