import { AggregationReducer } from '.';
import type {
  DataSourceAggregationReducer,
  DataSourcePivotBy,
} from '../../components/DataSource';
import type {
  InfiniteTableColumnGroup,
  InfiniteTablePropColumnGroups,
  InfiniteTablePropColumnsMap,
} from '../../components/InfiniteTable';
import type {
  InfiniteTablePivotColumn,
  InfiniteTablePivotFinalColumn,
  InfiniteTablePivotFinalColumnGroup,
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

function prepareColumn<DataType>(
  column: InfiniteTablePivotFinalColumn<DataType>,
) {
  const { pivotByAtIndex: pivotByForColumn } = column;

  if (pivotByForColumn.column) {
    if (typeof pivotByForColumn.column === 'function') {
      Object.assign(column, pivotByForColumn.column({ column }));
    } else {
      Object.assign(column, pivotByForColumn.column);
    }
  }

  return column;
}

function prepareColumnGroup<DataType>(
  columnGroup: InfiniteTablePivotFinalColumnGroup<DataType>,
) {
  const { pivotByAtIndex: pivotByForColumnGroup } = columnGroup;

  if (pivotByForColumnGroup.columnGroup) {
    if (typeof pivotByForColumnGroup.columnGroup === 'function') {
      Object.assign(
        columnGroup,
        pivotByForColumnGroup.columnGroup({ columnGroup }),
      );
    } else {
      Object.assign(columnGroup, pivotByForColumnGroup.columnGroup);
    }
  }

  return columnGroup;
}

export function getPivotColumnsAndColumnGroups<DataType, KeyType = any>({
  deepMap,
  pivotBy,
  pivotTotalColumnPosition,
  reducers = {},
  showSeparatePivotColumnForSingleAggregation = false,
}: {
  deepMap: DeepMap<KeyType, boolean>;
  pivotBy: DataSourcePivotBy<DataType>[];
  pivotTotalColumnPosition: InfiniteTablePropPivotTotalColumnPosition;
  reducers?: Record<string, DataSourceAggregationReducer<DataType, any>>;
  showSeparatePivotColumnForSingleAggregation?: boolean;
}): ComputedColumnsAndGroups<DataType> {
  const pivotLength = pivotBy.length;
  const aggregationReducers: AggregationReducer<DataType, any>[] = Object.keys(
    reducers,
  ).map((key) => {
    return { ...reducers[key], id: key };
  });
  const columns: InfiniteTablePropColumnsMap<
    DataType,
    InfiniteTablePivotColumn<DataType>
  > = new Map<string, InfiniteTablePivotColumn<DataType>>([
    [
      'labels',
      {
        header: 'Row labels',
        pivotBy,
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
    !showSeparatePivotColumnForSingleAggregation &&
    aggregationReducers.length === 1;

  deepMap.visitDepthFirst((_value, keys: KeyType[], _indexInGroup, next) => {
    keys = [...keys];

    if (pivotTotalColumnPosition === 'end') {
      next?.();
    }

    if (keys.length === pivotLength) {
      const pivotByForColumn = pivotBy[keys.length - 1];
      const parentKeys = keys.slice(0, -1);

      let parentColumnGroupId = parentKeys.join('/');

      if (!isSingleAggregationColumn) {
        const columnGroupId = parentColumnGroupId;
        parentColumnGroupId = keys.join('/');

        const pivotGroupKey = keys[keys.length - 1];
        columnGroups.set(
          parentColumnGroupId,
          prepareColumnGroup({
            header: pivotGroupKey,
            columnGroup: columnGroupId,
            pivotBy,
            pivotGroupKeys: keys,
            pivotByAtIndex: pivotByForColumn,
            pivotIndex: keys.length - 1,
            pivotGroupKey,
          }),
        );
      }

      aggregationReducers.forEach((reducer, index) => {
        const header = isSingleAggregationColumn
          ? keys[keys.length - 1]
          : reducer.id;

        const computedPivotColumn = prepareColumn({
          pivotBy,
          pivotColumn: true,
          pivotTotalColumn: false,
          pivotAggregator: reducer,
          pivotAggregatorIndex: index,
          pivotGroupKeys: keys,
          pivotGroupKey: keys[keys.length - 1],
          pivotIndex: keys.length - 1,
          pivotByAtIndex: pivotByForColumn,
          sortable: false,
          columnGroup: parentColumnGroupId,
          header,
          valueGetter: ({ rowInfo }) => {
            return rowInfo.pivotValuesMap?.get(keys)?.reducerResults[
              reducer.id
            ];
          },
        });

        const columnId = `${keys.join('/')}-${reducer.id}`;

        columns.set(columnId, computedPivotColumn);
      });
    } else {
      const colGroupId = keys.join('/');
      const parentKeys = keys.slice(0, -1);

      columnGroups.set(
        colGroupId,
        prepareColumnGroup({
          columnGroup: parentKeys.length ? parentKeys.join('/') : undefined,
          header: keys[keys.length - 1],
          pivotBy,
          pivotGroupKeys: keys,
          pivotIndex: keys.length - 1,
          pivotByAtIndex: pivotBy[keys.length - 1],
          pivotGroupKey: keys[keys.length - 1],
        }),
      );

      if (pivotTotalColumnPosition !== false) {
        const pivotByForColumn = pivotBy[keys.length - 1];
        let columnGroupId = parentKeys.length
          ? parentKeys.join('/')
          : undefined;

        if (!isSingleAggregationColumn) {
          let parentGroupForTotalsGroup = columnGroupId;
          columnGroupId = `total:${keys.join('/')}`;
          columnGroups.set(
            columnGroupId,
            prepareColumnGroup({
              header: `${keys[keys.length - 1]} total`,
              columnGroup: parentGroupForTotalsGroup,
              pivotBy,
              pivotTotalColumnGroup: true,
              pivotGroupKeys: keys,
              pivotIndex: keys.length - 1,
              pivotByAtIndex: pivotByForColumn,
              pivotGroupKey: keys[keys.length - 1],
            }),
          );
        }

        aggregationReducers.forEach((reducer, index) => {
          const header = isSingleAggregationColumn
            ? `${keys[keys.length - 1]} total `
            : `${reducer.id} total`;
          const computedPivotColumn = prepareColumn({
            columnGroup: columnGroupId,
            header,
            pivotAggregator: reducer,
            pivotAggregatorIndex: index,
            pivotColumn: true,
            pivotTotalColumn: true,
            pivotGroupKeys: keys,
            pivotGroupKey: keys[keys.length - 1],
            pivotByAtIndex: pivotByForColumn,
            pivotIndex: keys.length - 1,
            pivotBy,
            sortable: false,
            valueGetter: ({ rowInfo }) => {
              return rowInfo.pivotValuesMap?.get(keys)?.reducerResults[
                reducer.id
              ];
            },
          });
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
      pivotBy,
      pivotColumn: true,
      valueGetter: ({ rowInfo }) => {
        const key = Object.keys(rowInfo.reducerResults || {})[0];
        return rowInfo.reducerResults?.[key];
      },
    });
  }

  const result = {
    columns,
    columnGroups,
  };

  return result;
}
