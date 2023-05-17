import { err } from '../../../utils/debug';
import { DataSourceProps } from '../../DataSource';
import { defaultFilterTypes } from '../../DataSource/defaultFilterTypes';
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
  InfiniteTableGeneratedGroupColumn,
  RequireAtLeastOne,
} from '../types/InfiniteTableColumn';
import type {
  InfiniteTableColumnPinnedValues,
  InfiniteTableColumnSizingOptions,
  InfiniteTablePropColumnOrder,
  InfiniteTablePropColumnOrderNormalized,
  InfiniteTablePropColumnPinning,
  InfiniteTablePropColumnSizing,
  InfiniteTablePropColumnTypes,
  InfiniteTablePropColumnVisibility,
  InfiniteTableProps,
  InfiniteTablePropsEditable,
} from '../types/InfiniteTableProps';

import { adjustColumnOrderForPinning } from './adjustColumnOrderForPinning';
import { assignNonNull } from './assignFiltered';
import { getColumnComputedType } from './getColumnComputedType';

const logError = err('getComputedVisibleColumns');

export type SortInfoMap<T> = {
  [key: string]: {
    sortInfo: DataSourceSingleSortInfo<T>;
    index: number;
  };
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
  columnPinning: InfiniteTablePropColumnPinning,
): InfiniteTableColumnPinnedValues => {
  if (!columnPinning) {
    return false;
  }
  const pinned = columnPinning[colId];
  const computedPinned: InfiniteTableColumnPinnedValues =
    pinned === 'start' || pinned === true
      ? 'start'
      : pinned === 'end'
      ? 'end'
      : false;

  return computedPinned;
};

export type GetComputedVisibleColumnsResult<T> = {
  renderSelectionCheckBox: boolean;
  computedRemainingSpace: number;
  computedPinnedStartColumnsWidth: number;
  computedPinnedStartWidth: number;
  computedPinnedEndColumnsWidth: number;
  computedPinnedEndWidth: number;
  computedUnpinnedColumnsWidth: number;

  computedColumnsMap: Map<string, InfiniteTableComputedColumn<T>>;
  computedColumnsMapInInitialOrder: Map<string, InfiniteTableComputedColumn<T>>;

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
  fieldsToColumn: Map<keyof T, InfiniteTableComputedColumn<T>>;
};

type GetComputedVisibleColumnsParam<T> = {
  columns: Map<string, InfiniteTableColumn<T>>;

  bodySize: Size;
  columnMinWidth?: number;
  columnMaxWidth?: number;
  pinnedStartMaxWidth?: number;
  pinnedEndMaxWidth?: number;
  columnDefaultWidth?: number;
  columnDefaultFlex?: number;
  viewportReservedWidth?: number;
  resizableColumns: boolean | undefined;

  columnCssEllipsis: boolean;
  columnHeaderCssEllipsis: boolean;

  scrollbarWidth: number | undefined;

  filterValue?: DataSourcePropFilterValue<T>;
  filterTypes?: DataSourceProps<T>['filterTypes'];

  sortable?: boolean;
  multiSort: boolean;
  sortInfo?: DataSourceSingleSortInfo<T>[];
  setSortInfo: (sortInfo: DataSourceSingleSortInfo<T>[]) => void;

  draggableColumns?: boolean;
  columnOrder: InfiniteTablePropColumnOrder;
  columnPinning: InfiniteTablePropColumnPinning;
  editable: InfiniteTablePropsEditable<T>;
  columnDefaultEditable: InfiniteTableProps<T>['columnDefaultEditable'];
  columnDefaultFilterable: InfiniteTableProps<T>['columnDefaultFilterable'];
  columnSizing: InfiniteTablePropColumnSizing;
  columnTypes: InfiniteTablePropColumnTypes<T>;
  columnVisibility: InfiniteTablePropColumnVisibility;
  columnVisibilityAssumeVisible: boolean;
};

function isGroupColumnSortable<T>(
  column: InfiniteTableComputedColumn<T>,
  columns: Map<string, InfiniteTableComputedColumn<T>>,
) {
  let sortableColumnOrType = column.sortable ?? column.colType.sortable;

  if (sortableColumnOrType != null) {
    return sortableColumnOrType;
  }

  if (column.computedSortable === false) {
    return false;
  }

  let groupByField = column.groupByField || [];
  if (groupByField != null && !Array.isArray(groupByField)) {
    groupByField = [groupByField];
  }
  const fields = (groupByField || []).reduce((acc, field: string) => {
    acc[field] = true;
    return acc;
  }, {} as Record<string, boolean>);

  const groupColumns: InfiniteTableComputedColumn<T>[] = [];
  columns.forEach((col) => {
    if (col.field && fields[col.field as string]) {
      groupColumns.push(col);
    }
  });

  return groupColumns.reduce((sortable, col) => {
    return sortable && col.computedSortable === true;
  }, true as boolean);
}

