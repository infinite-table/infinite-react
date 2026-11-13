import { globalStyle } from '@vanilla-extract/css';

import { ShadcnLightVars } from './vars-shadcn-light.css';
import { ShadcnDarkVars } from './vars-shadcn-dark.css';

import { defineTheme } from './defineTheme.css';
import {
  getThemeGlobalSelector,
  getThemeNameCls,
} from './getThemeGlobalSelectors';

import { InfiniteTableHeaderWrapperClassName } from './components/InfiniteTableHeader/headerClassName';
import { ThemeVars } from './vars.css';

// the className shadcn/ui uses for the dark mode
const SHADCN_DARK_CLS = 'dark';

const shadcnStyles = {
  [`& .${InfiniteTableHeaderWrapperClassName}`]: {
    borderBottom: ThemeVars.components.Cell.borderTop,
    '&:hover': {
      backgroundColor: ThemeVars.components.Row.hoverBackground,
    },
  },
};

// The mode of this theme is the mode of the page: shadcn/ui puts the `dark`
// className on an element (usually the root) and changes its CSS variables
// there. So, unlike the other themes, this one has no styles
// for `prefers-color-scheme: dark`.
defineTheme('shadcn', {
  lightStyles: {
    vars: ShadcnLightVars,
    ...shadcnStyles,
  },
});

const themeNameCls = getThemeNameCls('shadcn');

globalStyle(
  [
    `.${SHADCN_DARK_CLS} .${themeNameCls}`,
    `.${SHADCN_DARK_CLS}.${themeNameCls}`,
    `.${themeNameCls} .${SHADCN_DARK_CLS}`,
    // the dark mode className of Infinite Table is not needed, but it works
    getThemeGlobalSelector('shadcn', 'dark'),
  ].join(', '),
  {
    vars: ShadcnDarkVars,
  },
);
