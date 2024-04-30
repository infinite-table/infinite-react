import { MinimalistLightVars } from './vars-minimalist-light.css';
import { ThemeVars } from './vars.css';

export const MinimalistDarkVars = {
  ...MinimalistLightVars,
  [ThemeVars.background]: '#1a1f2b',
  [ThemeVars.components.Cell.borderTop]: '1px solid #2D3748', // chakra gray 700
  [ThemeVars.color.color]: '#EDF2F7',
};
