import { DataSourceState } from '../../DataSource';
import { InfiniteTableState } from '../types';
import {
  InfiniteTableColumn,
  InfiniteTableGeneratedGroupColumn,
} from '../types/InfiniteTableColumn';
import { GroupByMap } from '../types/InfiniteTableState';

export function getGroupColumnsForComputedColumns<T>(
  computedColumns: Record<string, InfiniteTableColumn<T>>,
  groupByMap: GroupByMap<T>,
) {
  const computedGroupColumns: Record<
    string,
    InfiniteTableGeneratedGroupColumn<T>
  > = {};
  Object.keys(computedColumns).forEach((colId: string) => {
    const column:
      | InfiniteTableColumn<T>
      | InfiniteTableGeneratedGroupColumn<T> = computedColumns[colId];
    // go over all columns (ignore columns which are not group columns - also the cols which are multi group columns)
    const col = column as InfiniteTableGeneratedGroupColumn<T>;
    if (!col.groupByForColumn || Array.isArray(col.groupByForColumn)) {
      return;
    }
    const { groupByForColumn } = col;
    const field = groupByForColumn.field || groupByForColumn.groupField;
    const groupInfoForColumn = field ? groupByMap.get(field) : null;
    if (!groupInfoForColumn) {
      return;
    }

    computedGroupColumns[colId] =
      column as InfiniteTableGeneratedGroupColumn<T>;
  });

  return computedGroupColumns;
}

export function getColumnVisibilityForHideEmptyGroupColumns<T>(params: {
  computedGroupColumns: Record<string, InfiniteTableGeneratedGroupColumn<T>>;
  columnVisibility: InfiniteTableState<T>['columnVisibility'];
  hideEmptyGroupColumns: boolean;
  groupRowsIndexesInDataArray: DataSourceState<T>['groupRowsIndexesInDataArray'];
  dataArray: DataSourceState<T>['dataArray'];
  groupBy: DataSourceState<T>['groupBy'];
  groupByMap: GroupByMap<T>;
}): InfiniteTableState<T>['columnVisibility'] {
  const {
    hideEmptyGroupColumns,

    groupByMap,
    computedGroupColumns,
    groupRowsIndexesInDataArray,
    dataArray,
    groupBy,
  } = params;

  const columnVisibility = { ...params.columnVisibility };
  if (!hideEmptyGroupColumns) {
    Object.keys(computedGroupColumns).forEach((colId: string) => {
      if (columnVisibility[colId] === false) {
        delete columnVisibility[colId];
      }
    });

    return columnVisibility;
  }

  if (!groupRowsIndexesInDataArray || !groupRowsIndexesInDataArray.length) {
    return columnVisibility;
  }

  const groupsLength = groupBy.length;

  let expandedGroupsLevel = 0;

  const len = groupRowsIndexesInDataArray.length;

  for (let i = 0; i < len; i++) {
    const groupRowIndex = groupRowsIndexesInDataArray[i];
    const rowInfo = dataArray[groupRowIndex];

    if (rowInfo.isTreeNode) {
      continue;
    }

    if (!rowInfo.isGroupRow) {
      continue;
    }
    expandedGroupsLevel = Math.max(
      expandedGroupsLevel,
      rowInfo.groupNesting! - 1,
    );
    if (expandedGroupsLevel === groupsLength - 1) {
      break;
    }
  }

  Object.keys(computedGroupColumns).forEach((colId: string) => {
    const column: InfiniteTableGeneratedGroupColumn<T> =
      computedGroupColumns[colId];
    const { groupByForColumn } = column as InfiniteTableGeneratedGroupColumn<T>;
    if (Array.isArray(groupByForColumn)) {
      return;
    }
    const field = groupByForColumn.field || groupByForColumn.groupField;
    if (!field) {
      return;
    }
    const groupInfoForColumn = groupByMap.get(field)!;
    const index = groupInfoForColumn.groupIndex;

    const shouldBeHidden = index > expandedGroupsLevel && hideEmptyGroupColumns;

    if (shouldBeHidden) {
      if (columnVisibility[colId] !== false) {
        columnVisibility[colId] = false;
      }
    } else {
      if (columnVisibility.hasOwnProperty(colId)) {
        delete columnVisibility[colId];
      }
    }
  });

  return columnVisibility;
}
