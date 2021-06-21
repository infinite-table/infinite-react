/**
 * Do not type this to Partial<InfiniteTableProps> or InfiniteTableProps as it will ruin type safety
 * and won't require users of the table to pass required props
 */
export const defaultProps = {
  primaryKey: 'id',
  rowHeight: 40,

  showZebraRows: true,
  virtualizeColumns: true,
  // columnVisibilityAssumeVisible: true,
  header: true,
  columnMinWidth: 30,
};
