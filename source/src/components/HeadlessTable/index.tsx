import * as React from 'react';
import {
  MutableRefObject,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { setupResizeObserver } from '../ResizeObserver';

import { ScrollPosition } from '../types/ScrollPosition';
import { Size } from '../types/Size';
import { MatrixBrain, MatrixBrainOptions } from '../VirtualBrain/MatrixBrain';
import { SpacePlaceholder } from '../VirtualList/SpacePlaceholder';
import { scrollTransformTargetCls } from '../VirtualList/VirtualList.css';
import { VirtualScrollContainer } from '../VirtualScrollContainer';
import { RawTable } from './RawTable';
import { TableRenderCellFn } from './ReactHeadlessTableRenderer';

export type HeadlessTableProps = {
  scrollerDOMRef?: MutableRefObject<HTMLElement | null>;
  brain: MatrixBrain;
  renderCell: TableRenderCellFn;
  scrollStopDelay?: number;
};

export function useMatrixBrainLazy(
  brain: MatrixBrain,
  brainOptions: Partial<MatrixBrainOptions>,
  fixedCellsInfo: {
    fixedColsStart?: number;
    fixedColsEnd?: number;
    fixedRowsStart?: number;
    fixedRowsEnd?: number;
  },
) {
  useEffect(() => {
    brain.updateFixedCells({
      fixedColsStart: fixedCellsInfo.fixedColsStart,
      fixedColsEnd: fixedCellsInfo.fixedColsEnd,
      fixedRowsStart: fixedCellsInfo.fixedRowsStart,
      fixedRowsEnd: fixedCellsInfo.fixedRowsEnd,
    });
  }, [
    fixedCellsInfo.fixedColsStart,
    fixedCellsInfo.fixedColsEnd,
    fixedCellsInfo.fixedRowsStart,
    fixedCellsInfo.fixedRowsEnd,
    brain,
  ]);

  useEffect(() => {
    brain.update({
      height: brainOptions.height,
      width: brainOptions.width,

      cols: brainOptions.cols,
      rows: brainOptions.rows,

      colWidth: brainOptions.colWidth,
      rowHeight: brainOptions.rowHeight,

      rowspan: brainOptions.rowspan,
      colspan: brainOptions.colspan,
    });
  }, [
    brainOptions.height,
    brainOptions.width,

    brainOptions.cols,
    brainOptions.rows,

    brainOptions.colspan,
    brainOptions.rowspan,

    brainOptions.colWidth,
    brainOptions.rowHeight,

    brain,
  ]);
}

export function useMatrixBrain(
  brain: MatrixBrain,
  brainOptions: Partial<MatrixBrainOptions>,
  fixedCellsInfo?: {
    fixedColsStart?: number;
    fixedColsEnd?: number;
    fixedRowsStart?: number;
    fixedRowsEnd?: number;
  },
) {
  if (
    fixedCellsInfo &&
    (fixedCellsInfo.fixedColsStart ||
      fixedCellsInfo.fixedColsEnd ||
      fixedCellsInfo.fixedRowsStart ||
      fixedCellsInfo.fixedRowsEnd)
  ) {
    brain.updateFixedCells({
      fixedColsStart: fixedCellsInfo.fixedColsStart,
      fixedColsEnd: fixedCellsInfo.fixedColsEnd,
      fixedRowsStart: fixedCellsInfo.fixedRowsStart,
      fixedRowsEnd: fixedCellsInfo.fixedRowsEnd,
    });
  }

  brain.update({
    height: brainOptions.height,
    width: brainOptions.width,

    cols: brainOptions.cols,
    rows: brainOptions.rows,

    colWidth: brainOptions.colWidth,
    rowHeight: brainOptions.rowHeight,

    rowspan: brainOptions.rowspan,
    colspan: brainOptions.colspan,
  });
}
export function HeadlessTable(
  props: HeadlessTableProps & React.HTMLProps<HTMLDivElement>,
) {
  const { brain, scrollerDOMRef, scrollStopDelay, renderCell, ...domProps } =
    props;

  const domRef = useRef<HTMLDivElement>(null);

  const [scrollSize, setTotalScrollSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (scrollStopDelay != null) {
      brain.setScrollStopDelay(scrollStopDelay);
    }
  }, [scrollStopDelay, brain]);

  useEffect(() => {
    const node = domRef.current?.parentNode as HTMLElement;
    if (!node) {
      return;
    }
    const onResize = () => {
      // it's not enough to read the size from onResize
      // since that doesn't account for scrollbar presence and size
      // so we need to read it from the DOM from clientWidth/clientHeight
      const size: Size = {
        height: node.clientHeight,
        width: node.clientWidth,
      };

      brain.update(size);
    };
    const remove = setupResizeObserver(node, onResize);

    return remove;
  }, []);

  const onContainerScroll = useCallback(
    (scrollPos: ScrollPosition) => {
      brain.setScrollPosition(scrollPos);
      domRef.current!.style.transform = `translate3d(${-scrollPos.scrollLeft}px, ${-scrollPos.scrollTop}px, 0px)`;
    },
    [brain],
  );

  useEffect(() => {
    const removeOnRenderCount = brain.onRenderCountChange(() => {
      setTotalScrollSize(brain.getTotalSize());
    });

    setTotalScrollSize(brain.getTotalSize());

    return removeOnRenderCount;
  }, [brain]);

  return (
    <VirtualScrollContainer
      onContainerScroll={onContainerScroll}
      {...domProps}
      ref={scrollerDOMRef as RefObject<HTMLDivElement>}
    >
      <div
        ref={domRef}
        className={scrollTransformTargetCls}
        data-name="scroll-transform-target"
      >
        <RawTable renderCell={renderCell} brain={brain} />
      </div>
      <SpacePlaceholder width={scrollSize.width} height={scrollSize.height} />
    </VirtualScrollContainer>
  );
}
