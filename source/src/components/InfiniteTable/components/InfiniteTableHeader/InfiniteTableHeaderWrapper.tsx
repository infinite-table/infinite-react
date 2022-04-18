import * as React from 'react';
import type { Scrollbars } from '../..';

import { getScrollbarWidth } from '../../../utils/getScrollbarWidth';
import { MatrixBrain } from '../../../VirtualBrain/MatrixBrain';
import { useInfiniteTable } from '../../hooks/useInfiniteTable';

import { VerticalScrollbarPlaceholder } from '../ScrollbarPlaceholder';
import { HeaderWrapperCls } from './header.css';
import { InfiniteTableHeaderUnvirtualized } from './InfiniteTableHeaderUnvirtualized';

export type TableHeaderWrapperProps = {
  brain: MatrixBrain;
  scrollbars: Scrollbars;
  repaintId?: number | string;
};
export function TableHeaderWrapper<T>(props: TableHeaderWrapperProps) {
  const { brain, scrollbars, repaintId } = props;

  const tableContextValue = useInfiniteTable<T>();

  const {
    computedUnpinnedColumns,
    computedPinnedStartColumns,
    computedPinnedEndColumns,
    computedPinnedStartColumnsWidth,
    computedPinnedStartWidth,
    computedPinnedEndWidth,
    computedPinnedEndColumnsWidth,
    computedUnpinnedColumnsWidth,
    computedPinnedStartOverflow,
    computedPinnedEndOverflow,
  } = tableContextValue.computed;

  const {
    componentState: {
      virtualizeHeader,
      headerHeight,
      columnGroupsMaxDepth,
      pinnedStartScrollListener,
      pinnedEndScrollListener,
    },
  } = tableContextValue;

  const hasPinnedStart = computedPinnedStartColumns.length > 0;
  const hasPinnedEnd = computedPinnedEndColumns.length > 0;
  const height = columnGroupsMaxDepth
    ? columnGroupsMaxDepth * headerHeight
    : headerHeight;

  const unvirtualizedStyle: React.HTMLProps<HTMLElement>['style'] =
    !virtualizeHeader && computedPinnedStartColumnsWidth
      ? {
          left: computedPinnedStartWidth,
        }
      : undefined;

  // const header = virtualizeHeader ? (
  //   <InfiniteTableHeader
  //     columns={computedUnpinnedColumns}
  //     repaintId={virtualizeHeader ? repaintId : undefined}
  //     brain={brain}
  //     pinning={false}
  //     style={{
  //       position: 'absolute',
  //       left: computedPinnedStartWidth,
  //       width: computedUnpinnedColumnsWidth,
  //       height: columnGroupsMaxDepth || headerHeight,
  //     }}
  //     availableWidth={computedUnpinnedColumnsWidth}
  //     totalWidth={computedUnpinnedColumnsWidth}
  //   />
  // ) : (
  const header = (
    <InfiniteTableHeaderUnvirtualized
      style={unvirtualizedStyle}
      brain={brain}
      scrollable
      pinning={false}
      columns={computedUnpinnedColumns}
      availableWidth={computedUnpinnedColumnsWidth}
      totalWidth={computedUnpinnedColumnsWidth}
    />
  );

  return (
    <div
      className={HeaderWrapperCls}
      style={{
        height: virtualizeHeader ? height : undefined,
      }}
    >
      {hasPinnedStart ? (
        <InfiniteTableHeaderUnvirtualized
          style={{
            left: 0,
            position: 'absolute',
            width: computedPinnedStartWidth,
          }}
          availableWidth={computedPinnedStartWidth}
          totalWidth={computedPinnedStartColumnsWidth}
          columns={computedPinnedStartColumns}
          scrollable={computedPinnedStartOverflow}
          pinning={'start'}
          scrollListener={
            computedPinnedStartOverflow ? pinnedStartScrollListener : undefined
          }
        />
      ) : null}
      {header}
      {hasPinnedEnd ? (
        <InfiniteTableHeaderUnvirtualized
          style={{
            right: scrollbars.vertical ? getScrollbarWidth() : 0,
            position: 'absolute',
            width: computedPinnedEndWidth,
          }}
          columns={computedPinnedEndColumns}
          availableWidth={computedPinnedEndWidth}
          totalWidth={computedPinnedEndColumnsWidth}
          scrollable={computedPinnedEndOverflow}
          pinning={'end'}
          scrollListener={
            computedPinnedEndOverflow ? pinnedEndScrollListener : undefined
          }
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
