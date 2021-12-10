import { useEffect, useMemo } from 'react';
import type { InfiniteTableColumn, InfiniteTableState } from '..';

import type {
  DataSourceGroupRowsBy,
  DataSourcePropGroupRowsBy,
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
import { GroupRowsMap } from '../types/InfiniteTableState';

import {
  getColumnForGroupBy,
  getGroupColumnRender,
  getSingleGroupColumn,
} from '../utils/getColumnForGroupBy';

import { ToggleGrouRowFn, useToggleGroupRow } from './useToggleGroupRow';

function useGroupRowsMap<T>(groupRowsBy: DataSourcePropGroupRowsBy<T>) {
  const groupRowsMap = useMemo(() => {
    return groupRowsBy.reduce((acc, groupBy, index) => {
      acc.set(groupBy.field, {
        groupBy,
        groupIndex: index,
      });
      return acc;
    }, new Map() as GroupRowsMap<T>);
  }, [groupRowsBy]);

  return groupRowsMap;
}

export function useColumnsWhen<T>() {
  const {
    componentState: { groupRowsBy },
    componentActions: dataSourceActions,
  } = useDataSourceContextValue<T>();

  const {
    componentState: { groupRenderStrategy, pivotTotalColumnPosition },
  } = useComponentState<InfiniteTableState<T>>();

  const groupRowsMap = useGroupRowsMap(groupRowsBy);

  useEffect(() => {
    dataSourceActions.generateGroupRows = groupRenderStrategy !== 'inline';
  }, [groupRenderStrategy]);

  useEffect(() => {
    dataSourceActions.pivotTotalColumnPosition = pivotTotalColumnPosition;
  }, [pivotTotalColumnPosition]);

  useColumnsWhenInlineGroupRenderStrategy<T>(groupRowsMap);
  useColumnsWhenPivoting<T>();
  useColumnsWhenGrouping<T>();
  useHideEmptyGroupColumns<T>(groupRowsMap);
}

function useColumnsWhenInlineGroupRenderStrategy<T>(
  groupRowsMap: GroupRowsMap<T>,
) {
  const toggleGroupRow = useToggleGroupRow();

  const {
    componentActions,
    componentState: { columns, groupRenderStrategy },
  } = useComponentState<InfiniteTableState<T>>();

  function computeColumnsWhenInlineGroupRenderStrategy(
    columns: Map<string, InfiniteTableColumn<T>>,
    groupRowsMap: GroupRowsMap<T>,
    groupRenderStrategy: InfiniteTablePropGroupRenderStrategy,
    toggleGroupRow: ToggleGrouRowFn,
  ) {
    const computedColumns = new Map<string, InfiniteTableColumn<T>>();

    columns.forEach((column, id) => {
      let base: Partial<InfiniteTableGeneratedGroupColumn<T>> = {};
      const groupByForColumn = groupRowsMap.get(column.field!);
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
          groupRowsMap,
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
  }, [columns, groupRowsMap, groupRenderStrategy, toggleGroupRow]);
}

function useColumnsWhenPivoting<T>() {
  const {
    componentState: { groupRowsBy, pivotBy },
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

        groupRowsBy,
        toggleGroupRow,
      });

    componentActions.computedPivotColumns = computedPivotColumns;
  }, [pivotColumns, pivotColumn, pivotRowLabelsColumn]);
}

function useColumnsWhenGrouping<T>() {
  const {
    componentState: { groupRowsBy },
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
        groupRowsBy,
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
  }, [groupRowsBy, groupColumn, groupRenderStrategy, pivotColumns]);
}

function useHideEmptyGroupColumns<T>(groupRowsMap: GroupRowsMap<T>) {
  const {
    componentState: { groupRowsBy, groupRowsState },
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

    const { computedColumns } = currentState;

    let updated = false;
    const columnVisibility = new Map(currentState.columnVisibility);
    const cols = computedColumns;

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
      updated = true;
      if (shouldBeHidden && hideEmptyGroupColumns) {
        columnVisibility.set(colId, false);
      } else {
        columnVisibility.delete(colId);
      }
    });

    if (updated) {
      componentActions.columnVisibility = columnVisibility;
    }
  }, [
    getDataSourceState,
    groupRenderStrategy,
    generatedColumns,

    groupRowsBy,
    groupRowsMap,
    hideEmptyGroupColumns ? groupRowsState : null,
    hideEmptyGroupColumns,
  ]);
}

export function getColumnsWhenGrouping<T>(params: {
  columns: Map<string, InfiniteTableColumn<T>>;
  groupRowsBy: DataSourceGroupRowsBy<T>[];
  toggleGroupRow: (groupKeys: any[]) => void;
  groupColumn: InfiniteTableProps<T>['groupColumn'];
  groupRenderStrategy: InfiniteTablePropGroupRenderStrategy;
  pivotColumns: InfiniteTableProps<T>['pivotColumns'];
}): Map<string, InfiniteTableColumn<T>> | undefined {
  const {
    pivotColumns,
    groupRowsBy,
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
    groupRowsBy.forEach((groupByForColumn, groupIndexForColumn, arr) => {
      computedColumns.set(
        `group-by-${groupByForColumn.field}`,
        getColumnForGroupBy<T>(
          {
            groupByForColumn,
            groupRowsBy,
            groupIndexForColumn,
            groupCount: arr.length,
            groupRenderStrategy,
          },
          toggleGroupRow,
          groupColumn,
        ),
      );
    });
  } else if (groupRenderStrategy === 'single-column') {
    computedColumns.set(
      'group-by',
      getSingleGroupColumn(
        {
          groupCount: groupRowsBy.length,
          groupRowsBy,
          groupRenderStrategy,
        },
        toggleGroupRow,
        groupColumn,
      ),
    );
  }
  columns.forEach((col, colId) => {
    computedColumns.set(colId, col);
  });

  return computedColumns.size ? computedColumns : undefined;
}
