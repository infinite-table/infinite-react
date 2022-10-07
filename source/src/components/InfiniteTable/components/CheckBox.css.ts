import { style } from '@vanilla-extract/css';
import { cursor } from '../utilities.css';

export const CheckBoxCls = style([
  cursor.pointer,
  {
    selectors: {
      '&[disabled]': {
        opacity: 0.7,
      },
    },
  },
]);
