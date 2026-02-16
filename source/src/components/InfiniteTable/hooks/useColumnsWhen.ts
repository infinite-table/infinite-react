import { useEffect, useLayoutEffect, useMemo } from 'react';

import type {
  InfiniteTableColumn,
  InfiniteTableRowInfo,
  InfiniteTableState,
} from '..';
import { shallowEqualObjects } from '../../../utils/shallowEqualObjects';
import {
  DataSourceState,
  useDataSourceSelector,
  type DataSourceGroupBy,
  type DataSourcePivotBy,
  type DataSourcePropGroupBy,
  type DataSourcePropSelectionMode,
} from '../../DataSource';
import { useManagedComponentState } from '../../hooks/useComponentState';
import { getGroupByMap } from '../state/getInitialState';
import {
  getColumnVisibilityForHideEmptyGroupColumns,
  getGroupColumnsForComputedColumns,
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
import { GroupByMap, InfiniteTableActions } from '../types/InfiniteTableState';
import {
  getColumnForGroupBy,
  getGroupColumnRender,
  getGroupColumnRenderGroupIcon,
  getSingleGroupColumn,
} from '../utils/getColumnForGroupBy';

import { ToggleGroupRowFn, useToggleGroupRow } from './useToggleGroupRow';
import { useLatest } from '../../hooks/useLatest';

function useGroupByMap<T>(groupBy: DataSourcePropGroupBy<T>) {
  return useMemo(() => getGroupByMap(groupBy), [groupBy]);
}

export function useColumnsWhen<T>(
  state: InfiniteTableState<T>,
  actions: InfiniteTableActions<T>,
) {
  const { groupBy, dataSourceActions } = useDataSourceSelector((ctx) => {
    return {
      groupBy: ctx.dataSourceState.groupBy as DataSourceGroupBy<T>[],
      dataSourceActions: ctx.dataSourceActions,
    };
  });

  const {
    groupRenderStrategy,
    pivotTotalColumnPosition,
    pivotGrandTotalColumnPosition,
  } = state;

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

  useColumnsWhenInlineGroupRenderStrategy<T>(groupByMap, state, actions);
  const { toggleGroupRow } = useColumnsWhenGrouping<T>();

  useHideColumns<T>(groupByMap, state, actions);

  return { toggleGroupRow };
}

function useColumnsWhenInlineGroupRenderStrategy<T>(
  groupByMap: GroupByMap<T>,
  state: InfiniteTableState<T>,
  actions: InfiniteTableActions<T>,
) {
  const toggleGroupRow = useToggleGroupRow();

  const { columns, groupRenderStrategy, isTree } = state;

  const componentActions = actions;

  function computeColumnsWhenInlineGroupRenderStrategy(
    columns: Record<string, InfiniteTableColumn<T>>,
    groupByMap: GroupByMap<T>,
    groupRenderStrategy: InfiniteTablePropGroupRenderStrategy,
    toggleGroupRow: ToggleGroupRowFn,
  ) {
    const computedColumns: Record<string, InfiniteTableColumn<T>> = {};

    if (groupRenderStrategy !== 'inline') {
      return;
    }

    Object.keys(columns).forEach((id) => {
      const column = columns[id];
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
            if (rowInfo.isTreeNode) {
              return 1;
            }
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

      computedColumns[id] = clone;
    });

    return Object.keys(computedColumns).length === 0
      ? undefined
      : computedColumns;
  }

  useEffect(() => {
    const update = () => {
      componentActions.columnsWhenInlineGroupRenderStrategy = isTree
        ? undefined
        : computeColumnsWhenInlineGroupRenderStrategy(
            columns,
            groupByMap,
            groupRenderStrategy,
            toggleGroupRow,
          );
    };

    update();
  }, [columns, groupByMap, groupRenderStrategy, toggleGroupRow]);
}

function useColumnsWhenGrouping<T>() {
  const { groupBy, pivotBy, selectionMode } = useDataSourceSelector((ctx) => {
    return {
      groupBy: ctx.dataSourceState.groupBy as DataSourceGroupBy<T>[],
      pivotBy: ctx.dataSourceState.pivotBy as DataSourcePivotBy<T>[],
      selectionMode: ctx.dataSourceState.selectionMode,
    };
  });

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
  } = useManagedComponentState<InfiniteTableState<T>>();

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

    // return interceptMap(columns, {
    //   set: update,
    //   delete: update,
    //   clear: update,
    // });
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

function useHideColumns<T>(
  groupByMap: GroupByMap<T>,
  state: InfiniteTableState<T>,
  actions: InfiniteTableActions<T>,
) {
  const {
    dataArray,
    groupRowsIndexesInDataArray,
    groupBy,
    groupRowsState,
    originalLazyGroupDataChangeDetect,
    getDataSourceState,
  } = useDataSourceSelector((ctx) => {
    return {
      getDataSourceState: ctx.getDataSourceState,
      dataArray: ctx.dataSourceState.dataArray as InfiniteTableRowInfo<T>[],
      groupRowsIndexesInDataArray:
        ctx.dataSourceState.groupRowsIndexesInDataArray,
      groupBy: ctx.dataSourceState.groupBy as DataSourceState<T>['groupBy'],
      groupRowsState: ctx.dataSourceState.groupRowsState,
      originalLazyGroupDataChangeDetect:
        ctx.dataSourceState.originalLazyGroupDataChangeDetect,
    };
  });

  const {
    columnTypes,
    computedColumns,

    hideColumnWhenGrouped,
    hideEmptyGroupColumns,

    groupRenderStrategy,
  } = state;

  const componentActions = actions;

  const getComponentState = useLatest(state);

  // implements hideEmptyGroupColumns
  useLayoutEffect(() => {
    if (groupRenderStrategy !== 'multi-column') {
      return;
    }
    const currentState = getComponentState();

    const computedGroupColumns = getGroupColumnsForComputedColumns(
      computedColumns,
      groupByMap,
    );

    const newColumnVisibility = getColumnVisibilityForHideEmptyGroupColumns<T>({
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

    Object.keys(computedColumns).forEach((id) => {
      const col = computedColumns[id];
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
  columns: Record<string, InfiniteTableColumn<T>>;
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
  columns: Record<string, InfiniteTableColumn<T>> | undefined;
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

  const computedColumns: Record<string, InfiniteTableColumn<T>> = {};

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
      computedColumns[groupColumnId] = generatedGroupColumn;
    });
  } else if (groupRenderStrategy === 'single-column' && groupBy.length) {
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
    computedColumns[groupColumnId] = singleGroupColumn;
  }

  if (pivotColumns) {
    const columnsByField: Partial<Record<keyof T, InfiniteTableColumn<T>>> = {};

    Object.keys(columns).forEach((colId) => {
      const col = columns[colId];
      if (col.field) {
        columnsByField[col.field] = col;
      }
    });

    Object.keys(pivotColumns).forEach((key) => {
      const col = pivotColumns[key];
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
            ? columns[column.inheritFromColumn]
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
      computedColumns[key] = column;
    });
  } else {
    Object.keys(columns).forEach((colId) => {
      const col = columns[colId];
      computedColumns[colId] = col;
    });
  }

  return {
    columns: Object.keys(computedColumns).length ? computedColumns : undefined,
    groupColumnIds,
  };
}
