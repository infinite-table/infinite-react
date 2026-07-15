/**
 * Framework-neutral styling controller for column cells.
 *
 * Extracted verbatim from InfiniteTableColumnCell.tsx so the React component
 * and the Vue sibling compute the exact same classnames and inline styles.
 * No framework imports allowed in this file.
 */
import type { CSSProperties } from 'react';

import { InfiniteTable_Tree_RowInfoBase } from '../../../../utils/groupAndPivot';
import { join } from '../../../../utils/join';
import { stripVar } from '../../../../utils/stripVar';

import { useCellClassName } from '../../hooks/useCellClassName';
import { InternalVars } from '../../internalVars.css';
import { InfiniteTableRowInfo } from '../../types';
import type {
  InfiniteTableColumnClassName,
  InfiniteTableColumnStylingFnParams,
  InfiniteTableColumnStyle,
  InfiniteTableComputedColumn,
} from '../../types/InfiniteTableColumn';
import type {
  InfiniteTableColumnAlignValues,
  InfiniteTableColumnVerticalAlignValues,
} from '../../types/InfiniteTableColumn';
import { InfiniteTableRowStylingFnParams } from '../../types/InfiniteTableProps';
import type {
  InfiniteTablePropCellClassName,
  InfiniteTablePropCellStyle,
  InfiniteTablePropRowClassName,
  InfiniteTablePropRowStyle,
} from '../../types/InfiniteTableProps';
import { ThemeVars } from '../../vars.css';
import {
  ColumnCellRecipe,
  ColumnCellSelectionIndicatorRecipe,
} from '../cell.css';
import { TreeColumnCellExpanderCls } from './row.css';
import { InfiniteTableCellClassName } from './InfiniteTableCellClassNames';
import { InfiniteTableColumnCellClassName } from './InfiniteTableColumnCellClassNames';

const columnZIndexAtIndex = stripVar(InternalVars.columnZIndexAtIndex);
const columnVisibilityAtIndex = stripVar(InternalVars.columnVisibilityAtIndex);

export function styleForGroupColumn<T>({
  rowInfo,
}: {
  rowInfo: InfiniteTableRowInfo<T>;
}) {
  return {
    [stripVar(ThemeVars.components.Row.groupNesting)]:
      rowInfo.dataSourceHasGrouping
        ? rowInfo.isGroupRow
          ? rowInfo.groupNesting - 1
          : rowInfo.groupNesting
        : 0,
  };
}

export function styleForTreeColumn<T>({
  rowInfo,
}: {
  rowInfo: InfiniteTable_Tree_RowInfoBase<T>;
}) {
  return {
    [stripVar(ThemeVars.components.Row.groupNesting)]: rowInfo.isTreeNode
      ? rowInfo.isParentNode
        ? rowInfo.treeNesting
        : rowInfo.treeNesting + 1
      : 0,
  };
}

export function applyColumnClassName<T>(
  columnClassName: InfiniteTableColumnClassName<T>,
  param: InfiniteTableColumnStylingFnParams<T>,
) {
  const colClassName: undefined | string = columnClassName
    ? typeof columnClassName === 'function'
      ? columnClassName(param)
      : columnClassName
    : undefined;

  return colClassName;
}

export function applyColumnStyle<T>(
  existingStyle: CSSProperties | undefined,
  columnStyle: InfiniteTableColumnStyle<T>,
  param: InfiniteTableColumnStylingFnParams<T>,
) {
  return typeof columnStyle === 'function'
    ? { ...existingStyle, ...columnStyle(param) }
    : { ...existingStyle, ...columnStyle };
}

export type CellSelectionBorders = {
  top: boolean;
  left: boolean;
  right: boolean;
  bottom: boolean;
};

