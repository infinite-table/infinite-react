import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { cursor, fill, flex, transform } from '../../utilities.css';

export const ExpanderIconCls = style([
  fill.accentColor,
  flex.none,
  cursor.pointer,
]);

export const ExpanderIconClsVariants = recipe({
  variants: {
    expanded: {
      true: transform.rotate90,
      false: {},
    },
  },
});
