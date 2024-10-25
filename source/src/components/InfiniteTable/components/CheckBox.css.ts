import { style } from '@vanilla-extract/css';
import { ThemeVars } from '../vars.css';
import { cursor } from '../utilities.css';

export const CheckBoxCls = style([
  cursor.pointer,
  {
    accentColor: ThemeVars.color.accent,
    verticalAlign: 'middle',
    selectors: {
      '&[disabled]': {
        opacity: 0.7,
      },
    },
  },
]);
