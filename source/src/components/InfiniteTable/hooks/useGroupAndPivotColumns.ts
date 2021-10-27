import { useCallback, useEffect, useMemo } from 'react';
import { InfiniteTableColumn } from '..';
import { interceptMap } from '../../..';
import { DataSourceGroupRowsBy, GroupRowsState } from '../../DataSource';
import { useDataSourceContextValue } from '../../DataSource/publicHooks/useDataSource';
import { useComponentState } from '../../hooks/useComponentState';
import { getComputedPivotColumnsFromDataSourcePivotColumns } from '../state/getComputedPivotColumnsFromDataSourcePivotColumns';
import { InfiniteTableGeneratedGroupColumn } from '../types/InfiniteTableColumn';
import {
  InfiniteTableGeneratedColumns,
  InfiniteTablePropGroupColumn,
  InfiniteTablePropGroupRenderStrategy,
  InfiniteTableProps,
} from '../types/InfiniteTableProps';
import { InfiniteTableComponentState } from '../types/InfiniteTableState';
import {
  getColumnForGroupBy,
  getGroupColumnRender,
  getSingleGroupColumn,
} from '../utils/getColumnForGroupBy';

type GetGroupColumnStrategyOptions<T> = {
  groupRowsBy: DataSourceGroupRowsBy<T>[];
  groupColumn?: InfiniteTablePropGroupColumn<T>;
  groupRenderStrategy: InfiniteTablePropGroupRenderStrategy;
};
function getGroupRenderStrategy<T>(
  options: GetGroupColumnStrategyOptions<T>,
): InfiniteTablePropGroupRenderStrategy {
  const { groupRowsBy, groupColumn, groupRenderStrategy } = options;

  if (groupRenderStrategy) {
    return groupRenderStrategy;
  }

  if (groupColumn != null && typeof groupColumn === 'object') {
    return 'single-column';
  }

  const columnsInGroupRowsBy = groupRowsBy.filter((g) => g.column);

  if (columnsInGroupRowsBy.length) {
    return 'multi-column';
  }

  return 'multi-column';
}

type GroupRowsByMap<T> = Map<
  keyof T,
  { groupBy: DataSourceGroupRowsBy<T>; groupIndex: number }
>;

type ToggleGrouRowFn = (groupKeys: any[]) => void;

