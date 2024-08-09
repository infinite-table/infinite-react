import {
  ComplexStyleRule,
  fallbackVar,
  style,
  styleVariants,
} from '@vanilla-extract/css';
import { recipe, RecipeVariants } from '@vanilla-extract/recipes';
import { InfiniteClsShiftingColumns } from '../InfiniteCls.css';

import { ThemeVars } from '../vars.css';
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
  borderLeft: `${ThemeVars.components.Cell.borderLeft}`,
  borderRight: `${ThemeVars.components.Cell.borderRight}`,
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
  pinnedStartLastInCategory: {
    borderRight: `${ThemeVars.components.Cell.pinnedBorder}`,
  },
  pinnedStartFirstInCategory: {},
  pinnedEndFirstInCategory: {
    borderLeft: `${ThemeVars.components.Cell.pinnedBorder}`,
  },
  pinnedEndLastInCategory: {},
};

export const SelectionCheckboxCls = style({
  marginInline: ThemeVars.components.SelectionCheckBox.marginInline,
});

const CellSelectionIndicatorBase: ComplexStyleRule = {
  position: 'absolute',
  content: '',
  inset: 0,

  // expand the indicator to cover the cell borders left and right
  left: `calc(0px - ${ThemeVars.components.Cell.borderWidth})`,
  right: `calc(0px - ${ThemeVars.components.Cell.borderWidth})`,
  pointerEvents: 'none',
  background: ThemeVars.components.Cell.selectedBackgroundDefault,

  borderWidth: `${fallbackVar(
    ThemeVars.components.Cell.selectedBorderWidth,
    ThemeVars.components.Cell.activeBorderWidth,
    ThemeVars.components.Row.activeBorderWidth,
    ThemeVars.components.Cell.borderWidth,
  )}`,
  borderStyle: `${fallbackVar(
    ThemeVars.components.Cell.selectedBorderStyle,
    ThemeVars.components.Cell.activeBorderStyle,
  )}`,
  border: fallbackVar(
    ThemeVars.components.Cell.selectedBorder,
    `${fallbackVar(
      ThemeVars.components.Cell.selectedBorderWidth,
      ThemeVars.components.Cell.activeBorderWidth,
      ThemeVars.components.Row.activeBorderWidth,
      ThemeVars.components.Cell.borderWidth,
    )} ${fallbackVar(
      ThemeVars.components.Cell.selectedBorderStyle,
      ThemeVars.components.Cell.activeBorderStyle,
      ThemeVars.components.Row.activeBorderStyle,
    )} ${fallbackVar(
      ThemeVars.components.Cell.selectedBorderColor,
      ThemeVars.components.Cell.activeBorderColor,
      ThemeVars.components.Row.activeBorderColor,
      ThemeVars.color.accent,
    )}`,
  ),
};
export const ColumnCellSelectionIndicatorRecipe = recipe({
  base: {
    '::before': CellSelectionIndicatorBase,
  },
  variants: {
    right: {
      true: {},
      false: {
        '::before': {
          borderRightWidth: 0,
        },
      },
    },
    left: {
      true: {},
      false: {
        '::before': {
          borderLeftWidth: 0,
        },
      },
    },
    top: {
      true: {},
      false: {
        '::before': {
          borderTopWidth: 0,
        },
      },
    },
    bottom: {
      true: {},
      false: {
        '::before': {
          borderBottomWidth: 0,
        },
      },
    },
  },
});
export const ColumnCellRecipe = recipe({
  base: [
    {
      color: ThemeVars.components.Cell.color,
    },
  ],
  variants: {
    dragging: { false: {}, true: {} },
    cellSelected: { false: {}, true: {} },
    align: {
      start: {},
      end: {
        justifyContent: 'flex-end',
      },
      center: {},
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
    rowActive: {
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
    zebra: {
      false: {
        background: ThemeVars.components.Row.background,
      },
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
      null: {},
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
    firstRow: {
      true: {},
      false: {
        borderTop: ThemeVars.components.Cell.borderTop,
      },
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
    {
      // only apply justify-content: center
      // to cells which are not group cells
      variants: {
        align: 'center',
        groupCell: false,
      },
      style: {
        justifyContent: 'center',
      },
    },
  ],
});

export type ColumnCellVariantsType = RecipeVariants<typeof ColumnCellRecipe>;
