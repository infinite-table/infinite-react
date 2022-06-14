import React, { PointerEvent, useRef, useState } from 'react';
import { FlexComputeResizeResult } from '../../../../flexbox';
import { internalProps } from '../../../internalProps';

import { getResizer } from './fetchElements';
import {
  ResizeHandleCls,
  ResizeHandleDraggerClsRecipe,
} from './ResizeHandle.css';

type ResizeHandleProps = {
  columnIndex: number;
  initialWidth: number;
  totalColumns: number;
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

export const InfiniteTableHeaderCellResizeHandleCls = `${rootClassName}HeaderCell_ResizeHandle`;

function ResizeHandleFn(props: ResizeHandleProps) {
  const [constrained, setConstrained] = useState(false);
  const constrainedRef = useRef<boolean>(constrained);
  constrainedRef.current = constrained;

  const onPointerDown = (e: PointerEvent) => {
    e.stopPropagation();

    const shareSpaceOnResize = !!e.shiftKey;
    const pointerId = e.pointerId;
    const initialX = e.clientX;
    const target = e.target as HTMLElement;

    target.setPointerCapture(pointerId);

    const resizer = getResizer(props.columnIndex, {
      totalColumns: props.totalColumns,
      shareSpaceOnResize,
    });

    const resizeDiff = (diff: number) => {
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

  return (
    <div
      className={`${InfiniteTableHeaderCellResizeHandleCls} ${ResizeHandleCls}`}
      onPointerDown={onPointerDown}
    >
      <div
        className={ResizeHandleDraggerClsRecipe({
          constrained,
        })}
      />
    </div>
  );
}
export const ResizeHandle = React.memo(
  ResizeHandleFn,
  () => true,
) as typeof ResizeHandleFn;
