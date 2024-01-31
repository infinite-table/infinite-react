import {
  createGlobalThemeContract,
  createThemeContract,
  fallbackVar,
  globalStyle,
} from '@vanilla-extract/css';
import { toCSSVarName } from './utils/toCSSVarName';

export const columnHeaderHeightName = 'column-header-height';
export const InternalVars = createThemeContract({
  currentColumnTransformX: null,
  currentColumnTransformY: null,

  activeCellRowOffset: null,
  activeCellRowHeight: null,

  activeCellOffsetX: null,
  activeCellOffsetY: null,

  scrollTopForActiveRow: null,
  // this will be set to `${columnWidthAtIndex}-${the index of the column on which the active cell is}`
  activeCellColWidth: null,

  // this will be set to `${columnOffsetAtIndex}-${the index of the column on which the active cell is}`
  activeCellColOffset: null,

  columnReorderEffectDurationAtIndex: null,
  columnWidthAtIndex: null,
  columnOffsetAtIndex: null,
  columnOffsetAtIndexWhileReordering: null,
  columnZIndexAtIndex: null,

  pinnedStartWidth: null,
  pinnedEndWidth: null,

  pinnedEndOffset: null,

  computedVisibleColumnsCount: null,

  baseZIndexForCells: null,

  bodyWidth: null,
  bodyHeight: null,

  scrollbarWidthHorizontal: null,
  scrollbarWidthVertical: null,

  scrollLeft: null,
  scrollTop: null,
});
export const ThemeVars = createGlobalThemeContract(
  {
    color: {
      /**
       * Brand-specific accent color. This probably needs override to match your app.
       */
      accent: 'accent-color',
      error: 'error-color',
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

    iconSize: 'icon-size',

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

        /**
         * The height of the column header.
         *
         * @alias column-header-height
         */
        columnHeaderHeight: columnHeaderHeightName,
      },

      HeaderCell: {
        /**
         * Background for header cells.
         *
         * Overriden in the `dark` theme.
         */
        background: 'header-cell-background',
        hoverBackground: 'header-cell-hover-background',
        padding: 'header-cell-padding',
        paddingX: 'header-cell-padding-x',
        paddingY: 'header-cell-padding-y',
        iconSize: 'header-cell-icon-size',
        menuIconLineWidth: 'header-cell-menu-icon-line-width',
        sortIconMargin: 'header-cell-sort-icon-margin',
        /**
         * The width of the area you can hover over in order to grab the column resize handle.
         * Defaults to `20px`.
         *
         * The purpose of this active area is to make it easier to grab the resize handle.
         */
        resizeHandleActiveAreaWidth: 'resize-handle-active-area-width',

        /**
         * The width of the colored column resize handle that is displayed on hover and on drag. Defaults to `2px`
         */
        resizeHandleWidth: 'resize-handle-width',

        /**
         * The color of the column resize handle - the resize handle is the visible indicator that you see
         * when hovering over the right-edge of a resizable column. Also visible on drag while doing a column resize.
         */
        resizeHandleHoverBackground: 'resize-handle-hover-background',

        /**
         * The color of the column resize handle when it has reached a min/max constraint.
         */
        resizeHandleConstrainedHoverBackground:
          'resize-handle-constrained-hover-background',

        filterOperatorPaddingX: 'filter-operator-padding-x',
        filterEditorPaddingX: 'filter-editor-padding-x',
        filterEditorMarginX: 'filter-editor-margin-x',
        filterOperatorPaddingY: 'filter-operator-padding-y',
        filterEditorPaddingY: 'filter-editor-padding-y',
        filterEditorMarginY: 'filter-editor-margin-y',
        filterEditorBackground: 'filter-editor-background',
        filterEditorBorder: 'filter-editor-border',
        filterEditorFocusBorderColor: 'filter-editor-focus-border-color',
        filterEditorBorderRadius: 'filter-editor-border-radius',
        filterEditorColor: 'filter-editor-color',
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
        reorderEffectDuration: 'column-reorder-effect-duration',
        pinnedBorder: 'pinned-cell-border',

        /**
         * Text color inside rows. Defaults to `currentColor`
         *
         * Overriden in `dark` theme.
         */
        color: 'cell-color',

        /**
         * The background for selected cells, when cell selection is enabled.
         *
         * If not specified, it will default to `var(--infinite-active-cell-background)`.
         */
        selectedBackground: 'selected-cell-background',

        selectedBackgroundDefault: 'selected-cell-background-default',

        /**
         * The opacity of the background color for the selected cell.
         *
         * If not specified, it will default to the value for `var(--infinite-active-cell-background-alpha)`
         */
        selectedBackgroundAlpha: 'selected-cell-background-alpha',

        /**
         * The opacity of the background color for the selected cell, when the table is unfocused.
         * If not specified, it will default to `var(--infinite-active-cell-background-alpha--table-unfocused)`.
         */
        selectedBackgroundAlphaWhenTableUnfocused:
          'selected-cell-background-alpha--table-unfocused',

        /**
         * The color for border of the selected cell (when cell selection is enabled).
         *  Defaults to `var(--infinite-active-cell-border-color)`.
         */
        selectedBorderColor: 'selected-cell-border-color',

        /**
         * The width of the border for the selected cell. Defaults to `var(--infinite-active-cell-border-width)`.
         */
        selectedBorderWidth: 'selected-cell-border-width',

        /**
         * The style of the border for the selected cell (eg: 'solid', 'dashed', 'dotted') - defaults to 'dashed'.
         * Defaults to `var(--infinite-active-cell-border-style)`.
         */
        selectedBorderStyle: 'selected-cell-border-style',

        /**
         * Specifies the border for the selected cell. Defaults to `var(--infinite-selected-cell-border-width) var(--infinite-selected-cell-border-style) var(--infinite-selected-cell-border-color)`.
         */
        selectedBorder: 'selected-cell-border',

        /**
         * The opacity of the background color for the active cell (when cell keyboard navigation is enabled).
         * Eg: 0.25
         *
         * If `activeBackground` is not explicitly defined (this is the default), the background color of the active cell
         * is the same as the border color (`activeBorderColor`), but with this modified opacity.
         *
         * If `activeBorderColor` is also not defined, the accent color will be used.
         *
         * This is applied when the component has focus.
         */
        activeBackgroundAlpha: 'active-cell-background-alpha',

        /**
         * Same as the above, but applied when the component does not have focus.
         */
        activeBackgroundAlphaWhenTableUnfocused:
          'active-cell-background-alpha--table-unfocused',

        /**
         * The background color of the active cell.
         *
         * If not specified, it will default to `activeBorderColor` with the opacity of `activeBackgroundAlpha`.
         * If `activeBorderColor` is not specified, it will default to the accent color, with the same opacity as mentioned.
         *
         * However, specify this to explicitly override the default.
         */
        activeBackground: 'active-cell-background',

        activeBackgroundDefault: 'active-cell-background-default',

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
      SelectionCheckBox: {
        marginInline: 'selection-checkbox-margin-inline',
      },
      Menu: {
        background: 'menu-background',
        color: 'menu-color',
        padding: 'menu-padding',
        cellPaddingVertical: 'menu-cell-padding-vertical',
        cellPaddingHorizontal: 'menu-cell-padding-horizontal',
        cellMarginVertical: 'menu-cell-margin-vertical',
        itemDisabledBackground: 'menu-item-disabled-background',
        itemActiveBackground: 'menu-item-active-background',
        itemActiveOpacity: 'menu-item-active-opacity',
        itemPressedOpacity: 'menu-item-pressed-opacity',
        itemPressedBackground: 'menu-item-pressed-background',
        itemDisabledOpacity: 'menu-item-disabled-opacity',
        borderRadius: 'menu-border-radius',
        shadowColor: 'menu-shadow-color',
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

        selectedBackground: 'row-selected-background',

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
        selectedHoverBackground: 'row-selected-hover-background',
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
  toCSSVarName,
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
  [ThemeVars.components.HeaderCell.filterOperatorPaddingX]:
    ThemeVars.spacing['1'],
  [ThemeVars.components.HeaderCell.filterEditorPaddingX]:
    ThemeVars.spacing['2'],
  [ThemeVars.components.HeaderCell.filterEditorMarginX]: ThemeVars.spacing['1'],
  [ThemeVars.components.HeaderCell.filterOperatorPaddingY]:
    ThemeVars.spacing['0'],
  [ThemeVars.components.HeaderCell.filterEditorPaddingY]:
    ThemeVars.spacing['0'],
  [ThemeVars.components.HeaderCell.filterEditorMarginY]: ThemeVars.spacing['1'],
  [ThemeVars.components.HeaderCell.resizeHandleActiveAreaWidth]: '16px',
  [ThemeVars.components.HeaderCell.resizeHandleWidth]: '2px',
  [ThemeVars.components.HeaderCell.resizeHandleHoverBackground]:
    ThemeVars.color.accent,
  [ThemeVars.components.HeaderCell.resizeHandleConstrainedHoverBackground]:
    ThemeVars.color.error,
  [ThemeVars.components.HeaderCell.background]: '#ededed',
  [ThemeVars.components.HeaderCell.filterEditorBackground]:
    ThemeVars.components.Row.background,
  [ThemeVars.components.HeaderCell
    .filterEditorBorder]: `${ThemeVars.components.Cell.border}`,
  [ThemeVars.components.HeaderCell.filterEditorFocusBorderColor]:
    ThemeVars.color.accent,
  [ThemeVars.components.HeaderCell.filterEditorColor]: `currentColor`,
  [ThemeVars.components.HeaderCell.filterEditorBorderRadius]:
    ThemeVars.borderRadius,
  [ThemeVars.components.HeaderCell.hoverBackground]: '#dfdfdf',
  [ThemeVars.components.HeaderCell.paddingX]: ThemeVars.spacing['3'],
  [ThemeVars.components.HeaderCell.paddingY]: ThemeVars.spacing['3'],
  [ThemeVars.components.HeaderCell
    .padding]: `${ThemeVars.components.HeaderCell.paddingY} ${ThemeVars.components.HeaderCell.paddingX} `,

  [ThemeVars.components.HeaderCell.iconSize]: '16px',
  [ThemeVars.components.HeaderCell.menuIconLineWidth]: '1px',
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

  [ThemeVars.components.Cell
    .pinnedBorder]: `${ThemeVars.components.Cell.borderWidth} solid #2a323d`,
  [ThemeVars.components.Cell.borderInvisible]: 'none',
  [ThemeVars.components.Cell.borderRadius]: ThemeVars.spacing[2],
  [ThemeVars.components.Cell.reorderEffectDuration]: '.2s',

  // [ThemeVars.components.Cell.selectedCellBorder]: '2px solid red',
  [ThemeVars.components.Cell.selectedBorderStyle]: 'solid',
  [ThemeVars.components.Cell.activeBorderStyle]: 'dashed',
  [ThemeVars.components.Cell.activeBorderWidth]: '1px',
  // [ThemeVars.components.Cell.activeBorderColor]: '#4d95d7',
  // [ThemeVars.components.Cell.activeBackground]: 'rgba(77, 149, 215, 0.25)',

  [ThemeVars.components.Cell.activeBackgroundAlpha]: '0.25',
  [ThemeVars.components.Cell.activeBackgroundAlphaWhenTableUnfocused]: '0.1',

  [ThemeVars.components.Cell.selectedBackgroundDefault]: fallbackVar(
    ThemeVars.components.Cell.selectedBackground,
    ThemeVars.components.Cell.activeBackground,
    `color-mix(in srgb, ${fallbackVar(
      ThemeVars.components.Cell.selectedBorderColor,
      ThemeVars.components.Cell.activeBorderColor,
      ThemeVars.components.Row.activeBorderColor,
      ThemeVars.color.accent,
    )}, transparent calc(100% - ${fallbackVar(
      ThemeVars.components.Cell.selectedBackgroundAlpha,
      ThemeVars.components.Cell.activeBackgroundAlpha,
      ThemeVars.components.Row.activeBackgroundAlpha,
    )} * 100%))`,
  ),

  [ThemeVars.components.Cell.activeBackgroundDefault]: fallbackVar(
    ThemeVars.components.Cell.activeBackground,
    `color-mix(in srgb, ${fallbackVar(
      ThemeVars.components.Cell.activeBorderColor,
      ThemeVars.color.accent,
    )}, transparent calc(100% - ${
      ThemeVars.components.Cell.activeBackgroundAlpha
    } * 100%))`,
  ),
};

const SelectionCheckBoxVars = {
  [ThemeVars.components.SelectionCheckBox
    .marginInline]: `${ThemeVars.spacing[2]}`,
};

const RowVars = {
  [ThemeVars.components.Row.background]: ThemeVars.background,
  [ThemeVars.components.Row.oddBackground]: '#f6f6f6',
  [ThemeVars.components.Row.selectedBackground]: '#d1e9ff',
  [ThemeVars.components.Row.selectedHoverBackground]: '#add8ff',
  [ThemeVars.components.Row.groupRowBackground]: '#cbc5c5',
  [ThemeVars.components.Row.groupRowColumnNesting]: '30px',
  [ThemeVars.components.Row.hoverBackground]: '#dbdbdb',
  [ThemeVars.components.Row.pointerEventsWhileScrolling]: 'auto',
};

const MenuVars = {
  [ThemeVars.components.Menu.background]: ThemeVars.background,
  [ThemeVars.components.Menu.color]: ThemeVars.components.Cell.color,
  [ThemeVars.components.Menu.padding]: ThemeVars.spacing[3],
  [ThemeVars.components.Menu.cellPaddingVertical]: ThemeVars.spacing[3],
  [ThemeVars.components.Menu.cellPaddingHorizontal]: ThemeVars.spacing[3],
  [ThemeVars.components.Menu.cellMarginVertical]: ThemeVars.spacing[0],
  [ThemeVars.components.Menu.itemDisabledBackground]:
    ThemeVars.components.Menu.background,
  [ThemeVars.components.Menu.itemDisabledOpacity]: 0.5,
  [ThemeVars.components.Menu.itemActiveBackground]:
    ThemeVars.components.Row.hoverBackground,
  [ThemeVars.components.Menu.itemPressedBackground]:
    ThemeVars.components.Row.hoverBackground,
  [ThemeVars.components.Menu.itemActiveOpacity]: 0.9,
  [ThemeVars.components.Menu.itemPressedOpacity]: 1,
  [ThemeVars.components.Menu.borderRadius]: ThemeVars.spacing[2],
  [ThemeVars.components.Menu.shadowColor]: `rgba(0,0,0,0.25)`,
};

const LightTheme = {
  [ThemeVars.iconSize]: '24px',
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
  [ThemeVars.color.accent]: '#0284c7',
  [ThemeVars.color.error]: '#ff0000',
  [ThemeVars.borderRadius]: ThemeVars.spacing[2],
  [ThemeVars.background]: 'white',
  [ThemeVars.minHeight]: '100px',

  ...SelectionCheckBoxVars,
  ...MenuVars,
  ...LoadMaskVars,
  ...HeaderCellVars,
  ...HeaderVars,
  ...CellVars,
  ...RowVars,
};

const DarkTheme = {
  [ThemeVars.iconSize]: '24px',
  [ThemeVars.background]: '#101419',
  [ThemeVars.components.Cell.border]: '1px solid #2a323d',
  [ThemeVars.components.Header.color]: '#c3c3c3',
  [ThemeVars.components.LoadMask.textBackground]: ThemeVars.background,
  [ThemeVars.components.LoadMask.color]: ThemeVars.components.Cell.color,
  [ThemeVars.components.HeaderCell.background]: '#1b2129',
  [ThemeVars.components.HeaderCell.hoverBackground]: '#222932',
  [ThemeVars.components.Header.background]:
    ThemeVars.components.HeaderCell.background,
  [ThemeVars.components.Row.hoverBackground]: '#3b4754',
  [ThemeVars.components.Row.selectedBackground]: '#0a2e4f',
  [ThemeVars.components.Row.selectedHoverBackground]: '#0b243a',
  [ThemeVars.components.Row.background]: ThemeVars.background,
  [ThemeVars.components.Row.oddBackground]: '#242a31',
  [ThemeVars.components.Cell.color]: '#c3c3c3',
  [ThemeVars.components.Menu.shadowColor]: `rgba(0,0,0,0.25)`,
  [ThemeVars.components.Menu.shadowColor]: `rgba(255,255,255,0.25)`,
  [ThemeVars.components.HeaderCell
    .filterEditorBorder]: `${ThemeVars.components.Cell.borderWidth} solid #646464`,
  [ThemeVars.components.HeaderCell.filterEditorBackground]:
    ThemeVars.components.Row.oddBackground,
};

DarkTheme[ThemeVars.components.Menu.background] =
  DarkTheme[ThemeVars.background];
DarkTheme[ThemeVars.components.Menu.color] =
  DarkTheme[ThemeVars.components.Cell.color];
DarkTheme[ThemeVars.components.Menu.itemDisabledBackground] =
  DarkTheme[ThemeVars.components.Menu.background];
DarkTheme[ThemeVars.components.Menu.itemActiveBackground] =
  DarkTheme[ThemeVars.components.Row.hoverBackground];
DarkTheme[ThemeVars.components.Menu.itemPressedBackground] =
  DarkTheme[ThemeVars.components.Row.hoverBackground];

globalStyle(':root', {
  //@ts-ignore
  vars: LightTheme,
  '@media': {
    '(prefers-color-scheme: dark)': {
      vars: DarkTheme,
    },
  },
});

globalStyle('.light, .infinite-light, .light:root, .infinite-light:root', {
  //@ts-ignore
  vars: LightTheme,
});
globalStyle('.dark, .infinite-dark', {
  vars: DarkTheme,
});
