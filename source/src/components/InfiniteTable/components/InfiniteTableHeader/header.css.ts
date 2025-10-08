import { CSSProperties, style } from '@vanilla-extract/css';
import { recipe, RecipeVariants } from '@vanilla-extract/recipes';

import { InfiniteClsRecipe } from '../../InfiniteCls.css';
import { ThemeVars } from '../../vars.css';
import {
  alignItems,
  color,
  cssEllipsisClassName,
  display,
  flexFlow,
  height,
  justifyContent,
  left,
  overflow,
  position,
  top,
  transform,
  visibility,
  width,
  zIndex,
} from '../../utilities.css';
import {
  CellBorderObject,
  CellCls,
  CellClsVariants,
  ColumnCellVariantsObject,
} from '../cell.css';

export { CellCls, CellClsVariants };

export const HeaderSortIconCls = style([position.relative], 'SortIconCls');
export const HeaderFilterIconCls = style([position.relative], 'FilterIconCls');

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

export const HeaderFilterIconIndexCls = style({
  lineHeight: 0,
  fontSize: 10,
  borderRadius: '50%',
  padding: 1,
  position: 'absolute',
  transition: 'top 0.2s',
  top: 0,
  right: 2,
});

export const HeaderCellProxyRemoveIconRecipe = recipe({
  base: [
    position.absolute,
    top['50%'],
    left[0],
    transform['translate-50%Y'],
    color.currentColor,
  ],
  variants: {
    visible: {
      true: {
        visibility: 'visible',
      },
      false: {
        visibility: 'hidden',
      },
    },
  },
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
    display.block,
    position.absolute,
    {
      background: ThemeVars.components.Header.background,
      color: ThemeVars.components.Header.color,
      // transform: `translate3d(${InternalVars.virtualScrollLeftOffset}, 0px, 0px)`,
      transform: `translate3d(0px, 0px, 0px)`,
    },
  ],

  variants: {
    pinned: {
      start: {},
      end: {},
      false: {},
    },
    firstInCategory: {
      true: {},
      false: {},
    },
    lastInCategory: {
      true: {},
      false: {},
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
        pinned: 'start',
        firstInCategory: true,
      },
      style: ColumnCellVariantsObject.pinnedStartFirstInCategory,
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
    {
      variants: {
        pinned: 'end',
        lastInCategory: true,
      },
      style: ColumnCellVariantsObject.pinnedEndLastInCategory,
    },
  ],
});

export const HeaderCellProxy = style([
  position.absolute,
  zIndex['1000000'],
  {
    background: ThemeVars.components.HeaderCell.hoverBackground,
    color: ThemeVars.components.Cell.color,
    opacity: 0.8,
    padding: ThemeVars.components.Cell.padding,
    paddingLeft: 20,
    zIndex: 2_000,
    display: 'flex',
    flexFlow: 'row',
    alignItems: 'center',
    justifyContent: 'start',
  },
  cssEllipsisClassName,
]);

export const HeaderCellRecipe = recipe({
  base: [
    {
      ...CellBorderObject,
      borderLeft: `${ThemeVars.components.Cell.borderWidth} solid transparent`,
      borderRight: ThemeVars.components.HeaderCell.borderRight,
      background: ThemeVars.components.HeaderCell.background,
      padding: 0,
      ':hover': {
        background: ThemeVars.components.HeaderCell.hoverBackground,
      },
      display: 'block',
    },
  ],
  variants: {
    rowActive: { false: {}, true: {} },
    cellSelected: { false: {}, true: {} },
    rowSelected: { false: {}, true: {}, null: {} },

    rowDisabled: { false: {}, true: {} },
    firstRow: {
      false: {},
      true: {},
    },
    treeNode: {
      parent: {},
      leaf: {},
      false: {},
    },
    firstRowInHorizontalLayoutPage: {
      false: {},
      true: {},
    },
    groupRow: {
      false: {},
      true: {},
    },
    groupCell: {
      false: {},
      true: {},
    },
    align: {
      start: {},
      end: {},
      center: {},
    },
    verticalAlign: {
      start: {},
      end: {},
      center: {},
    },
    zebra: {
      false: {},
      even: {},
      odd: {},
    },
    dragging: {
      true: {},
      false: {},
    },
    insideDisabledDraggingPage: {
      true: {
        opacity:
          ThemeVars.components.Cell
            .horizontalLayoutColumnReorderDisabledPageOpacity,
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
        // vars: {
        //   [ThemeVars.components.Cell.reorderEffectDuration]: '0',
        // },
      },
      end: {
        // vars: {
        //   [ThemeVars.components.Cell.reorderEffectDuration]: '0',
        // },
      },
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
        // selectors: {
        //   [`${InfiniteClsRecipe({
        //     hasPinnedEndOverflow: true,
        //   })} &`]: {
        borderRight: ThemeVars.components.Cell.border,
        vars: {
          // [ThemeVars.components.Cell.border]:
          //   ThemeVars.components.Cell.borderInvisible,
        },
        // },
        // },
      },
    },
  ],
});

