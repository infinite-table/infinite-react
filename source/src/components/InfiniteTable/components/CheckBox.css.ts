import { style } from '@vanilla-extract/css';
import { ThemeVars } from '../vars.css';
import { cursor } from '../utilities.css';

export const CheckBoxCls = style([
  cursor.pointer,
  {
    accentColor: ThemeVars.color.accent,
    selectors: {
      '&[disabled]': {
        opacity: 0.7,
      },
    },
  },
]);
