import { useCallback } from 'react';
import { dbg } from '../../../utils/debug';
import { InfiniteTableComputedColumn } from '../types';

const debug = dbg('useColumnSizeFn');

/**
 * Returns a function that can be used to retrieve the width of a column column, by the column index
 */
export function useColumnSizeFn<T>(
  columns: InfiniteTableComputedColumn<T>[],
  _options: {
    wrapRowsHorizontally: boolean;
    wrapRowsHorizontallyPageCount: number;
  },
) {
  // const { wrapRowsHorizontally, wrapRowsHorizontallyPageCount } = options;
  const columnSize = useCallback(
    (index: number) => {
      const column = columns[index];

      // if (wrapRowsHorizontally) {
      //   column = columns[index % columns.length];
      // }
      if (__DEV__ && !column) {
        debug('cannot find column at index', index, columns);
      }

      return column ? column.computedWidth : 0;
    },
    [columns],
    // [columns, wrapRowsHorizontally, wrapRowsHorizontallyPageCount],
  );

  return columnSize;
}
