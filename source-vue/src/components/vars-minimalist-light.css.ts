import { ThemeVars } from './vars.css';
import { CommonThemeVars } from './vars-common.css';
const borderColor = '#EDF2F7'; // chakra gray 100

export const MinimalistLightVars = {
  ...CommonThemeVars,
  [ThemeVars.themeName]: 'minimalist',
  [ThemeVars.themeMode]: 'light',
  [ThemeVars.background]: 'white',
  [ThemeVars.color.color]: '#2D3748', // chakra gray 700
  [ThemeVars.components.Row.background]: 'transparent',
  [ThemeVars.components.Row.oddBackground]: 'transparent',
  [ThemeVars.components.Menu.separatorColor]: borderColor,
  [ThemeVars.components.HeaderCell.border]: 'none',
  [ThemeVars.components.HeaderCell.borderRight]: 'none',
  [ThemeVars.components.Cell.borderTop]: `1px solid ${borderColor}`,
  [ThemeVars.components.Cell.borderRadius]: '0',
  [ThemeVars.components.Header.background]: 'none',
  [ThemeVars.components.HeaderCell.background]: 'none',
  [ThemeVars.components.HeaderCell.background]: 'none',
  [ThemeVars.components.Cell.borderLeft]: 'none',
  [ThemeVars.components.Cell.borderRight]: 'none',
  [ThemeVars.components.Cell.borderWidth]: '0px',
  [ThemeVars.components.ActiveCellIndicator.inset]: '2px 1px 1px 1px',
};
