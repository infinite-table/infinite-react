import { fallbackVar, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { ThemeVars } from '../InfiniteTable/vars.css';
import { DensityScale } from '../InfiniteTable/density.css';
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
// the menu item spacing is scaled by the density (computed here, on the menu
// elements, so it also works for menus rendered outside the table, via
// menuPortalContainer). The outer menu padding is not scaled, as it can be
// a shorthand with more values.
const scaled = (value: string) => `calc(${value} * ${DensityScale})`;

export const MenuItemCls = recipe({
  base: [
    {
      paddingBlock: scaled(ThemeVars.components.Menu.cellPaddingVertical),
      paddingInline: scaled(ThemeVars.components.Menu.cellPaddingHorizontal),
      marginBlock: scaled(ThemeVars.components.Menu.cellMarginVertical),
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
    borderTop: `1px solid ${ThemeVars.components.Menu.separatorColor}`,
    borderBottom: 0,
    borderLeft: 0,
    borderRight: 0,
    marginTop: `calc(${ThemeVars.components.Menu.cellPaddingVertical} * ${DensityScale} / 2)`,
    marginBottom: `calc(${ThemeVars.components.Menu.cellPaddingVertical} * ${DensityScale} / 2)`,
  },
]);
