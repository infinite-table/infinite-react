import { defineComponent, h, ref } from 'vue';
import type { PropType } from 'vue';

import { FlexComputeResizeResult } from '../../../../flexbox';
import { internalProps } from '../../../internalProps';
import { InfiniteTableComputedColumn } from '../../../types';

import { getColumnResizer } from './columnResizer';
import {
  ResizeHandleCls,
  ResizeHandleDraggerClsRecipe,
  ResizeHandleRecipeCls,
} from './ResizeHandle.css';

import { useInfiniteTableContext } from '../../../InfiniteTableContextForVue.vue';

const { rootClassName } = internalProps;

export const InfiniteTableHeaderCellResizeHandleCls = `${rootClassName}HeaderCell_ResizeHandle`;

type ResizeFnParam = {
  diff: number;
  shareSpaceOnResize: boolean;
};

/**
 * Vue sibling of ResizeHandle/index.tsx - the drag handle rendered at the
 * edge of resizable header cells. Same pointer-capture drag logic: while
 * dragging, widths/offsets are applied transiently via CSS vars
 * (getColumnResizer); on pointerup the final columnSizing lands in state via
 * onResize.
 */
export const ResizeHandle = defineComponent({
  name: 'ResizeHandle',
  props: {
    horizontalLayoutPageIndex: {
      type: Number as PropType<number | null>,
      default: null,
    },
    columnIndex: { type: Number, required: true },
    columns: {
      type: Array as PropType<InfiniteTableComputedColumn<any>[]>,
      required: true,
    },
    computeResize: {
      type: Function as PropType<
        (param: ResizeFnParam) => FlexComputeResizeResult
      >,
      required: true,
    },
    onResize: {
      type: Function as PropType<(param: ResizeFnParam) => void>,
      required: true,
    },
  },
  setup(props) {
    const tableContext = useInfiniteTableContext();
    const { getState } = tableContext;

    const domRef: { current: HTMLDivElement | null } = { current: null };
    const constrained = ref(false);

    const onPointerDown = (e: PointerEvent) => {
      e.stopPropagation();

      const col = props.columns[props.columnIndex];
      if (!col) {
        return;
      }
      const computedPinned = col.computedPinned;
      const horizontalLayoutPageIndex = props.horizontalLayoutPageIndex;

      const { brain, headerBrain } = getState();

      const shareSpaceOnResize = !!e.shiftKey;
      const pointerId = e.pointerId;
      const initialX = e.clientX;
      const target = e.target as HTMLElement;

      let restoreRenderRange: () => void = () => {};

      if (brain.isHorizontalLayoutBrain) {
        const restoreBodyRange = brain.extendRenderRange({
          start: true,
          end: true,
          direction: 'horizontal',
        });
        const restoreHeaderRange = headerBrain.extendRenderRange({
          start: true,
          end: true,
          direction: 'horizontal',
        });
        restoreRenderRange = () => {
          restoreBodyRange();
          restoreHeaderRange();
        };
      }

      target.setPointerCapture(pointerId);

      const resizer = getColumnResizer(props.columnIndex, {
        columns: props.columns,
        shareSpaceOnResize,
        domRef,
      });

      const resizeDiff = (diff: number, { done }: { done?: boolean } = {}) => {
        if (horizontalLayoutPageIndex) {
          diff = diff / (horizontalLayoutPageIndex + 1);
          if (done) {
            diff = Math.round(diff);
          }
        }
        if (computedPinned === 'end') {
          diff *= -1;
        }
        const { adjustedDiff, constrained: isConstrained } =
          props.computeResize({
            diff,
            shareSpaceOnResize,
          });

        if (constrained.value !== isConstrained) {
          constrained.value = isConstrained;
        }

        resizer.resize(adjustedDiff);

        return adjustedDiff;
      };

      const onPointerMove = (e: PointerEvent) => {
        resizeDiff(Math.round(e.clientX - initialX));
      };

      const onPointerUp = (e: PointerEvent) => {
        target.releasePointerCapture(pointerId);

        target.removeEventListener('pointermove', onPointerMove);
        target.removeEventListener('pointerup', onPointerUp);

        const diff = Math.round(e.clientX - initialX);
        const adjustedDiff = resizeDiff(diff, { done: true });

        restoreRenderRange();

        props.onResize({ diff: adjustedDiff, shareSpaceOnResize });
      };

      target.addEventListener('pointermove', onPointerMove);
      target.addEventListener('pointerup', onPointerUp);
    };

    return () => {
      const col = props.columns[props.columnIndex];
      if (!col) {
        return null;
      }

      const computedPinned = col.computedPinned;
      const computedFirstInCategory = col.computedFirstInCategory;
      const computedLastInCategory = col.computedLastInCategory;

      const style =
        (computedPinned === false || computedPinned === 'start') &&
        computedLastInCategory
          ? {
              right: computedPinned === 'start' ? undefined : 0, //ThemeVars.components.HeaderCell.resizeHandleWidth,
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
            style,
            class: ResizeHandleDraggerClsRecipe({
              constrained: constrained.value,
              computedPinned,
              computedFirstInCategory,
              computedLastInCategory,
            }),
          }),
        ],
      );
    };
  },
});
