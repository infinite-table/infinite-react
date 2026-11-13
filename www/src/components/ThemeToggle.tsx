'use client';

/*
 * Light / dark for the whole site: <html data-theme="light|dark">.
 *
 * The choice is stored in localStorage; with nothing stored the site follows
 * the OS (prefers-color-scheme), and keeps following it while it changes.
 * ThemeInitScript (themeInit.tsx) runs in <head> before first paint, so there is no flash.
 * The toggle renders both icons and CSS shows the one for the current mode,
 * so the server HTML is correct whatever the theme.
 */

import { useEffect } from 'react';

import { THEME_STORAGE_KEY, type SiteTheme } from './themeInit';

function storedTheme(): SiteTheme | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

export function setSiteTheme(theme: SiteTheme) {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {}
}

if (typeof window !== 'undefined' && window.matchMedia) {
  // with no stored choice, follow the OS when it switches
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener?.('change', (event) => {
      if (storedTheme()) return;
      document.documentElement.setAttribute(
        'data-theme',
        event.matches ? 'dark' : 'light',
      );
    });
}

function preferredTheme(): SiteTheme {
  return (
    storedTheme() ??
    (window.matchMedia?.('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light')
  );
}

/**
 * Puts data-theme back when React re-creates <html> (it does when a page
 * fails hydration and is rendered again on the client).
 */
export function ThemeSync() {
  useEffect(() => {
    const root = document.documentElement;
    if (!root.hasAttribute('data-theme')) {
      root.setAttribute('data-theme', preferredTheme());
    }
  }, []);
  return null;
}

export function ThemeToggle({ className = '' }: { className?: string }) {
  return (
    <button
      type="button"
      className={`theme-toggle ${className}`}
      aria-label="Switch between light and dark mode"
      title="Switch between light and dark mode"
      onClick={() => {
        const current = document.documentElement.getAttribute('data-theme');
        setSiteTheme(current === 'dark' ? 'light' : 'dark');
      }}
    >
      {/* sun in dark mode (go light), moon in light mode (go dark) */}
      <svg
        className="theme-toggle__icon theme-toggle__icon--sun"
        viewBox="0 0 16 16"
        aria-hidden="true"
      >
        <circle cx="8" cy="8" r="3" />
        <path d="M8 1.5v1.6M8 12.9v1.6M1.5 8h1.6M12.9 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M3.4 12.6l1.1-1.1M11.5 4.5l1.1-1.1" />
      </svg>
      <svg
        className="theme-toggle__icon theme-toggle__icon--moon"
        viewBox="0 0 16 16"
        aria-hidden="true"
      >
        <path d="M13.5 9.6A5.6 5.6 0 0 1 6.4 2.5a5.6 5.6 0 1 0 7.1 7.1Z" />
      </svg>
    </button>
  );
}
