import { defineComponent, h, ref } from 'vue';
import type { PropType } from 'vue';

import { FlexComputeGroupResizeResult } from '../../../../flexbox';
import { internalProps } from '../../../internalProps';
import { InfiniteTableComputedColumn } from '../../../types';
import type { MatrixBrain } from '../../../../VirtualBrain/MatrixBrain';
import { ThemeVars } from '../../../vars.css';

import { getColumnGroupResizer } from './columnResizer';
import {
  ResizeHandleCls,
  ResizeHandleRecipeCls,
  ResizeHandleDraggerClsRecipe,
} from './ResizeHandle.css';

const { rootClassName } = internalProps;

export const InfiniteTableHeaderCellResizeHandleCls = `${rootClassName}HeaderCell_ResizeHandle`;

/**
 * Vue sibling of GroupResizeHandle.tsx - the drag handle rendered at the edge
 * of resizable column group headers. Same pointer-capture drag logic as the
 * React version.
 */
export const GroupResizeHandle = defineComponent({
  name: 'GroupResizeHandle',
  props: {
    groupColumns: {
      type: Array as PropType<InfiniteTableComputedColumn<any>[]>,
      required: true,
    },
    columns: {
      type: Array as PropType<InfiniteTableComputedColumn<any>[]>,
      required: true,
    },
    draggerStyle: {
      type: Object as PropType<Record<string, any>>,
      default: undefined,
    },
    brain: { type: Object as PropType<MatrixBrain>, required: true },
    computeResize: {
      type: Function as PropType<
        (diff: number) => FlexComputeGroupResizeResult
      >,
      required: true,
    },
    onResize: {
      type: Function as PropType<(diff: number) => void>,
      required: true,
    },
  },
  setup(props) {
    const domRef: { current: HTMLDivElement | null } = { current: null };
    const constrained = ref(false);

    const onPointerDown = (e: PointerEvent) => {
      e.stopPropagation();

      const col = props.groupColumns[0];
      if (!col) {
        return;
      }
      const computedPinned = col.computedPinned;

      const pointerId = e.pointerId;
      const initialX = e.clientX;
      const target = e.target as HTMLElement;

      target.setPointerCapture(pointerId);

      let initialMove = true;

      const resizer = getColumnGroupResizer(
        props.groupColumns.map((c) => c.computedVisibleIndex),
        {
          columns: props.columns,
          domRef,
        },
      );

      const resizeDiff = (diff: number) => {
        if (computedPinned === 'end') {
          diff *= -1;
        }
        const {
          constrained: isConstrained,
          adjustedDiffs,
          adjustedDiff,
        } = props.computeResize(diff);

        if (constrained.value !== isConstrained) {
          constrained.value = isConstrained;
        }

        resizer.resize(adjustedDiffs);

        return adjustedDiff;
      };

      const onPointerMove = (e: PointerEvent) => {
        if (initialMove) {
          // this group could be dragged so all columns have the minimum width
          // and new columns could come into the viewport, which might not be
          // visible yet (hidden via virtualization) - so adjust the available
          // size while dragging to make the brain render additional columns
          const maxDiff = props.groupColumns.reduce((diff, col) => {
            return diff + col.computedWidth - col.computedMinWidth;
          }, 0);
          const currentSize = props.brain.getAvailableSize();
          const newSize = {
            width: currentSize.width + maxDiff,
            height: currentSize.height,
          };

          props.brain.update(newSize);
          initialMove = false;
        }

        resizeDiff(Math.round(e.clientX - initialX));
      };

      const onPointerUp = (e: PointerEvent) => {
        target.releasePointerCapture(pointerId);

        target.removeEventListener('pointermove', onPointerMove);
        target.removeEventListener('pointerup', onPointerUp);

        const diff = Math.round(e.clientX - initialX);
        const adjustedDiff = resizeDiff(diff);

        props.onResize(adjustedDiff);
      };

      target.addEventListener('pointermove', onPointerMove);
      target.addEventListener('pointerup', onPointerUp);
    };

    return () => {
      const col = props.groupColumns[0];
      if (!col) {
        return null;
      }
      const computedPinned = col.computedPinned;
      const computedFirstInCategory = col.computedFirstInCategory;
      const computedLastInCategory = col.computedLastInCategory;

      const style: Record<string, any> | undefined =
        (computedPinned === false || computedPinned === 'start') &&
        computedLastInCategory
          ? {
              right:
                computedPinned === 'start'
                  ? undefined
                  : ThemeVars.components.HeaderCell.resizeHandleWidth,
            }
          : computedPinned === 'end' && computedFirstInCategory
          ? { right: undefined }
          : undefined;

      return h(
        'div',
        {
          ref: (el: any) => {
            domRef.current = (el as HTMLDivElement) ?? null;
          },
          class: `${InfiniteTableHeaderCellResizeHandleCls} ${ResizeHandleCls} ${ResizeHandleRecipeCls(
            {
              computedPinned,
              computedFirstInCategory,
              computedLastInCategory,
            },
          )}`,
          onPointerdown: onPointerDown,
        },
        [
          h('div', {
            style: { ...style, ...props.draggerStyle },
            class: ResizeHandleDraggerClsRecipe({
              constrained: constrained.value,
            }),
          }),
        ],
      );
    };
  },
});
