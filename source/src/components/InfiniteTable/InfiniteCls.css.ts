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
      false: {},
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
