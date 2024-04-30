import { globalStyle } from '@vanilla-extract/css';

import { LightVars as LightTheme } from './vars-default-light.css';
import { DarkVars as DarkTheme } from './vars-default-dark.css';
import { defineTheme } from './defineTheme.css';

defineTheme('default', {
  lightStyles: {
    //@ts-ignore
    vars: LightTheme,
  },
  darkStyles: {
    vars: DarkTheme,
  },
});

globalStyle(':root', {
  //@ts-ignore
  vars: LightTheme,
  '@media': {
    '(prefers-color-scheme: dark)': {
      vars: DarkTheme,
    },
  },
});

globalStyle(
  [
    '.light',
    '.infinite-light',
    '.infinite-theme-mode--light',

    '.light:root',
    '.infinite-light:root',
    '.infinite-theme-mode--light:root',
  ].join(', '),
  {
    //@ts-ignore
    vars: LightTheme,
  },
);
globalStyle(['.dark', '.infinite-dark'].join(', '), {
  vars: DarkTheme,
});
