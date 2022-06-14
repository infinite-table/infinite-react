import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { ThemeVars } from '../../../theme.css';

import { position, right, top, bottom, cursor } from '../../../utilities.css';

export const ResizeHandleCls = style(
  [
    position.absolute,
    top['0'],
    right['0'],
    bottom['0'],
    cursor.colResize,
    {
      transform: 'translateX(50%)',
      width: ThemeVars.components.HeaderCell.resizeHandleActiveAreaWidth,
    },
  ],

  'ResizeHandleCls',
);

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
  },
});
