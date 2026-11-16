'use client';

import * as React from 'react';

export type ColorMode = 'light' | 'dark';

/** The site's light / dark mode (<html data-theme>), kept up to date. */
export function useSiteMode(): ColorMode {
  const [mode, setMode] = React.useState<ColorMode>('dark');
  React.useEffect(() => {
    const html = document.documentElement;
    const read = () =>
      setMode(html.dataset.theme === 'light' ? 'light' : 'dark');
    read();
    const observer = new MutationObserver(read);
    observer.observe(html, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  }, []);
  return mode;
}

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
