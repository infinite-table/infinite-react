import { ThemeVars } from './vars.css';
import { CommonThemeVars } from './vars-common.css';
import { DerivedVars } from './vars-derived.css';
import { getDefaultThemeValue } from './vars-default-resolved.css';
const borderColor = '#EDF2F7'; // chakra gray 100

export const MinimalistLightVars = {
  // so what is made from the colors of this theme is resolved with them,
  // and not with the colors the default theme has for the mode of the OS
  ...DerivedVars,
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
  // this theme has no cell borders (the border width is 0), but it keeps
  // the borders the default theme makes from the cell border:
  // the header cell border, the pinned columns border and the filter editors
  [ThemeVars.components.Cell.border]: getDefaultThemeValue(
    ThemeVars.components.Cell.border,
    'light',
  ),
  [ThemeVars.components.HeaderCell.filterEditorBorder]: getDefaultThemeValue(
    ThemeVars.components.HeaderCell.filterEditorBorder,
    'light',
  ),
  [ThemeVars.components.ActiveCellIndicator.inset]: '2px 1px 1px 1px',
};
