import { ColumnCellVariantsType } from '../components/cell.css';
import { HeaderCellVariantsType } from '../components/InfiniteTableHeader/header.css';
import { InfiniteTableComputedColumn } from '../types';
import { InfiniteTableColumnAlign } from '../types/InfiniteTableColumn';

export function useCellClassName<T>(
  column: InfiniteTableComputedColumn<T>,
  baseClasses: string[],
  variants: (x: ColumnCellVariantsType | HeaderCellVariantsType) => string,
  extraFlags: {
    groupRow: boolean;
    rowExpanded: boolean;
    rowActive: boolean;
    align: InfiniteTableColumnAlign;
    rowSelected: boolean | null;
    dragging: boolean;
    zebra: 'odd' | 'even' | false;
  },
) {
  const result = [...baseClasses];
  const variantObject: ColumnCellVariantsType | HeaderCellVariantsType = {
    filtered: column.computedFiltered,
    first: column.computedFirst,
    last: column.computedLast,
    groupByField: !!column.groupByField,
    firstInCategory: column.computedFirstInCategory,
    lastInCategory: column.computedLastInCategory,
    pinned: column.computedPinned || false,
    rowSelected: extraFlags.rowSelected ?? 'null',
    rowActive: extraFlags.rowActive,
    dragging: extraFlags.dragging,
    align: extraFlags.align,
    zebra: extraFlags.zebra,
  };

  const theVariant = variants(variantObject);

  result.push(theVariant);

  if (column.computedFirst) {
    result.push(...baseClasses.map((c) => `${c}--first`));
  }

  if (column.groupByField) {
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
