import { OceanLightVars } from './vars-ocean-light.css';
import { getDefaultThemeValue } from './vars-default-resolved.css';
import { ThemeVars } from './vars.css';

const borderColor = `color-mix(in srgb, transparent, ${ThemeVars.components.Cell.color} 10%)`; // chakra gray 700

export const OceanDarkVars = {
  ...OceanLightVars,
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
  [ThemeVars.background]: '#032c4f',
  [ThemeVars.components.Menu.separatorColor]: borderColor,
  [ThemeVars.color.color]: '#96a0aa',
  [ThemeVars.color.success]: '#176417',
  [ThemeVars.color.error]: '#5e1414',
  [ThemeVars.components.Cell.borderTop]: `1px solid ${borderColor}`,
  [ThemeVars.components.HeaderCell.background]: '#04233d',
  [ThemeVars.components.HeaderCell.hoverBackground]: '#021f35',
  [ThemeVars.components.Row
    .oddBackground]: `color-mix(in srgb, ${ThemeVars.components.Row.background}, white 2%)`,
  [ThemeVars.components.Row
    .selectedHoverBackground]: `color-mix(in srgb, ${ThemeVars.components.Row.selectedBackground}, white 2%)`,
};
