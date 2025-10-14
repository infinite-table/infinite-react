import { ThemeVars } from './vars.css';

export const CommonThemeVars = {
  [ThemeVars.components.HeaderCell.borderRight]:
    ThemeVars.components.Cell.border,
  [ThemeVars.components.HeaderCell.border]: ThemeVars.components.Cell.border,
  [ThemeVars.components.HeaderCell.filterEditorBackground]:
    ThemeVars.components.Row.oddBackground,

  [ThemeVars.components.Header.color]: ThemeVars.color.color,
  [ThemeVars.components.Header.background]:
    ThemeVars.components.HeaderCell.hoverBackground,

  [ThemeVars.components.Cell.color]: ThemeVars.color.color,
  [ThemeVars.components.Cell.flashingBackground]: ThemeVars.color.accent,
  [ThemeVars.components.Cell.flashingUpBackground]: ThemeVars.color.success,
  [ThemeVars.components.Cell.flashingDownBackground]: ThemeVars.color.error,

  [ThemeVars.components.Menu.color]: ThemeVars.components.Cell.color,
  [ThemeVars.components.Menu.background]: ThemeVars.background,
  [ThemeVars.components.Menu.itemDisabledBackground]:
    ThemeVars.components.Menu.background,
  [ThemeVars.components.Menu.itemActiveBackground]:
    ThemeVars.components.Row.hoverBackground,
  [ThemeVars.components.Menu.itemPressedBackground]:
    ThemeVars.components.Row.hoverBackground,

  [ThemeVars.components.LoadMask.textBackground]: ThemeVars.background,
  [ThemeVars.components.LoadMask.color]: ThemeVars.components.Cell.color,

  [ThemeVars.components.Row.background]: ThemeVars.background,
  [ThemeVars.components.GroupingToolbar.background]: ThemeVars.background,
};
