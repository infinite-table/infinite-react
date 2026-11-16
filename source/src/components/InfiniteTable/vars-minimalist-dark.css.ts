import { MinimalistLightVars } from './vars-minimalist-light.css';
import { getDefaultThemeValue } from './vars-default-resolved.css';
import { ThemeVars } from './vars.css';

const borderColor = '#2D3748'; // chakra gray 700

export const MinimalistDarkVars = {
  ...MinimalistLightVars,
  [ThemeVars.themeMode]: 'dark',
  // this theme has no cell borders (the border width is 0), but it keeps
  // the borders the default theme makes from the cell border:
  // the header cell border, the pinned columns border and the filter editors
  [ThemeVars.components.Cell.border]: getDefaultThemeValue(
    ThemeVars.components.Cell.border,
    'dark',
  ),
  [ThemeVars.components.HeaderCell.filterEditorBorder]: getDefaultThemeValue(
    ThemeVars.components.HeaderCell.filterEditorBorder,
    'dark',
  ),
  [ThemeVars.background]: '#1a1f2b',
  [ThemeVars.components.Cell.borderTop]: `1px solid ${borderColor}`,
  [ThemeVars.components.Menu.separatorColor]: borderColor,
  [ThemeVars.color.color]: '#EDF2F7',
};
