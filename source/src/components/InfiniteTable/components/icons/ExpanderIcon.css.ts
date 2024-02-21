import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import {
  cursor,
  fill,
  flex,
  transform,
  verticalAlign,
} from '../../utilities.css';

export const ExpanderIconCls = style([
  fill.accentColor,
  flex.none,
  cursor.pointer,
  verticalAlign.middle,
]);

export const ExpanderIconClsVariants = recipe({
  variants: {
    expanded: {
      true: transform.rotate90,
      false: {},
    },
    direction: {
      end: {},
      start: {},
    },
  },
  compoundVariants: [
    {
      variants: {
        expanded: false,
        direction: 'end',
      },
      style: transform.rotate180,
    },
  ],
});
