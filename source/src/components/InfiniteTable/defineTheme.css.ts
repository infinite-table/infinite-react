import { globalStyle, GlobalStyleRule } from '@vanilla-extract/css';

import {
  getThemeGlobalSelector,
  getThemeNameCls,
} from './getThemeGlobalSelectors';

export function defineTheme(
  themeName: string,
  styles: {
    lightStyles: GlobalStyleRule;
    darkStyles: GlobalStyleRule;
  },
) {
  globalStyle(`.${getThemeNameCls(themeName)}:root`, {
    ...styles.lightStyles,
    '@media': {
      '(prefers-color-scheme: dark)': {
        ...styles.darkStyles,
      },
    },
  });

  globalStyle(`.${getThemeNameCls(themeName)}`, {
    ...styles.lightStyles,
    '@media': {
      '(prefers-color-scheme: dark)': {
        ...styles.darkStyles,
      },
    },
  });
  globalStyle(getThemeGlobalSelector(themeName, 'light'), styles.lightStyles);
  globalStyle(getThemeGlobalSelector(themeName, 'dark'), styles.darkStyles);
}
