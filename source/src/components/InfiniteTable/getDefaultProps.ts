import { InfiniteTableProps } from './types';

/**
 * Do not type this to Partial<InfiniteTableProps> or InfiniteTableProps as it will ruin type safety
 * and won't require users of the table to pass required props
 */
export function getDefaultProps<T>(): Partial<InfiniteTableProps<T>> {
  return {
    rowHeight: 40,

    showZebraRows: true,
    virtualizeColumns: true,
    // columnVisibilityAssumeVisible: true,
    header: true,
    columnMinWidth: 30,
  };
}
