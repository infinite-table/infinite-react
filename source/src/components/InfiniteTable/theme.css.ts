import { createGlobalThemeContract, globalStyle } from '@vanilla-extract/css';

export const ThemeVars = createGlobalThemeContract(
  {
    color: {
      /**
       * Brand-specific accent color. This probably needs override to match your app.
       */
      accent: 'accent-color',
      /**
       * The text color inside the component
       */
      color: 'color',
    },
    spacing: {
      0: 'space-0',
      1: 'space-1',
      2: 'space-2',
      3: 'space-3',
      4: 'space-4',
      5: 'space-5',
      6: 'space-6',
      7: 'space-7',
      8: 'space-8',
      9: 'space-9',
      10: 'space-10',
    },
    fontSize: {
      0: 'font-size-0',
      1: 'font-size-1',
      2: 'font-size-2',
      3: 'font-size-3',
      4: 'font-size-4',
      5: 'font-size-5',
      6: 'font-size-6',
      7: 'font-size-7',
    },
    fontFamily: 'font-family',
    minHeight: 'min-height',
    borderRadius: 'border-radius',
    /**
     * The background color for the whole component.
     *
     * Overriden in the `dark` theme.
     */
    background: 'background',

    components: {
      LoadMask: {
        /**
         * The padding used for the content inside the LoadMask.
         */
        padding: 'load-mask-padding',
        color: 'load-mask-color',
        textBackground: 'load-mask-text-background',
        overlayBackground: 'load-mask-overlay-background',
        overlayOpacity: 'load-mask-overlay-opacity',
        borderRadius: 'load-mask-border-radius',
      },
      Header: {
        /**
         * Background color for the header. Defaults to [`--infinie-header-cell-background`](#header-cell-background).
         *
         * Overriden in the `dark` theme.
         */
        background: 'header-background',
        /**
         * The text color inside the header.
         *
         * Overriden in the `dark` theme.
         */
        color: 'header-color',
        columnHeaderHeight: 'column-header-height',
      },
      HeaderCell: {
        draggingBackground: 'header-cell-dragging-background',
        /**
         * Background for header cells.
         *
         * Overriden in the `dark` theme.
         */
        background: 'header-cell-background',
        padding: 'header-cell-padding',
        paddingX: 'header-cell-padding-x',
        paddingY: 'header-cell-padding-y',
        iconSize: 'header-cell-icon-size',
        sortIconMargin: 'header-cell-sort-icon-margin',
      },
      Cell: {
        padding: 'cell-padding',
        borderWidth: 'cell-border-width',
        /**
         * Specifies the border for cells.
         *
         * Overriden in the `dark` theme - eg: `1px solid #2a323d`
         */
        border: 'cell-border',
        borderInvisible: 'cell-border-invisible',
        borderRadius: 'cell-border-radius',

        /**
         * Text color inside rows. Defaults to `currentColor`
         *
         * Overriden in `dark` theme.
         */
        color: 'cell-color',

        /**
         * The RED component of the color used for the active cell when cell keyboard navigation is enabled.
         *
         * The easiest way to define the color of the active cell is to use these 3 variables:
         *   `--infinite-active-cell-border-color--r`
         *   `--infinite-active-cell-border-color--g`
         *   `--infinite-active-cell-border-color--b`
         * as they define both the border and the background color of the active cell and the active row.
         *
         * You can also specify the GREEN and BLUE components of the color using the next two css vars.
         *
         * The border color of the active cell is decomposed into multiple variables for convenience as by default
         * the background of the active cell is the same color, but with the opacity specified by the value of `--infinie-active-cell-background-alpha`.
         *
         * If you don't want this, you can use `--infinite-active-cell-background` instead.
         */
        activeBorderColor_R: 'active-cell-border-color--r',

        /**
         * The GREEN component of the color used for the active cell when cell keyboard navigation is enabled.
         *
         * The easiest way to define the color of the active cell is to use these 3 variables:
         *   `--infinite-active-cell-border-color--r`
         *   `--infinite-active-cell-border-color--g`
         *   `--infinite-active-cell-border-color--b`
         * as they define both the border and the background color of the active cell and the active row.
         *
         * You can also specify the RED and BLUE components of the color using the next two css vars.
         *
         * The border color of the active cell is decomposed into multiple variables for convenience as by default
         * the background of the active cell is the same color, but with the opacity specified by the value of `--infinie-active-cell-background-alpha`.
         *
         * If you don't want this, you can use `--infinite-active-cell-background` instead.
         */
        activeBorderColor_G: 'active-cell-border-color--g',

        /**
         * The BLUE component of the color used for the active cell when cell keyboard navigation is enabled.
         *
         * The easiest way to define the color of the active cell is to use these 3 variables:
         *   `--infinite-active-cell-border-color--r`
         *   `--infinite-active-cell-border-color--g`
         *   `--infinite-active-cell-border-color--b`
         * as they define both the border and the background color of the active cell and the active row.
         *
         * You can also specify the RED and GREEN components of the color using the next two css vars.
         *
         * The border color of the active cell is decomposed into multiple variables for convenience as by default
         * the background of the active cell is the same color, but with the opacity specified by the value of `--infinie-active-cell-background-alpha`.
         *
         * If you don't want this, you can use `--infinite-active-cell-background` instead.
         */
        activeBorderColor_B: 'active-cell-border-color--b',

        /**
         * The opacity of the background color for the active cell (when cell keyboard navigation is enabled).
         *
         * The background color of the active cell is based on the value of the above 3 variables, but with the opacity specified by this variable.
         * This is applied when the component has focus.
         */
        activeBackgroundAlpha: 'active-cell-background-alpha',

        /**
         * Same as the above, but applied when the component does not have focus.
         */
        activeBackgroundAlphaWhenTableUnfocused:
          'active-cell-background-alpha--table-unfocused',

        /**
         * The background color of the active cell defaults to the same color (with modified opacity, as explained above) as the border color.
         *
         * However, specify this to explicitly override the default.
         */
        activeBackground: 'active-cell-background',

        /**
         * The color for border of the active cell (when cell keyboard navigation is enabled).
         */
        activeBorderColor: 'active-cell-border-color',
        /**
         * The width of the border for the active cell.
         */
        activeBorderWidth: 'active-cell-border-width',

        /**
         * The style of the border for the active cell (eg: 'solid', 'dashed', 'dotted') - defaults to 'dashed'.
         */
        activeBorderStyle: 'active-cell-border-style',

        /**
         * Specifies the border for the active cell. Defaults to `var(--infinite-active-cell-border-width) var(--infinite-active-cell-border-style) var(--infinite-active-cell-border-color)`.
         */
        activeBorder: 'active-cell-border',
      },
      Row: {
        /**
         * Background color for rows. Defaults to [`--infinite-background`](#background).
         *
         * Overriden in `dark` theme.
         */
        background: 'row-background',

        /**
         * Background color for odd rows. Even rows will use [`--infinite-row-background`](#row-background).
         *
         * Overriden in `dark` theme.
         */
        oddBackground: 'row-odd-background',

        /**
         * The background color of the active row. Defaults to the value of `var(--infinite-active-cell-background)`.
         *
         * However, specify this to explicitly override the default.
         */
        activeBackground: 'active-row-background',

        /**
         * The border color for the active row. Defaults to the value of `var(--infinite-active-cell-border-color)`.
         */
        activeBorderColor: 'active-row-border-color',

        /**
         * The width of the border for the active row. Defaults to the value of `var(--infinite-active-cell-border-width)`.
         */
        activeBorderWidth: 'active-row-border-width',

        /**
         * The style of the border for the active row (eg: 'solid', 'dashed', 'dotted') - defaults to the value of `var(--infinite-active-cell-border-style)`, which is `dashed` by default.
         */
        activeBorderStyle: 'active-row-border-style',

        /**
         * Specifies the border for the active row. Defaults to `var(--infinite-active-row-border-width) var(--infinite-active-row-border-style) var(--infinite-active-row-border-color)`.
         */
        activeBorder: 'active-row-border',

        /**
         * The opacity of the background color for the active row (when row keyboard navigation is enabled).
         * When you explicitly specify `--infinite-active-row-background`, this variable will not be used.
         * Instead, this variable is used when the active row background uses the color of the active cell (border).
         *
         * This is applied when the component has focus.
         *
         * Defaults to the value of `var(--infinite-active-cell-background-alpha)`.
         */
        activeBackgroundAlpha: 'active-row-background-alpha',

        /**
         * Same as the above, but applied when the component does not have focus.
         *
         * When you explicitly specify `--infinite-active-row-background`, this variable will not be used.
         * Instead, this variable is used when the active row background uses the color of the active cell (border).
         *
         * Defaults to the value of `var(--infinite-active-cell-background-alpha--table-unfocused)`.
         */
        activeBackgroundAlphaWhenTableUnfocused:
          'active-row-background-alpha--table-unfocused',

        /**
         * Background color for rows, on hover.
         *
         * Overriden in the `dark` theme.
         */
        hoverBackground: 'row-hover-background',
        groupRowBackground: 'group-row-background',
        groupRowColumnNesting: 'group-row-column-nesting',
        groupNesting: 'dont-override-group-row-nesting-length',
        pointerEventsWhileScrolling: 'row-pointer-events-while-scrolling',
      },
      ColumnCell: {
        background: 'column-cell-bg-dont-override',
      },
    },
  },
  (value: string | null) => `--infinite-${value}`,
);

