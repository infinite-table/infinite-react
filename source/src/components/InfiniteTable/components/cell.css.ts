import {
  ComplexStyleRule,
  fallbackVar,
  keyframes,
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
import { InternalVars } from '../internalVars.css';

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

export const FlashingColumnCellRecipe = recipe({
  base: {
    '::after': {
      position: 'absolute',
      content: '',
      inset: 0,
      zIndex: ThemeVars.components.Cell.flashingOverlayZIndex,

      // expand the indicator to cover the cell borders left and right
      left: `calc(0px - ${ThemeVars.components.Cell.borderWidth})`,
      right: `calc(0px - ${ThemeVars.components.Cell.borderWidth})`,
      pointerEvents: 'none',

      animationName: fallbackVar(
        ThemeVars.components.Cell.flashingAnimationName,
        keyframes({
          '0%': { opacity: 0 },
          '25%': { opacity: 1 },

          '75%': { opacity: 1 },
          '100%': { opacity: 0 },
        }),
      ),
      animationFillMode: 'forwards',

      animationDuration: `calc(1ms * ${fallbackVar(
        InternalVars.currentFlashingDuration,
        ThemeVars.components.Cell.flashingDuration,
      )})`,

      background: fallbackVar(
        InternalVars.currentFlashingBackground,
        ThemeVars.components.Cell.flashingBackground,
      ),
    },
  },
  variants: {
    direction: {
      up: {
        vars: {
          [InternalVars.currentFlashingBackground]: fallbackVar(
            ThemeVars.components.Cell.flashingUpBackground,
            ThemeVars.components.Cell.flashingBackground,
          ),
        },
      },
      down: {
        vars: {
          [InternalVars.currentFlashingBackground]: fallbackVar(
            ThemeVars.components.Cell.flashingDownBackground,
            ThemeVars.components.Cell.flashingBackground,
          ),
        },
      },
      neutral: {
        vars: {
          [InternalVars.currentFlashingBackground]:
            ThemeVars.components.Cell.flashingBackground,
        },
      },
    },
  },
});

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
      // contain: 'strict', // DONT APPLY _STRICT_ AS IT breaks rendering cell selection
      // and possibly other things as well

      // contain: 'size layout style',
    },
  ],
  variants: {
    dragging: { false: {}, true: {} },
    insideDisabledDraggingPage: {
      true: {
        opacity:
          ThemeVars.components.Cell
            .horizontalLayoutColumnReorderDisabledPageOpacity,
      },
      false: {},
    },
    cellSelected: { false: {}, true: {} },
    treeNode: {
      parent: {},
      leaf: {},
      false: {},
    },
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
    rowDisabled: {
      false: {},
      true: {
        opacity: ThemeVars.components.Row.disabledOpacity,
        vars: {
          [ThemeVars.components.Row.background]:
            ThemeVars.components.Row.disabledBackground,
          [ThemeVars.components.Row.oddBackground]:
            ThemeVars.components.Row.oddDisabledBackground,
          [ThemeVars.components.Row.hoverBackground]:
            ThemeVars.components.Row.disabledBackground,
          [ThemeVars.components.Row.activeBackground]:
            ThemeVars.components.Row.background,
          [ThemeVars.components.Row.selectedHoverBackground]:
            ThemeVars.components.Row.selectedDisabledBackground,
        },
      },
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
    firstRowInHorizontalLayoutPage: {
      true: {},
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
        firstRowInHorizontalLayoutPage: true,
        firstRow: false,
      },
      style: {
        borderTop: 'none',
      },
    },
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
    {
      variants: {
        rowDisabled: true,
        zebra: 'odd',
      },
      style: {
        vars: {
          [ThemeVars.components.Row.hoverBackground]:
            ThemeVars.components.Row.oddDisabledBackground,
        },
      },
    },
  ],
});

export type ColumnCellVariantsType = RecipeVariants<typeof ColumnCellRecipe>;
