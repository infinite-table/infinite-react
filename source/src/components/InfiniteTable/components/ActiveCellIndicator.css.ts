import { fallbackVar, style, styleVariants } from '@vanilla-extract/css';

import { ThemeVars } from '../vars.css';
import {
  left,
  top,
  pointerEvents,
  position,
  height,
  zIndex,
} from '../utilities.css';
import { InternalVars } from '../internalVars.css';

export const ActiveIndicatorWrapperCls = style([
  pointerEvents.none,
  position.sticky,
  left['0'],
  top['0'],
  height['0'],
  zIndex[1_000_000],
  {
    width: InternalVars.activeCellColWidth,
    height: InternalVars.activeCellRowHeight,
  },
]);
export const ActiveCellIndicatorBaseCls = style(
  [
    pointerEvents.none,
    position.absolute,
    {
      inset: ThemeVars.components.ActiveCellIndicator.inset,
      border: fallbackVar(
        ThemeVars.components.Cell.activeBorder,
        `${ThemeVars.components.Cell.activeBorderWidth} ${
          ThemeVars.components.Cell.activeBorderStyle
        } ${fallbackVar(
          ThemeVars.components.Cell.activeBorderColor,
          ThemeVars.color.accent,
        )}`,
      ),
      background: ThemeVars.components.Cell.activeBackgroundDefault,
    },
    {
      vars: {
        [InternalVars.activeCellOffsetX]: InternalVars.activeCellColOffset,
        [InternalVars.activeCellOffsetY]: InternalVars.activeCellRowOffset,
        transform: `translate3d(${InternalVars.activeCellOffsetX}, ${InternalVars.activeCellOffsetY}, 0px)`,
      },
    },
  ],
  'ActiveCellIndicator',
);

export const ActiveCellIndicatorCls = styleVariants({
  visible: [ActiveCellIndicatorBaseCls, { display: 'block' }],
  hidden: [ActiveCellIndicatorBaseCls, { display: 'none' }],
});
