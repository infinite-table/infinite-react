import { fallbackVar, style } from '@vanilla-extract/css';

import { ThemeVars } from '../vars.css';
import { left, top, pointerEvents, position } from '../utilities.css';
import { recipe } from '@vanilla-extract/recipes';

export const ActiveRowIndicatorBaseCls = style(
  [
    pointerEvents.none,
    position.absolute,
    top['0'],
    left['0'],
    {
      right: 0, //ThemeVars.runtime.browserScrollbarWidth,
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
          ThemeVars.components.Cell.activeBorderColor,
          ThemeVars.color.accent,
        )}`,
      ),
      background: fallbackVar(
        ThemeVars.components.Row.activeBackground,
        ThemeVars.components.Cell.activeBackground,
        `color-mix(in srgb, ${fallbackVar(
          ThemeVars.components.Row.activeBorderColor,
          ThemeVars.components.Cell.activeBorderColor,
          ThemeVars.color.accent,
        )}, transparent calc(100% - ${fallbackVar(
          ThemeVars.components.Row.activeBackgroundAlpha,
          ThemeVars.components.Cell.activeBackgroundAlpha,
        )} * 100%))`,
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

export const ActiveRowIndicatorRecipe = recipe({
  base: [ActiveRowIndicatorBaseCls],
  variants: {
    active: {
      true: {
        display: 'block',
      },
      false: {
        display: 'none',
      },
    },
  },
});
