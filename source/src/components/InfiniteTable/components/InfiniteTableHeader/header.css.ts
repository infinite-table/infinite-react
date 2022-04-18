import { globalStyle, style } from '@vanilla-extract/css';
import { recipe, RecipeVariants } from '@vanilla-extract/recipes';

import { InfiniteClsRecipe } from '../../InfiniteCls.css';
import { ThemeVars } from '../../theme.css';
import {
  alignItems,
  display,
  flexFlow,
  flex,
  overflow,
  position,
} from '../../utilities.css';

import {
  CellBorderObject,
  CellCls,
  CellClsVariants,
  ColumnCellVariantsObject,
} from '../cell.css';

export { CellCls, CellClsVariants };

export const HeaderCellProxy = style({
  background: ThemeVars.components.Header.background,
  opacity: 0.9,
  padding: ThemeVars.components.Cell.padding,
  paddingLeft: 20,
  zIndex: 200,
});

export const HeaderSortIconCls = style([
  position.relative,
  {
    marginLeft: 10,
  },
]);

globalStyle(`${HeaderSortIconCls} [data-name='index']`, {
  lineHeight: 0,
  fontSize: 10,
  borderRadius: '50%',
  padding: 1,
});

export const HeaderScrollbarPlaceholderCls = style([
  {
    background: ThemeVars.components.Header.background,
    top: 0,
    right: 0,
    bottom: 0,
  },
  position.absolute,
]);

export const HeaderClsRecipe = recipe({
  base: [
    flexFlow.row,
    position.absolute,
    {
      background: ThemeVars.components.Header.background,
      color: ThemeVars.components.Header.color,
    },
  ],

  variants: {
    pinned: {
      start: {},
      end: {},
      false: {},
    },
    virtualized: {
      true: {},
      false: {
        position: 'relative',
        overflow: 'hidden',
      },
    },
    overflow: {
      true: { zIndex: 10 },
      false: {},
    },
  },
  compoundVariants: [
    {
      variants: {
        overflow: true,
        pinned: 'start',
      },
      style: {
        ...ColumnCellVariantsObject.pinnedStartLastInCategory,
        vars: {},
      },
    },
    {
      variants: {
        overflow: true,
        pinned: 'end',
      },
      style: {
        ...ColumnCellVariantsObject.pinnedEndFirstInCategory,
        vars: {},
      },
    },
  ],
});

export const HeaderCellRecipe = recipe({
  base: [
    {
      ...CellBorderObject,
      background: ThemeVars.components.HeaderCell.background,
      padding: ThemeVars.components.HeaderCell.padding,
      borderRight: ThemeVars.components.Cell.border,
    },
  ],
  variants: {
    dragging: {
      true: {
        zIndex: 100,
        opacity: 0.8,
        background: ThemeVars.components.HeaderCell.draggingBackground,
      },
      false: {},
    },

    first: {
      true: ColumnCellVariantsObject.first,
      false: {},
    },
    last: {
      true: ColumnCellVariantsObject.last,
      false: {},
    },
    groupByField: {
      true: ColumnCellVariantsObject.groupByField,
      false: {},
    },
    firstInCategory: {
      true: {
        ...ColumnCellVariantsObject.firstInCategory,
      },
      false: {},
    },
    lastInCategory: {
      true: {
        ...ColumnCellVariantsObject.lastInCategory,
      },
      false: {},
    },
    pinned: {
      start: {
        ...ColumnCellVariantsObject.pinnedStart,
        zIndex: 10,
      },
      end: {},
      false: {},
    },
  },

  compoundVariants: [
    {
      variants: {
        pinned: 'start',
        lastInCategory: true,
      },
      style: {
        ...ColumnCellVariantsObject.pinnedStartLastInCategory,
        selectors: {
          [`${InfiniteClsRecipe({
            hasPinnedStartOverflow: true,
          })} &`]: {
            vars: {
              [ThemeVars.components.Cell.border]:
                ThemeVars.components.Cell.borderInvisible,
            },
          },
        },
      },
    },
    {
      variants: {
        pinned: 'end',
        firstInCategory: true,
      },
      style: ColumnCellVariantsObject.pinnedEndFirstInCategory,
    },
    {
      variants: {
        pinned: false,
        lastInCategory: true,
      },
      style: {
        selectors: {
          [`${InfiniteClsRecipe({
            hasPinnedEndOverflow: true,
          })} &`]: {
            borderRight: ThemeVars.components.Cell.border,
            vars: {
              [ThemeVars.components.Cell.border]:
                ThemeVars.components.Cell.borderInvisible,
            },
          },
        },
      },
    },
  ],
});

export type HeaderCellVariantsType = RecipeVariants<typeof HeaderCellRecipe>;

export const HeaderWrapperCls = style([
  {
    background: ThemeVars.components.Header.background,
  },
  overflow.hidden,
  position.relative,
  display.flex,
  flexFlow.row,
]);

export const HeaderGroupCls = style([flexFlow.column, display.flex]);
export const HeaderGroup_Header = style([
  display.flex,
  flexFlow.row,
  alignItems.center,
  {
    padding: ThemeVars.components.Cell.padding,
    borderBottom: ThemeVars.components.Cell.border,
    borderRight: ThemeVars.components.Cell.border,
  },
]);

export const HeaderGroup_Children = style([
  display.flex,
  flexFlow.row,
  alignItems.stretch,
  flex['1'],
]);
