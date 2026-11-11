import { SheetLightVars } from './vars-sheet-light.css';
import { ThemeVars } from './vars.css';

const palette = {
  background: '#1b1d1c',
  gutter: '#262927',
  gutterHover: '#2f3330',
  grid: '#353937',
  gridStrong: '#4a4f4c',
  text: '#e2e5e3',
  textMuted: '#9aa29d',
  accent: '#3dbb7a',
  up: '#3dbb7a',
  down: '#f06464',
};

export const SheetDarkVars = {
  ...SheetLightVars,
  [ThemeVars.themeMode]: 'dark',

  [ThemeVars.background]: palette.background,
  [ThemeVars.color.color]: palette.text,
  [ThemeVars.color.accent]: palette.accent,
  [ThemeVars.color.success]: palette.up,
  [ThemeVars.color.error]: palette.down,
  [ThemeVars.components.Cell
    .flashingUpBackground]: `color-mix(in srgb, ${palette.up} 24%, transparent)`,
  [ThemeVars.components.Cell
    .flashingDownBackground]: `color-mix(in srgb, ${palette.down} 24%, transparent)`,
  [ThemeVars.components.Cell
    .flashingBackground]: `color-mix(in srgb, ${palette.accent} 20%, transparent)`,

  [ThemeVars.components.Cell.borderColor]: palette.grid,
  [ThemeVars.components.Cell.border]: `1px solid ${palette.grid}`,
  [ThemeVars.components.Cell.borderTop]: `1px solid ${palette.grid}`,
  [ThemeVars.components.Cell.borderRight]: `1px solid ${palette.grid}`,
  [ThemeVars.components.Cell.pinnedBorder]: `1px solid ${palette.gridStrong}`,
  [ThemeVars.components.Cell.activeBorderColor]: palette.accent,
  [ThemeVars.components.Cell.selectedBorderColor]: palette.accent,
  [ThemeVars.components.Cell
    .selectedBackground]: `color-mix(in srgb, ${palette.accent} 14%, transparent)`,

  [ThemeVars.components.Header.color]: palette.textMuted,
  [ThemeVars.components.Header.background]: palette.gutter,
  [ThemeVars.components.HeaderCell.background]: palette.gutter,
  [ThemeVars.components.HeaderCell.hoverBackground]: palette.gutterHover,
  [ThemeVars.components.HeaderCell.border]: `1px solid ${palette.gridStrong}`,
  [ThemeVars.components.HeaderCell.borderRight]: `1px solid ${palette.grid}`,
  [ThemeVars.components.HeaderCell.filterEditorBackground]: palette.background,
  [ThemeVars.components.HeaderCell
    .filterEditorBorder]: `1px solid ${palette.grid}`,

  [ThemeVars.components.Row.background]: palette.background,
  [ThemeVars.components.Row.oddBackground]: palette.background,
  [ThemeVars.components.Row
    .hoverBackground]: `color-mix(in srgb, ${palette.accent} 6%, ${palette.background})`,
  [ThemeVars.components.Row
    .selectedBackground]: `color-mix(in srgb, ${palette.accent} 18%, ${palette.background})`,
  [ThemeVars.components.Row
    .selectedHoverBackground]: `color-mix(in srgb, ${palette.accent} 24%, ${palette.background})`,
  [ThemeVars.components.Row.groupRowBackground]: palette.gutter,
  [ThemeVars.components.Row.disabledBackground]: palette.background,
  [ThemeVars.components.Row.oddDisabledBackground]: palette.background,

  [ThemeVars.components.ExpandCollapseIcon.color]: palette.textMuted,

  [ThemeVars.components.Menu.background]: palette.gutter,
  [ThemeVars.components.Menu.separatorColor]: palette.grid,
  [ThemeVars.components.Menu.shadowColor]: 'rgba(0, 0, 0, 0.5)',

  [ThemeVars.components.LoadMask.textBackground]: palette.gutter,
  [ThemeVars.components.GroupingToolbar.background]: palette.gutter,
  [ThemeVars.components.RowDetail.background]: palette.gutter,
};
