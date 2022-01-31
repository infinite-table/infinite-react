import { useEffect, useMemo } from 'react';
import type { InfiniteTableColumn, InfiniteTableState } from '..';

import type {
  DataSourceGroupBy,
  DataSourcePropGroupBy,
} from '../../DataSource';
import { useDataSourceContextValue } from '../../DataSource/publicHooks/useDataSource';
import { useComponentState } from '../../hooks/useComponentState';
import { interceptMap } from '../../hooks/useInterceptedMap';
import { getComputedPivotColumnsFromDataSourcePivotColumns } from '../state/getComputedPivotColumnsFromDataSourcePivotColumns';
import type { InfiniteTableGeneratedGroupColumn } from '../types/InfiniteTableColumn';
import type {
  InfiniteTablePropGroupRenderStrategy,
  InfiniteTableProps,
} from '../types/InfiniteTableProps';
import { GroupByMap } from '../types/InfiniteTableState';

import {
  getColumnForGroupBy,
  getGroupColumnRender,
  getSingleGroupColumn,
} from '../utils/getColumnForGroupBy';

import { ToggleGrouRowFn, useToggleGroupRow } from './useToggleGroupRow';

function useGroupByMap<T>(groupBy: DataSourcePropGroupBy<T>) {
  const groupByMap = useMemo(() => {
    return groupBy.reduce((acc, groupBy, index) => {
      acc.set(groupBy.field, {
        groupBy,
        groupIndex: index,
      });
      return acc;
    }, new Map() as GroupByMap<T>);
  }, [groupBy]);

  return groupByMap;
}

export function useColumnsWhen<T>() {
  const {
    componentState: { groupBy },
    componentActions: dataSourceActions,
  } = useDataSourceContextValue<T>();

  const {
    componentState: { groupRenderStrategy, pivotTotalColumnPosition },
  } = useComponentState<InfiniteTableState<T>>();

  const groupByMap = useGroupByMap(groupBy);

  useEffect(() => {
    dataSourceActions.generateGroupRows = groupRenderStrategy !== 'inline';
  }, [groupRenderStrategy]);

  useEffect(() => {
    dataSourceActions.pivotTotalColumnPosition = pivotTotalColumnPosition;
  }, [pivotTotalColumnPosition]);

  useColumnsWhenInlineGroupRenderStrategy<T>(groupByMap);
  useColumnsWhenPivoting<T>();
  useColumnsWhenGrouping<T>();
  useHideEmptyGroupColumns<T>(groupByMap);
}

