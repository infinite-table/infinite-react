import type {
  DataSourceAggregationReducer,
  DataSourcePivotBy,
} from '../../components/DataSource';
import type { InfiniteTableColumnGroup } from '../../components/InfiniteTable';
import type {
  InfiniteTablePivotColumn,
  InfiniteTablePivotFinalColumnGroup,
  InfiniteTablePivotFinalColumnVariant,
} from '../../components/InfiniteTable/types/InfiniteTableColumn';
import {
  InfiniteTablePropColumnGroups,
  InfiniteTablePropColumns,
} from '../../components/InfiniteTable/types/InfiniteTableProps';
import type {
  InfiniteTablePropPivotTotalColumnPosition,
  InfiniteTablePropPivotGrandTotalColumnPosition,
} from '../../components/InfiniteTable/types/InfiniteTableState';
import { DeepMap } from '../DeepMap';
import { once } from '../DeepMap/once';

import { AggregationReducer } from '.';

export type ComputedColumnsAndGroups<DataType> = {
  columns: InfiniteTablePropColumns<
    DataType,
    InfiniteTablePivotColumn<DataType>
  >;
  columnGroups: InfiniteTablePropColumnGroups;
};

function prepareColumn<DataType>(
  column: InfiniteTablePivotFinalColumnVariant<DataType>,
) {
  const { pivotByAtIndex: pivotByForColumn, pivotAggregator } = column;

  if (pivotByForColumn?.column) {
    if (typeof pivotByForColumn.column === 'function') {
      Object.assign(column, pivotByForColumn.column({ column }));
    } else {
      Object.assign(column, pivotByForColumn.column);
    }
  }
  if (pivotAggregator?.pivotColumn) {
    if (typeof pivotAggregator.pivotColumn === 'function') {
      Object.assign(column, pivotAggregator.pivotColumn({ column }));
    } else {
      Object.assign(column, pivotAggregator.pivotColumn);
    }
  }

  return column;
}

