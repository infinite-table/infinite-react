import React, { PointerEvent } from 'react';

import { getResizer } from './fetchElements';
import { ResizeHandleCls, ResizeHandleDraggerCls } from './ResizeHandle.css';

type ResizeHandleProps = {
  columnIndex: number;
  initialWidth: number;
  totalColumns: number;
  onResize: (newWidth: number) => void;
};
function ResizeHandleFn(props: ResizeHandleProps) {
  const onPointerDown = (e: PointerEvent) => {
    e.stopPropagation();

    const pointerId = e.pointerId;
    const initialX = e.clientX;
    const target = e.target as HTMLElement;

    target.setPointerCapture(pointerId);

    const resizer = getResizer(props.columnIndex, {
      totalColumns: props.totalColumns,
    });

    const onPointerMove = (e: PointerEvent) => {
      resizer.resize(Math.round(e.clientX - initialX));
    };

    const onPointerUp = () => {
      target.releasePointerCapture(pointerId);

      //@ts-ignore
      target.removeEventListener('pointermove', onPointerMove);
      //@ts-ignore
      target.removeEventListener('pointerup', onPointerUp);
    };

    //@ts-ignore
    target.addEventListener('pointermove', onPointerMove);
    //@ts-ignore
    target.addEventListener('pointerup', onPointerUp);
  };

  return (
    <div className={ResizeHandleCls} onPointerDown={onPointerDown}>
      <div className={ResizeHandleDraggerCls} />
    </div>
  );
}
export const ResizeHandle = React.memo(
  ResizeHandleFn,
  () => true,
) as typeof ResizeHandleFn;