// declare here vars that default to other vars
const LoadMaskVars = {
  [ThemeVars.components.LoadMask.textBackground]: 'rgba(255,255,255,0.8)',
  [ThemeVars.components.LoadMask.overlayBackground]: 'gray',
  [ThemeVars.components.LoadMask.overlayOpacity]: '0.3',
  [ThemeVars.components.LoadMask.color]: 'inherit',
  [ThemeVars.components.LoadMask.padding]: ThemeVars.spacing[5],
  [ThemeVars.components.LoadMask.borderRadius]: ThemeVars.borderRadius,
};

const HeaderCellVars = {
  [ThemeVars.components.HeaderCell.background]: '#ededed',
  [ThemeVars.components.HeaderCell.paddingX]: ThemeVars.spacing['3'],
  [ThemeVars.components.HeaderCell.paddingY]: ThemeVars.spacing['3'],
  [ThemeVars.components.HeaderCell
    .padding]: `${ThemeVars.components.HeaderCell.paddingY} ${ThemeVars.components.HeaderCell.paddingX} `,
  [ThemeVars.components.HeaderCell.draggingBackground]: '#d4d3d3',
  [ThemeVars.components.HeaderCell.iconSize]: '16px',
  [ThemeVars.components.HeaderCell.sortIconMargin]: '16px',
};
const HeaderVars = {
  [ThemeVars.components.Header.background]:
    ThemeVars.components.HeaderCell.background,
  [ThemeVars.components.Header.color]: '#6f6f6f',
  [ThemeVars.components.Header.columnHeaderHeight]: '30px',
};

