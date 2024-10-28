import {
  InfiniteTableRowInfoDataDiscriminator,
  InfiniteTable_Tree_RowInfoBase,
} from '../../../../utils/groupAndPivot';
import { getColumnApiForColumn } from '../../api/getColumnApi';
import {
  InfiniteTableColumn,
  InfiniteTableColumnCellContextType,
  InfiniteTableComputedColumn,
  InfiniteTableContextValue,
  InfiniteTableRowInfo,
} from '../../types';
import {
  InfiniteTableColumnAlignValues,
  InfiniteTableColumnValueFormatterParams,
  InfiniteTableColumnVerticalAlignValues,
  InfiniteTableColumnWithField,
} from '../../types/InfiniteTableColumn';
import {
  InfiniteTablePropGroupRenderStrategy,
  InfiniteTableRowInfoDataDiscriminatorWithColumnAndApis,
} from '../../types/InfiniteTableProps';

import { InfiniteTableColumnRenderingContext } from './columnRenderingContextType';

function isColumnWithField<T>(
  c: InfiniteTableColumn<T>,
): c is InfiniteTableColumnWithField<T> & InfiniteTableColumn<T> {
  return typeof (c as InfiniteTableColumnWithField<T>).field === 'string';
}

export function getGroupByColumnReference<T>(options: {
  groupRenderStrategy: InfiniteTablePropGroupRenderStrategy;
  rowInfo: InfiniteTableRowInfo<T>;
  column: InfiniteTableComputedColumn<T>;
  fieldsToColumn: Map<keyof T, InfiniteTableComputedColumn<T>>;
}) {
  const { column, rowInfo, fieldsToColumn } = options;

  let groupByColumn: InfiniteTableComputedColumn<T> | undefined = undefined;
  if (column.groupByForColumn) {
    // for group rows, this logic retrieves the corresponding column
    // that's used as a base for styling.
    // eg: if we have groupBy: ['country', 'city']
    // and the current group row is for country
    // then the 'country' column will be returned
    // if the current group row is for city
    // then the 'city' column will be returned
    // NOTE: not sure this approach is the bestm to vary the returned column for each group row
    // but that's how it works for now

    if (rowInfo.isGroupRow) {
      const rowGroupBy = rowInfo.groupBy[rowInfo.groupBy.length - 1];

      groupByColumn = rowGroupBy
        ? fieldsToColumn.get(
            rowGroupBy.field || (rowGroupBy.groupField as keyof T),
          )
        : undefined;
    }

    // also, if we're rendering a normal row, but the group column is bound
    // to a field, then we return the other column that's bound to that field
    // if one exists
    if (!groupByColumn && column.field) {
      groupByColumn = fieldsToColumn.get(column.field);
    }
  }

  return groupByColumn;
}

