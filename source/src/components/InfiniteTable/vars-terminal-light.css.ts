import { TerminalDarkVars } from './vars-terminal-dark.css';
import { ThemeVars } from './vars.css';

const palette = {
  background: '#fbfbf9',
  surface: '#f1f1ed',
  surfaceRaised: '#e9e9e4',
  divider: '#e3e3dd',
  dividerStrong: '#cfcfc7',
  text: '#1d2329',
  textMuted: '#6b7280',
  accent: '#b45f06',
  up: '#0f8a4a',
  down: '#d1243a',
};

export const TerminalLightVars = {
  ...TerminalDarkVars,
  [ThemeVars.themeMode]: 'light',

  [ThemeVars.background]: palette.background,
  [ThemeVars.color.color]: palette.text,
  [ThemeVars.color.accent]: palette.accent,
  [ThemeVars.color.success]: palette.up,
  [ThemeVars.color.error]: palette.down,

  [ThemeVars.components.Cell.borderColor]: palette.divider,
  [ThemeVars.components.Cell.border]: `1px solid ${palette.divider}`,
  [ThemeVars.components.Cell.borderTop]: `1px solid ${palette.divider}`,
  [ThemeVars.components.Cell.borderRight]: `1px solid ${palette.divider}`,
  [ThemeVars.components.Cell.pinnedBorder]: `1px solid ${palette.dividerStrong}`,
  [ThemeVars.components.Cell.activeBorderColor]: palette.accent,

  [ThemeVars.components.Cell
    .flashingUpBackground]: `color-mix(in srgb, ${palette.up} 22%, transparent)`,
  [ThemeVars.components.Cell
    .flashingDownBackground]: `color-mix(in srgb, ${palette.down} 22%, transparent)`,
  [ThemeVars.components.Cell
    .flashingBackground]: `color-mix(in srgb, ${palette.accent} 20%, transparent)`,

  [ThemeVars.components.Header.color]: palette.textMuted,
  [ThemeVars.components.HeaderCell.background]: palette.surface,
  [ThemeVars.components.HeaderCell.hoverBackground]: palette.surfaceRaised,
  [ThemeVars.components.Header.background]: palette.surface,
  [ThemeVars.components.HeaderCell.border]: `1px solid ${palette.divider}`,
  [ThemeVars.components.HeaderCell.borderRight]: `1px solid ${palette.divider}`,
  [ThemeVars.components.HeaderCell.filterEditorBackground]: palette.background,
  [ThemeVars.components.HeaderCell
    .filterEditorBorder]: `1px solid ${palette.dividerStrong}`,

  [ThemeVars.components.Row.background]: palette.background,
  [ThemeVars.components.Row.oddBackground]: palette.background,
  [ThemeVars.components.Row.hoverBackground]: palette.surface,
  [ThemeVars.components.Row
    .selectedBackground]: `color-mix(in srgb, ${palette.accent} 12%, ${palette.background})`,
  [ThemeVars.components.Row
    .selectedHoverBackground]: `color-mix(in srgb, ${palette.accent} 18%, ${palette.background})`,
  [ThemeVars.components.Row.groupRowBackground]: palette.surface,
  [ThemeVars.components.Row.disabledBackground]: palette.background,
  [ThemeVars.components.Row.oddDisabledBackground]: palette.background,

  [ThemeVars.components.ExpandCollapseIcon.color]: palette.textMuted,

  [ThemeVars.components.Menu.background]: palette.background,
  [ThemeVars.components.Menu.separatorColor]: palette.dividerStrong,
  [ThemeVars.components.Menu.shadowColor]: 'rgba(0, 0, 0, 0.18)',
  [ThemeVars.components.Menu
    .itemActiveBackground]: `color-mix(in srgb, ${palette.accent} 10%, ${palette.background})`,
  [ThemeVars.components.Menu
    .itemPressedBackground]: `color-mix(in srgb, ${palette.accent} 16%, ${palette.background})`,

  [ThemeVars.components.LoadMask.textBackground]: palette.background,
  [ThemeVars.components.GroupingToolbar.background]: palette.surface,
  [ThemeVars.components.RowDetail.background]: palette.surface,
};
