'use client';

import * as React from 'react';

import type { ColorMode } from './theme';

export { type ColorMode, themeClassName } from './theme';

function readSiteMode(): ColorMode {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

function subscribeToSiteMode(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
  return () => observer.disconnect();
}

/**
 * The site's light / dark mode (<html data-theme>), kept up to date. Read
 * on the first render, so a grid never mounts in the other mode first; a
 * server render (and its hydration) uses dark, then React switches.
 */
export function useSiteMode(): ColorMode {
  return React.useSyncExternalStore(
    subscribeToSiteMode,
    readSiteMode,
    () => 'dark',
  );
}

export function Segmented<T extends string>(props: {
  label: string;
  options: readonly { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="home-demo__group">
      <span className="home-demo__label">{props.label}</span>
      <div className="home-seg" role="group" aria-label={props.label}>
        {props.options.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={option.id === props.value}
            onClick={() => props.onChange(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export const gridDomProps = { style: { height: '100%' } };

export const LICENSE_KEY = process.env.NEXT_PUBLIC_INFINITE_LICENSE_KEY;
