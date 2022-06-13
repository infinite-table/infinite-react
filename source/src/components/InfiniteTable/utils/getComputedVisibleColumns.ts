import { err } from '../../../utils/debug';
import type {
  DataSourceFilterValueItem,
  DataSourcePropFilterValue,
  DataSourceSingleSortInfo,
} from '../../DataSource/types';
import { computeFlex } from '../../flexbox';
import type { Size } from '../../types/Size';
import { getScrollbarWidth } from '../../utils/getScrollbarWidth';
import type {
  InfiniteTableColumn,
  InfiniteTableComputedColumn,
} from '../types/InfiniteTableColumn';
import type {
  InfiniteTableColumnPinnedValues,
  InfiniteTableColumnSizingOptions,
  InfiniteTablePropColumnOrder,
  InfiniteTablePropColumnOrderNormalized,
  InfiniteTablePropColumnPinningMap,
  InfiniteTablePropColumnSizing,
  InfiniteTablePropColumnTypes,
  InfiniteTablePropColumnVisibility,
} from '../types/InfiniteTableProps';

import { adjustColumnOrderForPinning } from './adjustColumnOrderForPinning';
import { assignNonNull } from './assignFiltered';
import { getColumnComputedType } from './getColumnComputedType';

const logError = err('getComputedVisibleColumns');

export type SortInfoMap<T> = {
  [key: string]: { sortInfo: DataSourceSingleSortInfo<T>; index: number };
};

const isColumnVisible = (
  columnVisibility: InfiniteTablePropColumnVisibility,
  _columnVisibilityAssumeVisible: boolean,

  colId: string,
) => {
  // if (_columnVisibilityAssumeVisible) {
  return columnVisibility[colId] !== false;
  // }

  // return columnVisibility.get(colId) === true;
};

const getComputedPinned = (
  colId: string,
  columnPinning: InfiniteTablePropColumnPinningMap,
): InfiniteTableColumnPinnedValues => {
  const pinned = columnPinning.get(colId);
  const computedPinned: InfiniteTableColumnPinnedValues =
    pinned === 'start' // || pinned === true
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
  viewportReservedWidth?: number;
  resizableColumns: boolean | undefined;

  columnCssEllipsis: boolean;
  columnHeaderCssEllipsis: boolean;

  filterValue?: DataSourcePropFilterValue<T>;

  sortable?: boolean;
  multiSort: boolean;
  sortInfo?: DataSourceSingleSortInfo<T>[];
  setSortInfo: (sortInfo: DataSourceSingleSortInfo<T>[]) => void;

  draggableColumns?: boolean;
  columnOrder: InfiniteTablePropColumnOrder;
  columnPinning: InfiniteTablePropColumnPinningMap;
  columnSizing: InfiniteTablePropColumnSizing;
  columnTypes: InfiniteTablePropColumnTypes<T>;
  columnVisibility: InfiniteTablePropColumnVisibility;
  columnVisibilityAssumeVisible: boolean;
};

