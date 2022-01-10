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

export function getPivotColumnsAndColumnGroups<DataType, KeyType = any>({
  deepMap,
  pivotBy,
  pivotTotalColumnPosition,
  aggregationReducers = [],
  generatePivotColumnForSingleAggregation = false,
}: {
  deepMap: DeepMap<KeyType, boolean>;
  pivotBy: DataSourcePivotBy<DataType>[];
  pivotTotalColumnPosition: InfiniteTablePropPivotTotalColumnPosition;
  aggregationReducers?: AggregationReducer<DataType, any>[];
  generatePivotColumnForSingleAggregation?: boolean;
}): ComputedColumnsAndGroups<DataType> {
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

  const isSingleAggregationColumn =
    !generatePivotColumnForSingleAggregation &&
    aggregationReducers.length === 1;

  deepMap.visitDepthFirst((_value, keys: KeyType[], _indexInGroup, next) => {
    keys = [...keys];

    if (pivotTotalColumnPosition === 'end') {
      next?.();
    }

    if (keys.length === pivotLength) {
      const parentKeys = keys.slice(0, -1);

      let columnGroupId = parentKeys.join('/');
      const pivotByForColumn = pivotBy[keys.length - 1];

      if (!isSingleAggregationColumn) {
        let parentColumnGroupId = columnGroupId;

        columnGroupId = keys.join('/');
        columnGroups.set(columnGroupId, {
          header: keys[keys.length - 1],
          columnGroup: parentColumnGroupId,
        });
      }

      aggregationReducers.forEach((reducer, index) => {
        const header = isSingleAggregationColumn
          ? keys[keys.length - 1]
          : reducer.id;

        const computedPivotColumn: InfiniteTablePivotFinalColumn<DataType> = {
          pivotBy,
          pivotColumn: true,
          pivotGroupKeys: keys,
          pivotGroupKeyForColumn: keys[keys.length - 1],
          pivotIndexForColumn: keys.length - 1,
          pivotByForColumn,
          sortable: false,
          columnGroup: columnGroupId,
          header,
          valueGetter: ({ rowInfo }) => {
            const reducerResult =
              rowInfo.pivotValuesMap?.get(keys)?.reducerResults[index];
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
        const columnId = `${keys.join('/')}-${reducer.id}`;

        columns.set(columnId, computedPivotColumn);
      });
    } else {
      const colGroupId = keys.join('/');
      const parentKeys = keys.slice(0, -1);

      columnGroups.set(colGroupId, {
        columnGroup: parentKeys.length ? parentKeys.join('/') : undefined,
        header: keys[keys.length - 1],
      });

      if (pivotTotalColumnPosition !== false) {
        const pivotByForColumn = pivotBy[keys.length - 1];
        let columnGroupId = parentKeys.length
          ? parentKeys.join('/')
          : undefined;

        if (!isSingleAggregationColumn) {
          let parentGroupForTotalsGroup = columnGroupId;
          columnGroupId = `total:${keys.join('/')}`;
          columnGroups.set(columnGroupId, {
            header: `${keys[keys.length - 1]} total`,
            columnGroup: parentGroupForTotalsGroup,
          });
        }

        aggregationReducers.forEach((reducer, index) => {
          const header = isSingleAggregationColumn
            ? `${keys[keys.length - 1]} total `
            : `${reducer.id} total`;
          const computedPivotColumn: InfiniteTablePivotFinalColumn<DataType> = {
            columnGroup: columnGroupId,
            header,
            pivotTotalColumn: true,
            pivotGroupKeys: keys,
            pivotGroupKeyForColumn: keys[keys.length - 1],
            pivotByForColumn,
            pivotIndexForColumn: keys.length - 1,
            pivotBy,
            sortable: false,
            valueGetter: ({ rowInfo }) => {
              const value =
                rowInfo.pivotValuesMap?.get(keys)?.reducerResults[index]
                  ?.value ?? null;

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
          columns.set(
            `total:${keys.join('/')}-${reducer.id}`,
            computedPivotColumn,
          );
        });
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
        return rowInfo.reducerResults?.[0]?.value;
      },
    });
  }

  const result = {
    columns,
    columnGroups,
  };

  return result;
}