export function useGroupAndPivotColumns<T>() {
  const {
    componentState: { groupRowsBy, pivotBy, groupRowsState },
    getState: getDataSourceState,
    componentActions: dataSourceActions,
  } = useDataSourceContextValue<T>();

  const {
    getComponentState,
    componentActions,
    componentState: {
      columns,
      generatedColumns,
      hideEmptyGroupColumns,
      groupColumn,
      groupRenderStrategy,
      pivotColumn,
      pivotRowLabelsColumn,
      pivotColumns,
      pivotTotalColumnPosition,
    },
  } = useComponentState<InfiniteTableComponentState<T>>();

  const toggleGroupRow = useCallback<ToggleGrouRowFn>((groupKeys: any[]) => {
    const newState = new GroupRowsState(getDataSourceState().groupRowsState);
    newState.toggleGroupRow(groupKeys);

    dataSourceActions.groupRowsState = newState;
  }, []);

  const groupRowsByMap = useMemo(() => {
    return groupRowsBy.reduce((acc, groupBy, index) => {
      acc.set(groupBy.field, {
        groupBy,
        groupIndex: index,
      });
      return acc;
    }, new Map() as GroupRowsByMap<T>);
  }, [groupRowsBy]);

  useEffect(() => {
    dataSourceActions.generateGroupRows = groupRenderStrategy !== 'inline';
  }, [groupRenderStrategy]);

  function updateComputedColumns(
    columns: Map<string, InfiniteTableColumn<T>>,
    groupRowsByMap: GroupRowsByMap<T>,
    groupRenderStrategy: InfiniteTablePropGroupRenderStrategy,
    toggleGroupRow: ToggleGrouRowFn,
  ) {
    const computedColumns = new Map<string, InfiniteTableColumn<T>>();

    columns.forEach((column, id) => {
      let base: Partial<InfiniteTableGeneratedGroupColumn<T>> = {};
      const groupByForColumn = groupRowsByMap.get(column.field!);
      if (groupByForColumn && groupRenderStrategy === 'inline') {
        const { groupIndex } = groupByForColumn;
        const field = groupByForColumn.groupBy.field;
        base = {
          groupByField: field as string,
          field: field,
          valueGetter: ({ enhancedData }) => {
            // const parents = enhancedData.parents;
            // console.log(parents);
            return enhancedData.groupKeys?.[groupIndex];
          },
          rowspan: ({ enhancedData, dataArray }) => {
            const prevEnhancedData = dataArray[enhancedData.indexInAll - 1] || {
              indexInParentGroups: [],
            };
            const prevIndexes = prevEnhancedData.indexInParentGroups! || [];
            const currentIndexes = enhancedData.indexInParentGroups! || [];

            let computeSpan = false;
            for (let i = 0; i <= groupIndex; i++) {
              const prev = prevIndexes[i];
              const current = currentIndexes[i];

              if (current !== prev) {
                computeSpan = true;
                break;
              }
            }

            if (!computeSpan) {
              //} || enhancedData.collapsed) {
              return 1;
            }
            const parentGroup = enhancedData.parents![groupIndex];

            const rowspan = parentGroup
              ? parentGroup.groupCount -
                (parentGroup.collapsedChildrenCount || 0) +
                (parentGroup.collapsedGroupsCount || 0)
              : 1;

            if (column.field === 'department') {
              console.log({ rowspan, parentGroup });
            }

            return rowspan;
          },
          render: getGroupColumnRender({
            groupIndex,
            groupRenderStrategy,
            toggleGroupRow,
          }),
        };
      }
      const clone = { ...base, ...column } as InfiniteTableColumn<T>;

      computedColumns.set(id, clone);
    });

    return computedColumns;
  }

  useEffect(() => {
    const update = () => {
      componentActions.computedColumns = updateComputedColumns(
        columns,
        groupRowsByMap,
        groupRenderStrategy,
        toggleGroupRow,
      );
    };

    update();

    return interceptMap(columns, {
      set: update,
      delete: update,
      clear: update,
    });
  }, [columns, groupRowsByMap, groupRenderStrategy, toggleGroupRow]);

  useEffect(() => {
    const currentState = getComponentState();

    if (pivotColumns) {
      if (currentState.generatedColumns.size) {
        //reset generated columns
        componentActions.generatedColumns = new Map();
      }

      return;
    }

    componentActions.generatedColumns = getGeneratedGroupColumns({
      groupColumn,
      groupRenderStrategy,
      groupRowsBy,
      pivotColumns,
      toggleGroupRow,
    });
  }, [groupRowsBy, groupColumn, groupRenderStrategy, pivotColumns]);

  useEffect(() => {
    if (groupRenderStrategy === 'single-column') {
      return;
    }

    const groupsLength = groupRowsBy.length;

    let expandedGroupsLevel = 0;
    const { dataArray } = getDataSourceState();
    const len = dataArray.length;

    for (let i = 0; i < len; i++) {
      const data = dataArray[i];

      expandedGroupsLevel = Math.max(
        expandedGroupsLevel,
        data.groupNesting! - 1,
      );
      if (expandedGroupsLevel === groupsLength - 1) {
        break;
      }
    }

    const currentState = getComponentState();
    // todo merge this into just 1 source
    const { computedColumns, pivotColumns, generatedColumns } = currentState;
    const columnVisibility = new Map(currentState.columnVisibility);
    const cols =
      pivotColumns ||
      (groupRenderStrategy === 'multi-column'
        ? generatedColumns
        : computedColumns);

    groupRowsBy.forEach(({ field }, index) => {
      const colId =
        groupRenderStrategy === 'multi-column'
          ? `group-by-${field}`
          : (field as string);

      const col = cols.get(colId);

      if (!col) {
        return;
      }
      const shouldBeHidden = index > expandedGroupsLevel;
      if (shouldBeHidden && hideEmptyGroupColumns) {
        columnVisibility.set(colId, false);
      } else {
        columnVisibility.delete(colId);
      }
    });

    componentActions.columnVisibility = columnVisibility;
  }, [
    getDataSourceState,
    groupRenderStrategy,
    generatedColumns,

    groupRowsBy,
    groupRowsByMap,
    hideEmptyGroupColumns ? groupRowsState : null,
    hideEmptyGroupColumns,
  ]);

  useEffect(() => {
    dataSourceActions.pivotTotalColumnPosition = pivotTotalColumnPosition;
  }, [pivotTotalColumnPosition]);

  useEffect(() => {
    const computedPivotColumns =
      getComputedPivotColumnsFromDataSourcePivotColumns(pivotColumns, {
        pivotColumn,
        pivotRowLabelsColumn,
        pivotTotalColumnPosition,
        pivotBy: pivotBy!,

        groupRowsBy,
        toggleGroupRow,
      });

    componentActions.computedPivotColumns = computedPivotColumns;
  }, [pivotColumns, pivotColumn, pivotRowLabelsColumn]);
}

export function getGeneratedGroupColumns<T>(params: {
  groupRowsBy: DataSourceGroupRowsBy<T>[];
  toggleGroupRow: (groupKeys: any[]) => void;
  groupColumn: InfiniteTableProps<T>['groupColumn'];
  groupRenderStrategy: InfiniteTablePropGroupRenderStrategy;
  pivotColumns: InfiniteTableProps<T>['pivotColumns'];
}): InfiniteTableGeneratedColumns<T> {
  const {
    pivotColumns,
    groupRowsBy,
    groupColumn,
    groupRenderStrategy,
    toggleGroupRow,
  } = params;

  const generatedColumns: InfiniteTableGeneratedColumns<T> = new Map();

  if (pivotColumns) {
    return generatedColumns;
  }

  const strategy = getGroupRenderStrategy({
    groupRowsBy,
    groupColumn,
    groupRenderStrategy,
  });

  if (groupRenderStrategy === 'multi-column') {
    groupRowsBy.forEach((groupBy, index, arr) => {
      generatedColumns.set(
        `group-by-${groupBy.field}`,
        getColumnForGroupBy<T>(
          {
            groupBy,
            groupRowsBy,
            groupIndex: index,
            groupCount: arr.length,
            groupRenderStrategy,
          },
          toggleGroupRow,
          groupColumn,
        ),
      );
    });
  } else if (strategy === 'single-column') {
    generatedColumns.set(
      'group-by',
      getSingleGroupColumn(
        {
          groupCount: groupRowsBy.length,
          groupRowsBy,
        },
        toggleGroupRow,
        groupColumn,
      ),
    );
  } else if (strategy === 'inline') {
    // do nothing, as no generated columns
  }

  return generatedColumns;
}
