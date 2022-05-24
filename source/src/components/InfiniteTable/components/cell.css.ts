import { style, styleVariants } from '@vanilla-extract/css';
import { recipe, RecipeVariants } from '@vanilla-extract/recipes';

import { ThemeVars } from '../theme.css';
import {
  alignItems,
  display,
  flexFlow,
  position,
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
  {
    padding: ThemeVars.components.Cell.padding,
    ...CellBorderObject,
  },
]);

export const ColumnCellCls = style([CellCls]);

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
  pinnedStartLastInCategory: {
    borderRight: ThemeVars.components.Cell.border,
    vars: {
      // [ThemeVars.components.Cell.border]:
      //   ThemeVars.components.Cell.borderInvisible,
    },
  },
  pinnedEndFirstInCategory: {
    borderLeft: ThemeVars.components.Cell.border,
    vars: {
      // [ThemeVars.components.Cell.border]:
      //   ThemeVars.components.Cell.borderInvisible,
    },
  },
};

export const ColumnCellRecipe = recipe({
  base: [
    {
      color: ThemeVars.components.Cell.color,
    },
  ],
  variants: {
    dragging: { false: {}, true: {} },
    zebra: {
      false: {},
      even: {
        background: ThemeVars.components.Row.background,
      },
      odd: {
        background: ThemeVars.components.Row.oddBackground,
      },
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
      start: {},
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
      style: ColumnCellVariantsObject.pinnedStartLastInCategory,
    },

    {
      variants: {
        pinned: 'end',
        firstInCategory: true,
      },
      style: ColumnCellVariantsObject.pinnedEndFirstInCategory,
    },
  ],
});

export type ColumnCellVariantsType = RecipeVariants<typeof ColumnCellRecipe>;
