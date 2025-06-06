import { CommonThemeVars } from './vars-common.css';
import { ThemeVars } from './vars.css';

export const DarkVars = {
  ...CommonThemeVars,
  [ThemeVars.themeMode]: 'dark',
  [ThemeVars.iconSize]: '24px',
  [ThemeVars.background]: '#101419',
  [ThemeVars.color.success]: '#008700',
  [ThemeVars.components.Cell.border]: '1px solid #2a323d',
  [ThemeVars.components.Header.color]: '#c3c3c3',
  [ThemeVars.components.HeaderCell.background]: '#1b2129',
  [ThemeVars.components.HeaderCell.hoverBackground]: '#222932',
  [ThemeVars.components.Header.background]:
    ThemeVars.components.HeaderCell.background,
  [ThemeVars.components.Row.hoverBackground]: '#3b4754',
  [ThemeVars.components.Row.selectedBackground]: '#0a2e4f',
  [ThemeVars.components.Row.selectedHoverBackground]: '#0b243a',
  [ThemeVars.components.Row.background]: ThemeVars.background,
  [ThemeVars.components.Row.oddBackground]: '#242a31',

  [ThemeVars.components.Row.disabledBackground]: '#292a2c',
  [ThemeVars.components.Row.oddDisabledBackground]: '#2d2e30',

  [ThemeVars.components.Cell.color]: '#c3c3c3',
  [ThemeVars.components.Menu.shadowColor]: `rgba(0,0,0,0.25)`,
  [ThemeVars.components.Menu.shadowColor]: `rgba(255,255,255,0.25)`,
  [ThemeVars.components.HeaderCell
    .filterEditorBorder]: `${ThemeVars.components.Cell.borderWidth} solid #646464`,
};
