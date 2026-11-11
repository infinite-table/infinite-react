import * as React from 'react';
import {
  RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

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

  const updateDOMTransform = useCallback(
    (contentScrollPos: ScrollPosition) => {
      // relative to the scroll origin, like all the cells - see largeContent.ts.
      // Computed now, not in the raf: cells were (re)positioned for this origin
      const scrollPos = brain.getDOMScrollPosition(contentScrollPos);
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
    },
    [brain],
  );

  const onContainerScroll = useCallback(
    (nativeScrollPos: ScrollPosition) => {
      // the scroll container may be shorter than the content (when the
      // content is larger than what browsers support) - the brain works with
      // content positions - see largeContent.ts
      brain.setScrollPosition(
        brain.toContentScrollPosition(nativeScrollPos),
        updateDOMTransform,
      );
    },
    [brain, updateDOMTransform],
  );

  useEffect(() => {
    // the spacer gets the content size, capped at what the browser supports
    const removeOnRenderCount = brain.onRenderCountChange(() => {
      setTotalScrollSize(brain.getNativeScrollSize());
    });

    setTotalScrollSize(brain.getNativeScrollSize());

    // useful when the brain is changed - when toggling the value of wrapRowsHorizontally
    updateDOMTransform(
      brain.getScrollPosition() || { scrollLeft: 0, scrollTop: 0 },
    );

    return removeOnRenderCount;
  }, [brain]);

  // When the scroll ratio changes (huge content that grows/shrinks, or
  // starts/stops being huge), keep the content the user was looking at:
  // rewrite the native scroll position for the new ratio - see largeContent.ts
  const scrollRatioRef = useRef({ brain, vertical: 1, horizontal: 1 });
  useLayoutEffect(() => {
    const prev = scrollRatioRef.current;
    const vertical = brain.getScrollRatio('vertical');
    const horizontal = brain.getScrollRatio('horizontal');
    scrollRatioRef.current = { brain, vertical, horizontal };

    const scroller = domRef.current?.parentElement;
    if (
      !scroller ||
      prev.brain !== brain ||
      (prev.vertical === vertical && prev.horizontal === horizontal)
    ) {
      return;
    }
    const nativeScrollPos = brain.toNativeScrollPosition(
      brain.getScrollPosition(),
    );
    if (prev.vertical !== vertical) {
      scroller.scrollTop = nativeScrollPos.scrollTop;
    }
    if (prev.horizontal !== horizontal) {
      scroller.scrollLeft = nativeScrollPos.scrollLeft;
    }
  }, [scrollSize, brain]);

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
