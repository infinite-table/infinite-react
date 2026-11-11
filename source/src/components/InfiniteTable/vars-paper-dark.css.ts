import { PaperLightVars } from './vars-paper-light.css';
import { ThemeVars } from './vars.css';

const PaperDarkPalette = {
  background: '#191919',
  surface: '#202020',
  hover: '#242424',
  divider: '#2b2b2b',
  text: '#e6e6e3',
  textMuted: '#9b9a96',
  accent: '#6b9cf5',
  up: '#3ccf8e',
  down: '#f2667f',
};

const palette = PaperDarkPalette;

export const PaperDarkVars = {
  ...PaperLightVars,
  [ThemeVars.themeMode]: 'dark',

  [ThemeVars.background]: palette.background,
  [ThemeVars.color.color]: palette.text,
  [ThemeVars.color.accent]: palette.accent,
  [ThemeVars.color.success]: palette.up,
  [ThemeVars.color.error]: palette.down,
  [ThemeVars.components.Cell
    .flashingUpBackground]: `color-mix(in srgb, ${palette.up} 22%, transparent)`,
  [ThemeVars.components.Cell
    .flashingDownBackground]: `color-mix(in srgb, ${palette.down} 22%, transparent)`,
  [ThemeVars.components.Cell
    .flashingBackground]: `color-mix(in srgb, ${palette.accent} 20%, transparent)`,

  [ThemeVars.components.Cell.borderColor]: palette.divider,
  [ThemeVars.components.Cell.border]: `1px solid ${palette.divider}`,
  [ThemeVars.components.Cell.borderTop]: `1px solid ${palette.divider}`,
  [ThemeVars.components.Cell.pinnedBorder]: `1px solid ${palette.divider}`,
  [ThemeVars.components.Cell.activeBorderColor]: palette.accent,

  [ThemeVars.components.Header.color]: palette.textMuted,
  [ThemeVars.components.Header.background]: palette.background,
  [ThemeVars.components.HeaderCell.background]: palette.background,
  [ThemeVars.components.HeaderCell.hoverBackground]: palette.hover,
  [ThemeVars.components.HeaderCell.filterEditorBackground]: palette.surface,
  [ThemeVars.components.HeaderCell
    .filterEditorBorder]: `1px solid ${palette.divider}`,

  [ThemeVars.components.Row.background]: palette.background,
  [ThemeVars.components.Row.oddBackground]: palette.background,
  [ThemeVars.components.Row.hoverBackground]: palette.hover,
  [ThemeVars.components.Row.selectedBackground]: palette.background,
  [ThemeVars.components.Row.selectedHoverBackground]: palette.hover,
  [ThemeVars.components.Row.groupRowBackground]: palette.surface,
  [ThemeVars.components.Row.disabledBackground]: palette.background,
  [ThemeVars.components.Row.oddDisabledBackground]: palette.background,

  [ThemeVars.components.ExpandCollapseIcon.color]: palette.textMuted,

  [ThemeVars.components.Menu.background]: palette.surface,
  [ThemeVars.components.Menu.separatorColor]: palette.divider,
  [ThemeVars.components.Menu.shadowColor]: 'rgba(0, 0, 0, 0.5)',
  [ThemeVars.components.Menu.itemActiveBackground]: palette.hover,
  [ThemeVars.components.Menu.itemPressedBackground]: palette.divider,

  [ThemeVars.components.LoadMask.textBackground]: palette.surface,
  [ThemeVars.components.GroupingToolbar.background]: palette.background,
  [ThemeVars.components.RowDetail.background]: palette.surface,
};