export function getCellContext<T>(
  context: Omit<InfiniteTableContextValue<T>, 'state' | 'computed'> & {
    rowIndex: number;
    columnId: string;
  },
): InfiniteTableRowInfoDataDiscriminatorWithColumnAndApis<T> {
  const {
    getComputed,
    getDataSourceState,
    getState,
    rowIndex,
    columnId,
    api,
    dataSourceApi,
  } = context;
  const { dataArray } = getDataSourceState();

  const rowInfo = dataArray[rowIndex];
  const { isGroupRow, isTreeNode } = rowInfo;
  const column = getComputed().computedColumnsMap.get(columnId)!;

  const {
    activeRowIndex,
    keyboardNavigation,

    isRowDetailEnabled: isRowDetailsEnabled,
  } = getState();
  const rowActive = rowIndex === activeRowIndex && keyboardNavigation === 'row';

  const rowDetailState =
    !isRowDetailsEnabled ||
    (typeof isRowDetailsEnabled === 'function' && !isRowDetailsEnabled(rowInfo))
      ? false
      : api.rowDetailApi.isRowDetailExpanded(rowInfo.id)
      ? 'expanded'
      : 'collapsed';

  const {
    formattedValue: value,
    formattedValueContext: { rawValue },
  } = getFormattedValueContextForCell({
    column,
    rowInfo,
    rowDetailState,
    columnsMap: getComputed().computedColumnsMap,
    context,
  });

  const columnApi = getColumnApiForColumn(column.id, context)!;

  return isGroupRow
    ? {
        api,
        dataSourceApi,
        column,
        columnApi,
        isParentNode: false,
        isGroupRow: true,
        isTreeNode: false,
        rowDetailState: false,
        data: rowInfo.data,
        rowActive,
        rowInfo,
        rowSelected: rowInfo.rowSelected,
        value,
        rawValue,
      }
    : isTreeNode
    ? rowInfo.isParentNode
      ? {
          api,
          dataSourceApi,
          columnApi,
          column,
          nodeExpanded: rowInfo.nodeExpanded,
          isTreeNode: true,
          isGroupRow: false,
          isParentNode: true,
          rowDetailState: rowDetailState,
          data: rowInfo.data,
          rowActive,
          rowInfo,
          rowSelected: rowInfo.rowSelected,
          value,
          rawValue,
        }
      : {
          api,
          dataSourceApi,
          columnApi,
          column,
          nodeExpanded: false,
          isTreeNode: true,
          isGroupRow: false,
          isParentNode: false,
          rowDetailState: rowDetailState,
          data: rowInfo.data,
          rowActive,
          rowInfo,
          rowSelected: rowInfo.rowSelected,
          value,
          rawValue,
        }
    : {
        api,
        dataSourceApi,
        columnApi,
        column,
        isTreeNode: false,
        isParentNode: false,
        isGroupRow: false,
        rowDetailState: rowDetailState,
        data: rowInfo.data,
        rowActive,
        rowInfo,
        rowSelected: rowInfo.rowSelected,
        value,
        rawValue,
      };
}

export function getColumnValueToEdit<T>(options: {
  column: InfiniteTableComputedColumn<T>;
  rowInfo: InfiniteTableRowInfo<T>;
}) {
  return getRawValueForCell(options.column, options.rowInfo);
}

export function getColumnRenderingParams<T>(options: {
  column: InfiniteTableComputedColumn<T>;
  rowIndexInHorizontalLayoutPage: number | null;
  horizontalLayoutPageIndex: number | null;
  rowInfo: InfiniteTableRowInfo<T>;
  rowDetailState: 'expanded' | 'collapsed' | false;
  visibleColumnsIds: string[];
  columnsMap: Map<string, InfiniteTableComputedColumn<T>>;
  fieldsToColumn: Map<keyof T, InfiniteTableComputedColumn<T>>;
  context: InfiniteTableColumnRenderingContext<T>;
}) {
  const { column, context, rowInfo, visibleColumnsIds } = options;
  const groupByColumnReference = getGroupByColumnReference({
    rowInfo,
    column,
    fieldsToColumn: options.fieldsToColumn,
    groupRenderStrategy: context.getState().groupRenderStrategy,
  });

  const { getState } = context;
  const { editingCell } = getState();

  const formattedResult = getFormattedValueContextForCell(options);
  const { formattedValueContext } = formattedResult;

  const inEdit = context.api.isEditorVisibleForCell({
    columnId: column.id,
    rowIndex: rowInfo.indexInAll,
  });

  const stylingParam = Object.assign(
    {
      rowIndexInHorizontalLayoutPage: options.rowIndexInHorizontalLayoutPage,
      horizontalLayoutPageIndex: options.horizontalLayoutPageIndex,
      column: options.column,
      inEdit,
      rowHasSelectedCells: false,
    },
    formattedValueContext,
    {
      editError:
        editingCell &&
        editingCell.primaryKey === rowInfo.id &&
        editingCell.columnId === column.id &&
        !editingCell.active &&
        editingCell.accepted instanceof Error
          ? editingCell.accepted
          : undefined,
    },
  );

  // we define it initially as false so TS doesn't complain
  // and then make it a getter
  // so it can be computed lazily - just when the user calls and needs this
  Object.defineProperty(stylingParam, 'rowHasSelectedCells', {
    get() {
      return rowInfo.hasSelectedCells(visibleColumnsIds);
    },
  });
  const align =
    typeof column.align === 'function'
      ? column.align({ isHeader: false, ...stylingParam })
      : column.align ?? 'start';

  const verticalAlign =
    typeof column.verticalAlign === 'function'
      ? column.verticalAlign({ isHeader: false, ...stylingParam })
      : column.verticalAlign ?? 'center';

  return {
    inEdit,
    stylingParam,
    formattedValueContext,
    renderFunctions: {
      renderGroupIcon:
        column.renderGroupIcon || groupByColumnReference?.renderGroupIcon,
      renderSelectionCheckBox: column.renderSelectionCheckBox,
      renderRowDetailIcon: column.renderRowDetailIcon,
      renderTreeIcon: column.renderTreeIcon,
      renderTreeIconForParentNode: column.renderTreeIconForParentNode,
      renderTreeIconForLeafNode: column.renderTreeIconForLeafNode,
      renderValue: column.renderValue || groupByColumnReference?.renderValue,
      renderGroupValue:
        column.renderGroupValue || groupByColumnReference?.renderGroupValue,
      renderLeafValue:
        column.renderLeafValue || groupByColumnReference?.renderLeafValue,
    },
    renderParams: getColumnRenderParam({
      // prefer this over spreading the options object
      // for better performance
      rowIndexInHorizontalLayoutPage: options.rowIndexInHorizontalLayoutPage,
      horizontalLayoutPageIndex: options.horizontalLayoutPageIndex,
      column: options.column,
      rowInfo: options.rowInfo,
      visibleColumnsIds: options.visibleColumnsIds,
      columnsMap: options.columnsMap,
      fieldsToColumn: options.fieldsToColumn,
      context: options.context,

      // override the following:
      align,
      verticalAlign,
      formattedValueContext,
    }),
    groupByColumnReference,
  };
}

