import { fallbackVar, style, styleVariants } from '@vanilla-extract/css';

import { ThemeVars } from '../theme.css';
import { left, top, pointerEvents, position, height } from '../utilities.css';

export const ActiveIndicatorWrapperCls = style([
  pointerEvents.none,
  position.sticky,
  left['0'],
  top['0'],
  height['0'],
]);
export const ActiveCellIndicatorBaseCls = style(
  [
    pointerEvents.none,
    position.sticky,
    left['0'],
    top['0'],
    {
      border: fallbackVar(
        ThemeVars.components.Cell.activeBorder,

        `${ThemeVars.components.Cell.activeBorderWidth} ${
          ThemeVars.components.Cell.activeBorderStyle
        } ${fallbackVar(
          ThemeVars.components.Cell.activeBorderColor,
          `rgb(${ThemeVars.components.Cell.activeBorderColor_R} ${ThemeVars.components.Cell.activeBorderColor_G} ${ThemeVars.components.Cell.activeBorderColor_B})`,
        )}`,
      ),

      background: fallbackVar(
        ThemeVars.components.Cell.activeBackground,
        `rgba(${ThemeVars.components.Cell.activeBorderColor_R}, ${ThemeVars.components.Cell.activeBorderColor_G}, ${ThemeVars.components.Cell.activeBorderColor_B}, ${ThemeVars.components.Cell.activeBackgroundAlpha})`,
      ),
    },
  ],
  'ActiveCellIndicator',
);

export const ActiveCellIndicatorCls = styleVariants({
  visible: [ActiveCellIndicatorBaseCls, { display: 'block' }],
  hidden: [ActiveCellIndicatorBaseCls, { display: 'none' }],
});
