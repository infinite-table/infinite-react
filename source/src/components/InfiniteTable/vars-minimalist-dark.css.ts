import { MinimalistLightVars } from './vars-minimalist-light.css';
import { ThemeVars } from './vars.css';

const borderColor = '#2D3748'; // chakra gray 700

export const MinimalistDarkVars = {
  ...MinimalistLightVars,
  [ThemeVars.themeMode]: 'dark',
  [ThemeVars.background]: '#1a1f2b',
  [ThemeVars.components.Cell.borderTop]: `1px solid ${borderColor}`,
  [ThemeVars.components.Menu.separatorColor]: borderColor,
  [ThemeVars.color.color]: '#EDF2F7',
};
