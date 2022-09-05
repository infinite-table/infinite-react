import { fallbackVar, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { ThemeVars } from '../InfiniteTable/theme.css';
import {
  alignItems,
  boxSizingBorderBox,
  cursor,
  display,
  flexFlow,
  margin,
  position,
  userSelect,
} from '../InfiniteTable/utilities.css';

export const MenuCls = style([
  boxSizingBorderBox,
  position.relative,
  display.inlineGrid,
  flexFlow.column,
  margin.none,
  {
    padding: ThemeVars.components.Menu.padding,
    color: ThemeVars.components.Menu.color,
    background: ThemeVars.components.Menu.background,
  },
]);

export const MenuRowCls = style([display.contents]);

const activeItemBorder = fallbackVar(
  ThemeVars.components.Row.activeBorder,
  `${fallbackVar(
    ThemeVars.components.Row.activeBorderWidth,
    ThemeVars.components.Cell.activeBorderWidth,
  )} ${fallbackVar(
    ThemeVars.components.Row.activeBorderStyle,
    ThemeVars.components.Cell.activeBorderStyle,
  )} ${fallbackVar(
    ThemeVars.components.Row.activeBorderColor,
    `rgb(${ThemeVars.components.Cell.activeBorderColor_R} ${ThemeVars.components.Cell.activeBorderColor_G} ${ThemeVars.components.Cell.activeBorderColor_B})`,
  )}`,
);
export const MenuItemCls = recipe({
  base: [
    {
      paddingBlock: ThemeVars.components.Menu.cellPaddingVertical,
      paddingInline: ThemeVars.components.Menu.cellPaddingHorizontal,
      marginBlock: ThemeVars.components.Menu.cellMarginVertical,
      border: activeItemBorder,
      borderColor: 'transparent',
    },
    display.flex,
    alignItems.center,
    userSelect.none,
  ],
  variants: {
    disabled: {
      true: [
        {
          opacity: ThemeVars.components.Menu.itemDisabledOpacity,
          background: ThemeVars.components.Menu.itemDisabledBackground,
        },
        cursor.default,
        userSelect.none,
      ],
      false: [cursor.pointer],
    },
    hover: {
      true: {
        background: ThemeVars.components.Menu.itemHoverBackground,
        opacity: ThemeVars.components.Menu.itemHoverOpacity,
      },
      false: {},
    },
    pressed: {
      false: {},
      true: {},
    },
    active: {
      true: {
        selectors: {
          [`${MenuCls}:focus &`]: {
            border: activeItemBorder,
          },
          [`${MenuCls}:focus &:first-child`]: {
            borderRightColor: 'transparent',
          },
          [`${MenuCls}:focus &:last-child`]: {
            borderLeftColor: 'transparent',
          },
          [`${MenuCls}:focus &:not(:first-child):not(:last-child)`]: {
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
          },
        },
      },
      false: {},
    },
  },
  compoundVariants: [
    {
      variants: {
        pressed: true,
        hover: true,
      },
      style: {
        background: ThemeVars.components.Menu.itemPressedBackground,
        opacity: ThemeVars.components.Menu.itemPressedOpacity,
      },
    },
  ],
});

export const MenuSeparatorCls = style([
  {
    borderTop: '1px solid currentColor',
    borderBottom: 0,
    marginTop: `calc(${ThemeVars.components.Menu.cellPaddingVertical} / 2)`,
    marginBottom: `calc(${ThemeVars.components.Menu.cellPaddingVertical} / 2)`,
  },
]);