const CellVars = {
  [ThemeVars.components.Cell.color]: 'currentColor',
  [ThemeVars.components.Cell.borderWidth]: '1px',
  [ThemeVars.components.Cell
    .padding]: `${ThemeVars.spacing[2]} ${ThemeVars.spacing[3]}`,
  [ThemeVars.components.Cell
    .border]: `${ThemeVars.components.Cell.borderWidth} solid #c6c6c6`,
  [ThemeVars.components.Cell.borderInvisible]: 'none',
  [ThemeVars.components.Cell.borderRadius]: ThemeVars.spacing[2],

  [ThemeVars.components.Cell.activeBorderStyle]: 'dashed',
  [ThemeVars.components.Cell.activeBorderWidth]: '1px',
  [ThemeVars.components.Cell.activeBorderColor_R]: '77',
  [ThemeVars.components.Cell.activeBorderColor_G]: '149',
  [ThemeVars.components.Cell.activeBorderColor_B]: '215',

  [ThemeVars.components.Cell.activeBackgroundAlpha]: '0.25',
  [ThemeVars.components.Cell.activeBackgroundAlphaWhenTableUnfocused]: '0.1',
};

const RowVars = {
  [ThemeVars.components.Row.background]: ThemeVars.background,
  [ThemeVars.components.Row.oddBackground]: '#f6f6f6',
  [ThemeVars.components.Row.groupRowBackground]: '#cbc5c5',
  [ThemeVars.components.Row.groupRowColumnNesting]: '30px',
  [ThemeVars.components.Row.hoverBackground]: '#dbdbdb',
  [ThemeVars.components.Row.pointerEventsWhileScrolling]: 'auto',
};