export type ColumnCellStylingOptions<T> = {
  column: InfiniteTableComputedColumn<T>;
  rowInfo: InfiniteTableRowInfo<T>;
  rowIndex: number;
  rowHeight: number;
  rowIndexInHorizontalLayoutPage: number | null;
  horizontalLayoutPageIndex: number | null;

  align: InfiniteTableColumnAlignValues;
  verticalAlign: InfiniteTableColumnVerticalAlignValues;

  stylingParam: InfiniteTableColumnStylingFnParams<T>;
  formattedValueContext: any;
  groupByColumnReference: InfiniteTableComputedColumn<T> | undefined;

  rowStyle?: InfiniteTablePropRowStyle<T>;
  rowClassName?: InfiniteTablePropRowClassName<T>;
  cellStyle?: InfiniteTablePropCellStyle<T>;
  cellClassName?: InfiniteTablePropCellClassName<T>;

  showZebraRows: boolean;
  rowActive: boolean;
  rowDisabled: boolean;
  rowSelected: boolean | null;
  cellSelected: boolean;

  cellSelection: {
    isCellSelected: (rowId: any, colId: string) => boolean;
  } | null;
  getData: () => InfiniteTableRowInfo<T>[];
  computedVisibleColumns: InfiniteTableComputedColumn<T>[];
  computedColumnOrder: string[];

  columnReorderInPageIndex: number | null;
};

export type ColumnCellStylingResult = {
  style: CSSProperties;
  className: string;
  cellSelectionBorders: CellSelectionBorders | null;
  zebra: 'odd' | 'even' | false;
  columnIsTree: boolean;
};

/**
 * Computes the full inline style + className for a column cell — the exact
 * logic previously inlined in InfiniteTableColumnCell.tsx.
 */
