import * as React from 'react';
import { useEffect, useState } from 'react';

import {
  type ExamplesTheme,
  onThemeChange,
  readTheme,
  themeToggleLabel,
  themeToggleTitle,
  toggleTheme,
} from './examplesTheme';

/** the light / dark toggle of the bottom right bar (examplesTheme.ts) */
export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<ExamplesTheme | null>(null);

  useEffect(() => {
    if ((navigator as any).webdriver) return;
    setTheme(readTheme());
    return onThemeChange(setTheme);
  }, []);

  if (!theme) return null;

  return (
    <button
      type="button"
      className="ex-chrome-item ex-chrome-icon"
      title={themeToggleTitle(theme)}
      aria-label={themeToggleTitle(theme)}
      onClick={toggleTheme}
    >
      {themeToggleLabel(theme)}
    </button>
  );
};
