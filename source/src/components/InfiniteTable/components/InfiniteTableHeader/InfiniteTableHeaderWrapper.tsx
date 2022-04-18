import * as React from 'react';
import type { Scrollbars } from '../..';
import { useMatrixBrain } from '../../../HeadlessTable';

import { getScrollbarWidth } from '../../../utils/getScrollbarWidth';
import { MatrixBrain } from '../../../VirtualBrain/MatrixBrain';
import { useInfiniteTable } from '../../hooks/useInfiniteTable';

import { VerticalScrollbarPlaceholder } from '../ScrollbarPlaceholder';
import { HeaderScrollbarPlaceholderCls, HeaderWrapperCls } from './header.css';
import { InfiniteTableHeader } from './InfiniteTableHeader';
import { InfiniteTableHeaderUnvirtualized } from './InfiniteTableHeaderUnvirtualized';

export type TableHeaderWrapperProps = {
  brain: MatrixBrain;
  scrollbars: Scrollbars;
  repaintId?: number | string;
};
export function TableHeaderWrapper<T>(props: TableHeaderWrapperProps) {
  const { brain, scrollbars } = props;

  const tableContextValue = useInfiniteTable<T>();

  const {
    computedPinnedStartColumns,
    computedPinnedEndColumns,
    computedUnpinnedColumnsWidth,
    computedVisibleColumns,
    columnSize,
  } = tableContextValue.computed;

  const {
    componentState: { headerHeight, columnGroupsMaxDepth },
  } = tableContextValue;

  const height = columnGroupsMaxDepth
    ? columnGroupsMaxDepth * headerHeight
    : headerHeight;

  useMatrixBrain(
    brain,
    {
      colWidth: columnSize,
      rowHeight: headerHeight,
      rows: columnGroupsMaxDepth || 1,
      cols: computedVisibleColumns.length,
      height,
    },
    {
      fixedColsEnd: computedPinnedEndColumns.length,
      fixedColsStart: computedPinnedStartColumns.length,
    },
  );

  const header = (
    <InfiniteTableHeader
      columns={computedVisibleColumns}
      brain={brain}
      headerHeight={headerHeight}
      availableWidth={computedUnpinnedColumnsWidth}
      totalWidth={computedUnpinnedColumnsWidth}
    />
  );

  const verticalScrollbarPlaceholder =
    scrollbars.vertical && getScrollbarWidth() ? (
      <div
        className={HeaderScrollbarPlaceholderCls}
        style={{
          zIndex: 1000,
          width: getScrollbarWidth(),
        }}
      />
    ) : null;

  return (
    <div
      className={HeaderWrapperCls}
      style={{
        height: height,
      }}
    >
      {header}
      {verticalScrollbarPlaceholder}
    </div>
  );
}