function useColumnsWhenInlineGroupRenderStrategy<T>(groupByMap: GroupByMap<T>) {
  const toggleGroupRow = useToggleGroupRow();

  const {
    componentActions,
    componentState: { columns, groupRenderStrategy },
  } = useComponentState<InfiniteTableState<T>>();

  function computeColumnsWhenInlineGroupRenderStrategy(
    columns: Map<string, InfiniteTableColumn<T>>,
    groupByMap: GroupByMap<T>,
    groupRenderStrategy: InfiniteTablePropGroupRenderStrategy,
    toggleGroupRow: ToggleGrouRowFn,
  ) {
    const computedColumns = new Map<string, InfiniteTableColumn<T>>();

    columns.forEach((column, id) => {
      let base: Partial<InfiniteTableGeneratedGroupColumn<T>> = {};
      const groupByForColumn = groupByMap.get(column.field!);
      if (groupByForColumn && groupRenderStrategy === 'inline') {
        const { groupIndex } = groupByForColumn;
        const field = groupByForColumn.groupBy.field;
        base = {
          groupByField: field as string,
          field: field,
          valueGetter: ({ rowInfo }) => {
            return rowInfo.groupKeys?.[groupIndex];
          },
          rowspan: ({ rowInfo, dataArray }) => {
            const prevRowInfo = dataArray[rowInfo.indexInAll - 1] || {
              indexInParentGroups: [],
            };
            const prevIndexes = prevRowInfo.indexInParentGroups! || [];
            const currentIndexes = rowInfo.indexInParentGroups! || [];

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
              return 1;
            }
            const parentGroup = rowInfo.parents![groupIndex];

            const rowspan = parentGroup
              ? parentGroup.groupCount -
                (parentGroup.collapsedChildrenCount || 0) +
                (parentGroup.collapsedGroupsCount || 0)
              : 1;

            return rowspan;
          },
          render: getGroupColumnRender({
            groupIndexForColumn: groupIndex,
            groupRenderStrategy,
            toggleGroupRow,
          }),
        };
      }
      const clone = { ...base, ...column } as InfiniteTableColumn<T>;

      computedColumns.set(id, clone);
    });

    return computedColumns.size === 0 ? undefined : computedColumns;
  }

  useEffect(() => {
    const update = () => {
      componentActions.columnsWhenInlineGroupRenderStrategy =
        computeColumnsWhenInlineGroupRenderStrategy(
          columns,
          groupByMap,
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
  }, [columns, groupByMap, groupRenderStrategy, toggleGroupRow]);
}

function useColumnsWhenPivoting<T>() {
  const {
    componentState: { groupBy, pivotBy },
  } = useDataSourceContextValue<T>();

  const {
    componentActions,
    componentState: {
      pivotColumns,
      pivotColumn,
      pivotRowLabelsColumn,
      pivotTotalColumnPosition,
    },
  } = useComponentState<InfiniteTableState<T>>();

  const toggleGroupRow = useToggleGroupRow();

  useEffect(() => {
    const computedPivotColumns =
      getComputedPivotColumnsFromDataSourcePivotColumns(pivotColumns, {
        pivotColumn,
        pivotRowLabelsColumn,
        pivotTotalColumnPosition,
        pivotBy: pivotBy!,

        groupBy: groupBy,
        toggleGroupRow,
      });

    componentActions.computedPivotColumns = computedPivotColumns;
  }, [pivotColumns, pivotColumn, pivotRowLabelsColumn]);
}

function useColumnsWhenGrouping<T>() {
  const {
    componentState: { groupBy },
  } = useDataSourceContextValue<T>();

  const {
    componentActions,
    componentState: { columns, groupColumn, groupRenderStrategy, pivotColumns },
  } = useComponentState<InfiniteTableState<T>>();

  const toggleGroupRow = useToggleGroupRow();

  useEffect(() => {
    if (pivotColumns) {
      return;
    }

    const update = () => {
      const columnsWhenGrouping = getColumnsWhenGrouping({
        columns,
        groupColumn,
        groupRenderStrategy,
        groupBy,
        pivotColumns,
        toggleGroupRow,
      });

      componentActions.columnsWhenGrouping = columnsWhenGrouping;
    };

    update();

    return interceptMap(columns, {
      set: update,
      delete: update,
      clear: update,
    });
  }, [columns, groupBy, groupColumn, groupRenderStrategy, pivotColumns]);
}

function useHideEmptyGroupColumns<T>(groupRowsMap: GroupByMap<T>) {
  const {
    componentState: { groupBy, groupRowsState },
    getState: getDataSourceState,
  } = useDataSourceContextValue<T>();

  const {
    getComponentState,
    componentActions,
    componentState: {
      columnsWhenGrouping: generatedColumns,
      hideEmptyGroupColumns,
      groupRenderStrategy,
    },
  } = useComponentState<InfiniteTableState<T>>();

  useEffect(() => {
    if (groupRenderStrategy !== 'multi-column') {
      return;
    }

    const groupsLength = groupBy.length;

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

    const { computedColumns } = currentState;

    let updated = false;
    const columnVisibility = { ...currentState.columnVisibility };
    const cols = computedColumns;

    groupBy.forEach(({ field, column: groupColumn }, index) => {
      const colId = groupColumn?.id || `group-by-${field}`;
      let col = cols.get(colId);

      if (!col) {
        return;
      }
      const shouldBeHidden =
        index > expandedGroupsLevel && hideEmptyGroupColumns;

      updated = true;
      if (shouldBeHidden) {
        columnVisibility[colId] = false;
      } else {
        delete columnVisibility[colId];
      }
    });

    if (updated) {
      componentActions.columnVisibility = columnVisibility;
    }
  }, [
    getDataSourceState,
    groupRenderStrategy,
    generatedColumns,

    groupBy,
    groupRowsMap,
    hideEmptyGroupColumns ? groupRowsState : null,
    hideEmptyGroupColumns,
  ]);
}

export function getColumnsWhenGrouping<T>(params: {
  columns: Map<string, InfiniteTableColumn<T>>;
  groupBy: DataSourceGroupBy<T>[];
  toggleGroupRow: (groupKeys: any[]) => void;
  groupColumn: InfiniteTableProps<T>['groupColumn'];
  groupRenderStrategy: InfiniteTablePropGroupRenderStrategy;
  pivotColumns: InfiniteTableProps<T>['pivotColumns'];
}): Map<string, InfiniteTableColumn<T>> | undefined {
  const {
    pivotColumns,
    groupBy,
    groupColumn,
    groupRenderStrategy,
    toggleGroupRow,
    columns,
  } = params;

  if (pivotColumns) {
    return undefined;
  }

  if (groupRenderStrategy === 'inline') {
    return undefined;
  }

  const computedColumns = new Map<string, InfiniteTableColumn<T>>();

  if (groupRenderStrategy === 'multi-column') {
    groupBy.forEach((groupByForColumn, groupIndexForColumn, arr) => {
      const generatedGroupColumn = getColumnForGroupBy<T>(
        {
          groupByForColumn,
          groupBy,
          groupIndexForColumn,
          groupCount: arr.length,
          groupRenderStrategy,
        },
        toggleGroupRow,
        groupColumn,
      );
      computedColumns.set(
        generatedGroupColumn.id || `group-by-${groupByForColumn.field}`,
        generatedGroupColumn,
      );
    });
  } else if (groupRenderStrategy === 'single-column') {
    const singleGroupColumn = getSingleGroupColumn(
      {
        groupCount: groupBy.length,
        groupBy,
        groupRenderStrategy,
      },
      toggleGroupRow,
      groupColumn,
    );

    computedColumns.set(singleGroupColumn.id || 'group-by', singleGroupColumn);
  }
  columns.forEach((col, colId) => {
    computedColumns.set(colId, col);
  });

  return computedColumns.size ? computedColumns : undefined;
}
