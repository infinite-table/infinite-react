import { ThemeVars } from './vars.css';

export const DarkVars = {
  [ThemeVars.iconSize]: '24px',
  [ThemeVars.background]: '#101419',
  [ThemeVars.components.Cell.border]: '1px solid #2a323d',
  [ThemeVars.components.Header.color]: '#c3c3c3',
  [ThemeVars.components.LoadMask.textBackground]: ThemeVars.background,
  [ThemeVars.components.LoadMask.color]: ThemeVars.components.Cell.color,
  [ThemeVars.components.HeaderCell.background]: '#1b2129',
  [ThemeVars.components.HeaderCell.hoverBackground]: '#222932',
  [ThemeVars.components.Header.background]:
    ThemeVars.components.HeaderCell.background,
  [ThemeVars.components.Row.hoverBackground]: '#3b4754',
  [ThemeVars.components.Row.selectedBackground]: '#0a2e4f',
  [ThemeVars.components.Row.selectedHoverBackground]: '#0b243a',
  [ThemeVars.components.Row.background]: ThemeVars.background,
  [ThemeVars.components.Row.oddBackground]: '#242a31',
  [ThemeVars.components.Cell.color]: '#c3c3c3',
  [ThemeVars.components.Menu.shadowColor]: `rgba(0,0,0,0.25)`,
  [ThemeVars.components.Menu.shadowColor]: `rgba(255,255,255,0.25)`,
  [ThemeVars.components.HeaderCell
    .filterEditorBorder]: `${ThemeVars.components.Cell.borderWidth} solid #646464`,
  [ThemeVars.components.HeaderCell.filterEditorBackground]:
    ThemeVars.components.Row.oddBackground,
};

DarkVars[ThemeVars.components.Menu.background] = DarkVars[ThemeVars.background];
DarkVars[ThemeVars.components.Menu.color] =
  DarkVars[ThemeVars.components.Cell.color];
DarkVars[ThemeVars.components.Menu.itemDisabledBackground] =
  DarkVars[ThemeVars.components.Menu.background];
DarkVars[ThemeVars.components.Menu.itemActiveBackground] =
  DarkVars[ThemeVars.components.Row.hoverBackground];
DarkVars[ThemeVars.components.Menu.itemPressedBackground] =
  DarkVars[ThemeVars.components.Row.hoverBackground];
