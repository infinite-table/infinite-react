import { MinimalistLightVars } from './vars-minimalist-light.css';
import { MinimalistDarkVars } from './vars-minimalist-dark.css';
import { InfiniteTableHeaderCellClassName } from './components/InfiniteTableHeader/headerClassName';

import { defineTheme } from './defineTheme.css';

const minimalistStyles = {
  [`& .${InfiniteTableHeaderCellClassName}`]: {
    textTransform: 'uppercase',
    fontWeight: 'bold',
    letterSpacing: '0.05em',
  },
};

defineTheme('minimalist', {
  lightStyles: {
    vars: MinimalistLightVars,
    ...minimalistStyles,
  },
  darkStyles: {
    vars: MinimalistDarkVars,
    ...minimalistStyles,
  },
});
