import { useCallback } from 'react';
import { TableComputedColumn } from '../types';

/**
 * Returns a function that can be used to retrieve the width of an unpinned column, by the column index
 */
export const useColumnSizeFn = (
  computedUnpinnedColumns: TableComputedColumn<any>[],
) => {
  const columnSize = useCallback(
    (index: number) => {
      const column = computedUnpinnedColumns[index];
      if (!column) {
        console.log(
          'cannot find column at index',
          index,
          computedUnpinnedColumns,
        );
      }
      return column ? column.computedWidth : 0;
    },
    [computedUnpinnedColumns],
  );

  return columnSize;
};