const LightTheme = {
  [ThemeVars.spacing[0]]: '0rem' /* 0px when 1rem=16px */,
  [ThemeVars.spacing[1]]: '0.125rem' /* 2px when 1rem=16px */,
  [ThemeVars.spacing[2]]: '0.25rem' /* 4px when 1rem=16px */,
  [ThemeVars.spacing[3]]: '0.5rem' /* 8px when 1rem=16px */,
  [ThemeVars.spacing[4]]: '0.75rem' /* 12px when 1rem=16px */,
  [ThemeVars.spacing[5]]: '1rem' /* 16px when 1rem=16px */,
  [ThemeVars.spacing[6]]: '1.25rem' /* 20px when 1rem=16px */,
  [ThemeVars.spacing[7]]: '1.5rem' /* 24px when 1rem=16px */,
  [ThemeVars.spacing[8]]: '2.25rem' /* 36px when 1rem=16px */,
  [ThemeVars.spacing[9]]: '3rem' /* 48px when 1rem=16px */,
  [ThemeVars.spacing[10]]: '4rem' /* 64px when 1rem=16px */,

  [ThemeVars.fontSize[0]]: '0.5rem' /* 8px when 1rem=16px */,
  [ThemeVars.fontSize[1]]: '0.625rem' /* 10px when 1rem=16px */,
  [ThemeVars.fontSize[2]]: '0.75rem' /* 12px when 1rem=16px */,
  [ThemeVars.fontSize[3]]: '0.875rem' /* 14px when 1rem=16px */,
  [ThemeVars.fontSize[4]]: '1rem' /* 16px when 1rem=16px */,
  [ThemeVars.fontSize[5]]: '1.25rem' /* 20px when 1rem=16px */,
  [ThemeVars.fontSize[6]]: '1.5rem' /* 24px when 1rem=16px */,
  [ThemeVars.fontSize[7]]: '2.25rem' /* 36px when 1rem=16px */,

  [ThemeVars.fontFamily]: 'inherit',
  [ThemeVars.color.color]: '#484848',
  [ThemeVars.color.accent]: '#ff7043',
  [ThemeVars.borderRadius]: ThemeVars.spacing[2],
  [ThemeVars.background]: 'white',
  [ThemeVars.minHeight]: '100px',
  ...LoadMaskVars,
  ...HeaderCellVars,
  ...HeaderVars,
  ...CellVars,
  ...RowVars,
};

const DarkTheme = {
  [ThemeVars.background]: '#101419',
  [ThemeVars.components.Cell.border]: '1px solid #2a323d',
  [ThemeVars.components.Header.color]: '#c3c3c3',
  [ThemeVars.components.HeaderCell.background]: '#1b2129',
  [ThemeVars.components.Header.background]:
    ThemeVars.components.HeaderCell.background,
  [ThemeVars.components.Row.hoverBackground]: '#3b4754',
  [ThemeVars.components.Row.background]: ThemeVars.background,
  [ThemeVars.components.Row.oddBackground]: '#242a31',
  [ThemeVars.components.Cell.color]: '#c3c3c3',
};

globalStyle(':root', {
  vars: LightTheme,
  '@media': {
    '(prefers-color-scheme: dark)': {
      vars: DarkTheme,
    },
  },
});

globalStyle('.light', {
  vars: LightTheme,
});
globalStyle('.infinite-light', {
  vars: LightTheme,
});
globalStyle('.dark', {
  vars: DarkTheme,
});
globalStyle('.infinite-dark', {
  vars: DarkTheme,
});