export function getColumnRenderParam<T>(options: {
  rowIndexInHorizontalLayoutPage: number | null;
  horizontalLayoutPageIndex: number | null;
  column: InfiniteTableComputedColumn<T>;
  align: InfiniteTableColumnAlignValues;
  verticalAlign: InfiniteTableColumnVerticalAlignValues;
  rowInfo: InfiniteTableRowInfo<T>;
  visibleColumnsIds: string[];
  formattedValueContext: InfiniteTableColumnValueFormatterParams<T>;
  columnsMap: Map<string, InfiniteTableComputedColumn<T>>;
  fieldsToColumn: Map<keyof T, InfiniteTableComputedColumn<T>>;

  context: InfiniteTableColumnRenderingContext<T>;
}) {
  const {
    column,
    context,
    rowInfo,
    align,
    verticalAlign,
    visibleColumnsIds,
    columnsMap,
    fieldsToColumn,
    formattedValueContext,
  } = options;
  const { value } = formattedValueContext;
  const {
    api: imperativeApi,
    getDataSourceState,
    getState,
    dataSourceApi,
  } = context;
  const { editingCell } = getState();

  const { indexInAll: rowIndex } = rowInfo;

  const dataSourceState = getDataSourceState();
  const { selectionMode, cellSelection } = dataSourceState;

  const groupByColumn = getGroupByColumnReference({
    rowInfo,
    column,
    fieldsToColumn,
    groupRenderStrategy: context.getState().groupRenderStrategy,
  });

  const toggleGroupRow = imperativeApi.toggleGroupRow;

  const cellSelected =
    cellSelection?.isCellSelected(rowInfo.id, column.id) ?? false;

  const renderParam: Omit<
    InfiniteTableColumnCellContextType<T>,
    'domRef' | 'htmlElementRef'
  > = {
    column,
    columnsMap,
    fieldsToColumn,
    align,
    verticalAlign,
    cellSelected,

    rowHasSelectedCells: false,
    horizontalLayoutPageIndex: options.horizontalLayoutPageIndex,
    rowIndexInHorizontalLayoutPage: options.rowIndexInHorizontalLayoutPage,

    ...formattedValueContext,
    editError:
      editingCell &&
      editingCell.primaryKey === rowInfo.id &&
      editingCell.columnId === column.id &&
      !editingCell.active &&
      editingCell.accepted instanceof Error
        ? editingCell.accepted
        : undefined,
    groupByColumn,
    selectionMode,
    api: imperativeApi,
    dataSourceApi,

    toggleCurrentRowDetails: () =>
      imperativeApi.rowDetailApi.toggleRowDetail(rowInfo.id),
    toggleRowDetails: imperativeApi.rowDetailApi.toggleRowDetail,
    expandRowDetails: imperativeApi.rowDetailApi.expandRowDetail,
    collapseRowDetails: imperativeApi.rowDetailApi.collapseRowDetail,

    toggleCurrentTreeNode: () => {
      dataSourceApi.treeApi.toggleNode(
        (rowInfo as InfiniteTable_Tree_RowInfoBase<T>).nodePath,
      );
    },
    toggleTreeNode: dataSourceApi.treeApi.toggleNode,
    expandTreeNode: dataSourceApi.treeApi.expandNode,
    collapseTreeNode: dataSourceApi.treeApi.collapseNode,

    selectTreeNode: dataSourceApi.treeApi.selectNode,
    deselectTreeNode: dataSourceApi.treeApi.deselectNode,
    toggleTreeNodeSelection: dataSourceApi.treeApi.toggleNodeSelection,

    toggleCurrentTreeNodeSelection: () => {
      if (!rowInfo.isTreeNode) {
        return;
      }
      dataSourceApi.treeApi.toggleNodeSelection(rowInfo.nodePath);
    },

    selectRow: imperativeApi.rowSelectionApi.selectRow,
    deselectRow: imperativeApi.rowSelectionApi.deselectRow,
    toggleRowSelection: imperativeApi.rowSelectionApi.toggleRowSelection,
    toggleGroupRowSelection:
      imperativeApi.rowSelectionApi.toggleGroupRowSelection,
    selectCell: () => {
      imperativeApi.cellSelectionApi.selectCell({
        rowId: rowInfo.id,
        colId: column.id,
      });
    },
    deselectCell: () => {
      imperativeApi.cellSelectionApi.deselectCell({
        rowId: rowInfo.id,
        colId: column.id,
      });
    },
    renderBag: {
      all: null,
      value: typeof value === 'boolean' ? `${value}` : value,

      selectionCheckBox: null,
      groupIcon: null,
    },

    selectCurrentRow: () => {
      if (rowInfo.isTreeNode) {
        return;
      }
      return imperativeApi.rowSelectionApi.selectRow(
        rowInfo.id,
        rowInfo.dataSourceHasGrouping ? rowInfo.groupKeys : undefined,
      );
    },
    deselectCurrentRow: () => {
      if (rowInfo.isTreeNode) {
        return;
      }
      return imperativeApi.rowSelectionApi.deselectRow(
        rowInfo.id,
        rowInfo.dataSourceHasGrouping ? rowInfo.groupKeys : undefined,
      );
    },
    rowIndex,
    toggleGroupRow,
    toggleCurrentGroupRow: () => {
      if (!rowInfo.isGroupRow) {
        return;
      }

      toggleGroupRow(rowInfo.groupKeys!);
    },

    toggleCurrentRowSelection: () => {
      if (rowInfo.isGroupRow || rowInfo.isTreeNode) {
        return;
      }
      return imperativeApi.rowSelectionApi.toggleRowSelection(rowInfo.id);
    },

    toggleCurrentGroupRowSelection: () => {
      if (!rowInfo.isGroupRow) {
        return;
      }
      return imperativeApi.rowSelectionApi.toggleGroupRowSelection(
        rowInfo.isGroupRow ? rowInfo.groupKeys : [],
      );
    },
    rootGroupBy: dataSourceState.groupBy,
    pivotBy: dataSourceState.pivotBy,
  };

  Object.defineProperty(renderParam, 'rowHasSelectedCells', {
    get() {
      return rowInfo.hasSelectedCells(visibleColumnsIds);
    },
  });

  return renderParam;
}

