import type {
  InfiniteTableColumn,
  InfiniteTableColumnPinned,
  InfiniteTableComputedColumn,
} from '../types/InfiniteTableColumn';
import type { Size } from '../../types/Size';
import type { DataSourceSingleSortInfo } from '../../DataSource/types';

import { computeFlex } from '../../flexbox';
import type {
  InfiniteTablePropColumnOrder,
  InfiniteTablePropColumnOrderNormalized,
  InfiniteTablePropColumnPinning,
  InfiniteTablePropColumnVisibility,
} from '../types/InfiniteTableProps';
import { adjustColumnOrderForPinning } from './adjustColumnOrderForPinning';
import { err } from '../../../utils/debug';

const error = err('getComputedVisibleColumns');

export type SortInfoMap<T> = {
  [key: string]: { sortInfo: DataSourceSingleSortInfo<T>; index: number };
};

export const IS_GROUP_COLUMN_ID = (columnId: string) => {
  return columnId.startsWith('group-by');
};

const isColumnVisible = (
  columnVisibility: InfiniteTablePropColumnVisibility,
  _columnVisibilityAssumeVisible: boolean,

  colId: string,
) => {
  // if (_columnVisibilityAssumeVisible) {
  return !columnVisibility.has(colId) || columnVisibility.get(colId) !== false;
  // }

  // return columnVisibility.get(colId) === true;
};

const getComputedPinned = (
  colId: string,
  columnPinning: InfiniteTablePropColumnPinning,
): InfiniteTableColumnPinned => {
  const pinned = columnPinning.get(colId);
  const computedPinned: InfiniteTableColumnPinned =
    pinned === 'start' || pinned === true
      ? 'start'
      : pinned === 'end'
      ? 'end'
      : false;

  return computedPinned;
};

export type GetComputedVisibleColumnsResult<T> = {
  computedRemainingSpace: number;
  computedPinnedStartColumnsWidth: number;
  computedPinnedStartWidth: number;
  computedPinnedEndColumnsWidth: number;
  computedPinnedEndWidth: number;
  computedUnpinnedColumnsWidth: number;

  columnMinWidth?: number;
  columnMaxWidth?: number;
  columnDefaultWidth?: number;

  computedPinnedStartColumns: InfiniteTableComputedColumn<T>[];
  computedPinnedEndColumns: InfiniteTableComputedColumn<T>[];
  computedUnpinnedColumns: InfiniteTableComputedColumn<T>[];

  computedColumnOrder: InfiniteTablePropColumnOrderNormalized;

  computedUnpinnedOffset: number;
  computedPinnedEndOffset: number;

  computedVisibleColumns: InfiniteTableComputedColumn<T>[];
  computedVisibleColumnsMap: Map<string, InfiniteTableComputedColumn<T>>;
};

type GetComputedVisibleColumnsParam<T> = {
  columns: Map<string, InfiniteTableColumn<T>>;

  bodySize: Size;
  columnMinWidth?: number;
  columnMaxWidth?: number;
  pinnedStartMaxWidth?: number;
  pinnedEndMaxWidth?: number;
  columnDefaultWidth?: number;

  sortable?: boolean;
  multiSort: boolean;
  sortInfo?: DataSourceSingleSortInfo<T>[];
  setSortInfo: (sortInfo: DataSourceSingleSortInfo<T>[]) => void;

  draggableColumns?: boolean;
  columnOrder: InfiniteTablePropColumnOrder;
  columnPinning: InfiniteTablePropColumnPinning;
  columnVisibility: InfiniteTablePropColumnVisibility;
  columnVisibilityAssumeVisible: boolean;
};

