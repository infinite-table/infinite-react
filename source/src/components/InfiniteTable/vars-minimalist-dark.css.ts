import { MinimalistLightVars } from './vars-minimalist-light.css';
import { ThemeVars } from './vars.css';

export const MinimalistDarkVars = {
  ...MinimalistLightVars,

  [ThemeVars.background]: '#1a1f2b',
  // [ThemeVars.components.Row.border]: '#1a1f2b',

  [ThemeVars.color.color]: '#EDF2F7', //--chakra-colors-gray-100
};
