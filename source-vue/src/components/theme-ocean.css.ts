import { OceanLightVars } from './vars-ocean-light.css';
import { OceanDarkVars } from './vars-ocean-dark.css';

import { defineTheme } from './defineTheme.css';

const oceanStyles = {};

defineTheme('ocean', {
  lightStyles: {
    vars: OceanLightVars,
    ...oceanStyles,
  },
  darkStyles: {
    vars: OceanDarkVars,
    ...oceanStyles,
  },
});
