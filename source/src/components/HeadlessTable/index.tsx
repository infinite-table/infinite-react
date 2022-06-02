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

import type { ScrollPosition } from '../types/ScrollPosition';
import type { Size } from '../types/Size';
import type {
  ReactHeadlessTableRenderer,
  TableRenderCellFn,
} from './ReactHeadlessTableRenderer';

import { MatrixBrain, MatrixBrainOptions } from '../VirtualBrain/MatrixBrain';
import { SpacePlaceholder } from '../VirtualList/SpacePlaceholder';
import { scrollTransformTargetCls } from '../VirtualList/VirtualList.css';
import { VirtualScrollContainer } from '../VirtualScrollContainer';
import { RawTable } from './RawTable';
import { SubscriptionCallback } from '../types/SubscriptionCallback';
import { Renderable } from '../types/Renderable';
import { ActiveRowIndicator } from '../InfiniteTable/components/ActiveRowIndicator';
import { ActiveCellIndicator } from '../InfiniteTable/components/ActiveCellIndicator';

export type HeadlessTableProps = {
  scrollerDOMRef?: MutableRefObject<HTMLElement | null>;
  brain: MatrixBrain;
  renderCell: TableRenderCellFn;
  activeRowIndex?: number | null;
  activeCellIndex?: [number, number] | null;
  scrollStopDelay?: number;
  cellHoverClassNames?: string[];
  renderer?: ReactHeadlessTableRenderer;
  onRenderUpdater?: SubscriptionCallback<Renderable>;
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
  const {
    brain,
    scrollerDOMRef,
    scrollStopDelay,
    renderCell,
    cellHoverClassNames,
    renderer,
    activeRowIndex,
    activeCellIndex,
    onRenderUpdater,
    ...domProps
  } = props;

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
      brain.setScrollPosition(scrollPos, (scrollPos) => {
        domRef.current!.style.transform = `translate3d(${-scrollPos.scrollLeft}px, ${-scrollPos.scrollTop}px, 0px)`;
      });
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
        <RawTable
          renderer={renderer}
          onRenderUpdater={onRenderUpdater}
          renderCell={renderCell}
          brain={brain}
          cellHoverClassNames={cellHoverClassNames}
        />
      </div>

      <ActiveRowIndicator brain={brain} activeRowIndex={activeRowIndex} />
      <ActiveCellIndicator brain={brain} activeCellIndex={activeCellIndex} />
      <SpacePlaceholder width={scrollSize.width} height={scrollSize.height} />
    </VirtualScrollContainer>
  );
}
