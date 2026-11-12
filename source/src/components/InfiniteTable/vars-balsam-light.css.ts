import { ThemeVars } from './vars.css';
import { CommonThemeVars } from './vars-common.css';
import { DerivedVars } from './vars-derived.css';
import { getDefaultThemeValue } from './vars-default-resolved.css';

const borderColor = `#bdc3c7`;

export const BalsamLightVars = {
  // so what is made from the colors of this theme is resolved with them,
  // and not with the colors the default theme has for the mode of the OS
  ...DerivedVars,
  ...CommonThemeVars,

  [ThemeVars.themeName]: 'balsam',
  [ThemeVars.themeMode]: 'light',

  // The dark mode sets its own border color, so the light mode has to set
  // one as well. Otherwise, with a dark OS, the dark one would still be there
  // under the `infinite-theme-mode--light` className.
  [ThemeVars.components.Cell.borderColor]: getDefaultThemeValue(
    ThemeVars.components.Cell.borderColor,
    'light',
  ),

  [ThemeVars.components.Row
    .selectedBackground]: `color-mix(in srgb, transparent, ${ThemeVars.color.accent} 20%);`,

  [ThemeVars.background]: 'white',

  [ThemeVars.components.Menu.separatorColor]: borderColor,

  [ThemeVars.components.Menu
    .itemDisabledBackground]: `color-mix(in srgb, ${ThemeVars.components.Menu.background}, white 20%)`,
  [ThemeVars.components.Menu
    .itemPressedBackground]: `color-mix(in srgb, ${ThemeVars.components.HeaderCell.background}, white 4%)`,

  [ThemeVars.color.color]: 'black',
  [ThemeVars.components.Cell.borderTop]: `1px solid rgba(189, 195, 199, .58)`,
  [ThemeVars.components.HeaderCell.background]: '#f5f7f7',
  [ThemeVars.components.HeaderCell
    .hoverBackground]: `color-mix(in srgb, ${ThemeVars.components.HeaderCell.background}, white 2%)`,

  [ThemeVars.components.Row.oddBackground]: `#fcfdfe`,
  [ThemeVars.components.Row.hoverBackground]: '#ecf0f1',

  [ThemeVars.components.Row
    .selectedHoverBackground]: `color-mix(in srgb, ${ThemeVars.components.Row.selectedBackground}, white 2%)`,
};
