import { CSSProperties, PointerEvent, useRef, useState } from 'react';
import * as React from 'react';
import { FlexComputeGroupResizeResult } from '../../../../flexbox';
import { internalProps } from '../../../internalProps';
import { InfiniteTableComputedColumn } from '../../../types';

import { getColumnGroupResizer } from './columnResizer';
import {
  ResizeHandleCls,
  ResizeHandleRecipeCls,
  ResizeHandleDraggerClsRecipe,
} from './ResizeHandle.css';
import type { MatrixBrain } from '../../../../VirtualBrain/MatrixBrain';
import { ThemeVars } from '../../../vars.css';

type GroupResizeHandleProps<T> = {
  groupColumns: InfiniteTableComputedColumn<T>[];
  columns: InfiniteTableComputedColumn<T>[];

  style: CSSProperties;

  brain: MatrixBrain;
  computeResize: (diff: number) => FlexComputeGroupResizeResult;

  onResize: (diff: number) => void;
};

const { rootClassName } = internalProps;

export const InfiniteTableHeaderCellResizeHandleCls = `${rootClassName}HeaderCell_ResizeHandle`;

function GroupResizeHandleFn<T>(props: GroupResizeHandleProps<T>) {
  const domRef = useRef<HTMLDivElement>(null);
  const [constrained, setConstrained] = useState(false);
  const constrainedRef = useRef<boolean>(constrained);
  constrainedRef.current = constrained;

  const col = props.groupColumns[0];
  if (!col) {
    return null;
  }
  const computedPinned = col.computedPinned;
  const computedFirstInCategory = col.computedFirstInCategory;
  const computedLastInCategory = col.computedLastInCategory;

  const onPointerDown = (e: PointerEvent) => {
    e.stopPropagation();

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
      const { constrained, adjustedDiffs, adjustedDiff } =
        props.computeResize(diff);

      if (constrainedRef.current !== constrained) {
        setConstrained(constrained);
      }

      resizer.resize(adjustedDiffs);

      return adjustedDiff;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (initialMove) {
        // since this group could be dragged so all columns have the minimum width
        // and new columns could come into the viewport, which might not be visible yet, and thus are hidden via virtualization
        // we need to adjust the available size while dragging to determine the brain to render additional columns

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

      //@ts-ignore
      target.removeEventListener('pointermove', onPointerMove);
      //@ts-ignore
      target.removeEventListener('pointerup', onPointerUp);

      const diff = Math.round(e.clientX - initialX);
      const adjustedDiffs = resizeDiff(diff);

      props.onResize(adjustedDiffs);
    };

    //@ts-ignore
    target.addEventListener('pointermove', onPointerMove);
    //@ts-ignore
    target.addEventListener('pointerup', onPointerUp);
  };

  const style: CSSProperties | undefined =
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
        style={{ ...style, ...props.style }}
        className={ResizeHandleDraggerClsRecipe({
          constrained,
        })}
      />
    </div>
  );
}
export const GroupResizeHandle = React.memo(
  GroupResizeHandleFn,
) as typeof GroupResizeHandleFn;
