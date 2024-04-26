import { fallbackVar, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { ThemeVars } from '../InfiniteTable/vars.css';
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
    borderRadius: ThemeVars.components.Menu.borderRadius,
    outline: 'none',
    boxShadow: `0 6px 12px -2px ${ThemeVars.components.Menu.shadowColor},0 3px 7px -3px ${ThemeVars.components.Menu.background}`,
  },
]);

export const MenuRowCls = style({
  display: 'contents',
});

const keyboardActiveItemBorder = fallbackVar(
  ThemeVars.components.Row.activeBorder,
  `${fallbackVar(
    ThemeVars.components.Row.activeBorderWidth,
    ThemeVars.components.Cell.activeBorderWidth,
  )} ${fallbackVar(
    ThemeVars.components.Row.activeBorderStyle,
    ThemeVars.components.Cell.activeBorderStyle,
  )} ${fallbackVar(
    ThemeVars.components.Row.activeBorderColor,
    ThemeVars.components.Cell.activeBorderColor,
    ThemeVars.color.accent,
  )}`,
);
export const MenuItemCls = recipe({
  base: [
    {
      paddingBlock: ThemeVars.components.Menu.cellPaddingVertical,
      paddingInline: ThemeVars.components.Menu.cellPaddingHorizontal,
      marginBlock: ThemeVars.components.Menu.cellMarginVertical,
      border: keyboardActiveItemBorder,
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
    active: {
      true: {},
      false: {},
    },
    pressed: {
      false: {},
      true: {},
    },
    keyboardActive: {
      true: {
        selectors: {
          [`${MenuCls}:focus-within > ${MenuRowCls} > &`]: {
            border: keyboardActiveItemBorder,
          },
          [`${MenuCls}:focus-within > ${MenuRowCls} > &:first-child:last-child`]:
            {
              border: keyboardActiveItemBorder,
            },
          [`${MenuCls}:focus-within > ${MenuRowCls} > &:first-child`]: {
            borderRightColor: 'transparent',
          },
          [`${MenuCls}:focus-within > ${MenuRowCls} > &:last-child`]: {
            borderLeftColor: 'transparent',
          },
          [`${MenuCls}:focus-within > ${MenuRowCls} > &:not(:first-child):not(:last-child)`]:
            {
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
        active: true,
        disabled: false,
      },
      style: {
        background: ThemeVars.components.Menu.itemActiveBackground,
        opacity: ThemeVars.components.Menu.itemActiveOpacity,
      },
    },
    {
      variants: {
        pressed: true,
        active: true,
        disabled: false,
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
