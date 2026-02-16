import { useMemo } from 'react';

import { MatrixBrainOptions } from '../../VirtualBrain/MatrixBrain';
import { InfiniteTableComputedColumn } from '../types';
import { DataSourceState, useDataSourceSelector } from '../../DataSource';

export function useColumnRowspan<T>(
  computedVisibleColumns: InfiniteTableComputedColumn<T>[],
) {
  const { getDataSourceState } = useDataSourceSelector((ctx) => {
    return {
      getDataSourceState: ctx.getDataSourceState as () => DataSourceState<T>,
    };
  });

  const rowspan = useMemo<MatrixBrainOptions['rowspan']>(() => {
    const colsWithRowspan = computedVisibleColumns.filter(
      (col) => typeof col.rowspan === 'function',
    );

    return colsWithRowspan.length
      ? ({ rowIndex, colIndex }) => {
          const dataArray = getDataSourceState().dataArray;
          const rowInfo = dataArray[rowIndex];
          if (!rowInfo) {
            return 1;
          }
          const data = rowInfo.data;

          const column = computedVisibleColumns[colIndex];

          if (!column || !column.rowspan) {
            return 1;
          }
          return column.rowspan({
            column,
            data,
            dataArray,
            rowInfo,
            rowIndex,
          });
        }
      : undefined;
  }, [computedVisibleColumns]);

  return rowspan;
}
