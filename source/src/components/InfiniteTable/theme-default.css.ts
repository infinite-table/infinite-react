import { globalStyle } from '@vanilla-extract/css';

import { LightVars as LightTheme } from './vars-default-light.css';
import { DarkVars as DarkTheme } from './vars-default-dark.css';
import { defineTheme } from './defineTheme.css';
import { getThemeModeCls } from './getThemeGlobalSelectors';

globalStyle(':root', {
  //@ts-ignore
  vars: LightTheme,
  '@media': {
    '(prefers-color-scheme: dark)': {
      vars: DarkTheme,
    },
  },
});

// make sure if the light mode is set, it gets applied, even if the theme is not set
globalStyle(`.${getThemeModeCls('light')}, .${getThemeModeCls('light')}:root`, {
  //@ts-ignore
  vars: LightTheme,
});

// make sure if the dark mode is set, it gets applied, even if the theme is not set
globalStyle(`.${getThemeModeCls('dark')}, .${getThemeModeCls('dark')}:root`, {
  vars: DarkTheme,
});

defineTheme('default', {
  lightStyles: {
    //@ts-ignore
    vars: LightTheme,
  },
  darkStyles: {
    vars: DarkTheme,
  },
});
