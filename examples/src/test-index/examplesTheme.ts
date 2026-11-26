/**
 * The light / dark choice of the examples apps (the test pages and the test
 * pages indexes), shared by the React, Vue and Angular apps: they are on one
 * origin behind the front of the dev servers (scripts/examples-dev-server.js),
 * so they share localStorage. No framework in here.
 *
 * The choice is applied to <html>: `data-examples-theme` (the page around the
 * grids: index.global.css) and the grid's own `infinite-theme-mode--*` class.
 * Under automation (Playwright) nothing is applied: the pages look the way the
 * specs expect (the React app: the dark grids of its <body> class).
 */

export type ExamplesTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'infinite-tests:theme';
const THEME_EVENT = 'infinite-examples-theme';

const isAutomation = () =>
  typeof navigator !== 'undefined' && !!(navigator as any).webdriver;

/**
 * The inline script each app's HTML runs before the first paint (no flash of
 * the other theme): in <head>, or as the first element of <body> with
 * `inBody` - the React app, whose <body> has the dark grid className its
 * specs expect. That className stays under automation; otherwise it gives
 * way to the user's choice on <html>, as in the other apps. (On <html> it
 * would match the theme's `:root` rules, which its specs don't expect.)
 */
export const themeBootScript = ({ inBody = false } = {}) =>
  `(function(){try{if(navigator.webdriver)return;var d=document.documentElement;` +
  `var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t!=='light'&&t!=='dark')t='dark';` +
  `d.setAttribute('data-examples-theme',t);d.classList.add('infinite-theme-mode--'+t);` +
  (inBody
    ? `document.body.classList.remove('infinite-theme-mode--dark','infinite-theme-mode--light');`
    : '') +
  `}catch(e){}})();`;

export const readTheme = (): ExamplesTheme => {
  if (typeof document !== 'undefined') {
    const current = document.documentElement.getAttribute(
      'data-examples-theme',
    );
    if (current === 'light' || current === 'dark') return current;
  }
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === 'light'
      ? 'light'
      : 'dark';
  } catch {
    return 'dark';
  }
};

function apply(theme: ExamplesTheme) {
  const root = document.documentElement;
  root.setAttribute('data-examples-theme', theme);
  root.classList.remove(
    'infinite-theme-mode--light',
    'infinite-theme-mode--dark',
  );
  root.classList.add(`infinite-theme-mode--${theme}`);
  // the React app's <body> class (themeBootScript)
  document.body?.classList.remove(
    'infinite-theme-mode--light',
    'infinite-theme-mode--dark',
  );
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: theme }));
}

export const setTheme = (theme: ExamplesTheme) => {
  if (isAutomation()) return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {}
  apply(theme);
};

export const toggleTheme = () =>
  setTheme(readTheme() === 'dark' ? 'light' : 'dark');

/** calls `listener` when the theme changes, in this tab or another one */
export const onThemeChange = (listener: (theme: ExamplesTheme) => void) => {
  if (typeof window === 'undefined') return () => {};
  const onLocal = (event: Event) =>
    listener((event as CustomEvent<ExamplesTheme>).detail);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY) return;
    const theme = event.newValue === 'light' ? 'light' : 'dark';
    apply(theme);
  };
  window.addEventListener(THEME_EVENT, onLocal);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(THEME_EVENT, onLocal);
    window.removeEventListener('storage', onStorage);
  };
};

/** the toggle's label: the theme it switches to */
export const themeToggleLabel = (theme: ExamplesTheme) =>
  theme === 'dark' ? '☀' : '☾';

export const themeToggleTitle = (theme: ExamplesTheme) =>
  theme === 'dark' ? 'Switch to the light theme' : 'Switch to the dark theme';
