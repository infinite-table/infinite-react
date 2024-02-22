import { fallbackVar, style, styleVariants } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { RowDetailRecipe } from './components/rowDetail.css';
import { ThemeVars } from './theme.css';

import {
  boxSizingBorderBox,
  display,
  flexFlow,
  position,
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

  {
    selectors: {
      [`${RowDetailRecipe.classNames.base} &`]: {
        height: [ThemeVars.components.RowDetail.gridHeight],
      },
    },
  },
]);

export const InfiniteClsScrolling = style(
  {
    vars: {
      [ThemeVars.components.Row.pointerEventsWhileScrolling]: 'none',
    },
  },
  'InfiniteClsScrolling',
);

const activeCellBorderVarsForUnfocusedState = {
  // we adjust the alpha opacity for the background
  [ThemeVars.components.Cell
    .activeBackgroundAlpha]: `${ThemeVars.components.Cell.activeBackgroundAlphaWhenTableUnfocused}`,
  [ThemeVars.components.Row.activeBackgroundAlpha]: fallbackVar(
    ThemeVars.components.Row.activeBackgroundAlphaWhenTableUnfocused,
    ThemeVars.components.Cell.activeBackgroundAlphaWhenTableUnfocused,
  ),
};
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
  compoundVariants: [
    {
      variants: {
        focused: false,
        focusedWithin: false,
      },
      style: {
        vars: activeCellBorderVarsForUnfocusedState,
      },
    },
  ],
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

export const InfiniteClsShiftingColumns = style(
  {
    userSelect: 'none',
  },
  'shiftingcols',
);

export const FooterCls = style([position.relative]);

export const InfiniteClsHasPinnedStart = style({});
export const InfiniteClsHasPinnedEnd = style({});

// export const PinnedIndicatorCls = style([
//   position.absolute,
//   top[0],
//   cursor.colResize,
//   userSelect.none,
//   width[0],
//   visibility.hidden,
//   pointerEvents['none'],
//   zIndex[10_000_000],
//   {
//     // zIndex: InternalVars.baseZIndexForCells,
//     transform: `translate3d(-100%, 0px, 0px)`,
//     borderRight: ThemeVars.components.Cell.pinnedBorder,
//     bottom: InternalVars.scrollbarWidthHorizontal,
//   },
// ]);
// export const PinnedStartIndicatorBorder = style([
//   PinnedIndicatorCls,
//   {
//     left: InternalVars.pinnedStartWidth,

//     selectors: {
//       [`${InfiniteClsHasPinnedStart} &`]: {
//         // visibility: 'visible',
//       },
//     },
//   },
// ]);

// export const PinnedEndIndicatorBorder = style([
//   PinnedIndicatorCls,

//   {
//     // right: `calc( ${InternalVars.pinnedEndWidth} + ${InternalVars.scrollbarWidthVertical})`,
//     left: `calc( ${InternalVars.pinnedEndOffset} )`,

//     selectors: {
//       [`${InfiniteClsHasPinnedEnd} &`]: {
//         // visibility: 'visible',
//       },
//     },
//   },
// ]);
