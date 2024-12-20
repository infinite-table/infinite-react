import { ColumnCellVariantsType } from '../components/cell.css';
import { HeaderCellVariantsType } from '../components/InfiniteTableHeader/header.css';
import { InfiniteTableComputedColumn } from '../types';
import {
  InfiniteTableColumnAlignValues,
  InfiniteTableColumnVerticalAlignValues,
} from '../types/InfiniteTableColumn';

export function useCellClassName<T>(
  column: InfiniteTableComputedColumn<T>,
  baseClasses: string[],
  variants: (x: ColumnCellVariantsType | HeaderCellVariantsType) => string,
  extraFlags: {
    insideDisabledDraggingPage: boolean;
    groupRow: boolean;
    treeNode: 'parent' | 'leaf' | false;
    firstRow: boolean;
    firstRowInHorizontalLayoutPage: boolean;
    groupCell: boolean;
    rowExpanded: boolean;
    rowActive: boolean;
    rowDisabled: boolean;
    align: InfiniteTableColumnAlignValues;
    verticalAlign: InfiniteTableColumnVerticalAlignValues;
    rowSelected: boolean | null;
    dragging: boolean;
    cellSelected: boolean;
    zebra: 'odd' | 'even' | false;
  },
) {
  const result = [...baseClasses];
  const variantObject: ColumnCellVariantsType | HeaderCellVariantsType = {
    filtered: column.computedFiltered,
    first: column.computedFirst,
    last: column.computedLast,
    groupByField: !!column.groupByForColumn,
    firstInCategory: column.computedFirstInCategory,
    lastInCategory: column.computedLastInCategory,
    pinned: column.computedPinned || false,
    cellSelected: extraFlags.cellSelected || false,
    rowSelected: extraFlags.rowSelected ?? 'null',
    rowActive: extraFlags.rowActive,
    dragging: extraFlags.dragging,
    insideDisabledDraggingPage: extraFlags.insideDisabledDraggingPage,
    firstRow: extraFlags.firstRow ?? false,
    firstRowInHorizontalLayoutPage:
      extraFlags.firstRowInHorizontalLayoutPage ?? false,
    rowDisabled: extraFlags.rowDisabled,
    groupRow: extraFlags.groupRow,
    groupCell: extraFlags.groupCell,
    treeNode: extraFlags.treeNode,
    verticalAlign: extraFlags.verticalAlign,
    align: extraFlags.align,
    zebra: extraFlags.zebra,
  };

  const theVariant = variants(variantObject);

  result.push(theVariant);

  if (column.computedFirst) {
    result.push(...baseClasses.map((c) => `${c}--first`));
  }

  if (column.groupByForColumn) {
    result.push(...baseClasses.map((c) => `${c}--group-column`));
  }
  if (column.computedLast) {
    result.push(...baseClasses.map((c) => `${c}--last`));
  }
  if (column.computedFirstInCategory) {
    result.push(...baseClasses.map((c) => `${c}--first-in-category`));
  }
  if (column.computedLastInCategory) {
    result.push(...baseClasses.map((c) => `${c}--last-in-category`));
  }
  if (extraFlags.rowSelected) {
    result.push(...baseClasses.map((c) => `${c}--row-selected`));
  }
  if (extraFlags.cellSelected) {
    result.push(...baseClasses.map((c) => `${c}--cell-selected`));
  }
  if (extraFlags.firstRow) {
    result.push(...baseClasses.map((c) => `${c}--first-row`));
  }
  if (extraFlags.firstRowInHorizontalLayoutPage) {
    result.push(
      ...baseClasses.map((c) => `${c}--first-row-in-horizontal-layout-page`),
    );
  }

  if (extraFlags.rowDisabled) {
    result.push(...baseClasses.map((c) => `${c}--disabled`));
  }

  if (extraFlags.treeNode) {
    result.push(
      ...baseClasses.map(
        (c) => `${c}--tree-node ${c}-tree-${extraFlags.treeNode}-node`,
      ),
    );
  }

  if (extraFlags.groupRow) {
    result.push(...baseClasses.map((c) => `${c}--group-row`));

    result.push(
      ...baseClasses.map(
        (c) =>
          `${c}--${
            extraFlags.rowExpanded
              ? 'group-row-expanded'
              : 'group-row-collapsed'
          }`,
      ),
    );
  }
  if (column.computedPinned) {
    result.push(
      ...baseClasses.map((c) => `${c}--pinned-${column.computedPinned}`),
    );
  } else {
    result.push(...baseClasses.map((c) => `${c}--unpinned`));
  }

  return result.filter(Boolean).join(' ');
}
