import { stripVar } from '../../../utils/stripVar';
import { InternalVars } from '../internalVars.css';
import { InfiniteTableComputedColumn } from '../types';
import { useInfiniteTableSelector } from './useInfiniteTableSelector';

const columnWidthAtIndex = stripVar(InternalVars.columnWidthAtIndex);
const columnOffsetAtIndex = stripVar(InternalVars.columnOffsetAtIndex);

export function useVisibleColumnSizes<T>() {
  const { computedVisibleColumns } = useInfiniteTableSelector((ctx) => {
    return {
      computedVisibleColumns: ctx.computed
        .computedVisibleColumns as InfiniteTableComputedColumn<T>[],
    };
  });

  return computedVisibleColumns.map((column) => {
    return {
      id: column.id,
      width: column.computedWidth,
      cssVarForWidth: `var(${columnWidthAtIndex}-${column.computedVisibleIndex})`,
      offset: column.computedOffset,
      cssVarForOffset: `var(${columnOffsetAtIndex}-${column.computedVisibleIndex})`,
      pinned: column.computedPinned,
    };
  });
}
