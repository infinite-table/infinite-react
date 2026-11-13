/**
 * Theme + density registries for the hero.
 *
 * The hero only ever talks to these: the control bar renders them, the
 * scripted show cycles `SHOW_THEME_SEQUENCE`, and the wrapper of the grid
 * gets `themeClassName()` and `density.className`. Both are the library's own
 * classNames, with nothing hero-specific behind them.
 * (The theme CSS files themselves are imported in hero.css.)
 */

export type HeroColorMode = 'light' | 'dark';

export type HeroTheme = {
  id: string;
  label: string;
  /** Swatch shown in the control bar. */
  swatch: string;
  modes: readonly HeroColorMode[];
};

export const HERO_THEMES: readonly HeroTheme[] = [
  {
    id: 'default',
    label: 'Default',
    swatch: '#3b82f6',
    modes: ['light', 'dark'],
  },
  {
    id: 'terminal',
    label: 'Terminal',
    swatch: '#f5a524',
    modes: ['light', 'dark'],
  },
  { id: 'sheet', label: 'Sheet', swatch: '#3dbb7a', modes: ['light', 'dark'] },
  { id: 'paper', label: 'Paper', swatch: '#8b8e99', modes: ['light', 'dark'] },
];

export const DEFAULT_THEME_ID = 'default';

/** The order the scripted show walks through (ends back on the default). */
export const SHOW_THEME_SEQUENCE: readonly string[] = [
  'terminal',
  'sheet',
  'paper',
  'default',
];

export function getHeroTheme(id: string) {
  return HERO_THEMES.find((theme) => theme.id === id) ?? HERO_THEMES[0];
}

export function themeClassName(id: string, mode: HeroColorMode) {
  const theme = getHeroTheme(id);
  const safeMode = theme.modes.includes(mode) ? mode : theme.modes[0];
  return `infinite-theme-name--${theme.id} infinite-theme-mode--${safeMode}`;
}

export type HeroDensity = {
  id: 'compact' | 'comfortable' | 'spacious';
  label: string;
  /**
   * The library's density className. It scales the sizes of the current
   * theme: row and header height, paddings, menu spacing and the font size.
   */
  className: string;
};

export const HERO_DENSITIES: readonly HeroDensity[] = [
  {
    id: 'compact',
    label: 'Compact',
    className: 'infinite-density--compact',
  },
  {
    id: 'comfortable',
    label: 'Comfortable',
    className: 'infinite-density--comfortable',
  },
  {
    id: 'spacious',
    label: 'Spacious',
    className: 'infinite-density--spacious',
  },
];

export const DEFAULT_DENSITY_ID: HeroDensity['id'] = 'comfortable';

export function getHeroDensity(id: string) {
  return (
    HERO_DENSITIES.find((density) => density.id === id) ?? HERO_DENSITIES[1]
  );
}
