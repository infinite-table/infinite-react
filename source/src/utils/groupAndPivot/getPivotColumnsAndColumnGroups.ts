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
  InfiniteTablePivotFinalColumnGroup,
  InfiniteTablePivotFinalColumnVariant,
} from '../../components/InfiniteTable/types/InfiniteTableColumn';
import { InfiniteTablePropColumnGroupsMap } from '../../components/InfiniteTable/types/InfiniteTableProps';

import type {
  InfiniteTablePropPivotTotalColumnPosition,
  InfiniteTablePropPivotGrandTotalColumnPosition,
} from '../../components/InfiniteTable/types/InfiniteTableState';
import { DeepMap } from '../DeepMap';
import { once } from '../DeepMap/once';

export type ComputedColumnsAndGroups<DataType> = {
  columns: InfiniteTablePropColumnsMap<
    DataType,
    InfiniteTablePivotColumn<DataType>
  >;
  columnGroups: InfiniteTablePropColumnGroupsMap;
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

export function getPivotColumnsAndColumnGroups<DataType, KeyType = any>({
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
  const columns: InfiniteTablePropColumnsMap<
    DataType,
    InfiniteTablePivotColumn<DataType>
  > = new Map<string, InfiniteTablePivotColumn<DataType>>([
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
  ]);

  const columnGroups: InfiniteTablePropColumnGroups = new Map<
    string,
    InfiniteTableColumnGroup
  >();

  const addGrandTotalColumns = once(function () {
    aggregationReducers.forEach((reducer, index) => {
      columns.set(
        `total:${reducer.id}`,
        prepareColumn({
          header: `${reducer.name || reducer.id} total`,
          pivotBy,
          pivotColumn: true,
          pivotTotalColumn: true,
          pivotAggregator: reducer,
          pivotAggregatorIndex: index,

          pivotGroupKeys: [],
          pivotGroupKey: '',
          pivotIndex: -1,

          valueGetter: ({ rowInfo }) => {
            return rowInfo.reducerResults?.[reducer.id] as any as string;
          },
        }),
      );
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

      // todo when !isSingleAggregationColumn add here pivot total column
      aggregationReducers.forEach((reducer, index) => {
        const header = isSingleAggregationColumn
          ? keys[keys.length - 1]
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
          sortable: false,
          columnGroup: parentColumnGroupId,
          header,
          valueGetter: ({ rowInfo }) => {
            return rowInfo.pivotValuesMap?.get(keys)?.reducerResults[
              reducer.id
            ] as any as string;
          },
        });

        const columnId = `${reducer.id}:${keys.join('/')}`;

        columns.set(columnId, computedPivotColumn);
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
            sortable: false,
            valueGetter: ({ rowInfo }) => {
              return rowInfo.pivotValuesMap?.get(keys)?.reducerResults[
                reducer.id
              ] as any as string;
            },
          });
          columns.set(
            `total:${reducer.id}:${keys.join('/')}`,
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
