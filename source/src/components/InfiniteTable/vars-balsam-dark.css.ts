import { BalsamLightVars } from './vars-balsam-light.css';
import { ThemeVars } from './vars.css';

const borderColor = `#5c5c5c`;

export const BalsamDarkVars = {
  ...BalsamLightVars,
  [ThemeVars.components.Cell.borderColor]: borderColor,
  [ThemeVars.themeMode]: 'dark',
  [ThemeVars.background]: '#2d3436',

  [ThemeVars.components.Menu.separatorColor]: borderColor,
  [ThemeVars.components.Menu.background]: ThemeVars.background,
  [ThemeVars.components.Menu
    .itemDisabledBackground]: `color-mix(in srgb, ${ThemeVars.components.Menu.background}, white 20%)`,
  [ThemeVars.components.Menu
    .itemPressedBackground]: `color-mix(in srgb, ${ThemeVars.components.HeaderCell.background}, white 4%)`,

  [ThemeVars.color.color]: '#f5f5f5',

  [ThemeVars.components.Cell
    .borderTop]: `1px solid ${ThemeVars.components.Cell.borderColor}`,
  [ThemeVars.components.HeaderCell.background]: '#1c1c1c',
  [ThemeVars.components.HeaderCell
    .hoverBackground]: `color-mix(in srgb, ${ThemeVars.components.HeaderCell.background}, white 2%)`,

  [ThemeVars.components.Row.oddBackground]: `#262c2e`,
  [ThemeVars.components.Row.hoverBackground]: '#3d4749',

  [ThemeVars.components.Row
    .selectedHoverBackground]: `color-mix(in srgb, ${ThemeVars.components.Row.selectedBackground}, white 2%)`,
};
