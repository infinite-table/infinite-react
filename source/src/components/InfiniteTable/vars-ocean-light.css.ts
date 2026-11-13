import { CommonThemeVars } from './vars-common.css';
import { DerivedVars } from './vars-derived.css';
import { getDefaultThemeValue } from './vars-default-resolved.css';
import { ThemeVars } from './vars.css';
const borderColor = `color-mix(in srgb, transparent, ${ThemeVars.color.color} 10%)`;

export const OceanLightVars = {
  // so what is made from the colors of this theme is resolved with them,
  // and not with the colors the default theme has for the mode of the OS
  ...DerivedVars,
  ...CommonThemeVars,
  [ThemeVars.themeName]: 'ocean',
  [ThemeVars.themeMode]: 'light',
  [ThemeVars.color.accent]: '#8b5cf6',

  [ThemeVars.background]: '#d1e8fc',
  [ThemeVars.color.color]: '#04233d',
  [ThemeVars.color.success]: '#64ce64',
  [ThemeVars.color.error]: '#fc6565',

  [ThemeVars.components.HeaderCell.background]: '#7dd3fc', // tw sky
  [ThemeVars.components.HeaderCell.hoverBackground]: '#38bdf8',

  [ThemeVars.components.Header.color]: ThemeVars.color.color,
  [ThemeVars.components.Cell.color]: ThemeVars.color.color,
  [ThemeVars.components.Cell.borderTop]: `1px solid ${borderColor}`,
  [ThemeVars.components.HeaderCell
    .borderRight]: `1px solid color-mix(in srgb, transparent, ${ThemeVars.color.color} 40%)`,

  [ThemeVars.components.Cell.borderLeft]: 'none',
  [ThemeVars.components.Cell.borderRight]: 'none',
  [ThemeVars.components.Cell.borderWidth]: '0px',
  // this theme has no cell borders (the border width is 0), but it keeps
  // the borders the default theme makes from the cell border:
  // the header cell border, the pinned columns border and the filter editors
  [ThemeVars.components.Cell.border]: getDefaultThemeValue(
    ThemeVars.components.Cell.border,
    'light',
  ),
  [ThemeVars.components.HeaderCell.filterEditorBorder]: getDefaultThemeValue(
    ThemeVars.components.HeaderCell.filterEditorBorder,
    'light',
  ),
  [ThemeVars.components.ActiveCellIndicator.inset]: '2px 1px 1px 1px',

  [ThemeVars.components.Row
    .oddBackground]: `color-mix(in srgb, ${ThemeVars.components.Row.background}, white 20%)`,

  [ThemeVars.components.Row.hoverBackground]:
    ThemeVars.components.HeaderCell.background,
  [ThemeVars.components.Row.selectedBackground]:
    ThemeVars.components.HeaderCell.hoverBackground,
  [ThemeVars.components.Row
    .selectedHoverBackground]: `color-mix(in srgb, ${ThemeVars.components.Row.selectedBackground}, white 20%)`,
  [ThemeVars.components.Menu.separatorColor]: borderColor,
  [ThemeVars.components.Menu.background]:
    ThemeVars.components.HeaderCell.background,
  [ThemeVars.components.Menu.itemPressedBackground]: ThemeVars.background,
};