export const getComputedVisibleColumns = <T extends unknown>({
  columns,

  bodySize,
  columnMinWidth,
  columnMaxWidth,
  columnDefaultWidth,
  pinnedStartMaxWidth,
  pinnedEndMaxWidth,
  sortable,
  sortInfo,
  setSortInfo,
  multiSort,

  draggableColumns,
  columnOrder,
  columnPinning,
  columnVisibility,
  columnVisibilityAssumeVisible,
}: GetComputedVisibleColumnsParam<T>): GetComputedVisibleColumnsResult<T> => {
  let computedOffset = 0;

  const normalizedColumnOrder = adjustColumnOrderForPinning(
    columnOrder === true ? [...columns.keys()] : columnOrder,
    columnPinning,
  );

  const visibleColumnOrder = normalizedColumnOrder.filter(
    isColumnVisible.bind(null, columnVisibility, columnVisibilityAssumeVisible),
  );

  const columnsArray: InfiniteTableColumn<T>[] = visibleColumnOrder
    .map((columnId) => {
      let col = columns.get(columnId);
      if (!col) {
        //TODO find a better solution for group columns

        error(
          `Column with id "${columnId}" specified in columnOrder array cannot be found in the columns map.`,
        );
      }

      return col!;
    })
    .filter(Boolean);

  const sortedMap = (sortInfo ?? []).reduce(
    (acc: SortInfoMap<T>, info: DataSourceSingleSortInfo<T>, index) => {
      if (info.id) {
        acc[info.id] = { sortInfo: info, index };
      }
      if (info.field) {
        acc[info.field as unknown as keyof SortInfoMap<T>] = {
          sortInfo: info,
          index,
        };
      }
      return acc;
    },
    {} as SortInfoMap<T>,
  );

  const flexResult = computeFlex({
    availableSize: bodySize.width,
    maxSize: columnMaxWidth,
    minSize: columnMinWidth,
    items: columnsArray.map((col) => {
      let size = col.flex != null ? undefined : col.width ?? columnDefaultWidth;
      if (!size && col.flex == null) {
        size = col.minWidth ?? columnMinWidth;
      }
      return {
        size,
        flex: col.flex!,
        minSize: col.minWidth,
        maxSize: col.maxWidth,
      };
    }),
  });

  const { computedSizes } = flexResult;

  const computedPinnedStartColumns: InfiniteTableComputedColumn<T>[] = [];
  const computedPinnedEndColumns: InfiniteTableComputedColumn<T>[] = [];
  const computedUnpinnedColumns: InfiniteTableComputedColumn<T>[] = [];

  const computedVisibleColumns: InfiniteTableComputedColumn<T>[] = [];
  const computedVisibleColumnsMap: Map<
    string,
    InfiniteTableComputedColumn<T>
  > = new Map();

  let computedUnpinnedColumnsWidth = 0;
  let computedPinnedStartColumnsWidth = 0;
  let computedPinnedEndColumnsWidth = 0;
  let prevPinned: InfiniteTableColumnPinned | null = null;

  const computedPinnedArray: InfiniteTableColumnPinned[] = [];

  let totalPinnedStartWidth = 0;
  let totalUnpinnedWidth = 0;
  let totalPinnedEndWidth = 0;

  columnsArray.forEach((_c, i) => {
    const id = visibleColumnOrder[i];
    const computedWidth = computedSizes[i];

    const pinned = (computedPinnedArray[i] = getComputedPinned(
      id,
      columnPinning,
    ));
    if (pinned === 'start') {
      totalPinnedStartWidth += computedWidth;
    } else if (pinned === 'end') {
      totalPinnedEndWidth += computedWidth;
    } else {
      totalUnpinnedWidth += computedWidth;
    }
  });

  const firstPinnedEndAbsoluteOffset = bodySize.width - totalPinnedEndWidth;

  columnsArray.forEach((c, i) => {
    const id = visibleColumnOrder[i];
    const nextColumnId = visibleColumnOrder[i + 1];

    const sortingInfo = sortedMap[id as string]
      ? sortedMap[id as string]
      : c.field
      ? sortedMap[c.field as string] ?? null
      : null;

    const computedSortInfo = sortingInfo?.sortInfo ?? null;
    const computedSorted = !!computedSortInfo;
    const computedSortedAsc = computedSorted && computedSortInfo!.dir === 1;
    const computedSortedDesc = computedSorted && !computedSortedAsc;
    const computedSortIndex = sortingInfo?.index ?? -1;

    const computedWidth = computedSizes[i];

    const toggleSort = () => {
      let currentSortInfo = computedSortInfo;
      let newColumnSortInfo: DataSourceSingleSortInfo<T> | null;

      if (!currentSortInfo) {
        newColumnSortInfo = {
          dir: 1,
          id,
          field: c.field,
          type: c.type,
        } as DataSourceSingleSortInfo<T>;
      } else {
        if (computedSortedDesc) {
          newColumnSortInfo = null;
        } else {
          newColumnSortInfo = {
            ...computedSortInfo,
            dir: -1,
          };
        }
      }

      if (c.field && newColumnSortInfo && !newColumnSortInfo.field) {
        newColumnSortInfo.field = c.field;
      }

      let finalSortInfo = sortInfo ? [...sortInfo] : [];
      if (multiSort) {
        if (computedSortIndex === -1) {
          // it should be added to the end
          if (newColumnSortInfo) {
            finalSortInfo.push(newColumnSortInfo);
          }
        } else {
          // it's an existing sort - so should be updated
          finalSortInfo = finalSortInfo
            .map((info, index) => {
              if (index === computedSortIndex) {
                return newColumnSortInfo;
              }
              return info;
            })
            .filter((x) => x != null) as DataSourceSingleSortInfo<T>[];
        }
      } else {
        finalSortInfo = newColumnSortInfo ? [newColumnSortInfo] : [];
      }

      setSortInfo(finalSortInfo);
    };

    // const pinned = columnPinning.get(id);
    const computedPinned = getComputedPinned(id, columnPinning);

    const computedLast = i === visibleColumnOrder.length - 1;
    const computedPinningOffset =
      computedPinned === 'start'
        ? computedPinnedStartColumnsWidth
        : computedPinned === 'end'
        ? computedPinnedEndColumnsWidth
        : computedOffset - computedPinnedStartColumnsWidth;

    const computedAbsoluteOffset =
      computedPinned === 'start' || computedPinned === false
        ? computedOffset
        : firstPinnedEndAbsoluteOffset + computedPinnedEndColumnsWidth;

    const computedFirstInCategory = computedPinned !== prevPinned;
    const computedLastInCategory =
      computedLast ||
      computedPinned !== getComputedPinned(nextColumnId, columnPinning);

    const result: InfiniteTableComputedColumn<T> = {
      align: 'start' as 'start',
      verticalAlign: 'center' as 'center',
      ...c,
      computedWidth,
      computedAbsoluteOffset,
      computedPinningOffset,
      computedOffset,
      computedSortable: c.sortable ?? sortable ?? true,
      computedSortInfo,
      computedSortIndex,
      computedMultiSort: multiSort,
      computedSorted,
      computedSortedAsc,
      computedSortedDesc,
      computedVisibleIndex: i,
      computedPinned,
      computedDraggable: c.draggable ?? draggableColumns ?? true,
      computedFirstInCategory,
      computedLastInCategory,
      computedFirst: i === 0,
      computedLast,
      toggleSort,
      id: id as string,
      header: c.header ?? c.name ?? c.field,
    };

    computedOffset += computedWidth;

    computedVisibleColumnsMap.set(result.id, result);
    computedVisibleColumns.push(result);

    if (computedPinned === 'start') {
      computedPinnedStartColumns.push(result);
      computedPinnedStartColumnsWidth += result.computedWidth;
    }
    if (computedPinned === 'end') {
      computedPinnedEndColumns.push(result);
      computedPinnedEndColumnsWidth += result.computedWidth;
    }
    if (!computedPinned) {
      computedUnpinnedColumns.push(result);
      computedUnpinnedColumnsWidth += result.computedWidth;
    }

    prevPinned = computedPinned;
  });

  const computedPinnedStartWidth =
    pinnedStartMaxWidth != null
      ? Math.min(pinnedStartMaxWidth, computedPinnedStartColumnsWidth)
      : computedPinnedStartColumnsWidth;
  const computedPinnedEndWidth =
    pinnedEndMaxWidth != null
      ? Math.min(pinnedEndMaxWidth, computedPinnedEndColumnsWidth)
      : computedPinnedEndColumnsWidth;

  const result: GetComputedVisibleColumnsResult<T> = {
    computedRemainingSpace:
      bodySize.width -
      (totalPinnedStartWidth + totalPinnedEndWidth + totalUnpinnedWidth),
    computedPinnedStartColumnsWidth,
    computedPinnedEndColumnsWidth,
    computedUnpinnedColumnsWidth,
    computedColumnOrder: normalizedColumnOrder,
    computedPinnedStartColumns,
    computedPinnedEndColumns,
    computedUnpinnedOffset: computedPinnedStartColumnsWidth,
    computedPinnedEndOffset:
      computedPinnedStartColumnsWidth + computedUnpinnedColumnsWidth,
    computedUnpinnedColumns,
    computedVisibleColumns,
    computedVisibleColumnsMap,
    computedPinnedEndWidth,
    computedPinnedStartWidth,
  };

  return result;
};
