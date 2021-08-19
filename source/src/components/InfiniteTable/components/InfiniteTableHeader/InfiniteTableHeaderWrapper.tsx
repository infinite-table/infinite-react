import * as React from 'react';
import { useCallback, useRef, useState } from 'react';
import { ICSS } from '../../../../style/utilities';
import { join } from '../../../../utils/join';
import { getScrollbarWidth } from '../../../utils/getScrollbarWidth';
import { VirtualBrain } from '../../../VirtualBrain';
import { useInfiniteTable } from '../../hooks/useInfiniteTable';
import { Size } from '../../../types/Size';
import { VerticalScrollbarPlaceholder } from '../ScrollbarPlaceholder';
import { InfiniteTableHeader } from './InfiniteTableHeader';
import { InfiniteTableHeaderUnvirtualized } from './InfiniteTableHeaderUnvirtualized';

export type TableHeaderWrapperProps = {
  brain: VirtualBrain;
  scrollbars: { vertical: boolean; horizontal: boolean };
  repaintId?: number | string;
  onResize?: (height: number) => void;
};
export function TableHeaderWrapper<T>(props: TableHeaderWrapperProps) {
  const { brain, scrollbars, repaintId, onResize } = props;

  const tableContextValue = useInfiniteTable<T>();

  const lastResizeHeightRef = useRef<number>(0);

  const [sizes, setSizes] = useState<[number, number, number]>([0, 0, 0]);

  const onResizePinnedStart = useCallback((size: Size) => {
    setSizes((sizes) => {
      sizes = [...sizes];
      sizes[0] = size.height;

      if (lastResizeHeightRef.current !== sizes[0]) {
        lastResizeHeightRef.current = sizes[0];
        onResize?.(sizes[0]);
      }
      return sizes;
    });
  }, []);

  const onResizeUnpinned = useCallback((size: Size) => {
    setSizes((sizes) => {
      sizes = [...sizes];
      sizes[1] = size.height;
      if (lastResizeHeightRef.current !== sizes[1]) {
        lastResizeHeightRef.current = sizes[1];
        onResize?.(sizes[1]);
      }
      return sizes;
    });
  }, []);
  const onResizePinnedEnd = useCallback((size: Size) => {
    setSizes((sizes) => {
      sizes = [...sizes];
      sizes[2] = size.height;
      if (lastResizeHeightRef.current !== sizes[2]) {
        lastResizeHeightRef.current = sizes[2];
        onResize?.(sizes[2]);
      }
      return sizes;
    });
  }, []);

  const {
    computedUnpinnedColumns,
    computedPinnedStartColumns,
    computedPinnedEndColumns,
    computedPinnedStartColumnsWidth,
    computedPinnedEndColumnsWidth,
    computedUnpinnedColumnsWidth,
  } = tableContextValue.computed;

  const {
    componentState: { virtualizeHeader },
  } = tableContextValue;

  const hasPinnedStart = computedPinnedStartColumns.length > 0;
  const hasPinnedEnd = computedPinnedEndColumns.length > 0;
  const height = Math.max(...sizes);

  const header = virtualizeHeader ? (
    <InfiniteTableHeader
      columns={computedUnpinnedColumns}
      repaintId={virtualizeHeader ? repaintId : undefined}
      brain={brain}
      onResize={onResizeUnpinned}
      style={{
        position: 'absolute',
        left: computedPinnedStartColumnsWidth,
        width: computedUnpinnedColumnsWidth,
      }}
      totalWidth={computedUnpinnedColumnsWidth}
    />
  ) : (
    <InfiniteTableHeaderUnvirtualized
      columns={computedUnpinnedColumns}
      totalWidth={computedUnpinnedColumnsWidth}
    />
  );

  return (
    <div
      className={join(
        ICSS.overflow.hidden,
        ICSS.position.relative,
        ICSS.display.flex,
        ICSS.flexFlow.row,
      )}
      style={{
        background: 'var(--ITableHeader__background)',
        height: virtualizeHeader ? height : undefined,
      }}
    >
      {hasPinnedStart ? (
        <InfiniteTableHeaderUnvirtualized
          style={{
            left: 0,
            position: 'absolute',
            width: computedPinnedStartColumnsWidth,
          }}
          onResize={onResizePinnedStart}
          columns={computedPinnedStartColumns}
          totalWidth={computedPinnedStartColumnsWidth}
        />
      ) : null}
      {header}
      {hasPinnedEnd ? (
        <InfiniteTableHeaderUnvirtualized
          onResize={onResizePinnedEnd}
          style={{
            right: scrollbars.vertical ? getScrollbarWidth() : 0,
            position: 'absolute',
            width: computedPinnedEndColumnsWidth,
          }}
          columns={computedPinnedEndColumns}
          totalWidth={computedPinnedEndColumnsWidth}
        />
      ) : null}
      {scrollbars.vertical ? (
        <VerticalScrollbarPlaceholder
          style={{
            height: '100%',
            right: 0,
          }}
        ></VerticalScrollbarPlaceholder>
      ) : null}
    </div>
  );
}
