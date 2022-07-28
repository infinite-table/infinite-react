import { style, styleVariants } from '@vanilla-extract/css';
import { recipe, RecipeVariants } from '@vanilla-extract/recipes';
import { InfiniteClsShiftingColumns } from '../InfiniteCls.css';

import { ThemeVars } from '../theme.css';
import {
  alignItems,
  display,
  flexFlow,
  position,
  userSelect,
  whiteSpace,
  willChange,
} from '../utilities.css';

export const columnAlignCellStyle = styleVariants({
  center: { justifyContent: 'center' },
  start: { justifyContent: 'flex-start' },
  end: { justifyContent: 'flex-start', flexFlow: 'row-reverse' },
});

export const CellBorderObject = {
  borderLeft: `${ThemeVars.components.Cell.borderWidth} solid transparent`,
  borderRight: `${ThemeVars.components.Cell.borderWidth} solid transparent`,
};

export const CellClsVariants = styleVariants({
  shifting: {
    transition: 'left 300ms',
  },
  dragging: {
    transition: 'none',
  },
});

export const CellCls = style([
  display.flex,
  flexFlow.row,
  alignItems.center,
  position.absolute,
  willChange.transform,
  whiteSpace.nowrap,
  userSelect.none,
  {
    padding: ThemeVars.components.Cell.padding,
    ...CellBorderObject,
  },
]);

export const ColumnCellCls = style([
  CellCls,
  {
    selectors: {
      [`${InfiniteClsShiftingColumns} &`]: {
        // color: 'red',
        transition: `transform ${ThemeVars.components.Cell.reorderEffectDuration}`,
      },
    },
  },
]);

export const ColumnCellVariantsObject = {
  first: {
    borderTopLeftRadius: ThemeVars.components.Cell.borderRadius,
    borderBottomLeftRadius: ThemeVars.components.Cell.borderRadius,
  },
  last: {
    borderTopRightRadius: ThemeVars.components.Cell.borderRadius,
    borderBottomRightRadius: ThemeVars.components.Cell.borderRadius,
  },
  groupByField: {},
  firstInCategory: {},
  lastInCategory: {},
  pinnedStart: {},
  pinnedEnd: {},
  unpinned: {},
  pinnedStartLastInCategory: {},
  pinnedStartFirstInCategory: {},
  pinnedEndFirstInCategory: {},
  pinnedEndLastInCategory: {},
};

export const ColumnCellRecipe = recipe({
  base: [
    {
      color: ThemeVars.components.Cell.color,
    },
  ],
  variants: {
    dragging: { false: {}, true: {} },
    rowActive: {
      false: {},
      true: {},
    },
    zebra: {
      false: {},
      even: {
        background: ThemeVars.components.Row.background,
      },
      odd: {
        background: ThemeVars.components.Row.oddBackground,
      },
    },
    rowSelected: {
      true: {
        background: ThemeVars.components.Row.selectedBackground,
      },
      false: {},
    },
    first: {
      true: {
        borderTopLeftRadius: ThemeVars.components.Cell.borderRadius,
        borderBottomLeftRadius: ThemeVars.components.Cell.borderRadius,
      },
      false: {},
    },
    last: {
      true: {
        borderTopRightRadius: ThemeVars.components.Cell.borderRadius,
        borderBottomRightRadius: ThemeVars.components.Cell.borderRadius,
      },
      false: {},
    },
    groupByField: {
      true: ColumnCellVariantsObject.groupByField,
      false: {},
    },
    firstInCategory: {
      true: ColumnCellVariantsObject.firstInCategory,
      false: {},
    },
    lastInCategory: {
      true: ColumnCellVariantsObject.lastInCategory,
      false: {},
    },
    pinned: {
      start: {
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
      style: ColumnCellVariantsObject.pinnedStartLastInCategory,
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
        pinned: 'end',
        firstInCategory: true,
      },
      style: ColumnCellVariantsObject.pinnedEndFirstInCategory,
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

export type ColumnCellVariantsType = RecipeVariants<typeof ColumnCellRecipe>;
