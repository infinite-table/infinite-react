import { ThemeVars } from './vars.css';

export const CommonThemeVars = {
  [ThemeVars.components.Header.color]: ThemeVars.color.color,
  [ThemeVars.components.Cell.color]: ThemeVars.color.color,
  [ThemeVars.components.Header.background]:
    ThemeVars.components.HeaderCell.hoverBackground,
  [ThemeVars.components.Cell.flashingBackground]: ThemeVars.color.accent,
  [ThemeVars.components.Cell.flashingUpBackground]: ThemeVars.color.success,
  [ThemeVars.components.Cell.flashingDownBackground]: ThemeVars.color.error,
};