export const getComputedVisibleColumns = <T extends unknown>({
  columns,

  bodySize,
  columnMinWidth,
  columnMaxWidth,
  columnDefaultWidth,
  columnCssEllipsis,
  columnHeaderCssEllipsis,
  pinnedStartMaxWidth,
  pinnedEndMaxWidth,
  filterValue,
  sortable,
  sortInfo,
  setSortInfo,
  multiSort,

  viewportReservedWidth,
  resizableColumns,

  draggableColumns,
  columnOrder,
  columnPinning,
  columnSizing,
  columnTypes,
  columnVisibility,
  columnVisibilityAssumeVisible,
}: GetComputedVisibleColumnsParam<T>): GetComputedVisibleColumnsResult<T> => {
  let computedOffset = 0;

  const filterValueRecord = (filterValue || []).reduce(
    (acc, filterValueItem) => {
      const { id, field } = filterValueItem;

      if (field) {
        acc[field as string] = filterValueItem;
      }
      if (id) {
        acc[id] = filterValueItem;
      }
      return acc;
    },
    {} as Record<string, DataSourceFilterValueItem<T>>,
  );

  const normalizedColumnOrder = adjustColumnOrderForPinning(
    columnOrder === true ? [...columns.keys()] : columnOrder,
    columnPinning,
  );

  const visibleColumnOrder = normalizedColumnOrder.filter((colId) => {
    const col = columns.get(colId);
    if (!col) {
      logError(
        `Column with id "${colId}" specified in columnOrder array cannot be found in the columns map.`,
      );
      return false;
    }

    const result = isColumnVisible(
      columnVisibility,
      columnVisibilityAssumeVisible,
      colId,
    );

    return result;
  });

  const columnsArray: InfiniteTableColumn<T>[] = visibleColumnOrder
    .map((columnId) => columns.get(columnId)!)
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
    availableSize: Math.max(
      bodySize.width - (viewportReservedWidth ?? 0) - getScrollbarWidth(),
      0,
    ),

    maxSize: columnMaxWidth,
    minSize: columnMinWidth,
    items: visibleColumnOrder.map((colId) => {
      const column = columns.get(colId);
      const colType = getColumnComputedType(column!, columnTypes);
      const colTypeSizing: InfiniteTableColumnSizingOptions = {
        minWidth: colType?.minWidth,
        maxWidth: colType?.maxWidth,
        width: colType?.defaultWidth,
        flex: colType?.defaultFlex,
      };
      let colSizing = assignNonNull(
        {
          width: column?.defaultWidth,
          flex: column?.defaultFlex,
          minWidth: column?.minWidth,
          maxWidth: column?.maxWidth,
        },
        columnSizing[colId],
      );

      // if colSizing has width
      if (colSizing.width != null) {
        // it should ignore coltype flex
        delete colTypeSizing.flex;
      }

      // or if it has flex
      if (colSizing.flex != null) {
        // it should ignore coltype width
        delete colTypeSizing.width;
      }

      colSizing = assignNonNull(colTypeSizing, colSizing);

      const colFlex: number | undefined = colSizing.flex ?? undefined;
      const colMinWidth =
        colSizing.minWidth ?? column?.minWidth ?? columnMinWidth;
      const colMaxWidth =
        colSizing.maxWidth ?? column?.maxWidth ?? columnMaxWidth;

      let size =
        colFlex != undefined
          ? undefined
          : colSizing.width ?? columnDefaultWidth;

      if (!size && colFlex == undefined) {
        size = colMinWidth;
      }

      return {
        size,
        flex: colFlex!,
        minSize: colMinWidth,
        maxSize: colMaxWidth,
      };
    }),
  });

  const { computedSizes, flexSizes, minSizes, maxSizes } = flexResult;

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
  let prevPinned: InfiniteTableColumnPinnedValues | null = null;

  const computedPinnedArray: InfiniteTableColumnPinnedValues[] = [];

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
    const colType = getColumnComputedType(c, columnTypes);

    // const comparer = c.comparer || colType?.comparer;

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
    const computedFlex = flexSizes[i] || null;
    const computedMinWidth = minSizes[i] || 0;
    const computedMaxWidth = maxSizes[i] || 10_000;

    // const computedComp;

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

    const cssEllipsis =
      c.cssEllipsis ?? colType.cssEllipsis ?? columnCssEllipsis;

    const headerCssEllipsis =
      c.headerCssEllipsis ??
      colType.cssEllipsis ??
      c.cssEllipsis ??
      colType.headerCssEllipsis ??
      columnHeaderCssEllipsis ??
      cssEllipsis;

    const computedFilterValue =
      filterValueRecord[id] || c.field
        ? filterValueRecord[c.field as string] || null
        : null;

    const computedFiltered = computedFilterValue != null;
    const computedFilterable =
      c.defaultFilterable ?? colType.defaultFilterable ?? true;

    const computedDataType =
      c.dataType ||
      colType.dataType ||
      (Array.isArray(c.type) ? c.type[0] : c.type) ||
      'string';
    const computedSortType = c.sortType || colType.sortType || computedDataType;
    const computedFilterType =
      c.filterType || colType.filterType || computedDataType;

    const field = c.field ?? colType.field;
    const valueGetter = c.valueGetter ?? colType.valueGetter;

    let sortableColumnOrType = c.sortable ?? colType.sortable;

    if (sortableColumnOrType == null) {
      //not explicitly set, so if no field or valueGetter defined, we'll make this unsortable
      if (field == null && valueGetter == null) {
        sortableColumnOrType = false;
      }
    }

    let computedSortable = sortableColumnOrType ?? sortable ?? true;

    const result: InfiniteTableComputedColumn<T> = {
      align: colType.align,
      verticalAlign: colType.verticalAlign,
      defaultHiddenWhenGroupedBy: colType.defaultHiddenWhenGroupedBy,
      valueGetter,
      valueFormatter: colType.valueFormatter,
      renderValue: colType.renderValue,
      render: colType.render,
      style: colType.style,
      components: colType.components,
      columnGroup: colType.columnGroup,
      field,
      ...c,
      computedResizable:
        c.resizable ?? colType.resizable ?? resizableColumns ?? true,
      computedMinWidth,
      computedMaxWidth,
      computedFlex,
      computedDataType,
      computedSortType,
      computedFilterType,
      cssEllipsis,
      headerCssEllipsis,
      computedFilterValue,
      computedFiltered,
      computedFilterable,
      computedWidth,
      computedAbsoluteOffset,
      computedPinningOffset,
      computedOffset,
      computedSortable,
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
      toggleSort: () => {
        const currentSortInfo = computedSortInfo;
        let newColumnSortInfo: DataSourceSingleSortInfo<T> | null;

        if (!currentSortInfo) {
          newColumnSortInfo = {
            dir: 1,
            id,
            field: c.field,
            type: computedSortType,
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
        if (
          c.valueGetter &&
          newColumnSortInfo &&
          !newColumnSortInfo.valueGetter
        ) {
          newColumnSortInfo.valueGetter = (data) =>
            c.valueGetter!({ data, field: c.field });
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
      },
      id: id as string,
      header: c.header ?? colType.header ?? c.name ?? c.field,
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
