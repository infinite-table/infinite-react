import { useEffect, useLayoutEffect, useMemo } from 'react';

import type { InfiniteTableColumn, InfiniteTableState } from '..';
import { shallowEqualObjects } from '../../../utils/shallowEqualObjects';
import type {
  DataSourceGroupBy,
  DataSourcePivotBy,
  DataSourcePropGroupBy,
  DataSourcePropSelectionMode,
} from '../../DataSource';
import { useDataSourceContextValue } from '../../DataSource/publicHooks/useDataSource';
import { useComponentState } from '../../hooks/useComponentState';
import { interceptMap } from '../../hooks/useInterceptedMap';
import { getGroupByMap } from '../state/getInitialState';
import {
  getColumnVisibilityForHideEmptyGroupColumns,
  getGroupColumnsMapForComputedColumns,
} from '../state/getColumnVisibilityForHideEmptyGroupColumns';

import type {
  InfiniteTableComputedPivotFinalColumn,
  InfiniteTableGeneratedGroupColumn,
  InfiniteTablePivotColumn,
} from '../types/InfiniteTableColumn';
import type {
  InfiniteTablePropGroupRenderStrategy,
  InfiniteTableProps,
} from '../types/InfiniteTableProps';
import { GroupByMap } from '../types/InfiniteTableState';
import {
  getColumnForGroupBy,
  getGroupColumnRender,
  getGroupColumnRenderGroupIcon,
  getSingleGroupColumn,
} from '../utils/getColumnForGroupBy';

import { ToggleGroupRowFn, useToggleGroupRow } from './useToggleGroupRow';

function useGroupByMap<T>(groupBy: DataSourcePropGroupBy<T>) {
  return useMemo(() => getGroupByMap(groupBy), [groupBy]);
}

