import { stripVar } from '../../../utils/stripVar';
import { InternalVars } from '../internalVars.css';
import { useInfiniteTable } from './useInfiniteTable';

const columnWidthAtIndex = stripVar(InternalVars.columnWidthAtIndex);
const columnOffsetAtIndex = stripVar(InternalVars.columnOffsetAtIndex);

export function useVisibleColumnSizes() {
  const context = useInfiniteTable<any>();

  return context.computed.computedVisibleColumns.map((column) => {
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
