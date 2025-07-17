import { CommonThemeVars } from './vars-common.css';
import { ThemeVars } from './vars.css';

const borderColor = `var(--border)`;
export const ShadcnLightVars = {
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
