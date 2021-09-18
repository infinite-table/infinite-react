import {
  DataSourcePropGroupRowsBy,
  DataSourcePropPivotBy,
} from '../../DataSource';
import { InfiniteTableProps } from '../types';
import { InfiniteTablePivotColumn } from '../types/InfiniteTableColumn';
import { InfiniteTableComponentState } from '../types/InfiniteTableState';

export function getComputedPivotColumns<T>(
  pivotColumns: InfiniteTableProps<T>['pivotColumns'],
  params: {
    pivotColumn: InfiniteTableProps<T>['pivotColumn'];
    pivotTotalColumnPosition: InfiniteTableComponentState<T>['pivotTotalColumnPosition'];
    pivotBy: DataSourcePropPivotBy<T>;
    groupRowsBy: DataSourcePropGroupRowsBy<T>;
  },
): InfiniteTableProps<T>['pivotColumns'] {
  if (!pivotColumns) {
    return undefined;
  }

  const { pivotColumn, pivotBy, groupRowsBy, pivotTotalColumnPosition } =
    params;

  const computedPivotColumns = new Map();

  pivotColumns.forEach((col, key) => {
    let column: InfiniteTablePivotColumn<T> = col;

    if (col.pivotTotalColumn && pivotTotalColumnPosition === false) {
      // don't include the total columns if specified as false
      // return;
    }
    if (params.pivotColumn) {
      if (typeof pivotColumn === 'function') {
        column = {
          ...col,
          ...pivotColumn({
            column: col,
            pivotBy,
            groupRowsBy,
          }),
        } as InfiniteTablePivotColumn<T>;
      } else {
        column = {
          ...col,
          ...params.pivotColumn,
        } as InfiniteTablePivotColumn<T>;
      }
    }
    computedPivotColumns.set(key, column);
  });

  return computedPivotColumns;
}
