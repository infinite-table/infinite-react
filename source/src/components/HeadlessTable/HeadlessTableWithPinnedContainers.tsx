//@ts-nocheck
import React, {
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { HeadlessTableProps, useMatrixBrain } from '.';
import { join } from '../../utils/join';
import {
  boxSizingBorderBox,
  display,
  position,
  transformTranslateZero,
} from '../InfiniteTable/utilities.css';
import { useResizeObserver } from '../ResizeObserver';
import { ScrollPosition } from '../types/ScrollPosition';
import { Size } from '../types/Size';
import { getScrollbarWidth } from '../utils/getScrollbarWidth';
import { MatrixBrain } from '../VirtualBrain/MatrixBrain';
import { SpacePlaceholder } from '../VirtualList/SpacePlaceholder';
import { scrollTransformTargetCls } from '../VirtualList/VirtualList.css';
import { VirtualScrollContainer } from '../VirtualScrollContainer';
import { RawTable } from './RawTable';
import { TableRenderCellFnParam } from './ReactHeadlessTableRenderer';

export type HeadlessTableWithPinnedContainersProps = {} & HeadlessTableProps;

const ONLY_VERTICAL_SCROLL = {
  horizontal: false,
  vertical: true,
};

const measureSizeStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0, // this is same as top,left,bottom,right:0
  pointerEvents: 'none',
  zIndex: -1_000,
};
export function HeadlessTableWithPinnedContainersFn(
  props: HeadlessTableWithPinnedContainersProps,
) {
  const { brain } = props;

  const domRef = useRef<HTMLDivElement>(null);
  const measureSizeRef = useRef<HTMLDivElement>(null);

  const [measureSize, setMeasureSize] = useState<Size | null>(null);
  const size = measureSize || { width: props.width, height: props.height };

  useMatrixBrain(
    brain,
    {
      ...props,
      height: size.height,
      width: size.width,
    },
    {
      fixedColsStart: props.fixedColsStart,
      fixedColsEnd: props.fixedColsEnd,
      fixedRowsStart: props.fixedRowsStart,
      fixedRowsEnd: props.fixedRowsEnd,
    },
  );
  useResizeObserver(measureSizeRef, setMeasureSize);
  const onContainerScroll = useCallback(
    (scrollPos: ScrollPosition) => {
      brain.setScrollPosition({
        scrollTop: scrollPos.scrollTop,
        scrollLeft: 0,
      });
      domRef.current!.style.transform = `translate3d(${-scrollPos.scrollLeft}px, ${-scrollPos.scrollTop}px, 0px)`;
    },
    [brain],
  );

  const [scrollSize, setTotalScrollSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const removeOnRenderCount = brain.onRenderCountChange(() => {
      setTotalScrollSize(brain.getTotalSize());
    });

    setTotalScrollSize(brain.getTotalSize());

    return () => {
      removeOnRenderCount();
    };
  }, [brain]);

  // const hasHorizontalScrollbar =
  //   computedUnpinnedColumnsWidth >
  //   bodySize.width -
  //     computedPinnedStartColumnsWidth -
  //     computedPinnedEndColumnsWidth;

  // const reservedContentHeight =
  //   brain.getTotalSize().height +
  //   (hasHorizontalScrollbar ? getScrollbarWidth() : 0);
  return (
    <div
      className={join(
        transformTranslateZero,
        position.relative,
        boxSizingBorderBox,
      )}
      style={{
        width: props.width,
        height: props.height,
      }}
    >
      <VirtualScrollContainer
        scrollable={ONLY_VERTICAL_SCROLL}
        onContainerScroll={onContainerScroll}
        ref={props.scrollerDOMRef as RefObject<HTMLDivElement>}
      >
        <div className={display.flex}>
          <div
            ref={domRef}
            className={scrollTransformTargetCls}
            data-name="scroll-transform-target"
          >
            <RawTable renderCell={props.renderCell} brain={brain} />
          </div>
        </div>
        <SpacePlaceholder
          count={props.rows}
          width={0}
          height={scrollSize.height}
        />
        {/**
         * we need this size measurer, even though we have props.width and props.height passed down to us
         * because this measurer also accounts for scrollbars showing/hiding which changes the
         * dimensions of the space available for virtualization
         */}
        <div ref={measureSizeRef} style={measureSizeStyle} />
      </VirtualScrollContainer>
    </div>
  );
}

export const HeadlessTableWithPinnedContainers: React.FC<HeadlessTableWithPinnedContainersProps> =
  React.memo(HeadlessTableWithPinnedContainersFn);
