import * as React from 'react';

import type { Scrollbars } from '../..';
import { useMatrixBrain } from '../../../HeadlessTable';
import { getScrollbarWidth } from '../../../utils/getScrollbarWidth';
import { MatrixBrain } from '../../../VirtualBrain/MatrixBrain';
import { useInfiniteTable } from '../../hooks/useInfiniteTable';

import { buildColumnAndGroupTree } from './buildColumnAndGroupTree';
import { HeaderScrollbarPlaceholderCls, HeaderWrapperCls } from './header.css';
import { InfiniteTableHeader } from './InfiniteTableHeader';

export type TableHeaderWrapperProps = {
  brain: MatrixBrain;
  scrollbars: Scrollbars;
};
export function TableHeaderWrapper<T>(props: TableHeaderWrapperProps) {
  const { brain, scrollbars } = props;

  const tableContextValue = useInfiniteTable<T>();

  const {
    computedPinnedStartColumns,
    computedPinnedEndColumns,
    computedVisibleColumns,
    columnSize,
  } = tableContextValue.computed;

  const {
    componentState: {
      headerHeight,
      columnGroupsDepthsMap,
      columnGroupsMaxDepth,
      computedColumnGroups,
    },
  } = tableContextValue;

  const rows =
    !computedColumnGroups || !computedColumnGroups.size
      ? 1
      : columnGroupsMaxDepth + 2;

  const height = rows * headerHeight;
  // console.log({
  //   columnGroupsMaxDepth,
  //   computedColumnGroups,
  //   rows,
  //   headerHeight,
  // });

  const columnAndGroupTreeInfo = React.useMemo(() => {
    if (!computedColumnGroups || !computedColumnGroups.size) {
      return undefined;
    }

    return buildColumnAndGroupTree(
      computedVisibleColumns,
      computedColumnGroups,
      columnGroupsDepthsMap,
      columnGroupsMaxDepth,
    );
  }, [computedVisibleColumns, computedColumnGroups, columnGroupsDepthsMap]);

  const cellspan = React.useCallback(
    ({ rowIndex, colIndex }: { rowIndex: number; colIndex: number }) => {
      const column = computedVisibleColumns[colIndex];

      const rowspan = 1;
      const colspan = 1;
      if (!column || !columnAndGroupTreeInfo) {
        return { rowspan, colspan };
      }

      const treeItem = columnAndGroupTreeInfo.pathsToCells.get([
        rowIndex,
        colIndex,
      ]);

      if (!treeItem) {
        return { rowspan, colspan };
      }
      if (treeItem.type === 'column') {
        return {
          colspan,
          rowspan: rows - treeItem.depth,
        };
      }

      const index = treeItem.columnItems.findIndex(
        (child) => child.id === column.id,
      );

      return {
        rowspan,
        colspan: index === 0 ? treeItem.columnItems.length : 1,
      };
    },
    [
      computedColumnGroups,
      columnGroupsMaxDepth,
      computedVisibleColumns,
      columnAndGroupTreeInfo,
      rows,
      columnGroupsDepthsMap,
    ],
  );

  const rowspan = React.useCallback(
    ({ rowIndex, colIndex }) => cellspan({ rowIndex, colIndex }).rowspan,
    [cellspan],
  );
  const colspan = React.useCallback(
    ({ rowIndex, colIndex }) => cellspan({ rowIndex, colIndex }).colspan,
    [cellspan],
  );

  useMatrixBrain(
    brain,
    {
      colWidth: columnSize,
      rowHeight: headerHeight,
      rows,
      cols: computedVisibleColumns.length,
      height,
      rowspan,
      colspan,
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
      headerHeight={height}
      columnGroupsMaxDepth={columnGroupsMaxDepth}
      columnAndGroupTreeInfo={columnAndGroupTreeInfo}
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
