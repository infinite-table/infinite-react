import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { join } from '../../utils/join';

import {
  boxSizingBorderBox,
  position,
  transformTranslateZero,
} from '../InfiniteTable/utilities.css';

import { ScrollPosition } from '../types/ScrollPosition';
import { MatrixBrain, SpanFunction } from '../VirtualBrain/MatrixBrain';
import { SpacePlaceholder } from '../VirtualList/SpacePlaceholder';
import { scrollTransformTargetCls } from '../VirtualList/VirtualList.css';
import { VirtualScrollContainer } from '../VirtualScrollContainer';
import { RawTable } from './RawTable';
import { TableRenderCellFnParam } from './ReactHeadlessTableRenderer';

export type HeadlessTableProps = {
  rows: number;
  cols: number;

  width: number;
  height: number;

  rowHeight: number;
  colWidth: number;

  renderCell: (params: TableRenderCellFnParam) => React.ReactNode;

  rowspan?: SpanFunction;
  colspan?: SpanFunction;
};
export function HeadlessTable(props: HeadlessTableProps) {
  const [brain] = React.useState(() => new MatrixBrain());

  useEffect(() => {
    brain.update({
      height: props.height,
      width: props.width,

      cols: props.cols,
      rows: props.rows,

      colSize: props.colWidth,
      rowSize: props.rowHeight,

      rowspan: props.rowspan,
      colspan: props.colspan,
    });
  }, [
    props.height,
    props.width,

    props.cols,
    props.rows,

    props.colspan,
    props.rowspan,

    props.colWidth,
    props.rowHeight,

    brain,
  ]);

  const domRef = useRef<HTMLDivElement>(null);

  const onContainerScroll = useCallback(
    (scrollPos: ScrollPosition) => {
      brain.setScrollPosition(scrollPos);
      domRef.current!.style.transform = `translate3d(${-scrollPos.scrollLeft}px, ${-scrollPos.scrollTop}px, 0px)`;
    },
    [brain],
  );

  const [totalSize, setTotalSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const removeOnRenderCount = brain.onRenderCountChange(() => {
      setTotalSize(brain.getTotalSize());
    });

    setTotalSize(brain.getTotalSize());

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
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(11,150px)',
          }}
        >
          <RawTable renderCell={props.renderCell} brain={brain} />
        </div>
        <SpacePlaceholder
          count={props.rows}
          width={totalSize.width}
          height={totalSize.height}
        />
      </VirtualScrollContainer>
    </div>
  );
}
