import * as React from 'react';

import { ICSS } from '../../../../style/utilities';
import { join } from '../../../../utils/join';
import { getScrollbarWidth } from '../../../utils/getScrollbarWidth';
import { VirtualBrain } from '../../../VirtualBrain';
import { useInfiniteTable } from '../../hooks/useInfiniteTable';

import { VerticalScrollbarPlaceholder } from '../ScrollbarPlaceholder';
import { InfiniteTableHeader } from './InfiniteTableHeader';
import { InfiniteTableHeaderUnvirtualized } from './InfiniteTableHeaderUnvirtualized';

export type TableHeaderWrapperProps = {
  brain: VirtualBrain;
  scrollbars: { vertical: boolean; horizontal: boolean };
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

  const header = virtualizeHeader ? (
    <InfiniteTableHeader
      columns={computedUnpinnedColumns}
      repaintId={virtualizeHeader ? repaintId : undefined}
      brain={brain}
      style={{
        position: 'absolute',
        left: computedPinnedStartWidth,
        width: computedUnpinnedColumnsWidth,
        height: columnGroupsMaxDepth || headerHeight,
      }}
      availableWidth={computedUnpinnedColumnsWidth}
      totalWidth={computedUnpinnedColumnsWidth}
    />
  ) : (
    <InfiniteTableHeaderUnvirtualized
      brain={brain}
      scrollable
      columns={computedUnpinnedColumns}
      availableWidth={computedUnpinnedColumnsWidth}
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
            width: computedPinnedStartWidth,
          }}
          availableWidth={computedPinnedStartWidth}
          totalWidth={computedPinnedStartColumnsWidth}
          columns={computedPinnedStartColumns}
          scrollable={computedPinnedStartOverflow}
          classNameModifiers={[
            'pinned',
            'pinned-start',
            computedPinnedStartOverflow ? 'overflow' : '',
          ]}
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
          classNameModifiers={[
            'pinned',
            'pinned-end',
            computedPinnedEndOverflow ? 'overflow' : '',
          ]}
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
