import * as React from 'react';
import {
  MutableRefObject,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { join } from '../../utils/join';

import {
  boxSizingBorderBox,
  position,
  transformTranslateZero,
} from '../InfiniteTable/utilities.css';
import { useResizeObserver } from '../ResizeObserver';

import { ScrollPosition } from '../types/ScrollPosition';
import { Size } from '../types/Size';
import {
  MatrixBrain,
  MatrixBrainOptions,
  SpanFunction,
} from '../VirtualBrain/MatrixBrain';
import { SpacePlaceholder } from '../VirtualList/SpacePlaceholder';
import { scrollTransformTargetCls } from '../VirtualList/VirtualList.css';
import { VirtualScrollContainer } from '../VirtualScrollContainer';
import { RawTable } from './RawTable';
import { TableRenderCellFnParam } from './ReactHeadlessTableRenderer';

export type HeadlessTableProps = {
  scrollerDOMRef?: MutableRefObject<HTMLElement | null>;
  rows: number;
  cols: number;

  brain: MatrixBrain;

  fixedColsStart?: number;
  fixedColsEnd?: number;
  fixedRowsStart?: number;
  fixedRowsEnd?: number;

  width: number;
  height: number;

  rowHeight: number;
  colWidth: number;

  renderCell: (params: TableRenderCellFnParam) => React.ReactNode;

  rowspan?: SpanFunction;
  colspan?: SpanFunction;

  scrollStopDelay?: number;
};

const measureSizeStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0, // this is same as top,left,bottom,right:0
  pointerEvents: 'none',
  zIndex: -1_000,
};

export function useMatrixBrain(
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
export function HeadlessTable(props: HeadlessTableProps) {
  const brain = props.brain;

  useEffect(() => {
    if (props.scrollStopDelay != null) {
      brain.setScrollStopDelay(props.scrollStopDelay);
    }
  }, [props.scrollStopDelay, brain]);

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

  const domRef = useRef<HTMLDivElement>(null);
  const measureSizeRef = useRef<HTMLDivElement>(null);

  useResizeObserver(measureSizeRef, setMeasureSize);

  const onContainerScroll = useCallback(
    (scrollPos: ScrollPosition) => {
      brain.setScrollPosition(scrollPos);
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
        onContainerScroll={onContainerScroll}
        ref={props.scrollerDOMRef as RefObject<HTMLDivElement>}
      >
        <div
          ref={domRef}
          className={scrollTransformTargetCls}
          data-name="scroll-transform-target"
        >
          <RawTable
            fixedColsStart={props.fixedColsStart}
            fixedColsEnd={props.fixedColsEnd}
            fixedRowsStart={props.fixedRowsStart}
            fixedRowsEnd={props.fixedRowsEnd}
            renderCell={props.renderCell}
            brain={brain}
          />
        </div>
        <SpacePlaceholder
          count={props.rows}
          width={scrollSize.width}
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
