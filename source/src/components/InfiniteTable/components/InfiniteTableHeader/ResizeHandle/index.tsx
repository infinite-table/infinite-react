import React, { PointerEvent, useRef, useState } from 'react';
import { FlexComputeResizeResult } from '../../../../flexbox';
import { internalProps } from '../../../internalProps';
import { InfiniteTableComputedColumn } from '../../../types';

import { getColumnResizer } from './columnResizer';
import {
  ResizeHandleCls,
  ResizeHandleDraggerClsRecipe,
  ResizeHandleRecipeCls,
} from './ResizeHandle.css';

type ResizeHandleProps<T> = {
  columnIndex: number;
  columns: InfiniteTableComputedColumn<T>[];

  computeResize: ({
    diff,
    shareSpaceOnResize,
  }: {
    diff: number;
    shareSpaceOnResize: boolean;
  }) => FlexComputeResizeResult;

  onResize: ({
    diff,
    shareSpaceOnResize,
  }: {
    diff: number;
    shareSpaceOnResize: boolean;
  }) => void;
};

const { rootClassName } = internalProps;

/**
 * For the resize handle for column groups, see GroupResizeHandle.tsx
 */

export const InfiniteTableHeaderCellResizeHandleCls = `${rootClassName}HeaderCell_ResizeHandle`;

function ResizeHandleFn<T>(props: ResizeHandleProps<T>) {
  const domRef = useRef<HTMLDivElement>(null);
  const [constrained, setConstrained] = useState(false);
  const constrainedRef = useRef<boolean>(constrained);
  constrainedRef.current = constrained;

  const col = props.columns[props.columnIndex];

  if (!col) {
    return null;
  }
  const computedPinned = col.computedPinned;
  const computedFirstInCategory = col.computedFirstInCategory;
  const computedLastInCategory = col.computedLastInCategory;

  const onPointerDown = (e: PointerEvent) => {
    e.stopPropagation();

    const shareSpaceOnResize = !!e.shiftKey;
    const pointerId = e.pointerId;
    const initialX = e.clientX;
    const target = e.target as HTMLElement;

    target.setPointerCapture(pointerId);

    const resizer = getColumnResizer(props.columnIndex, {
      columns: props.columns,
      shareSpaceOnResize,
      domRef,
    });

    const resizeDiff = (diff: number) => {
      if (computedPinned === 'end') {
        diff *= -1;
      }
      const { adjustedDiff, constrained } = props.computeResize({
        diff,
        shareSpaceOnResize,
      });

      if (constrainedRef.current !== constrained) {
        setConstrained(constrained);
      }

      resizer.resize(adjustedDiff);

      return adjustedDiff;
    };

    const onPointerMove = (e: PointerEvent) => {
      resizeDiff(Math.round(e.clientX - initialX));
    };

    const onPointerUp = (e: PointerEvent) => {
      target.releasePointerCapture(pointerId);

      //@ts-ignore
      target.removeEventListener('pointermove', onPointerMove);
      //@ts-ignore
      target.removeEventListener('pointerup', onPointerUp);

      const diff = Math.round(e.clientX - initialX);
      const adjustedDiff = resizeDiff(diff);

      props.onResize({ diff: adjustedDiff, shareSpaceOnResize });
    };

    //@ts-ignore
    target.addEventListener('pointermove', onPointerMove);
    //@ts-ignore
    target.addEventListener('pointerup', onPointerUp);
  };

  const style =
    (computedPinned === false || computedPinned === 'start') &&
    computedLastInCategory
      ? {
          right: computedPinned === 'start' ? 0 : 0, //ThemeVars.components.HeaderCell.resizeHandleWidth,
        }
      : computedPinned === 'end' && computedFirstInCategory
      ? { right: 'none', left: 0 }
      : undefined;
  return (
    <div
      ref={domRef}
      className={`${InfiniteTableHeaderCellResizeHandleCls} ${ResizeHandleCls} ${ResizeHandleRecipeCls(
        {
          computedPinned,
          computedFirstInCategory,
          computedLastInCategory,
        },
      )}`}
      onPointerDown={onPointerDown}
    >
      <div
        style={style}
        className={ResizeHandleDraggerClsRecipe({
          constrained,
        })}
      />
    </div>
  );
}
export const ResizeHandle = React.memo(ResizeHandleFn) as typeof ResizeHandleFn;
