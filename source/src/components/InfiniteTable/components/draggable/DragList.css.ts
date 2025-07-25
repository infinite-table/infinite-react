import { recipe } from '@vanilla-extract/recipes';
import {
  cursor,
  pointerEvents,
  position,
  userSelect,
  willChange,
  zIndex,
} from '../../utilities.css';
import { style } from '@vanilla-extract/css';

export const DragListRecipe = recipe({
  base: [willChange.transform, position.relative],
  variants: {
    dragging: {
      true: [cursor.grabbing, userSelect.none],
    },
  },
});
const transitionTransformActiveItem = style({
  transition: 'transform 0.05s cubic-bezier(0.4, 0, 0.2, 1)',
});
const transitionTransformNonActiveItem = style({
  transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
});

export const DraggableItemRecipe = recipe({
  base: [willChange.transform, position.relative],
  variants: {
    active: {
      true: [zIndex[1000000], transitionTransformActiveItem, cursor.grabbing],
    },
    draggingInProgress: {
      true: [userSelect.none],
    },
  },
  compoundVariants: [
    {
      variants: {
        active: false,
        draggingInProgress: true,
      },
      style: [transitionTransformNonActiveItem],
    },
  ],
});
