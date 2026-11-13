import { CommonThemeVars } from './vars-common.css';
import { LightVars } from './vars-default-light.css';
import { ThemeVars } from './vars.css';

const borderColor = `var(--border)`;

/**
 * The value a variable has in the light mode of the default theme, with the
 * variables it references replaced by their own values.
 */
function getDefaultLightValue(cssVar: string): string {
  const value = `${LightVars[cssVar as keyof typeof LightVars]}`;

  return value.replace(/var\(--[\w-]+\)/g, (reference) =>
    reference in LightVars ? getDefaultLightValue(reference) : reference,
  );
}

/**
 * The default theme gives these variables one value for the light mode and
 * another one for the dark mode, and chooses between them by the color scheme
 * of the OS. This theme does not set them to shadcn/ui colors, so it has
 * to set them itself: its mode is the mode of the page (the `dark` className
 * of shadcn/ui), whatever the OS says.
 */
const MODE_DEPENDENT_VARS = [
  ThemeVars.components.Cell.border,
  ThemeVars.components.Cell.pinnedBorder,
  ThemeVars.components.HeaderCell.filterEditorBorder,
  ThemeVars.components.GroupingToolbar.color,
  ThemeVars.components.GroupingToolbar.activeBackground,
  ThemeVars.components.GroupingToolbar.rejectBackground,
  ThemeVars.components.GroupingToolbarItem.background,
  ThemeVars.components.GroupingToolbarItem.border,
  ThemeVars.components.GroupingToolbarItem.activeBackground,
  ThemeVars.components.Menu.shadowColor,
  ThemeVars.components.Row.disabledBackground,
  ThemeVars.components.Row.oddDisabledBackground,
  ThemeVars.components.Row.selectedDisabledBackground,
  ThemeVars.components.RowDetail.background,
];

// in light mode they keep the values they always had
const DefaultLightModeVars = Object.fromEntries(
  MODE_DEPENDENT_VARS.map((cssVar) => [cssVar, getDefaultLightValue(cssVar)]),
) as Record<string, string>;

/**
 * The default theme makes these from its accent color. They are declared
 * again here, as they are in the default theme, so they are made from the
 * accent of this theme (the `--primary` color of shadcn/ui)
 * and not from the blue of the default theme.
 */
const AccentVars = Object.fromEntries(
  [
    ThemeVars.focusOutline,
    ThemeVars.components.ExpandCollapseIcon.color,
    ThemeVars.components.HeaderCell.filterEditorFocusBorderColor,
    ThemeVars.components.GroupingToolbarItem.activeBorder,
    ThemeVars.components.Cell.selectedBackgroundDefault,
  ].map((cssVar) => [cssVar, LightVars[cssVar as keyof typeof LightVars]]),
) as Record<string, string>;

export const ShadcnLightVars = {
  ...DefaultLightModeVars,
  ...AccentVars,
  ...CommonThemeVars,
  [ThemeVars.themeName]: 'shadcn',
  [ThemeVars.themeMode]: 'light',

  [ThemeVars.background]: `var(--background)`,
  [ThemeVars.color.color]: 'var(--foreground)',
  [ThemeVars.color.success]: 'var(--primary)',
  [ThemeVars.color.error]: 'var(--destructive)',
  [ThemeVars.color.accent]: 'var(--primary)',

  [ThemeVars.components.Header.color]: 'var(--muted-foreground)',
  [ThemeVars.components.HeaderCell.border]: 'none',
  [ThemeVars.components.HeaderCell.borderRight]: 'none',
  [ThemeVars.components.HeaderCell.background]: 'transparent',
  [ThemeVars.components.HeaderCell.hoverBackground]:
    ThemeVars.components.HeaderCell.background,
  [ThemeVars.components.Header.background]: ThemeVars.background,
  [ThemeVars.components.HeaderCell.resizeHandleHoverBackground]:
    ThemeVars.color.color,
  [ThemeVars.components.Cell.borderTop]: `1px solid ${borderColor}`,
  [ThemeVars.components.ActiveCellIndicator.inset]: '2px 1px 1px 1px',
  [ThemeVars.components.Cell.activeBackgroundAlpha]: `0.1`,
  [ThemeVars.components.Cell.activeBorderColor]: `var(--primary)`,
  [ThemeVars.components.Cell
    .activeBackgroundDefault]: `color-mix(in oklch, var(--primary) 10%, transparent 90%)`,

  [ThemeVars.components.Cell.borderLeft]: 'none',
  [ThemeVars.components.Cell.borderRight]: 'none',
  [ThemeVars.components.Cell.borderWidth]: '0px',

  [ThemeVars.components.Row.background]: ThemeVars.background,
  [ThemeVars.components.Row.oddBackground]: ThemeVars.background,
  [ThemeVars.components.Row
    .hoverBackground]: `color-mix(in oklch, var(--muted) 50%, transparent 50%)`,
  [ThemeVars.components.Row.selectedBackground]: `var(--muted)`,
  [ThemeVars.components.Row.selectedHoverBackground]:
    ThemeVars.components.Row.selectedBackground,
  [ThemeVars.components.Menu.background]: ThemeVars.background,
  [ThemeVars.components.Menu.color]: `var(--popover-foreground)`,
  [ThemeVars.components.Menu.itemDisabledBackground]: 'transparent',
  [ThemeVars.components.Menu.itemDisabledOpacity]: `0.2`,
  [ThemeVars.components.Menu.itemPressedBackground]: `var(--accent)`,
};
