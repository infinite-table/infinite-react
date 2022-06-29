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
      border: fallbackVar(
        ThemeVars.components.Row.activeBorder,
        `${fallbackVar(
          ThemeVars.components.Row.activeBorderWidth,
          ThemeVars.components.Cell.activeBorderWidth,
        )} ${fallbackVar(
          ThemeVars.components.Row.activeBorderStyle,
          ThemeVars.components.Cell.activeBorderStyle,
        )} ${fallbackVar(
          ThemeVars.components.Row.activeBorderColor,
          `rgb(${ThemeVars.components.Cell.activeBorderColor_R} ${ThemeVars.components.Cell.activeBorderColor_G} ${ThemeVars.components.Cell.activeBorderColor_B})`,
        )}`,
      ),
      background: fallbackVar(
        ThemeVars.components.Row.activeBackground,
        ThemeVars.components.Cell.activeBackground,
        `rgba(${ThemeVars.components.Cell.activeBorderColor_R}, ${
          ThemeVars.components.Cell.activeBorderColor_G
        }, ${ThemeVars.components.Cell.activeBorderColor_B}, ${fallbackVar(
          ThemeVars.components.Row.activeBackgroundAlpha,
          ThemeVars.components.Cell.activeBackgroundAlpha,
        )})`,
      ),
      vars: {
        [ThemeVars.components.Row.activeBorderStyle]: fallbackVar(
          ThemeVars.components.Row.activeBorderStyle,
          ThemeVars.components.Cell.activeBorderStyle,
        ),
      },
    },
  ],
  'ActiveRowIndicator',
);

export const ActiveRowIndicatorCls = styleVariants({
  visible: [
    ActiveRowIndicatorBaseCls,
    {
      display: 'block',
    },
  ],
  hidden: [ActiveRowIndicatorBaseCls, { display: 'none' }],
});