export function getRawValueForCell<T>(
  column: InfiniteTableComputedColumn<T>,
  rowInfo: InfiniteTableRowInfo<T>,
) {
  const { data, isGroupRow, dataSourceHasGrouping } = rowInfo;
  const groupBy = dataSourceHasGrouping ? rowInfo.groupBy : undefined;

  let value =
    isGroupRow &&
    groupBy &&
    column.groupByForColumn &&
    // if this is a multi-group column we're good
    (Array.isArray(column.groupByForColumn) ||
      // or it has to be a group column for the current group row
      column.groupByForColumn === groupBy[groupBy.length - 1])
      ? rowInfo.value
      : isColumnWithField(column)
      ? data?.[column.field]
      : null;

  if (
    column.field &&
    rowInfo.isGroupRow &&
    rowInfo.reducerData &&
    rowInfo.reducerData[column.field] != null
  ) {
    value = rowInfo.reducerData[column.field];
  }

  if (column.valueGetter) {
    if (!rowInfo.isGroupRow && rowInfo.data) {
      value = column.valueGetter({ data: rowInfo.data, field: column.field });
    }
  }

  return value;
}

export function getFormattedValueParamForCell<T>(
  value: any,
  column: InfiniteTableComputedColumn<T>,
  rowInfo: InfiniteTableRowInfo<T>,
  context: InfiniteTableColumnRenderingContext<T>,
  rowDetailState: 'expanded' | 'collapsed' | false,
): InfiniteTableRowInfoDataDiscriminator<T> {
  const { rowSelected, indexInAll: rowIndex } = rowInfo;
  const { activeRowIndex, keyboardNavigation } = context.getState();
  const rowActive = rowIndex === activeRowIndex && keyboardNavigation === 'row';

  // TS hack to discriminate between the grouped vs non-grouped rows vs tree nodes
  return rowInfo.isGroupRow
    ? {
        rowInfo,
        isGroupRow: true,
        isTreeNode: false,
        isParentNode: false,
        data: rowInfo.data,
        rowDetailState: false as false | 'expanded' | 'collapsed',
        rowSelected,
        rowActive,
        value,
        rawValue: value,
        field: column.field,
      }
    : rowInfo.isTreeNode
    ? rowInfo.isParentNode
      ? {
          rowInfo,
          isGroupRow: false,
          isTreeNode: true,
          isParentNode: true,
          nodeExpanded: rowInfo.nodeExpanded,
          data: rowInfo.data,
          rowDetailState,
          rowSelected,
          rowActive,
          value,
          rawValue: value,
          field: column.field,
        }
      : {
          rowInfo,
          isGroupRow: false,
          isTreeNode: true,
          isParentNode: false,
          nodeExpanded: false,
          data: rowInfo.data,
          rowDetailState,
          rowSelected,
          rowActive,
          value,
          rawValue: value,
          field: column.field,
        }
    : {
        rowInfo,
        isGroupRow: false,
        isTreeNode: false,
        isParentNode: false,
        data: rowInfo.data,
        rowDetailState,
        rowSelected,
        rowActive,
        value,
        rawValue: value,
        field: column.field,
      };
}

