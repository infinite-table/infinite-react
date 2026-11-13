import { ShadcnLightVars } from './vars-shadcn-light.css';
import { ThemeVars } from './vars.css';

const borderColor = `var(--border)`;
const muted = `var(--muted)`;

/**
 * Most of the theme is made of shadcn/ui variables, which already have their
 * dark values when the page is in dark mode. They are all declared again for
 * the dark mode, so they are resolved on the element that is in dark mode.
 *
 * What is added here are the dark values of the variables the theme does not
 * take from shadcn/ui in light mode (see vars-shadcn-light.css.ts).
 */
export const ShadcnDarkVars = {
  ...ShadcnLightVars,
  [ThemeVars.themeMode]: 'dark',

  [ThemeVars.components.Cell.borderColor]: borderColor,
  [ThemeVars.components.Cell.border]: `1px solid ${borderColor}`,
  [ThemeVars.components.Cell.pinnedBorder]: `1px solid ${borderColor}`,
  [ThemeVars.components.HeaderCell
    .filterEditorBorder]: `1px solid var(--input)`,

  [ThemeVars.components.GroupingToolbar.rejectBackground]:
    ThemeVars.components.GroupingToolbar.background,
  [ThemeVars.components.GroupingToolbarItem.background]:
    ThemeVars.components.GroupingToolbar.background,

  [ThemeVars.components.Menu.shadowColor]: `rgba(0,0,0,0.6)`,

  [ThemeVars.components.Row
    .disabledBackground]: `color-mix(in oklch, ${muted} 60%, ${ThemeVars.background})`,
  [ThemeVars.components.Row
    .oddDisabledBackground]: `color-mix(in oklch, ${muted} 35%, ${ThemeVars.background})`,
  [ThemeVars.components.Row.selectedDisabledBackground]:
    ThemeVars.components.Row.selectedBackground,
  [ThemeVars.components.RowDetail.background]: muted,
};
