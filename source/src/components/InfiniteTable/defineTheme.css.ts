import { globalStyle, GlobalStyleRule } from '@vanilla-extract/css';

import {
  getThemeGlobalSelector,
  getThemeNameCls,
} from './getThemeGlobalSelectors';

export function defineTheme(
  themeName: string,
  styles: {
    lightStyles: GlobalStyleRule;
    darkStyles?: GlobalStyleRule;
  },
) {
  const mediaStyles = {
    ...styles.lightStyles,
  };
  if (styles.darkStyles) {
    mediaStyles['@media'] = {
      '(prefers-color-scheme: dark)': {
        ...styles.darkStyles,
      },
    };
  }

  globalStyle(
    `.${getThemeNameCls(themeName)}:root, .${getThemeNameCls(themeName)}`,
    mediaStyles,
  );

  globalStyle(getThemeGlobalSelector(themeName, 'light'), styles.lightStyles);

  if (styles.darkStyles) {
    globalStyle(getThemeGlobalSelector(themeName, 'dark'), styles.darkStyles);
  }
}