export function getColumnCellStyling<T>(
  options: ColumnCellStylingOptions<T>,
): ColumnCellStylingResult {
  const {
    column,
    rowInfo,
    rowIndex,
    rowHeight,
    rowIndexInHorizontalLayoutPage,
    horizontalLayoutPageIndex,
    align,
    verticalAlign,
    stylingParam,
    formattedValueContext,
    groupByColumnReference,
    rowStyle,
    rowClassName,
    cellStyle,
    cellClassName,
    showZebraRows,
    rowActive,
    rowDisabled,
    rowSelected,
    cellSelected,
    cellSelection,
    getData,
    computedVisibleColumns,
    computedColumnOrder,
    columnReorderInPageIndex,
  } = options;

  const visibleColumnIds = computedVisibleColumns.map((x) => x.id);
  const allColumnIds = computedColumnOrder;
  const rowPropsAndStyleArgs: InfiniteTableRowStylingFnParams<T> = {
    ...formattedValueContext,
    visibleColumnIds,
    allColumnIds,
    rowIndex,
    // we put it as false by default
    rowHasSelectedCells: false,
  };

  // and then make it a getter
  // so it can be computed lazily - just when the user calls and needs this
  Object.defineProperty(rowPropsAndStyleArgs, 'rowHasSelectedCells', {
    get() {
      return rowInfo.hasSelectedCells(visibleColumnIds);
    },
  });

  const columnIsTree = !!(
    rowInfo.isTreeNode &&
    (column.renderTreeIcon ||
      column.renderTreeIconForLeafNode ||
      column.renderTreeIconForParentNode)
  );

  const rowComputedClassName =
    typeof rowClassName === 'function'
      ? rowClassName(rowPropsAndStyleArgs)
      : rowClassName;

  let colClassName: string | undefined = undefined;

  if (groupByColumnReference?.className) {
    colClassName = applyColumnClassName(
      groupByColumnReference.className,
      stylingParam,
    );
  }
  if (cellClassName) {
    colClassName = join(
      colClassName,
      applyColumnClassName(cellClassName, stylingParam),
    );
  }
  if (column.className) {
    colClassName = join(
      colClassName,
      applyColumnClassName(column.className, stylingParam),
    );
  }

  if (columnIsTree) {
    colClassName = join(
      colClassName,
      TreeColumnCellExpanderCls({
        align,
      }),
    );
  }

  let style: CSSProperties | undefined;

  if (rowInfo.dataSourceHasGrouping && column.groupByForColumn) {
    style = styleForGroupColumn({ rowInfo });
  }

  if (columnIsTree) {
    style = styleForTreeColumn({
      rowInfo: rowInfo as InfiniteTable_Tree_RowInfoBase<T>,
    });
  }

  if (rowStyle) {
    style =
      typeof rowStyle === 'function'
        ? { ...style, ...rowStyle(rowPropsAndStyleArgs) }
        : { ...style, ...rowStyle };
  }

  if (cellStyle) {
    style = applyColumnStyle(style, cellStyle, stylingParam);
  }

  if (groupByColumnReference?.style) {
    style = applyColumnStyle(style, groupByColumnReference.style, stylingParam);
  }
  if (column.style) {
    style = applyColumnStyle(style, column.style, stylingParam);
  }
  style = style || {};

  style.height = rowHeight;
  style.zIndex = `var(${columnZIndexAtIndex}-${column.computedVisibleIndex})`;
  // @ts-ignore
  style.visibility = `var(${columnVisibilityAtIndex}-${column.computedVisibleIndex}, visible)`;

  const odd =
    rowIndexInHorizontalLayoutPage != null
      ? rowIndexInHorizontalLayoutPage % 2 === 1
      : (rowInfo.indexInAll != null ? rowInfo.indexInAll : rowIndex) % 2 === 1;

  const zebra = showZebraRows ? (odd ? 'odd' : 'even') : false;

  let topSelectionBorder = false;
  let leftSelectionBorder = false;
  let rightSelectionBorder = false;
  let bottomSelectionBorder = false;

  if (cellSelection && cellSelected) {
    const arr = getData();
    const topRowInfo = arr[rowInfo.indexInAll - 1];
    const bottomRowInfo = arr[rowInfo.indexInAll + 1];
    const nextColumn = computedVisibleColumns[column.computedVisibleIndex + 1];
    const prevColumn = computedVisibleColumns[column.computedVisibleIndex - 1];

    topSelectionBorder = topRowInfo
      ? !cellSelection.isCellSelected(topRowInfo.id, column.id)
      : true;

    if (column.computedPinned === 'end' && column.computedFirstInCategory) {
      leftSelectionBorder = true;
    } else {
      leftSelectionBorder = prevColumn
        ? !cellSelection.isCellSelected(rowInfo.id, prevColumn.id)
        : true;
    }

    if (column.computedPinned === 'start' && column.computedLastInCategory) {
      rightSelectionBorder = true;
    } else {
      rightSelectionBorder = nextColumn
        ? !cellSelection.isCellSelected(rowInfo.id, nextColumn.id)
        : true;
    }
    bottomSelectionBorder = bottomRowInfo
      ? !cellSelection.isCellSelected(bottomRowInfo.id, column.id)
      : true;
  }

  const cellSelectionBorders =
    cellSelection && cellSelected
      ? {
          top: topSelectionBorder,
          left: leftSelectionBorder,
          right: rightSelectionBorder,
          bottom: bottomSelectionBorder,
        }
      : null;

  const insideDisabledDraggingPage =
    columnReorderInPageIndex != null
      ? horizontalLayoutPageIndex !== columnReorderInPageIndex
      : false;

  const className = join(
    cellSelectionBorders
      ? ColumnCellSelectionIndicatorRecipe(cellSelectionBorders)
      : '',
    useCellClassName(
      column,
      [InfiniteTableColumnCellClassName, InfiniteTableCellClassName],
      ColumnCellRecipe,
      {
        dragging: false,
        insideDisabledDraggingPage,
        zebra,
        align,
        verticalAlign,
        rowDisabled,
        rowActive,
        cellSelected,
        rowSelected,
        treeNode: rowInfo.isTreeNode
          ? rowInfo.isParentNode
            ? 'parent'
            : 'leaf'
          : false,
        firstRow: rowInfo.indexInAll === 0,
        firstRowInHorizontalLayoutPage: rowIndexInHorizontalLayoutPage === 0,
        groupRow: rowInfo.isGroupRow,
        groupCell: rowInfo.isGroupRow ? !!column.groupByForColumn : false,
        rowExpanded: rowInfo.isGroupRow ? !rowInfo.collapsed : false,
      },
    ),
    colClassName,
    rowComputedClassName,
  );

  return {
    style,
    className,
    cellSelectionBorders,
    zebra,
    columnIsTree,
  };
}