export function getFormattedValueContextForCell<T>(options: {
  column: InfiniteTableComputedColumn<T>;
  rowInfo: InfiniteTableRowInfo<T>;
  columnsMap: Map<string, InfiniteTableComputedColumn<T>>;
  context: InfiniteTableColumnRenderingContext<T>;
  rowDetailState: 'expanded' | 'collapsed' | false;
}): {
  formattedValueContext: InfiniteTableColumnValueFormatterParams<T>;
  formattedValue: any;
} {
  const { column, rowInfo, context, rowDetailState } = options;
  const rawValue = getRawValueForCell(column, rowInfo);
  const formattedValueContext = getFormattedValueParamForCell(
    rawValue,
    column,
    rowInfo,
    context,
    rowDetailState,
  );

  const formattedValue: any = column.valueFormatter
    ? column.valueFormatter(formattedValueContext)
    : rawValue;

  formattedValueContext.value = formattedValue;

  return {
    formattedValue,
    formattedValueContext,
  };
}

// export function isCellContentFocusable<T>(
//   column: InfiniteTableComputedColumn<T>,
//   formattedValueContext: InfiniteTableColumnValueFormatterParams<T>,
// ) {
//   if (typeof column.contentFocusable === 'function') {
//     return column.contentFocusable({
//       ...formattedValueContext,
//       column,
//     });
//   }

//   return column.contentFocusable === true;
// }

// export function isCellEditable<T>(
//   column: InfiniteTableComputedColumn<T>,
//   formattedValueContext: InfiniteTableColumnValueFormatterParams<T>,
// ) {
//   if (typeof column.editable === 'function') {
//     return column.editable({
//       ...formattedValueContext,
//       column,
//     });
//   }

//   return column.editable === true;
// }
