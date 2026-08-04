/**
 * Pure column-generation logic used when grouping/pivoting is active.
 *
 * Moved out of hooks/useColumnsWhen.ts (which is React-specific) so the Vue
 * root can share it. The only framework-specific dependency is
 * ./getColumnForGroupBy which is resolved per framework via moduleSuffixes
 * (the .vue sibling renders group icons with Vue vnodes).
 */
import type {
  DataSourceGroupBy,
  DataSourcePivotBy,
  DataSourcePropSelectionMode,
} from '../../DataSource';

import type {
  InfiniteTableComputedPivotFinalColumn,
  InfiniteTablePivotColumn,
} from '../types/InfiniteTableColumn';
import type { InfiniteTableColumn } from '../types/InfiniteTableColumn';
import type {
  InfiniteTablePropGroupRenderStrategy,
  InfiniteTableProps,
} from '../types/InfiniteTableProps';
import type { InfiniteTableState } from '../types/InfiniteTableState';

import {
  getColumnForGroupBy,
  getSingleGroupColumn,
} from './getColumnForGroupBy';

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
