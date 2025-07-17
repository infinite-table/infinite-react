import { createGlobalThemeContract } from '@vanilla-extract/css';
import { toCSSVarName } from './utils/toCSSVarName';

export const columnHeaderHeightName = 'column-header-height';

export const CSS_LOADED_VALUE = 'true';

export const ThemeVars = createGlobalThemeContract(
  {
    loaded: 'loaded',
    themeName: 'theme-name',
    themeMode: 'theme-mode',
    color: {
      /**
       * Brand-specific accent color. This probably needs override to match your app.
       */
      accent: 'accent-color',
      success: 'success-color',
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

    runtime: {
      bodyWidth: 'runtime-body-content-width',
      totalVisibleColumnsWidthValue: 'runtime-total-visible-columns-width',
      totalVisibleColumnsWidthVar: 'runtime-total-visible-columns-width-var',
      visibleColumnsCount: 'runtime-visible-columns-count',
      browserScrollbarWidth: 'runtime-browser-scrollbar-width',
    },

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
        border: 'header-cell-border',
        padding: 'header-cell-padding',
        paddingX: 'header-cell-padding-x',
        paddingY: 'header-cell-padding-y',
        iconSize: 'header-cell-icon-size',
        menuIconLineWidth: 'header-cell-menu-icon-line-width',
        sortIconMargin: 'header-cell-sort-icon-margin',
        borderRight: 'header-cell-border-right',
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
      ActiveCellIndicator: {
        inset: 'active-cell-indicator-inset',
      },
      Cell: {
        flashingDuration: 'flashing-duration',
        flashingAnimationName: 'flashing-animation-name',
        flashingOverlayZIndex: 'flashing-overlay-z-index',
        flashingBackground: 'flashing-background',
        flashingUpBackground: 'flashing-up-background',
        flashingDownBackground: 'flashing-down-background',
        padding: 'cell-padding',
        borderWidth: 'cell-border-width',
        /**
         * Specifies the border for cells.
         *
         * Overriden in the `dark` theme - eg: `1px solid #2a323d`
         */
        border: 'cell-border',
        borderLeft: 'cell-border-left',
        borderRight: 'cell-border-right',
        borderTop: 'cell-border-top',
        borderInvisible: 'cell-border-invisible',
        borderRadius: 'cell-border-radius',
        reorderEffectDuration: 'column-reorder-effect-duration',
        pinnedBorder: 'pinned-cell-border',
        horizontalLayoutColumnReorderDisabledPageOpacity:
          'horizontal-layout-column-reorder-disabled-page-opacity',

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
      ExpandCollapseIcon: {
        color: 'expand-collapse-icon-color',
      },
      Menu: {
        background: 'menu-background',
        color: 'menu-color',
        separatorColor: 'menu-separator-color',
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
      RowDetail: {
        background: 'rowdetail-background',
        padding: 'rowdetail-padding',
        gridHeight: 'rowdetail-grid-height',
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

        /*
         * Background color for disabled rows. For setting the background of disabled odd rows, use [`--infinite-row-odd-disabled-background`](#row-odd-disabled-background).
         *
         */
        disabledBackground: 'row-disabled-background',
        /**
         * Background color for disabled rows. For setting the background of disabled even rows, use [`--infinite-row-disabled-background`](#row-disabled-background).
         */
        oddDisabledBackground: 'row-odd-disabled-background',

        selectedBackground: 'row-selected-background',

        /**
         * Opacity for disabled rows. Defaults to 0.5
         */
        disabledOpacity: 'row-disabled-opacity',

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
        selectedDisabledBackground: 'row-selected-disabled-background',
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
