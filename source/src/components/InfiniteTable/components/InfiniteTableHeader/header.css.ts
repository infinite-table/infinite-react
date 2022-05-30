import { style } from '@vanilla-extract/css';
import { recipe, RecipeVariants } from '@vanilla-extract/recipes';

import { InfiniteClsRecipe } from '../../InfiniteCls.css';
import { ThemeVars } from '../../theme.css';
import {
  alignItems,
  display,
  flexFlow,
  height,
  overflow,
  position,
  width,
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

export const HeaderSortIconCls = style([position.relative], 'SortIconCls');
export const HeaderSortIconRecipe = recipe({
  variants: {
    align: {
      start: {
        marginLeft: ThemeVars.components.HeaderCell.sortIconMargin,
      },
      center: {
        marginLeft: ThemeVars.components.HeaderCell.sortIconMargin,
      },
      end: {
        marginRight: ThemeVars.components.HeaderCell.sortIconMargin,
      },
    },
  },
});

export const HeaderSortIconIndexCls = style({
  lineHeight: 0,
  fontSize: 10,
  borderRadius: '50%',
  padding: 1,
  position: 'absolute',
  transition: 'top 0.2s',
  top: 0,
  right: 2,
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
    // flexFlow.column,
    display.block,
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
      padding: 0,
      borderRight: ThemeVars.components.Cell.border,
    },
    display.block,
  ],
  variants: {
    rowActive: { false: {}, true: {} },
    zebra: {
      false: {},
      even: {},
      odd: {},
    },
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
    filtered: {
      true: {},
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

export const HeaderCellContentRecipe = recipe(
  {
    base: [
      {
        padding: ThemeVars.components.HeaderCell.padding,
      },
      height['100%'],
      width['100%'],
      display.flex,
      flexFlow.row,
      alignItems.center,
    ],
    variants: {
      filtered: {
        false: {},
        true: {},
      },
    },
  },
  'HeaderCellContentRecipe',
);

export type HeaderCellContentVariantsType = Required<
  RecipeVariants<typeof HeaderCellContentRecipe>
>;

export const HeaderWrapperCls = style([
  {
    background: ThemeVars.components.Header.background,
  },
  overflow.hidden,
  position.relative,
  display.flex,
  flexFlow.row,
]);

export const HeaderGroupCls = style([
  display.flex,
  flexFlow.row,
  alignItems.center,
  {
    padding: ThemeVars.components.Cell.padding,
    borderBottom: ThemeVars.components.Cell.border,
    borderRight: ThemeVars.components.Cell.border,
  },
]);

export const HeaderFilterCls = style([
  display.flex,
  flexFlow.row,
  alignItems.center,
  position.relative,
  {
    // paddingLeft: ThemeVars.components.HeaderCell.paddingX,
    // paddingRight: ThemeVars.components.HeaderCell.paddingY,

    borderTop: ThemeVars.components.Cell.border,
  },
]);

export const HeaderFilterEditorCls = style([width['100%'], height['100%']]);
