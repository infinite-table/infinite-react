/**
 * Theme + density seam for the hero.
 *
 * The hero only ever talks to these registries: the control bar renders them,
 * the scripted show cycles `SHOW_THEME_SEQUENCE`, and the grid wrapper applies
 * `themeClassName()` / `density.className`. New themes and density classes
 * from the library drop in here without touching the rest of the hero.
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
  { id: 'ocean', label: 'Ocean', swatch: '#0ea5b7', modes: ['light', 'dark'] },
  {
    id: 'balsam',
    label: 'Balsam',
    swatch: '#22a06b',
    modes: ['light', 'dark'],
  },
  {
    id: 'minimalist',
    label: 'Minimalist',
    swatch: '#a1a1aa',
    modes: ['light', 'dark'],
  },
];

export const DEFAULT_THEME_ID = 'default';

/** The order the scripted show walks through (ends back on the default). */
export const SHOW_THEME_SEQUENCE: readonly string[] = [
  'ocean',
  'balsam',
  'minimalist',
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
  id: 'compact' | 'normal' | 'comfortable';
  label: string;
  rowHeight: number;
  headerHeight: number;
  /**
   * Today: a hero-scoped class (hero.css) setting padding + font size.
   * Later: the library's `infinite-density--*` class.
   */
  className: string;
};

export const HERO_DENSITIES: readonly HeroDensity[] = [
  {
    id: 'compact',
    label: 'Compact',
    rowHeight: 28,
    headerHeight: 30,
    className: 'hero-density--compact',
  },
  {
    id: 'normal',
    label: 'Normal',
    rowHeight: 34,
    headerHeight: 36,
    className: 'hero-density--normal',
  },
  {
    id: 'comfortable',
    label: 'Comfy',
    rowHeight: 42,
    headerHeight: 42,
    className: 'hero-density--comfortable',
  },
];

export const DEFAULT_DENSITY_ID: HeroDensity['id'] = 'normal';

export function getHeroDensity(id: string) {
  return (
    HERO_DENSITIES.find((density) => density.id === id) ?? HERO_DENSITIES[1]
  );
}