const menuVisibleStyle: CSSProperties = {
  visibility: 'visible',
  display: 'flex',
};

export const HeaderMenuIconCls = recipe({
  base: [
    position.relative,
    display.flex,
    flexFlow.column,
    justifyContent.spaceAround,
    visibility.hidden,
    {
      cursor: 'context-menu',
      paddingBlockStart: '2px',
      paddingBlockEnd: '2px',
      minWidth: ThemeVars.components.HeaderCell.iconSize,
      height: ThemeVars.components.HeaderCell.iconSize,
      selectors: {
        '&:active': {
          top: '1px',
        },
        [`${HeaderCellRecipe.classNames.variants.dragging.false}:hover &`]:
          menuVisibleStyle,
      },
    },
  ],
  variants: {
    menuVisible: {
      true: menuVisibleStyle,
    },
    reserveSpaceWhenHidden: {
      true: {},
      false: {
        display: 'none',
      },
    },
  },
  compoundVariants: [
    {
      variants: {
        menuVisible: true,
        reserveSpaceWhenHidden: false,
      },
      style: menuVisibleStyle,
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
      justifyContent.start,
    ],
    variants: {
      filtered: {
        false: {},
        true: {},
      },
      verticalAlign: {
        start: {
          alignItems: 'flex-start',
        },
        end: {
          alignItems: 'flex-end',
        },
        center: {},
      },
      align: {
        start: {},
        end: {
          flexDirection: 'row-reverse',
        },
        center: {
          justifyContent: 'center',
        },
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
    background: ThemeVars.components.HeaderCell.background,
  },
]);
export const HeaderFilterRecipe = recipe({
  base: [
    display.flex,
    flexFlow.row,
    alignItems.stretch,
    position.relative,
    {
      borderTop: ThemeVars.components.Cell.border,
      paddingBlock: ThemeVars.components.HeaderCell.filterEditorMarginY,
    },
  ],
  variants: {
    active: {
      true: {},
      false: {},
    },
  },
});

export const HeaderFilterOperatorCls = style([
  display.flex,
  flexFlow.row,
  alignItems.center,
  position.relative,
  {
    paddingInline: ThemeVars.components.HeaderCell.filterOperatorPaddingX,
    paddingBlock: ThemeVars.components.HeaderCell.filterOperatorPaddingY,
    selectors: {
      [`.${HeaderFilterRecipe.classNames.variants.active.true} &`]: {
        color: ThemeVars.color.accent,
      },
      '&:active': {
        top: '1px',
      },
    },
  },
]);

export const HeaderFilterOperatorIconRecipe = recipe({
  base: [position.relative, top[0], {}],
  variants: {
    disabled: {
      true: {
        opacity: ThemeVars.components.Menu.itemDisabledOpacity,
        cursor: 'auto',
      },
      false: {
        selectors: {
          '&:active': {
            top: '1px',
          },
        },
      },
    },
  },
});

const HeaderFilterFocusedEditorStyle = {
  outline: 'none',
  borderColor: ThemeVars.components.HeaderCell.filterEditorFocusBorderColor,
};

export const HeaderFilterEditorCls = style([
  width['100%'],
  height['100%'],
  {
    marginInline: ThemeVars.components.HeaderCell.filterEditorMarginX,
    paddingInline: ThemeVars.components.HeaderCell.filterEditorPaddingX,
    paddingBlock: ThemeVars.components.HeaderCell.filterEditorPaddingY,
    background: ThemeVars.components.HeaderCell.filterEditorBackground,
    color: ThemeVars.components.HeaderCell.filterEditorColor,
    border: ThemeVars.components.HeaderCell.filterEditorBorder,
    borderRadius: ThemeVars.components.HeaderCell.filterEditorBorderRadius,

    selectors: {
      '&:focus': HeaderFilterFocusedEditorStyle,
      [`.${HeaderFilterRecipe.classNames.variants.active.true} &`]:
        HeaderFilterFocusedEditorStyle,
    },
  },
]);
