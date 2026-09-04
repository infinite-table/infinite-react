import defaultSortTypes from '../../../utils/multisort/sortTypes';
import type { InfiniteTableRowInfo } from '../../../utils/groupAndPivot';
import type { InfiniteTablePivotColumn } from '../../InfiniteTable/types/InfiniteTableColumn';
import type { DataSourcePropSortTypes, DataSourceSingleSortInfo } from '../types';

type PivotSort = {
  dir: 1 | -1;
  type?: string | string[];
  fn?: (first: any, second: any) => number;
  pivotGroupKeys: any[];
  reducerId: string | undefined;
  pivotTotalColumn: boolean;
};

function getRowNesting<T>(row: InfiniteTableRowInfo<T>): number {
  return 'groupNesting' in row ? (row.groupNesting ?? 0) : 0;
}

function getPivotCellValue<T>(
  row: InfiniteTableRowInfo<T>,
  sort: PivotSort,
) {
  if (!row.isGroupRow || !sort.reducerId) {
    return undefined;
  }

  if (
    sort.pivotTotalColumn &&
    (!sort.pivotGroupKeys || sort.pivotGroupKeys.length === 0)
  ) {
    return row.reducerResults?.[sort.reducerId];
  }

  return row.pivotValuesMap?.get(sort.pivotGroupKeys)?.reducerResults?.[
    sort.reducerId
  ];
}

function comparePivotValues(
  a: unknown,
  b: unknown,
  sort: PivotSort,
  sortTypes: DataSourcePropSortTypes,
): number {
  if (a == null && b == null) {
    return 0;
  }
  // missing pivot buckets stay last in both directions
  if (a == null) {
    return 1;
  }
  if (b == null) {
    return -1;
  }

  const type = Array.isArray(sort.type) ? sort.type[0] : sort.type;
  const fn =
    sort.fn || (type && sortTypes[type]) || sortTypes.string || defaultSortTypes.string;
  const result = fn(a, b);
  return result === 0 ? 0 : sort.dir * result;
}

function toPivotSorts<T>(
  sortInfo: DataSourceSingleSortInfo<T>[] | null,
  pivotColumns: Record<string, InfiniteTablePivotColumn<T>> | undefined,
): PivotSort[] {
  if (!sortInfo?.length || !pivotColumns) {
    return [];
  }

  const result: PivotSort[] = [];
  for (const info of sortInfo) {
    const col = info.id ? pivotColumns[info.id] : undefined;
    if (!col?.pivotColumn || !col.pivotAggregator) {
      continue;
    }
    result.push({
      dir: info.dir,
      type: info.type,
      fn: info.fn,
      pivotGroupKeys: col.pivotGroupKeys ?? [],
      reducerId: col.pivotAggregator.id,
      pivotTotalColumn: !!col.pivotTotalColumn,
    });
  }
  return result;
}

type TreeNode<T> = {
  row: InfiniteTableRowInfo<T>;
  children: TreeNode<T>[];
};

function buildTree<T>(rows: InfiniteTableRowInfo<T>[]): TreeNode<T>[] {
  const roots: TreeNode<T>[] = [];
  const stack: TreeNode<T>[] = [];

  for (const row of rows) {
    const node: TreeNode<T> = { row, children: [] };
    const nesting = getRowNesting(row);

    while (stack.length && getRowNesting(stack[stack.length - 1].row) >= nesting) {
      stack.pop();
    }

    if (!stack.length) {
      roots.push(node);
    } else {
      stack[stack.length - 1].children.push(node);
    }
    stack.push(node);
  }

  return roots;
}

function flattenSortedTree<T>(roots: TreeNode<T>[]): InfiniteTableRowInfo<T>[] {
  const result: InfiniteTableRowInfo<T>[] = [];

  const walk = (nodes: TreeNode<T>[], parentIndexes: number[]) => {
    nodes.forEach((node, indexInGroup) => {
      const indexInParentGroups = [...parentIndexes, indexInGroup];
      const row = node.row as InfiniteTableRowInfo<T> & {
        indexInGroup: number;
        indexInParentGroups: number[];
        indexInAll: number;
      };
      row.indexInGroup = indexInGroup;
      row.indexInParentGroups = indexInParentGroups;
      row.indexInAll = result.length;
      result.push(row);
      walk(node.children, indexInParentGroups);
    });
  };

  walk(roots, []);
  return result;
}

/**
 * Reorders grouped (and nested) row infos by pivot-column sort infos.
 *
 * Pivot columns display aggregated values on group rows. Sorting the raw
 * dataset by the inherited aggregator field would also shuffle first-seen
 * pivot keys (and therefore generated column order).
 */
export function sortGroupedRowInfosByPivotColumns<T>(
  dataArray: InfiniteTableRowInfo<T>[],
  sortInfo: DataSourceSingleSortInfo<T>[] | null,
  pivotColumns: Record<string, InfiniteTablePivotColumn<T>> | undefined,
  sortTypes?: DataSourcePropSortTypes,
): InfiniteTableRowInfo<T>[] {
  const pivotSorts = toPivotSorts(sortInfo, pivotColumns);
  if (!pivotSorts.length || !dataArray.length) {
    return dataArray;
  }

  const knownSortTypes = { ...defaultSortTypes, ...sortTypes };
  const roots = buildTree(dataArray);

  const compareNodes = (a: TreeNode<T>, b: TreeNode<T>) => {
    for (const sort of pivotSorts) {
      const result = comparePivotValues(
        getPivotCellValue(a.row, sort),
        getPivotCellValue(b.row, sort),
        sort,
        knownSortTypes,
      );
      if (result !== 0) {
        return result;
      }
    }
    return 0;
  };

  const sortTree = (nodes: TreeNode<T>[]) => {
    nodes.sort(compareNodes);
    for (const node of nodes) {
      sortTree(node.children);
    }
  };

  sortTree(roots);
  return flattenSortedTree(roots);
}
