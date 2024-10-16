import { ShadcnLightVars } from './vars-shadcn-light.css';

import { defineTheme } from './defineTheme.css';

import { InfiniteTableHeaderWrapperClassName } from './components/InfiniteTableHeader/headerClassName';
import { ThemeVars } from './vars.css';

const shadcnStyles = {
  [`.${InfiniteTableHeaderWrapperClassName}`]: {
    borderBottom: ThemeVars.components.Cell.borderTop,
    '&:hover': {
      backgroundColor: ThemeVars.components.Row.hoverBackground,
    },
  },
};

defineTheme('shadcn', {
  lightStyles: {
    vars: ShadcnLightVars,
    ...shadcnStyles,
  },
});
