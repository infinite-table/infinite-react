import * as React from 'react';
import { RefObject, useCallback, useEffect, useRef, useState } from 'react';

import { setupResizeObserver } from '../ResizeObserver';

import type { ScrollPosition } from '../types/ScrollPosition';
import type { Size } from '../types/Size';

import { MatrixBrain, MatrixBrainOptions } from '../VirtualBrain/MatrixBrain';
import { SpacePlaceholder } from '../VirtualList/SpacePlaceholder';
import { scrollTransformTargetCls } from '../VirtualList/VirtualList.css';
import {
  VirtualScrollContainer,
  VirtualScrollContainerChildToScrollCls,
} from '../VirtualScrollContainer';
import { RawTable } from './RawTable';
import { SubscriptionCallback } from '../types/SubscriptionCallback';
import { Renderable } from '../types/Renderable';
import { ActiveRowIndicator } from '../InfiniteTable/components/ActiveRowIndicator';
import { ActiveCellIndicator } from '../InfiniteTable/components/ActiveCellIndicator';
import { join } from '../../utils/join';
import { TableRenderCellFn, TableRenderDetailRowFn } from './rendererTypes';
import { GridRenderer } from './ReactHeadlessTableRenderer';
// import { InternalVars } from '../InfiniteTable/internalVars.css';
// import { stripVar } from '../../utils/stripVar';
import { CELL_DETACHED_CLASSNAMES } from '../InfiniteTable/components/cellDetachedCls';

// const virtualScrollLeftOffset = stripVar(InternalVars.virtualScrollLeftOffset);
// const virtualScrollTopOffset = stripVar(InternalVars.virtualScrollTopOffset);

export type HeadlessTableProps = {
  scrollerDOMRef?: RefObject<HTMLElement | null>;
  scrollVarHostRef?: RefObject<HTMLElement | null>;
  wrapRowsHorizontally?: boolean;
  brain: MatrixBrain;
  forceRerenderTimestamp?: number;
  debugId?: string;
  activeCellRowHeight: number | ((rowIndex: number) => number) | undefined;
  renderCell: TableRenderCellFn;
  renderDetailRow?: TableRenderDetailRowFn;
  activeRowIndex?: number | null;
  activeCellIndex?: [number, number] | null;
  scrollStopDelay?: number;
  cellHoverClassNames?: string[];
  renderer?: GridRenderer;
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

const CHILD_TO_SCROLL_CLS = join(
  scrollTransformTargetCls,
  VirtualScrollContainerChildToScrollCls,
);
export function HeadlessTable(
  props: HeadlessTableProps & React.HTMLProps<HTMLDivElement>,
) {
  const {
    brain,
    scrollerDOMRef,
    scrollStopDelay,
    renderCell,
    renderDetailRow,
    activeCellRowHeight,
    cellHoverClassNames,
    renderer,
    activeRowIndex,
    activeCellIndex,
    onRenderUpdater,
    wrapRowsHorizontally,
    forceRerenderTimestamp,
    scrollVarHostRef,
    ...domProps
  } = props;

  const { autoFocus } = domProps;

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
    if (autoFocus && document.activeElement !== node) {
      node.focus();
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
    const remove = setupResizeObserver(node, onResize, { debounce: 50 });

    return remove;
  }, [wrapRowsHorizontally, brain]);

  const updateDOMTransform = useCallback((scrollPos: ScrollPosition) => {
    requestAnimationFrame(() => {
      // const scrollVarHost = scrollVarHostRef?.current;

      // if (!scrollVarHost) {
      // seems like it's a lot less performant to scroll via CSS vars
      // as STYLE RECALCULATION is a lot more expensive than using the transform property

      if (!domRef.current) {
        // we're in a raf, so the component might have been unmounted in the meantime
        // so we protect against that
        return;
      }
      domRef.current!.style.setProperty(
        'transform',
        `translate3d(${-scrollPos.scrollLeft}px, ${-scrollPos.scrollTop}px, 0px)`,
      );
      return;
      // }

      // scrollVarHost.style.setProperty(
      //   virtualScrollLeftOffset,
      //   `-${scrollPos.scrollLeft}px`,
      // );

      // scrollVarHost.style.setProperty(
      //   virtualScrollTopOffset,
      //   `-${scrollPos.scrollTop}px`,
      // );
    });
  }, []);

  const onContainerScroll = useCallback(
    (scrollPos: ScrollPosition) => {
      brain.setScrollPosition(scrollPos, updateDOMTransform);
    },
    [brain, updateDOMTransform],
  );

  useEffect(() => {
    const removeOnRenderCount = brain.onRenderCountChange(() => {
      setTotalScrollSize(brain.getVirtualizedContentSize());
    });

    setTotalScrollSize(brain.getVirtualizedContentSize());

    // useful when the brain is changed - when toggling the value of wrapRowsHorizontally
    updateDOMTransform(
      brain.getScrollPosition() || { scrollLeft: 0, scrollTop: 0 },
    );

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
        className={CHILD_TO_SCROLL_CLS}
        data-name="scroll-transform-target"
      >
        <RawTable
          forceRerenderTimestamp={forceRerenderTimestamp}
          renderer={renderer}
          onRenderUpdater={onRenderUpdater}
          renderCell={renderCell}
          renderDetailRow={renderDetailRow}
          brain={brain}
          cellHoverClassNames={cellHoverClassNames}
          cellDetachedClassNames={CELL_DETACHED_CLASSNAMES}
        />
        {activeCellIndex != null ? (
          <ActiveCellIndicator
            brain={brain}
            rowHeight={activeCellRowHeight}
            activeCellIndex={activeCellIndex}
          />
        ) : null}
      </div>
      {activeRowIndex != null ? (
        <ActiveRowIndicator brain={brain} activeRowIndex={activeRowIndex} />
      ) : null}

      <SpacePlaceholder
        width={scrollSize.width}
        height={scrollSize.height}
      ></SpacePlaceholder>
    </VirtualScrollContainer>
  );
}
