import { style, styleVariants } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { ThemeVars } from './theme.css';

import {
  boxSizingBorderBox,
  display,
  flexFlow,
  position,
  userSelect,
} from './utilities.css';

export const InfiniteCls = style([
  position.relative,
  display.flex,
  flexFlow.column,
  {
    outline: 'none',
    fontFamily: ThemeVars.fontFamily,
    color: ThemeVars.color.color,
    background: ThemeVars.background,
    minHeight: ThemeVars.minHeight,
  },
  boxSizingBorderBox,
]);

export const InfiniteClsScrolling = style(
  {
    vars: {
      [ThemeVars.components.Row.pointerEventsWhileScrolling]: 'none',
    },
  },
  'InfiniteClsScrolling',
);

export const InfiniteClsRecipe = recipe({
  variants: {
    focused: {
      true: {},
      false: {},
    },
    focusedWithin: {
      true: {},
      false: {
        vars: {
          [ThemeVars.components.Cell
            .activeBackgroundAlpha]: `${ThemeVars.components.Cell.activeBackgroundAlphaWhenTableUnfocused}`,
          [ThemeVars.components.Cell
            .activeBackgroundFromBorder]: `rgba(${ThemeVars.components.Cell.activeBorderColor_R}, ${ThemeVars.components.Cell.activeBorderColor_G}, ${ThemeVars.components.Cell.activeBorderColor_B}, ${ThemeVars.components.Cell.activeBackgroundAlpha})`,
          [ThemeVars.components.Row.activeBackgroundFromBorder]:
            ThemeVars.components.Cell.activeBackgroundFromBorder,
        },
      },
    },
    hasPinnedStart: {
      true: {},
      false: {},
    },
    hasPinnedEnd: {
      true: {},
      false: {},
    },
    hasPinnedStartOverflow: {
      true: {},
      false: {},
    },
    hasPinnedEndOverflow: {
      true: {},
      false: {},
    },
  },
});

export const PinnedRowsClsVariants = styleVariants({
  pinnedStart: {},
  pinnedEnd: {},
  overflow: {},
});
export const PinnedRowsContainerClsVariants = recipe({
  variants: {
    pinned: {
      start: {
        borderRight: [ThemeVars.components.Cell.border],
      },
      end: {
        borderLeft: [ThemeVars.components.Cell.border],
      },
      false: {},
    },
  },
});

export const InfiniteClsShiftingColumns = style([userSelect.none]);

export const FooterCls = style([position.relative]);
