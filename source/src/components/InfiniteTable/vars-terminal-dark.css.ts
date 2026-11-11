import { CommonThemeVars } from './vars-common.css';
import { DerivedVars } from './vars-derived.css';
import { ThemeVars } from './vars.css';

// a trading desk / terminal look: dense, monospace, hairline dividers
export const TERMINAL_FONT_FAMILY = `ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace`;

const palette = {
  background: '#0b0e13',
  surface: '#10151c',
  surfaceRaised: '#151b24',
  divider: '#1a212b',
  dividerStrong: '#273140',
  text: '#c9d1db',
  textMuted: '#7c8796',
  accent: '#f5a524',
  up: '#1fd17b',
  down: '#ff4d5e',
};

export const TerminalDarkVars = {
  ...DerivedVars,
  ...CommonThemeVars,
  [ThemeVars.themeName]: 'terminal',
  [ThemeVars.themeMode]: 'dark',

  [ThemeVars.fontFamily]: TERMINAL_FONT_FAMILY,
  [ThemeVars.baseFontSize]: '12px',
  [ThemeVars.rowHeight]: '26px',
  [ThemeVars.components.Header.columnHeaderHeight]: '28px',
  [ThemeVars.borderRadius]: '2px',

  [ThemeVars.background]: palette.background,
  [ThemeVars.color.color]: palette.text,
  [ThemeVars.color.accent]: palette.accent,
  [ThemeVars.color.success]: palette.up,
  [ThemeVars.color.error]: palette.down,

  [ThemeVars.components.Cell.paddingX]: '8px',
  [ThemeVars.components.Cell.paddingY]: '2px',
  [ThemeVars.components.Cell.borderRadius]: '0',
  [ThemeVars.components.Cell.borderWidth]: '1px',
  [ThemeVars.components.Cell.borderColor]: palette.divider,
  [ThemeVars.components.Cell.border]: `1px solid ${palette.divider}`,
  [ThemeVars.components.Cell.borderTop]: `1px solid ${palette.divider}`,
  [ThemeVars.components.Cell.borderLeft]: 'none',
  [ThemeVars.components.Cell.borderRight]: `1px solid ${palette.divider}`,
  [ThemeVars.components.Cell.pinnedBorder]: `1px solid ${palette.dividerStrong}`,

  [ThemeVars.components.Cell.activeBorderColor]: palette.accent,
  [ThemeVars.components.Cell.activeBorderStyle]: 'solid',
  [ThemeVars.components.Cell.activeBackgroundAlpha]: '0.12',

  [ThemeVars.components.Cell
    .flashingUpBackground]: `color-mix(in srgb, ${palette.up} 32%, transparent)`,
  [ThemeVars.components.Cell
    .flashingDownBackground]: `color-mix(in srgb, ${palette.down} 32%, transparent)`,
  [ThemeVars.components.Cell
    .flashingBackground]: `color-mix(in srgb, ${palette.accent} 28%, transparent)`,

  [ThemeVars.components.Header.color]: palette.textMuted,
  [ThemeVars.components.HeaderCell.background]: palette.surface,
  [ThemeVars.components.HeaderCell.hoverBackground]: palette.surfaceRaised,
  [ThemeVars.components.Header.background]: palette.surface,
  [ThemeVars.components.HeaderCell.paddingX]: '8px',
  [ThemeVars.components.HeaderCell.paddingY]: '0px',
  [ThemeVars.components.HeaderCell.border]: `1px solid ${palette.divider}`,
  [ThemeVars.components.HeaderCell.borderRight]: `1px solid ${palette.divider}`,
  [ThemeVars.components.HeaderCell.iconSize]: '14px',
  [ThemeVars.components.HeaderCell.filterEditorBackground]: palette.background,
  [ThemeVars.components.HeaderCell
    .filterEditorBorder]: `1px solid ${palette.dividerStrong}`,
  [ThemeVars.components.HeaderCell.filterEditorBorderRadius]: '2px',

  [ThemeVars.components.Row.background]: palette.background,
  [ThemeVars.components.Row.oddBackground]: palette.background,
  [ThemeVars.components.Row.hoverBackground]: palette.surfaceRaised,
  [ThemeVars.components.Row
    .selectedBackground]: `color-mix(in srgb, ${palette.accent} 14%, ${palette.background})`,
  [ThemeVars.components.Row
    .selectedHoverBackground]: `color-mix(in srgb, ${palette.accent} 20%, ${palette.background})`,
  [ThemeVars.components.Row.groupRowBackground]: palette.surface,
  [ThemeVars.components.Row.disabledBackground]: palette.background,
  [ThemeVars.components.Row.oddDisabledBackground]: palette.background,

  [ThemeVars.components.ExpandCollapseIcon.color]: palette.textMuted,

  // menus as dense as the rows
  [ThemeVars.components.Menu.padding]: '4px',
  [ThemeVars.components.Menu.cellPaddingVertical]: '5px',
  [ThemeVars.components.Menu.cellPaddingHorizontal]: '10px',
  [ThemeVars.components.Menu.background]: palette.surfaceRaised,
  [ThemeVars.components.Menu.separatorColor]: palette.dividerStrong,
  [ThemeVars.components.Menu.borderRadius]: '2px',
  [ThemeVars.components.Menu.shadowColor]: 'rgba(0, 0, 0, 0.6)',
  [ThemeVars.components.Menu
    .itemActiveBackground]: `color-mix(in srgb, ${palette.accent} 16%, ${palette.surfaceRaised})`,
  [ThemeVars.components.Menu
    .itemPressedBackground]: `color-mix(in srgb, ${palette.accent} 24%, ${palette.surfaceRaised})`,

  [ThemeVars.components.LoadMask.textBackground]: palette.surfaceRaised,
  [ThemeVars.components.GroupingToolbar.background]: palette.surface,
  [ThemeVars.components.RowDetail.background]: palette.surface,
};
