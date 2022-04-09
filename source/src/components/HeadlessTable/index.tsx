import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { join } from '../../utils/join';

import {
  boxSizingBorderBox,
  position,
  transformTranslateZero,
} from '../InfiniteTable/utilities.css';
import { useResizeObserver } from '../ResizeObserver';

import { ScrollPosition } from '../types/ScrollPosition';
import { Size } from '../types/Size';
import { MatrixBrain, SpanFunction } from '../VirtualBrain/MatrixBrain';
import { SpacePlaceholder } from '../VirtualList/SpacePlaceholder';
import { scrollTransformTargetCls } from '../VirtualList/VirtualList.css';
import { VirtualScrollContainer } from '../VirtualScrollContainer';
import { RawTable } from './RawTable';
import { TableRenderCellFnParam } from './ReactHeadlessTableRenderer';

export type HeadlessTableProps = {
  rows: number;
  cols: number;

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
};

const measureSizeStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0, // this is same as top,left,bottom,right:0
  pointerEvents: 'none',
  zIndex: -1_000,
};
export function HeadlessTable(props: HeadlessTableProps) {
  const [brain] = React.useState(() => new MatrixBrain());

  useEffect(() => {
    brain.updateFixedCells({
      fixedColsStart: props.fixedColsStart,
      fixedColsEnd: props.fixedColsEnd,
      fixedRowsStart: props.fixedRowsStart,
      fixedRowsEnd: props.fixedRowsEnd,
    });
  }, [
    props.fixedColsStart,
    props.fixedColsEnd,
    props.fixedRowsStart,
    props.fixedRowsEnd,
    brain,
  ]);

  const [measureSize, setMeasureSize] = useState<Size | null>(null);

  const size = measureSize || { width: props.width, height: props.height };

  useEffect(() => {
    brain.update({
      height: size.height,
      width: size.width,

      cols: props.cols,
      rows: props.rows,

      colSize: props.colWidth,
      rowSize: props.rowHeight,

      rowspan: props.rowspan,
      colspan: props.colspan,
    });
  }, [
    size.height,
    size.width,

    props.cols,
    props.rows,

    props.colspan,
    props.rowspan,

    props.colWidth,
    props.rowHeight,

    brain,
  ]);

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
      <VirtualScrollContainer onContainerScroll={onContainerScroll}>
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
        <div ref={measureSizeRef} style={measureSizeStyle} />
      </VirtualScrollContainer>
    </div>
  );
}