function prepareColumnGroup<DataType>(
  columnGroup: InfiniteTablePivotFinalColumnGroup<DataType>,
) {
  const { pivotByAtIndex: pivotByForColumnGroup } = columnGroup;

  if (pivotByForColumnGroup?.columnGroup) {
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

export function getPivotColumnsAndColumnGroups<
  DataType,
  KeyType extends string | number = string | number,
>({
  deepMap,
  pivotBy,
  pivotTotalColumnPosition,
  pivotGrandTotalColumnPosition,
  reducers = {},
  showSeparatePivotColumnForSingleAggregation = false,
}: {
  deepMap: DeepMap<KeyType, boolean>;
  pivotBy: DataSourcePivotBy<DataType>[];
  pivotTotalColumnPosition: InfiniteTablePropPivotTotalColumnPosition;
  pivotGrandTotalColumnPosition: InfiniteTablePropPivotGrandTotalColumnPosition;
  reducers?: Record<string, DataSourceAggregationReducer<DataType, any>>;
  showSeparatePivotColumnForSingleAggregation?: boolean;
}): ComputedColumnsAndGroups<DataType> {
  const pivotLength = pivotBy.length;
  const aggregationReducers: AggregationReducer<DataType, any>[] = Object.keys(
    reducers,
  ).map((key) => {
    return { ...reducers[key], id: key };
  });

  if (!aggregationReducers.length) {
    showSeparatePivotColumnForSingleAggregation = true;
    pivotGrandTotalColumnPosition = false;
    pivotTotalColumnPosition = false;
    aggregationReducers.push({
      id: '__empty-aggregation-reducer__',
      name: '-',
      initialValue: null,
      reducer: () => null,
    });
  }
  const columns: InfiniteTablePropColumns<
    DataType,
    InfiniteTablePivotColumn<DataType>
  > = {};
  // [
  //   'labels',
  //   {
  //     header: 'Row labels',
  //     pivotBy,
  //     valueGetter: (params) => {
  //       const { rowInfo } = params;
  //       if (!rowInfo.data) {
  //         // TODO replace with loading spinner
  //         return 'Loading ...';
  //       }
  //       return rowInfo.groupKeys
  //         ? rowInfo.groupKeys[rowInfo.groupKeys?.length - 1]
  //         : null;
  //     },
  //   },
  // ],

  const columnGroups: Record<string, InfiniteTableColumnGroup> = {};

  const addGrandTotalColumns = once(function () {
    aggregationReducers.forEach((reducer, index) => {
      columns[`total:${reducer.id}`] = prepareColumn({
        header: `${reducer.name || reducer.id} total`,
        pivotBy,
        pivotColumn: true,
        pivotTotalColumn: true,
        pivotAggregator: reducer,
        pivotAggregatorIndex: index,

        pivotGroupKeys: [],
        pivotGroupKey: '',
        pivotIndex: -1,

        valueFormatter: ({ rowInfo }) => {
          // return rowInfo.reducerResults?.[reducer.id] as any as string;

          return rowInfo.isGroupRow
            ? (rowInfo.reducerResults?.[reducer.id] as any as string)
            : null;
        },
      });
    });
  });

  if (
    (!pivotLength && pivotTotalColumnPosition === 'start') ||
    pivotGrandTotalColumnPosition === 'start'
  ) {
    addGrandTotalColumns();
  }

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
      // const initialParentColumnGroupId = parentColumnGroupId;

      if (!isSingleAggregationColumn) {
        const columnGroupId = parentColumnGroupId;
        parentColumnGroupId = keys.join('/');

        const pivotGroupKey = keys[keys.length - 1];
        columnGroups[parentColumnGroupId] = prepareColumnGroup({
          header: `${pivotGroupKey}`,
          columnGroup: columnGroupId,
          pivotBy,
          pivotGroupKeys: keys,
          pivotByAtIndex: pivotByForColumn,
          pivotIndex: keys.length - 1,
          pivotGroupKey,
        });
      }

      // todo when !isSingleAggregationColumn add here pivot total column
      aggregationReducers.forEach((reducer, index) => {
        const header = isSingleAggregationColumn
          ? `${keys[keys.length - 1]}`
          : reducer.name || reducer.id;

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
          defaultSortable: false,
          columnGroup: parentColumnGroupId,
          header,
          valueFormatter: ({ rowInfo }) => {
            if (!rowInfo.isGroupRow) {
              return null;
            }
            return rowInfo.pivotValuesMap?.get(keys)?.reducerResults[
              reducer.id
            ] as any as string;
          },
        });

        const columnId = `${reducer.id}:${keys.join('/')}`;

        columns[columnId] = computedPivotColumn;
      });

      // todo fix https://github.com/infinite-table/infinite-react/issues/22

      // if (!isSingleAggregationColumn) {
      //   aggregationReducers.forEach((reducer, index) => {
      //     const computedPivotTotalColumn = prepareColumn({
      //       columnGroup: parentColumnGroupId,
      //       header: isSingleAggregationColumn
      //         ? `${keys[keys.length - 1]} total `
      //         : `${reducer.id} total`,
      //       pivotAggregator: reducer,
      //       pivotAggregatorIndex: index,
      //       pivotColumn: true,
      //       pivotTotalColumn: true,
      //       pivotGroupKeys: keys,
      //       pivotGroupKey: keys[keys.length - 1],
      //       pivotByAtIndex: pivotByForColumn,
      //       pivotIndex: keys.length - 1,
      //       pivotBy,
      //       sortable: false,
      //       valueGetter: ({ rowInfo }) => {
      //         return rowInfo.pivotValuesMap?.get(keys)?.reducerResults[
      //           reducer.id
      //         ];
      //       },
      //     });

      //     columns.set(
      //       `total:${reducer.id}:${keys.join('/')}`,
      //       computedPivotTotalColumn,
      //     );
      //   });
      // }
    } else {
      const colGroupId = keys.join('/');
      const parentKeys = keys.slice(0, -1);

      columnGroups[colGroupId] = prepareColumnGroup({
        columnGroup: parentKeys.length ? parentKeys.join('/') : undefined,
        header: `${keys[keys.length - 1]}`,
        pivotBy,
        pivotGroupKeys: keys,
        pivotIndex: keys.length - 1,
        pivotByAtIndex: pivotBy[keys.length - 1],
        pivotGroupKey: keys[keys.length - 1],
      });

      if (pivotTotalColumnPosition !== false) {
        const pivotByForColumn = pivotBy[keys.length - 1];
        let columnGroupId = parentKeys.length
          ? parentKeys.join('/')
          : undefined;

        if (!isSingleAggregationColumn) {
          const parentGroupForTotalsGroup = columnGroupId;
          columnGroupId = `total:${keys.join('/')}`;
          columnGroups[columnGroupId] = prepareColumnGroup({
            header: `${keys[keys.length - 1]} total`,
            columnGroup: parentGroupForTotalsGroup,
            pivotBy,
            pivotTotalColumnGroup: true,
            pivotGroupKeys: keys,
            pivotIndex: keys.length - 1,
            pivotByAtIndex: pivotByForColumn,
            pivotGroupKey: keys[keys.length - 1],
          });
        }

        aggregationReducers.forEach((reducer, index) => {
          const header = isSingleAggregationColumn
            ? `${keys[keys.length - 1]} total `
            : `${reducer.name || reducer.id} total`;
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
            defaultSortable: false,
            valueFormatter: ({ rowInfo }) => {
              if (!rowInfo.isGroupRow) {
                return null;
              }
              return rowInfo.pivotValuesMap?.get(keys)?.reducerResults[
                reducer.id
              ] as any as string;
            },
          });
          columns[`total:${reducer.id}:${keys.join('/')}`] =
            computedPivotColumn;
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

  if (
    (!pivotLength && pivotTotalColumnPosition === 'end') ||
    pivotGrandTotalColumnPosition === 'end'
  ) {
    addGrandTotalColumns();
  }

  const result = {
    columns,
    columnGroups,
  };

  return result;
}
