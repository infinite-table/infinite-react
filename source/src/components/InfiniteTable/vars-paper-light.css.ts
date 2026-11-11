import { CommonThemeVars } from './vars-common.css';
import { DerivedVars } from './vars-derived.css';
import { PaperIcons } from './vars-paper-icons.css';
import { ThemeVars } from './vars.css';

// borderless and airy: hairline row separators, rounded selection pills,
// a subtle hover and its own icon set
const PaperLightPalette = {
  background: '#ffffff',
  surface: '#f7f7f5',
  hover: '#f5f5f3',
  divider: '#efefed',
  text: '#2f3437',
  textMuted: '#7b7a76',
  accent: '#2f6fe0',
  up: '#1f9d63',
  down: '#d9455f',
};

const palette = PaperLightPalette;

export const PaperLightVars = {
  ...DerivedVars,
  ...CommonThemeVars,
  ...PaperIcons,
  [ThemeVars.themeName]: 'paper',
  [ThemeVars.themeMode]: 'light',

  [ThemeVars.baseFontSize]: '14px',
  [ThemeVars.rowHeight]: '42px',
  [ThemeVars.components.Header.columnHeaderHeight]: '40px',
  [ThemeVars.borderRadius]: '8px',

  [ThemeVars.background]: palette.background,
  [ThemeVars.color.color]: palette.text,
  [ThemeVars.color.accent]: palette.accent,
  [ThemeVars.color.success]: palette.up,
  [ThemeVars.color.error]: palette.down,
  [ThemeVars.components.Cell
    .flashingUpBackground]: `color-mix(in srgb, ${palette.up} 16%, transparent)`,
  [ThemeVars.components.Cell
    .flashingDownBackground]: `color-mix(in srgb, ${palette.down} 16%, transparent)`,
  [ThemeVars.components.Cell
    .flashingBackground]: `color-mix(in srgb, ${palette.accent} 14%, transparent)`,

  [ThemeVars.components.Cell.paddingX]: '12px',
  [ThemeVars.components.Cell.paddingY]: '4px',
  // straight hairlines - the selected rows are pills, painted separately
  [ThemeVars.components.Cell.borderRadius]: '0',
  [ThemeVars.components.Cell.borderWidth]: '0px',
  [ThemeVars.components.Cell.borderColor]: palette.divider,
  [ThemeVars.components.Cell.border]: `1px solid ${palette.divider}`,
  [ThemeVars.components.Cell.borderTop]: `1px solid ${palette.divider}`,
  [ThemeVars.components.Cell.borderLeft]: 'none',
  [ThemeVars.components.Cell.borderRight]: 'none',
  [ThemeVars.components.Cell.pinnedBorder]: `1px solid ${palette.divider}`,

  [ThemeVars.components.Cell.activeBorderColor]: palette.accent,
  [ThemeVars.components.Cell.activeBorderStyle]: 'solid',
  [ThemeVars.components.Cell.activeBorderWidth]: '1.5px',
  [ThemeVars.components.Cell.activeBackgroundAlpha]: '0.06',
  [ThemeVars.components.ActiveCellIndicator.inset]: '3px 2px',

  [ThemeVars.components.Header.color]: palette.textMuted,
  [ThemeVars.components.Header.background]: palette.background,
  [ThemeVars.components.HeaderCell.background]: palette.background,
  [ThemeVars.components.HeaderCell.hoverBackground]: palette.hover,
  [ThemeVars.components.HeaderCell.paddingX]: '12px',
  [ThemeVars.components.HeaderCell.paddingY]: '0px',
  [ThemeVars.components.HeaderCell.border]: 'none',
  [ThemeVars.components.HeaderCell.borderRight]: 'none',
  [ThemeVars.components.HeaderCell.iconSize]: '16px',
  [ThemeVars.components.HeaderCell.filterEditorBackground]: palette.surface,
  [ThemeVars.components.HeaderCell
    .filterEditorBorder]: `1px solid ${palette.divider}`,
  [ThemeVars.components.HeaderCell.filterEditorBorderRadius]: '6px',

  [ThemeVars.components.Row.background]: palette.background,
  [ThemeVars.components.Row.oddBackground]: palette.background,
  [ThemeVars.components.Row.hoverBackground]: palette.hover,
  // the selection is painted as a pill (see theme-paper.css.ts)
  [ThemeVars.components.Row.selectedBackground]: palette.background,
  [ThemeVars.components.Row.selectedHoverBackground]: palette.hover,
  [ThemeVars.components.Row.groupRowBackground]: palette.surface,
  [ThemeVars.components.Row.disabledBackground]: palette.background,
  [ThemeVars.components.Row.oddDisabledBackground]: palette.background,

  [ThemeVars.components.ExpandCollapseIcon.color]: palette.textMuted,

  [ThemeVars.components.Menu.background]: palette.background,
  [ThemeVars.components.Menu.separatorColor]: palette.divider,
  [ThemeVars.components.Menu.borderRadius]: '10px',
  [ThemeVars.components.Menu.shadowColor]: 'rgba(15, 15, 15, 0.12)',
  [ThemeVars.components.Menu.itemActiveBackground]: palette.hover,
  [ThemeVars.components.Menu.itemPressedBackground]: palette.surface,

  [ThemeVars.components.LoadMask.textBackground]: palette.background,
  [ThemeVars.components.GroupingToolbar.background]: palette.background,
  [ThemeVars.components.RowDetail.background]: palette.surface,
};
