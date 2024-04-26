import { globalStyle } from '@vanilla-extract/css';

import { MinimalistLightVars } from './vars-minimalist-light.css';
import { MinimalistDarkVars } from './vars-minimalist-dark.css';

globalStyle(
  [
    '.infinite-theme-mode--light.infinite-theme-name--minimalist',
    '.infinite-theme-mode--light .infinite-theme-name--minimalist',
    '.infinite-theme-name--minimalist .infinite-theme-mode--light',
  ].join(', '),
  {
    vars: MinimalistLightVars,
  },
);

globalStyle(
  [
    '.infinite-theme-mode--dark.infinite-theme-name--minimalist',
    '.infinite-theme-mode--dark .infinite-theme-name--minimalist',
    '.infinite-theme-name--minimalist .infinite-theme-mode--dark',
  ].join(', '),
  {
    vars: MinimalistDarkVars,
  },
);
