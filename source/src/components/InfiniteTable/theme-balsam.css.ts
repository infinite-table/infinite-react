import { BalsamLightVars } from './vars-balsam-light.css';
import { BalsamDarkVars } from './vars-balsam-dark.css';

import { defineTheme } from './defineTheme.css';

const balsamStyles = {};

defineTheme('balsam', {
  lightStyles: {
    vars: BalsamLightVars,
    ...balsamStyles,
  },
  darkStyles: {
    vars: BalsamDarkVars,
    ...balsamStyles,
  },
});
