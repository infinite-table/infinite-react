/*
 * Runs in <head> before first paint and sets <html data-theme>: ?theme= in the
 * URL (demo iframes, screenshots), then the stored choice, then the OS.
 * Kept out of the client bundle; ThemeToggle.tsx is the client side.
 */

export const THEME_STORAGE_KEY = 'infinite-theme';

export type SiteTheme = 'light' | 'dark';

const THEME_INIT = `(function(){try{var d=document.documentElement,k=${JSON.stringify(
  THEME_STORAGE_KEY,
)},q=new URLSearchParams(location.search).get('theme'),t=q==='light'||q==='dark'?q:localStorage.getItem(k);if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}d.setAttribute('data-theme',t)}catch(e){document.documentElement.setAttribute('data-theme','dark')}})()`;

export function ThemeInitScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />;
}

