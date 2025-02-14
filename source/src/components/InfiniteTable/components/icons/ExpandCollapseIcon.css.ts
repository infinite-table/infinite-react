import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { cursor, flex, transform, verticalAlign } from '../../utilities.css';
import { ThemeVars } from '../../vars.css';

export const ExpanderIconCls = style([
  flex.none,
  cursor.pointer,
  verticalAlign.middle,
  {
    fill: ThemeVars.components.ExpandCollapseIcon.color,
    display: 'inline-block',
    verticalAlign: 'bottom',
  },
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
    disabled: {
      true: {
        cursor: 'auto',
        opacity: 0.4,
      },
      false: {},
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
