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
         * The border color for the active row
         */
        activeBorderColor: 'active-row-border-color',

        activeBorderWidth: 'active-row-border-width',
        activeBorderStyle: 'active-row-border-style',

        activeBorder: 'active-row-border',

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
};

const RowVars = {
  [ThemeVars.components.Row.background]: ThemeVars.background,
  [ThemeVars.components.Row.oddBackground]: '#f6f6f6',
  [ThemeVars.components.Row.groupRowBackground]: '#cbc5c5',
  [ThemeVars.components.Row.groupRowColumnNesting]: '30px',
  [ThemeVars.components.Row.hoverBackground]: '#dbdbdb',
  [ThemeVars.components.Row.pointerEventsWhileScrolling]: 'auto',
  [ThemeVars.components.Row
    .activeBorder]: `${ThemeVars.components.Row.activeBorderWidth} ${ThemeVars.components.Row.activeBorderStyle} ${ThemeVars.components.Row.activeBorderColor}`,
  [ThemeVars.components.Row.activeBorderStyle]: 'dashed',
  [ThemeVars.components.Row.activeBorderWidth]: '1px',
  [ThemeVars.components.Row.activeBorderColor]: '#c6c6c6',
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
