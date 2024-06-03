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
  headerBrain: MatrixBrain;
  bodyBrain: MatrixBrain;
  scrollbars: Scrollbars;
};
export function TableHeaderWrapper<T>(props: TableHeaderWrapperProps) {
  const { headerBrain, bodyBrain, scrollbars } = props;

  const tableContextValue = useInfiniteTable<T>();

  const {
    computedPinnedStartColumns,
    computedPinnedEndColumns,
    computedVisibleColumns,
    columnSize,
  } = tableContextValue.computed;

  const {
    state: {
      columnHeaderHeight,
      columnGroupsDepthsMap,
      columnGroupsMaxDepth,
      computedColumnGroups,
      showColumnFilters,
    },
  } = tableContextValue;

  const rows =
    !computedColumnGroups || !Object.keys(computedColumnGroups).length
      ? 1
      : columnGroupsMaxDepth + 2;

  const height =
    rows * columnHeaderHeight + (showColumnFilters ? columnHeaderHeight : 0);
  // console.log({
  //   columnGroupsMaxDepth,
  //   computedColumnGroups,
  //   rows,
  //   columnHeaderHeight,
  // });

  const columnAndGroupTreeInfo = React.useMemo(() => {
    if (!computedColumnGroups || !Object.keys(computedColumnGroups).length) {
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
    ({ rowIndex, colIndex }: { rowIndex: number; colIndex: number }) =>
      cellspan({ rowIndex, colIndex }).rowspan,
    [cellspan],
  );
  const colspan = React.useCallback(
    ({ rowIndex, colIndex }: { rowIndex: number; colIndex: number }) =>
      cellspan({ rowIndex, colIndex }).colspan,
    [cellspan],
  );

  const rowHeight = React.useCallback(
    (index: number) => {
      // if we need to show the column filters

      return showColumnFilters
        ? index < rows - 1
          ? columnHeaderHeight
          : 2 * columnHeaderHeight
        : columnHeaderHeight;
    },
    [rows, showColumnFilters, columnHeaderHeight],
  );

  useMatrixBrain(
    headerBrain,
    {
      colWidth: columnSize,
      rowHeight,
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
      headerBrain={headerBrain}
      bodyBrain={bodyBrain}
      columnHeaderHeight={height}
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
