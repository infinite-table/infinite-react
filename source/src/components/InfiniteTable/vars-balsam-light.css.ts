import { OceanLightVars } from './vars-ocean-light.css';
import { ThemeVars } from './vars.css';

const borderColor = `#bdc3c7`;

export const BalsamLightVars = {
  ...OceanLightVars,
  [ThemeVars.components.Row
    .selectedBackground]: `color-mix(in srgb, transparent, ${ThemeVars.color.accent} 20%);`,

  [ThemeVars.background]: 'white',

  [ThemeVars.components.Menu.separatorColor]: borderColor,
  [ThemeVars.components.Menu.background]: ThemeVars.background,
  [ThemeVars.components.Menu
    .itemDisabledBackground]: `color-mix(in srgb, ${ThemeVars.components.Menu.background}, white 20%)`,
  [ThemeVars.components.Menu
    .itemPressedBackground]: `color-mix(in srgb, ${ThemeVars.components.HeaderCell.background}, white 4%)`,

  [ThemeVars.color.color]: 'black',
  [ThemeVars.components.Cell.color]: ThemeVars.color.color,
  [ThemeVars.components.Cell.borderTop]: `1px solid rgba(189, 195, 199, .58)`,
  [ThemeVars.components.HeaderCell.background]: '#f5f7f7',
  [ThemeVars.components.HeaderCell
    .hoverBackground]: `color-mix(in srgb, ${ThemeVars.components.HeaderCell.background}, white 2%)`,
  [ThemeVars.components.Row.background]: ThemeVars.background,

  [ThemeVars.components.Row.oddBackground]: `#fcfdfe`,
  [ThemeVars.components.Row.hoverBackground]: '#ecf0f1',

  [ThemeVars.components.Row
    .selectedHoverBackground]: `color-mix(in srgb, ${ThemeVars.components.Row.selectedBackground}, white 2%)`,
};
