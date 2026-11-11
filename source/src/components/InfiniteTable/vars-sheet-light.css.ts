import { CommonThemeVars } from './vars-common.css';
import { DerivedVars } from './vars-derived.css';
import { ThemeVars } from './vars.css';

// a spreadsheet look: full gridlines, sharp corners, a gutter-like
// header, an active cell with a thick border and a fill handle
const palette = {
  background: '#ffffff',
  gutter: '#f3f4f3',
  gutterHover: '#e8eae8',
  grid: '#dadcda',
  gridStrong: '#b9bdb9',
  text: '#1f2421',
  textMuted: '#5b625d',
  accent: '#1a7f4b',
  up: '#1a7f4b',
  down: '#c62f2f',
};

export const SheetLightVars = {
  ...DerivedVars,
  ...CommonThemeVars,
  [ThemeVars.themeName]: 'sheet',
  [ThemeVars.themeMode]: 'light',

  [ThemeVars.baseFontSize]: '13px',
  [ThemeVars.rowHeight]: '26px',
  [ThemeVars.components.Header.columnHeaderHeight]: '26px',
  [ThemeVars.borderRadius]: '0',

  [ThemeVars.background]: palette.background,
  [ThemeVars.color.color]: palette.text,
  [ThemeVars.color.accent]: palette.accent,
  [ThemeVars.color.success]: palette.up,
  [ThemeVars.color.error]: palette.down,
  [ThemeVars.components.Cell
    .flashingUpBackground]: `color-mix(in srgb, ${palette.up} 18%, transparent)`,
  [ThemeVars.components.Cell
    .flashingDownBackground]: `color-mix(in srgb, ${palette.down} 18%, transparent)`,
  [ThemeVars.components.Cell
    .flashingBackground]: `color-mix(in srgb, ${palette.accent} 16%, transparent)`,

  [ThemeVars.components.Cell.paddingX]: '6px',
  [ThemeVars.components.Cell.paddingY]: '0px',
  [ThemeVars.components.Cell.borderRadius]: '0',
  [ThemeVars.components.Cell.borderWidth]: '1px',
  [ThemeVars.components.Cell.borderColor]: palette.grid,
  [ThemeVars.components.Cell.border]: `1px solid ${palette.grid}`,
  [ThemeVars.components.Cell.borderTop]: `1px solid ${palette.grid}`,
  [ThemeVars.components.Cell.borderLeft]: 'none',
  [ThemeVars.components.Cell.borderRight]: `1px solid ${palette.grid}`,
  [ThemeVars.components.Cell.pinnedBorder]: `1px solid ${palette.gridStrong}`,

  // the active cell: thick border, no fill
  [ThemeVars.components.Cell.activeBorderColor]: palette.accent,
  [ThemeVars.components.Cell.activeBorderStyle]: 'solid',
  [ThemeVars.components.Cell.activeBorderWidth]: '2px',
  [ThemeVars.components.Cell.activeBackground]: 'transparent',
  [ThemeVars.components.Cell.activeBackgroundDefault]: 'transparent',
  [ThemeVars.components.ActiveCellIndicator.inset]: '-1px',

  // selected cells (cell selection): a light fill and a border around the range
  [ThemeVars.components.Cell.selectedBorderColor]: palette.accent,
  [ThemeVars.components.Cell.selectedBorderStyle]: 'solid',
  [ThemeVars.components.Cell
    .selectedBackground]: `color-mix(in srgb, ${palette.accent} 10%, transparent)`,

  [ThemeVars.components.Header.color]: palette.textMuted,
  [ThemeVars.components.Header.background]: palette.gutter,
  [ThemeVars.components.HeaderCell.background]: palette.gutter,
  [ThemeVars.components.HeaderCell.hoverBackground]: palette.gutterHover,
  [ThemeVars.components.HeaderCell.paddingX]: '6px',
  [ThemeVars.components.HeaderCell.paddingY]: '0px',
  [ThemeVars.components.HeaderCell.border]: `1px solid ${palette.gridStrong}`,
  [ThemeVars.components.HeaderCell.borderRight]: `1px solid ${palette.grid}`,
  [ThemeVars.components.HeaderCell.iconSize]: '14px',
  [ThemeVars.components.HeaderCell.filterEditorBackground]: palette.background,
  [ThemeVars.components.HeaderCell
    .filterEditorBorder]: `1px solid ${palette.grid}`,
  [ThemeVars.components.HeaderCell.filterEditorBorderRadius]: '0',

  [ThemeVars.components.Row.background]: palette.background,
  [ThemeVars.components.Row.oddBackground]: palette.background,
  [ThemeVars.components.Row
    .hoverBackground]: `color-mix(in srgb, ${palette.accent} 4%, ${palette.background})`,
  [ThemeVars.components.Row
    .selectedBackground]: `color-mix(in srgb, ${palette.accent} 12%, ${palette.background})`,
  [ThemeVars.components.Row
    .selectedHoverBackground]: `color-mix(in srgb, ${palette.accent} 16%, ${palette.background})`,
  [ThemeVars.components.Row.groupRowBackground]: palette.gutter,
  [ThemeVars.components.Row.disabledBackground]: palette.background,
  [ThemeVars.components.Row.oddDisabledBackground]: palette.background,

  [ThemeVars.components.ExpandCollapseIcon.color]: palette.textMuted,

  [ThemeVars.components.Menu.background]: palette.background,
  [ThemeVars.components.Menu.separatorColor]: palette.grid,
  [ThemeVars.components.Menu.borderRadius]: '0',
  [ThemeVars.components.Menu.shadowColor]: 'rgba(0, 0, 0, 0.2)',

  [ThemeVars.components.LoadMask.textBackground]: palette.background,
  [ThemeVars.components.GroupingToolbar.background]: palette.gutter,
  [ThemeVars.components.RowDetail.background]: palette.gutter,
};
