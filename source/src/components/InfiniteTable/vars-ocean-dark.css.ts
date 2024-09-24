import { OceanLightVars } from './vars-ocean-light.css';
import { ThemeVars } from './vars.css';

const borderColor = `color-mix(in srgb, transparent, ${ThemeVars.components.Cell.color} 10%)`; // chakra gray 700

export const OceanDarkVars = {
  ...OceanLightVars,
  [ThemeVars.background]: '#032c4f',

  [ThemeVars.components.Menu.separatorColor]: borderColor,
  [ThemeVars.components.Menu.background]:
    ThemeVars.components.HeaderCell.background,
  [ThemeVars.components.Menu.itemPressedBackground]: ThemeVars.background,

  [ThemeVars.color.color]: '#96a0aa',
  [ThemeVars.components.Cell.color]: ThemeVars.color.color,
  [ThemeVars.components.Cell.borderTop]: `1px solid ${borderColor}`,
  [ThemeVars.components.HeaderCell.background]: '#04233d',
  [ThemeVars.components.HeaderCell.hoverBackground]: '#021f35',
  [ThemeVars.components.Row.background]: ThemeVars.background,

  [ThemeVars.components.Row
    .oddBackground]: `color-mix(in srgb, ${ThemeVars.components.Row.background}, white 2%)`,
  [ThemeVars.components.Row.hoverBackground]:
    ThemeVars.components.HeaderCell.background,
  [ThemeVars.components.Row.selectedBackground]:
    ThemeVars.components.HeaderCell.hoverBackground,
  [ThemeVars.components.Row
    .selectedHoverBackground]: `color-mix(in srgb, ${ThemeVars.components.Row.selectedBackground}, white 2%)`,
};
