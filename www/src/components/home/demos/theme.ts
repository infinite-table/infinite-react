/*
 * The grid theme classNames of the homepage demos. No framework code: shared
 * by the React demos (via shared.tsx) and their Vue ports (content/home).
 */
export type ColorMode = 'light' | 'dark';

/** The library's classNames for a theme, a mode and a density. */
export function themeClassName(
  theme: string,
  mode: ColorMode,
  density?: 'compact' | 'comfortable' | 'spacious',
) {
  return [
    theme !== 'default' ? `infinite-theme-name--${theme}` : '',
    `infinite-theme-mode--${mode}`,
    density ? `infinite-density--${density}` : '',
  ]
    .filter(Boolean)
    .join(' ');
}
