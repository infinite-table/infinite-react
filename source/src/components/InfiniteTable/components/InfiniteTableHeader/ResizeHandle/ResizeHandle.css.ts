import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { ThemeVars } from '../../../theme.css';

import {
  position,
  right,
  top,
  bottom,
  cursor,
  left,
  overflow,
} from '../../../utilities.css';

export const ResizeHandleCls = style(
  [
    position.absolute,
    top['0'],
    right['0'],
    bottom['0'],
    cursor.colResize,
    overflow.hidden,
    {
      transform: 'translateX(50%)',
      width: ThemeVars.components.HeaderCell.resizeHandleActiveAreaWidth,
      selectors: {
        '&:hover': {
          overflow: 'visible',
        },
      },
    },
  ],

  'ResizeHandleCls',
);

export const ResizeHandleRecipeCls = recipe({
  variants: {
    computedPinned: {
      start: {},
      end: [
        left['0'],
        right['auto'],
        {
          transform: 'translateX(-50%)',
        },
      ],
      false: {},
    },
    computedFirstInCategory: {
      true: {},
      false: {},
    },
    computedLastInCategory: {
      true: {},
      false: {},
    },
  },
  compoundVariants: [
    {
      variants: {
        computedPinned: 'end',
        computedLastInCategory: false,
        computedFirstInCategory: true,
      },
      style: {
        transform: 'none',
      },
    },
    {
      variants: {
        computedPinned: false,
        computedFirstInCategory: false,
        computedLastInCategory: true,
      },
      style: {
        transform: 'none',
      },
    },
    {
      variants: {
        computedPinned: 'start',
        computedFirstInCategory: false,
        computedLastInCategory: true,
      },
      style: {
        transform: 'none',
      },
    },
  ],
});

export const ResizeHandleDraggerClsRecipe = recipe({
  base: [
    position.absolute,
    top['0'],

    bottom['0'],
    {
      right: `calc((${ThemeVars.components.HeaderCell.resizeHandleActiveAreaWidth} - ${ThemeVars.components.HeaderCell.resizeHandleWidth}) / 2)`,
      width: ThemeVars.components.HeaderCell.resizeHandleWidth,
      selectors: {
        [`${ResizeHandleCls}:hover &`]: {
          background:
            ThemeVars.components.HeaderCell.resizeHandleHoverBackground,
        },
      },
    },
  ],
  variants: {
    constrained: {
      false: {},
      true: {
        selectors: {
          [`${ResizeHandleCls}:hover &`]: {
            background:
              ThemeVars.components.HeaderCell
                .resizeHandleConstrainedHoverBackground,
          },
        },
      },
    },
    computedPinned: {
      start: {},
      end: {},
      false: {},
    },
    computedFirstInCategory: {
      true: {},
      false: {},
    },
    computedLastInCategory: {
      true: {},
      false: {},
    },
  },
  compoundVariants: [
    {
      variants: {
        computedPinned: 'start',
        computedLastInCategory: true,
      },
      style: {
        right: 0,
      },
    },
    {
      variants: {
        computedPinned: 'end',
        computedFirstInCategory: true,
      },
      style: {
        right: 'unset',
      },
    },
  ],
});
