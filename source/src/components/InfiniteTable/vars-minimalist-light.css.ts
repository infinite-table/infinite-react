import { globalStyle } from '@vanilla-extract/css';
import { ThemeVars } from './vars.css';

export const MinimalistLightVars = {
  [ThemeVars.background]: 'white',
  [ThemeVars.color.color]: '#2D3748', // chakra gray 700
  [ThemeVars.components.Row.background]: 'transparent',
  [ThemeVars.components.Row.oddBackground]: 'transparent',
  [ThemeVars.components.Cell.border]: '1px solid #2D3748',
  [ThemeVars.components.Cell.borderRadius]: 'none',
};

// globalStyle('.InfiniteColumnCell:not(.InfiniteColumnCell--first-row)', {
//   // borderTop: [ThemeVars.components.Cell.border],
//   // borderLeft: 'none',
//   // borderRight: 'none',
// });
