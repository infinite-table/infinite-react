import * as React from 'react';

import { BackLink } from './BackLink';
import { FrameworkLink } from './FrameworkLink';
import { RunTestButton } from './RunTestButton';
import { ThemeToggle } from './ThemeToggle';

/**
 * The bar at the bottom right of every page (index.global.css .ex-chrome),
 * right to left: back, run the spec, the page in the other apps, the light /
 * dark toggle. Empty (hidden) under automation.
 */
export const PageDevChrome: React.FC = () => (
  <div className="ex-chrome">
    <BackLink />
    <RunTestButton />
    <FrameworkLink current="react" />
    <ThemeToggle />
  </div>
);
