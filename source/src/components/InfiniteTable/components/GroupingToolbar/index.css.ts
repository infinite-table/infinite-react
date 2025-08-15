import { style } from '@vanilla-extract/css';

import { ThemeVars } from '../../vars.css';
import { recipe } from '@vanilla-extract/recipes';

import {
  alignItems,
  alignSelf,
  borderRadius,
  cursor,
  display,
  flexFlow,
  justifyContent,
  padding,
  userSelect,
  zIndex,
} from '../../utilities.css';

const GroupingToolbarBaseCls = style(
  [
    display.flex,
    {
      gap: ThemeVars.components.GroupingToolbar.gap,
      color: ThemeVars.components.GroupingToolbar.color,
      padding: ThemeVars.components.GroupingToolbar.padding,
      border: ThemeVars.components.GroupingToolbar.border,
    },
  ],
  'GroupingToolbar',
);

export const GroupingToolbarPlaceholderCls = style({
  opacity: 0.5,
});

export const GroupingToolbarRecipe = recipe({
  base: [GroupingToolbarBaseCls],
  variants: {
    orientation: {
      horizontal: [flexFlow.row, alignItems.center],
      vertical: [flexFlow.column],
    },
    draggingInProgress: {
      true: [zIndex['1000']],
      false: [],
    },
    dropRejected: {
      true: [],
      false: [],
    },
    active: {
      true: [],
      false: {},
    },
  },
  compoundVariants: [
    {
      variants: {
        dropRejected: true,
        active: true,
      },
      style: {
        background: ThemeVars.components.GroupingToolbar.rejectBackground,
        border: ThemeVars.components.GroupingToolbar.rejectBorder,
      },
    },
    {
      variants: {
        dropRejected: false,
        active: true,
      },
      style: {
        background: ThemeVars.components.GroupingToolbar.activeBackground,
        border: ThemeVars.components.GroupingToolbar.border,
      },
    },
    {
      variants: {
        active: false,
        dropRejected: false,
      },
      style: {
        background: ThemeVars.components.GroupingToolbar.background,
        border: ThemeVars.components.GroupingToolbar.border,
      },
    },
  ],
});

export const GroupingToolbarItemRecipe = recipe({
  base: [
    {
      border: ThemeVars.components.GroupingToolbarItem.border,
      borderRadius: ThemeVars.components.GroupingToolbarItem.borderRadius,
      background: ThemeVars.components.GroupingToolbarItem.background,
      gap: ThemeVars.components.GroupingToolbar.gap,
    },
    padding[2],
    userSelect.none,
    alignItems.center,
    display.flex,
    justifyContent.spaceBetween,
  ],
  variants: {
    active: {
      true: [
        cursor.grabbing,
        zIndex['1000'],
        {
          background: ThemeVars.components.GroupingToolbarItem.background,
          border: ThemeVars.components.GroupingToolbarItem.activeBorder,
        },
      ],
      false: [cursor.grab],
    },
    draggingInProgress: {
      true: [],
      false: [],
    },
  },
});

export const GroupingToolbarItemClearCls = style([
  cursor.pointer,
  borderRadius.default,
  alignSelf.end,
  {
    ':focus': {
      outline: ThemeVars.focusOutline,
    },
  },
]);
