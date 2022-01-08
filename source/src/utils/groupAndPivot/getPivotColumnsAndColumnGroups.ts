import { AggregationReducer } from '.';
import type { DataSourcePivotBy } from '../../components/DataSource';
import type {
  InfiniteTableColumnGroup,
  InfiniteTablePropColumnGroups,
  InfiniteTablePropColumnsMap,
} from '../../components/InfiniteTable';
import type {
  InfiniteTablePivotColumn,
  InfiniteTablePivotFinalColumn,
} from '../../components/InfiniteTable/types/InfiniteTableColumn';

import type { InfiniteTablePropPivotTotalColumnPosition } from '../../components/InfiniteTable/types/InfiniteTableState';
import { DeepMap } from '../DeepMap';

export type ComputedColumnsAndGroups<DataType> = {
  columns: InfiniteTablePropColumnsMap<
    DataType,
    InfiniteTablePivotColumn<DataType>
  >;
  columnGroups: InfiniteTablePropColumnGroups;
};

export function getPivotColumnsAndColumnGroups<DataType, KeyType = any>(
  deepMap: DeepMap<KeyType, boolean>,
  pivotBy: DataSourcePivotBy<DataType>[],
  pivotTotalColumnPosition: InfiniteTablePropPivotTotalColumnPosition,
  aggregationReducers: AggregationReducer<DataType, any>[] = [],
): ComputedColumnsAndGroups<DataType> {
  const pivotLength = pivotBy.length;
  const columns: InfiniteTablePropColumnsMap<
    DataType,
    InfiniteTablePivotColumn<DataType>
  > = new Map<string, InfiniteTablePivotColumn<DataType>>([
    [
      'labels',
      {
        header: 'Row labels',
        valueGetter: (params) => {
          const { rowInfo } = params;
          return rowInfo.groupKeys
            ? rowInfo.groupKeys[rowInfo.groupKeys?.length - 1]
            : null;
        },
      },
    ],
  ]);

  const columnGroups: InfiniteTablePropColumnGroups = new Map<
    string,
    InfiniteTableColumnGroup
  >();

  deepMap.visitDepthFirst((_value, keys: KeyType[], _indexInGroup, next) => {
    keys = [...keys];

    if (pivotTotalColumnPosition === 'end') {
      next?.();
    }

    if (keys.length === pivotLength) {
      const parentKeys = keys.slice(0, -1);
      let columnGroupId = parentKeys.join('/');
      const pivotByForColumn = pivotBy[keys.length - 1];
      // TODO continue here implementing support for multiple aggregations
      // console.log(aggregationReducers);
      // aggregationReducers.forEach((reducer) => {
      let computedPivotColumn: InfiniteTablePivotFinalColumn<DataType> = {
        pivotBy,
        pivotColumn: true,
        pivotGroupKeys: keys,
        pivotGroupKeyForColumn: keys[keys.length - 1],
        pivotIndexForColumn: keys.length - 1,
        pivotByForColumn,
        sortable: false,
        columnGroup: parentKeys.length ? `${columnGroupId}` : undefined,
        header: keys[keys.length - 1],
        valueGetter: ({ rowInfo }) => {
          const reducerResult =
            rowInfo.pivotValuesMap?.get(keys)?.reducerResults[0];
          const value = reducerResult?.value ?? null;

          return value;
        },
        ...pivotByForColumn.column,
      };
      if (pivotByForColumn.column) {
        if (typeof pivotByForColumn.column === 'function') {
          Object.assign(
            computedPivotColumn,
            pivotByForColumn.column({ column: computedPivotColumn }),
          );
        } else {
          Object.assign(computedPivotColumn, pivotByForColumn.column);
        }
      }
      columns.set(`${keys.join('/')}`, computedPivotColumn);
      // });
    } else {
      const colGroupId = keys.join('/');
      const parentKeys = keys.slice(0, -1);

      columnGroups.set(colGroupId, {
        columnGroup: parentKeys.length ? parentKeys.join('/') : undefined,
        header: keys.join(' >> '),
      });

      if (pivotTotalColumnPosition !== false) {
        const pivotByForColumn = pivotBy[keys.length - 1];
        let computedPivotColumn: InfiniteTablePivotFinalColumn<DataType> = {
          columnGroup: parentKeys.length ? parentKeys.join('/') : undefined,
          header: `${keys.join('/')} total `,
          pivotTotalColumn: true,
          pivotGroupKeys: keys,
          pivotGroupKeyForColumn: keys[keys.length - 1],
          pivotByForColumn,
          pivotIndexForColumn: keys.length - 1,
          pivotBy,
          sortable: false,
          valueGetter: ({ rowInfo }) => {
            const value =
              rowInfo.pivotValuesMap?.get(keys)?.reducerResults[0].value ??
              null;

            return value;
          },
          ...pivotByForColumn.column,
        };
        if (pivotByForColumn.column) {
          if (typeof pivotByForColumn.column === 'function') {
            Object.assign(
              computedPivotColumn,
              pivotByForColumn.column({ column: computedPivotColumn }),
            );
          } else {
            Object.assign(computedPivotColumn, pivotByForColumn.column);
          }
        }
        columns.set(`${keys.join('/')}-total`, computedPivotColumn);
      }
    }

    if (
      pivotTotalColumnPosition === 'start' ||
      pivotTotalColumnPosition === false
    ) {
      next?.();
    }
  });

  if (columns.size === 1) {
    columns.set('single', {
      header: 'Reduced',
      valueGetter: ({ rowInfo }) => {
        return rowInfo.reducerResults?.[0].value;
      },
    });
  }

  const result = {
    columns,
    columnGroups,
  };

  return result;
}