export function useColumnsWhen<T>() {
  const {
    componentState: { groupBy },
    componentActions: dataSourceActions,
  } = useDataSourceContextValue<T>();

  const {
    componentState: {
      groupRenderStrategy,
      pivotTotalColumnPosition,
      pivotGrandTotalColumnPosition,
    },
  } = useComponentState<InfiniteTableState<T>>();

  useEffect(() => {
    dataSourceActions.generateGroupRows = groupRenderStrategy !== 'inline';
  }, [groupRenderStrategy]);

  useEffect(() => {
    dataSourceActions.pivotTotalColumnPosition = pivotTotalColumnPosition;
  }, [pivotTotalColumnPosition]);

  useEffect(() => {
    if (pivotGrandTotalColumnPosition != undefined) {
      dataSourceActions.pivotGrandTotalColumnPosition =
        pivotGrandTotalColumnPosition;
    }
  }, [pivotGrandTotalColumnPosition]);

  const groupByMap = useGroupByMap(groupBy);

  useColumnsWhenInlineGroupRenderStrategy<T>(groupByMap);
  const { toggleGroupRow } = useColumnsWhenGrouping<T>();

  useHideColumns<T>(groupByMap);

  return { toggleGroupRow };
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
    toggleGroupRow: ToggleGroupRowFn,
  ) {
    const computedColumns = new Map<string, InfiniteTableColumn<T>>();

    if (groupRenderStrategy !== 'inline') {
      return;
    }

    columns.forEach((column, id) => {
      let base: Partial<InfiniteTableGeneratedGroupColumn<T>> = {};
      const groupByForColumn = groupByMap.get(column.field!);
      if (groupByForColumn && groupRenderStrategy === 'inline') {
        const { groupIndex } = groupByForColumn;

        base = {
          groupByForColumn: groupByForColumn.groupBy,
          field: groupByForColumn.groupBy?.field,
          valueGetter: groupByForColumn.groupBy?.valueGetter,

          valueFormatter: ({ rowInfo }) => {
            return rowInfo.isGroupRow
              ? rowInfo.groupKeys?.[groupIndex]
              : rowInfo.value;
          },
          rowspan: ({ rowInfo, dataArray }) => {
            if (!rowInfo.isGroupRow) {
              return 1;
            }
            const prevRowInfo = dataArray[rowInfo.indexInAll - 1] || {
              indexInParentGroups: [],
            };
            if (!prevRowInfo || !prevRowInfo.dataSourceHasGrouping) {
              return 1;
            }
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
          renderGroupIcon: getGroupColumnRenderGroupIcon({
            groupIndexForColumn: groupIndex,
            groupRenderStrategy,
            toggleGroupRow,
            initialRenderGroupIcon: column.renderGroupIcon,
          }),
          render: getGroupColumnRender({
            groupIndexForColumn: groupIndex,
            groupRenderStrategy,
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

function useColumnsWhenGrouping<T>() {
  const {
    componentState: { groupBy, pivotBy, selectionMode },
  } = useDataSourceContextValue<T>();

  const {
    componentActions,
    componentState: {
      columns,
      groupColumn,
      hideColumnWhenGrouped,
      groupRenderStrategy,
      pivotColumns,
      pivotColumn,
      pivotTotalColumnPosition,
      pivotGrandTotalColumnPosition,
    },
    getComponentState,
  } = useComponentState<InfiniteTableState<T>>();

  const toggleGroupRow = useToggleGroupRow();

  useEffect(() => {
    const update = () => {
      const { columns: columnsWhenGrouping, groupColumnIds } =
        getColumnsWhenGrouping({
          columns,
          groupColumn,
          pivotColumn,
          pivotTotalColumnPosition,
          pivotGrandTotalColumnPosition,
          groupRenderStrategy:
            groupRenderStrategy === 'inline'
              ? 'single-column'
              : groupRenderStrategy,
          groupBy,
          pivotBy,
          pivotColumns,
          toggleGroupRow,
          selectionMode,
        });

      componentActions.columnsWhenGrouping = columnsWhenGrouping;

      let currentColumnOrder = getComponentState().columnOrder;
      if (groupColumnIds.length && Array.isArray(currentColumnOrder)) {
        const colOrder = new Set(currentColumnOrder);
        let shouldUpdate = false;
        groupColumnIds.forEach((groupColId) => {
          if (!colOrder.has(groupColId)) {
            shouldUpdate = true;
            currentColumnOrder = [
              groupColId,
              ...(currentColumnOrder as string[]),
            ];
          }
        });
        if (shouldUpdate) {
          componentActions.columnOrder = currentColumnOrder;
        }
      }
    };

    update();

    return interceptMap(columns, {
      set: update,
      delete: update,
      clear: update,
    });
  }, [
    columns,
    groupBy,
    pivotBy,
    selectionMode,
    hideColumnWhenGrouped,
    groupColumn,
    groupRenderStrategy,
    pivotColumns,
    pivotTotalColumnPosition,
    pivotColumn,
  ]);

  return { toggleGroupRow };
}

function useHideColumns<T>(groupByMap: GroupByMap<T>) {
  const {
    componentState: {
      dataArray,
      groupRowsIndexesInDataArray: groupRowsIndexesInDataArray,
      groupBy,
      groupRowsState,
      originalLazyGroupDataChangeDetect,
    },
    getState: getDataSourceState,
  } = useDataSourceContextValue<T>();

  const {
    getComponentState,
    componentActions,
    componentState: {
      columnTypes,
      computedColumns,

      hideColumnWhenGrouped,
      hideEmptyGroupColumns,

      groupRenderStrategy,
    },
  } = useComponentState<InfiniteTableState<T>>();

  // implements hideEmptyGroupColumns
  useLayoutEffect(() => {
    if (groupRenderStrategy !== 'multi-column') {
      return;
    }
    const currentState = getComponentState();

    const computedGroupColumns = getGroupColumnsMapForComputedColumns(
      computedColumns,
      groupByMap,
    );

    const newColumnVisibility = getColumnVisibilityForHideEmptyGroupColumns({
      computedGroupColumns,
      columnVisibility: currentState.columnVisibility,
      hideEmptyGroupColumns,
      groupRowsIndexesInDataArray,
      dataArray,
      groupBy,
      groupByMap,
    });

    if (
      !shallowEqualObjects(currentState.columnVisibility, newColumnVisibility)
    ) {
      componentActions.columnVisibility = newColumnVisibility;
    }
  }, [
    getDataSourceState,
    groupRenderStrategy,
    originalLazyGroupDataChangeDetect,
    groupBy,
    groupByMap,
    computedColumns,

    hideEmptyGroupColumns ? dataArray : null,
    hideEmptyGroupColumns ? groupRowsState : null,
    hideEmptyGroupColumns ? groupRowsIndexesInDataArray : null,
    hideEmptyGroupColumns,
  ]);

  // implements the functionality of column.defaultHiddenWhenGrouped and hideColumnWhenGrouped
  useEffect(() => {
    const isGrouped = groupBy.length > 0;
    const currentState = getComponentState();

    const {
      columnVisibility,
      columnVisibilityForGrouping,
      hideColumnWhenGrouped,
    } = currentState;

    const newColumnVisibility = { ...columnVisibility };
    let newColumnVisibilityForGrouping = { ...columnVisibilityForGrouping };

    let updatedVisibilityWhenGrouping = false;

    let newlyHiddenColumns = new Set<string>();
    let newlyDisplayedColumns = new Set<string>();

    computedColumns.forEach((col, id) => {
      if (col.defaultHiddenWhenGroupedBy || hideColumnWhenGrouped != null) {
        const hideWhenGrouped =
          (col.defaultHiddenWhenGroupedBy === '*' && isGrouped) ||
          ((col.defaultHiddenWhenGroupedBy === true || hideColumnWhenGrouped) &&
            col.field &&
            groupByMap.get(col.field)) ||
          (typeof col.defaultHiddenWhenGroupedBy === 'string' &&
            groupByMap.get(col.defaultHiddenWhenGroupedBy as keyof T)) ||
          (typeof col.defaultHiddenWhenGroupedBy === 'object' &&
            Object.keys(col.defaultHiddenWhenGroupedBy).reduce(
              (acc: boolean, field) => acc || groupByMap.has(field as keyof T),
              false,
            ));

        if (hideWhenGrouped) {
          if (newColumnVisibilityForGrouping[id] !== false) {
            if (columnVisibility[id] === false) {
              // if the column is already specified as invisible,
              // dont put it in the list of cols made invisible due to grouping rules
              return;
            }
            // should be hidden and was not already
            newColumnVisibilityForGrouping[id] = false;
            updatedVisibilityWhenGrouping = true;
            newlyHiddenColumns.add(id);
          }
        } else {
          if (newColumnVisibilityForGrouping[id] === false) {
            //should be visible and was not already
            delete newColumnVisibilityForGrouping[id];
            updatedVisibilityWhenGrouping = true;
            newlyDisplayedColumns.add(id);
          }
        }
      }
    });

    if (updatedVisibilityWhenGrouping) {
      componentActions.columnVisibilityForGrouping =
        newColumnVisibilityForGrouping;

      newlyDisplayedColumns.forEach((colId) => {
        delete newColumnVisibility[colId];
      });

      newlyHiddenColumns.forEach((colId) => {
        newColumnVisibility[colId] = false;
      });

      componentActions.columnVisibility = newColumnVisibility;
    }
  }, [
    computedColumns,
    columnTypes,
    groupBy,
    groupByMap,
    hideColumnWhenGrouped,
  ]);
}

export function getColumnsWhenGrouping<T>(params: {
  columns: Map<string, InfiniteTableColumn<T>>;
  groupBy: DataSourceGroupBy<T>[];
  selectionMode: DataSourcePropSelectionMode;
  pivotBy?: DataSourcePivotBy<T>[];
  toggleGroupRow: (groupKeys: any[]) => void;
  pivotTotalColumnPosition: InfiniteTableState<T>['pivotTotalColumnPosition'];
  pivotGrandTotalColumnPosition: InfiniteTableState<T>['pivotGrandTotalColumnPosition'];
  groupColumn: InfiniteTableProps<T>['groupColumn'];
  groupRenderStrategy: InfiniteTablePropGroupRenderStrategy;
  pivotColumns: InfiniteTableProps<T>['pivotColumns'];
  pivotColumn: InfiniteTableProps<T>['pivotColumn'];
}): {
  columns: Map<string, InfiniteTableColumn<T>> | undefined;
  groupColumnIds: string[];
} {
  const {
    pivotColumns,
    groupBy,
    pivotBy,
    selectionMode,
    groupColumn,
    pivotTotalColumnPosition,
    pivotGrandTotalColumnPosition,
    pivotColumn,
    groupRenderStrategy,
    toggleGroupRow,
    columns,
  } = params;

  if (groupRenderStrategy === 'inline') {
    return { columns: undefined, groupColumnIds: [] };
  }

  const computedColumns = new Map<string, InfiniteTableColumn<T>>();

  const groupColumnIds: string[] = [];

  if (groupRenderStrategy === 'multi-column') {
    groupBy.forEach((groupByForColumn, groupIndexForColumn, arr) => {
      const generatedGroupColumn = getColumnForGroupBy<T>(
        {
          groupByForColumn,
          groupBy,
          pivotBy,
          groupIndexForColumn,
          groupCount: arr.length,
          groupRenderStrategy,
          selectionMode,
        },
        toggleGroupRow,
        groupColumn,
      );

      const groupColumnId =
        generatedGroupColumn.id ||
        `group-by-${groupByForColumn.field || groupByForColumn.groupField}`;

      groupColumnIds.push(groupColumnId);
      computedColumns.set(groupColumnId, generatedGroupColumn);
    });
  } else if (groupRenderStrategy === 'single-column' && groupBy.length) {
    // } else if (
    //   (groupRenderStrategy === 'single-column' ||
    //     groupRenderStrategy === 'single-column-extended') &&
    //   groupBy.length
    // ) {
    const singleGroupColumn = getSingleGroupColumn(
      {
        groupCount: groupBy.length,
        groupBy,
        pivotBy,
        groupRenderStrategy,
        selectionMode,
      },
      toggleGroupRow,
      groupColumn,
    );

    const groupColumnId = singleGroupColumn.id || 'group-by';
    groupColumnIds.push(groupColumnId);
    computedColumns.set(groupColumnId, singleGroupColumn);
  }

  if (pivotColumns) {
    const columnsByField: Partial<Record<keyof T, InfiniteTableColumn<T>>> = {};

    columns.forEach((col) => {
      if (col.field) {
        columnsByField[col.field] = col;
      }
    });

    pivotColumns.forEach((col, key) => {
      const isSimpleTotalColumn = col.pivotTotalColumn && col.columnGroup;
      const isGrandTotalColumn = col.pivotTotalColumn && !col.columnGroup;

      if (isSimpleTotalColumn && pivotTotalColumnPosition === false) {
        // don't include the total columns if specified as false
        return;
      }
      if (isGrandTotalColumn && pivotGrandTotalColumnPosition === false) {
        // don't include the grand total columns if specified as false
        return;
      }

      let column: InfiniteTablePivotColumn<T> = { ...col };

      // const isPivotRowLabelsColumn =
      //   !column.pivotColumn && !column.pivotTotalColumn;

      // if (!isPivotRowLabelsColumn) {
      if (pivotColumn) {
        if (typeof pivotColumn === 'function') {
          column = {
            ...column,
            ...pivotColumn({
              column: column as InfiniteTableComputedPivotFinalColumn<T>,
              pivotBy: pivotBy!,
              groupBy,
            }),
          } as InfiniteTablePivotColumn<T>;
        } else {
          column = {
            ...column,
            ...pivotColumn,
          } as InfiniteTablePivotColumn<T>;
        }
      }
      if (column.inheritFromColumn !== false) {
        const colToInheritFrom =
          typeof column.inheritFromColumn === 'string'
            ? columns.get(column.inheritFromColumn)
            : column.pivotAggregator?.field
            ? columnsByField[column.pivotAggregator?.field]
            : undefined;
        column = { ...colToInheritFrom, ...column };
      }

      if (!column.render && column.renderValue) {
        column.render = (renderOptions) => {
          return column.renderValue!(renderOptions);
        };
      }
      computedColumns.set(key, column);
    });
  } else {
    columns.forEach((col, colId) => {
      computedColumns.set(colId, col);
    });
  }

  return {
    columns: computedColumns.size ? computedColumns : undefined,
    groupColumnIds,
  };
}