export const getComputedVisibleColumns = <T extends unknown>({
  columns,

  bodySize,
  columnMinWidth,
  columnMaxWidth,
  columnDefaultWidth,
  columnDefaultFlex,
  scrollbarWidth,
  columnCssEllipsis,
  columnHeaderCssEllipsis,
  pinnedStartMaxWidth,
  pinnedEndMaxWidth,
  filterValue,
  sortable,
  sortInfo,
  setSortInfo,
  multiSort,
  filterTypes = defaultFilterTypes,

  viewportReservedWidth,
  resizableColumns,

  draggableColumns,
  columnOrder,
  columnPinning,
  editable,
  columnDefaultEditable,
  columnDefaultFilterable,
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

  const columnIdsToVisibleIndex: Map<string, number> = new Map();

  const visibleColumnsArray: InfiniteTableColumn<T>[] = visibleColumnOrder.map(
    (columnId, index) => {
      const col = columns.get(columnId)!;

      columnIdsToVisibleIndex.set(columnId, index);

      return col;
    },
  );

  const sortedMap = (sortInfo ?? []).reduce(
    (acc: SortInfoMap<T>, info: DataSourceSingleSortInfo<T>, index) => {
      if (info.id) {
        acc[info.id] = { sortInfo: info, index };
      } else if (info.field) {
        acc[info.field as unknown as keyof SortInfoMap<T>] = {
          sortInfo: info,
          index,
        };
      }
      return acc;
    },
    {} as SortInfoMap<T>,
  );

  type ColSizeOptions = {
    flex?: number;
    size?: number;
    minSize?: number;
    maxSize?: number;
  };

  function getColSize(
    colId: string,
  ): RequireAtLeastOne<ColSizeOptions, 'flex' | 'size'> {
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

    let colFlex: number | undefined = colSizing.flex ?? undefined;
    const colMinWidth =
      colSizing.minWidth ?? column?.minWidth ?? columnMinWidth;
    const colMaxWidth =
      colSizing.maxWidth ?? column?.maxWidth ?? columnMaxWidth;

    let size =
      colFlex != undefined
        ? undefined
        : colSizing.width ??
          (columnDefaultFlex ? undefined : columnDefaultWidth);

    if (!size && colFlex == undefined) {
      if (columnDefaultFlex) {
        colFlex = columnDefaultFlex;
      } else {
        size = colMinWidth;
      }
    }

    return {
      size,
      flex: colFlex!,
      minSize: colMinWidth,
      maxSize: colMaxWidth,
    };
  }

  const flexResult = computeFlex({
    availableSize: Math.max(
      bodySize.width -
        (viewportReservedWidth ?? 0) -
        // see #scrollbarverticaltag
        (scrollbarWidth ?? getScrollbarWidth()),
      0,
    ),

    maxSize: columnMaxWidth,
    minSize: columnMinWidth,
    items: visibleColumnOrder.map(getColSize),
  });

  const { computedSizes, flexSizes, minSizes, maxSizes } = flexResult;

  const computedPinnedStartColumns: InfiniteTableComputedColumn<T>[] = [];
  const computedPinnedEndColumns: InfiniteTableComputedColumn<T>[] = [];
  const computedUnpinnedColumns: InfiniteTableComputedColumn<T>[] = [];

  const computedVisibleColumns: InfiniteTableComputedColumn<T>[] = [];
  computedVisibleColumns.length = visibleColumnOrder.length;

  const computedVisibleColumnsMap: Map<
    string,
    InfiniteTableComputedColumn<T>
  > = new Map();

  const computedColumnsMap: Map<
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

  visibleColumnsArray.forEach((_c, i) => {
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

  const groupColumns: InfiniteTableComputedColumn<T>[] = [];

  const orderedColumns: Map<string, InfiniteTableColumn<T>> = new Map();
  visibleColumnOrder.forEach((id, index) => {
    const c = visibleColumnsArray[index];
    orderedColumns.set(id, c);
  });

  const columnIdsInitialColumnOrder: string[] = [];

  columns.forEach((c, key) => {
    columnIdsInitialColumnOrder.push(key);
    if (!orderedColumns.has(key)) {
      orderedColumns.set(key, c);
    }
  });

  const fieldsToColumn: Map<
    keyof T,
    InfiniteTableComputedColumn<T>
  > = new Map();

  // we need to loop over this in the visibility order
  // as we calculate computedOffset based on previous item
  // and also have a  reference
  orderedColumns.forEach((c, id) => {
    let theComputedVisibleIndex = columnIdsToVisibleIndex.get(id);

    if (theComputedVisibleIndex == undefined) {
      theComputedVisibleIndex = -1;
    }
    const computedVisible = theComputedVisibleIndex != -1;

    const nextColumnId = visibleColumnOrder[theComputedVisibleIndex + 1];

    const colType = getColumnComputedType(c, columnTypes);

    const computedVisibleIndex = theComputedVisibleIndex;

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

    const colSizeForNonVisibleColumn: ColSizeOptions = computedVisible
      ? {}
      : getColSize(id);

    const computedWidth = computedVisible
      ? computedSizes[theComputedVisibleIndex]
      : colSizeForNonVisibleColumn.size || 0;
    const computedFlex = computedVisible
      ? flexSizes[theComputedVisibleIndex] || null
      : null;

    const computedMinWidth = computedVisible
      ? minSizes[theComputedVisibleIndex] || 0
      : colSizeForNonVisibleColumn.minSize || 0;

    const computedMaxWidth = computedVisible
      ? maxSizes[theComputedVisibleIndex] || 10_000
      : colSizeForNonVisibleColumn.maxSize || 10_000;

    // const computedComp;

    // const pinned = columnPinning.get(id);
    const computedPinned = computedVisible
      ? getComputedPinned(id, columnPinning)
      : false;

    const computedLast = computedVisible
      ? theComputedVisibleIndex === visibleColumnOrder.length - 1
      : false;
    let computedVisibleIndexInCategory = computedVisibleIndex;
    const computedPinningOffset = computedVisible
      ? computedPinned === 'start'
        ? computedPinnedStartColumnsWidth
        : computedPinned === 'end'
        ? computedPinnedEndColumnsWidth
        : computedOffset - computedPinnedStartColumnsWidth
      : 0;

    if (computedPinned == 'start') {
      computedVisibleIndexInCategory = computedVisible
        ? computedVisibleIndex
        : -1;
    } else if (computedPinned === 'end') {
      computedVisibleIndexInCategory = computedVisible
        ? computedVisibleIndex -
          (computedPinnedStartColumns.length + computedUnpinnedColumns.length)
        : -1;
    } else {
      computedVisibleIndexInCategory = computedVisible
        ? computedVisibleIndex - computedPinnedStartColumns.length
        : -1;
    }

    const computedAbsoluteOffset = computedVisible
      ? computedPinned === 'start' || computedPinned === false
        ? computedOffset
        : firstPinnedEndAbsoluteOffset + computedPinnedEndColumnsWidth
      : -1;

    const computedFirstInCategory = computedVisible
      ? computedPinned !== prevPinned
      : false;
    const computedLastInCategory = computedVisible
      ? computedLast ||
        computedPinned !== getComputedPinned(nextColumnId, columnPinning)
      : false;

    const cssEllipsis =
      c.cssEllipsis ?? colType.cssEllipsis ?? columnCssEllipsis;

    const headerCssEllipsis =
      c.headerCssEllipsis ??
      colType.cssEllipsis ??
      c.cssEllipsis ??
      colType.headerCssEllipsis ??
      columnHeaderCssEllipsis ??
      cssEllipsis;

    const computedFilterValue = computedVisible
      ? filterValueRecord[id] ||
        c.field ||
        (c as InfiniteTableComputedColumn<T>).groupByField
        ? filterValueRecord[id] ||
          filterValueRecord[
            (c.field ||
              (c as InfiniteTableComputedColumn<T>).groupByField) as string
          ] ||
          null
        : null
      : null;
    const computedFilterable =
      c.defaultFilterable ??
      colType.defaultFilterable ??
      columnDefaultFilterable ??
      true;

    const computedEditable =
      editable ??
      c.defaultEditable ??
      colType.defaultEditable ??
      columnDefaultEditable ??
      false;

    const computedDataType =
      c.dataType ||
      colType.dataType ||
      (Array.isArray(c.type) ? c.type[0] : c.type) ||
      'string';

    const computedSortType = c.sortType || colType.sortType || computedDataType;
    const computedFilterType =
      c.filterType || colType.filterType || computedDataType;

    let computedFiltered = false;

    if (computedFilterValue != null && !computedFilterValue.disabled) {
      const foundFilterType = filterTypes[computedFilterType];

      if (
        foundFilterType &&
        (!foundFilterType.emptyValues ||
          !foundFilterType.emptyValues.includes(
            computedFilterValue.filter.value,
          ))
      ) {
        computedFiltered = true;
      }
    }

    const field = c.field ?? colType.field;
    const valueGetter = c.valueGetter ?? colType.valueGetter;

    let sortableColumnOrType = c.sortable ?? colType.sortable;

    if (
      sortableColumnOrType == null &&
      !(c as InfiniteTableGeneratedGroupColumn<T>).groupByField
    ) {
      //not explicitly set, so if no field or valueGetter defined, we'll make this unsortable
      if (field == null && valueGetter == null) {
        sortableColumnOrType = false;
      }
    }

    let computedSortable = sortableColumnOrType ?? sortable ?? true;

    const result: InfiniteTableComputedColumn<T> = {
      colType,
      align: colType.align,
      computedVisible,
      verticalAlign: colType.verticalAlign,
      defaultHiddenWhenGroupedBy: colType.defaultHiddenWhenGroupedBy,
      valueGetter,
      valueFormatter: colType.valueFormatter,
      renderValue: colType.renderValue,
      render: colType.render,
      style: colType.style,
      contentFocusable: colType.contentFocusable,

      renderMenuIcon: colType.renderMenuIcon,
      renderSortIcon: colType.renderSortIcon,
      renderSelectionCheckBox: colType.renderSelectionCheckBox,
      renderHeaderSelectionCheckBox: colType.renderHeaderSelectionCheckBox,
      headerStyle: colType.headerStyle,
      headerClassName: colType.headerClassName,

      columnGroup: colType.columnGroup,
      getValueToEdit: colType.getValueToEdit,
      getValueToPersist: colType.getValueToPersist,
      shouldAcceptEdit: colType.shouldAcceptEdit,
      field,
      ...c,
      components: {
        ...colType.components,
        ...c.components,
      },
      computedResizable:
        c.resizable ?? colType.resizable ?? resizableColumns ?? true,
      computedMinWidth,
      computedMaxWidth,
      computedFlex,
      computedDataType,
      computedEditable,
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
      computedVisibleIndexInCategory,
      computedOffset,
      computedSortable,
      computedSortInfo,
      computedSortIndex,
      computedMultiSort: multiSort,
      computedSorted,
      computedSortedAsc,
      computedSortedDesc,
      computedVisibleIndex,
      computedPinned,
      computedDraggable: c.draggable ?? draggableColumns ?? true,
      computedFirstInCategory,
      computedLastInCategory,
      computedFirst: theComputedVisibleIndex === 0,
      computedLast,
      toggleSort: () => {
        const currentSortInfo = computedSortInfo;
        let newColumnSortInfo: DataSourceSingleSortInfo<T> | null;

        const field = (result.groupByField ? result.groupByField : c.field) as
          | keyof T
          | (keyof T)[];
        if (!currentSortInfo) {
          newColumnSortInfo = {
            dir: 1,
            id,
            field,
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

        if (field && newColumnSortInfo && !newColumnSortInfo.field) {
          newColumnSortInfo.field = field;
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

    if (computedVisible) {
      computedOffset += computedWidth;
      computedVisibleColumnsMap.set(result.id, result);
      computedVisibleColumns[theComputedVisibleIndex] = result;

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
    }
    if (result.groupByField) {
      groupColumns.push(result);
    }
    computedColumnsMap.set(result.id, result);

    if (
      result.field &&
      // for now, do not include group columns
      !result.groupByField &&
      !fieldsToColumn.has(result.field)
    ) {
      fieldsToColumn.set(result.field, result);
    }
  });

  groupColumns.forEach((col) => {
    col.computedSortable = isGroupColumnSortable(col, computedColumnsMap);
  });

  const computedColumnsMapInInitialOrder = new Map<
    string,
    InfiniteTableComputedColumn<T>
  >();
  columnIdsInitialColumnOrder.forEach((id) => {
    const col = computedColumnsMap.get(id);
    if (col) {
      computedColumnsMapInInitialOrder.set(id, col);
    }
  });

  computedColumnsMap.forEach((col) => {
    if (!computedColumnsMapInInitialOrder.has(col.id)) {
      computedColumnsMapInInitialOrder.set(col.id, col);
    }
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

    computedColumnsMap,
    computedColumnsMapInInitialOrder,
    computedVisibleColumnsMap,
    computedPinnedEndWidth,
    computedPinnedStartWidth,
    renderSelectionCheckBox: computedVisibleColumns.reduce(
      (bool: boolean, c: InfiniteTableComputedColumn<T>) => {
        return bool || !!c.renderSelectionCheckBox;
      },
      false,
    ),
    fieldsToColumn,
  };

  return result;
};
