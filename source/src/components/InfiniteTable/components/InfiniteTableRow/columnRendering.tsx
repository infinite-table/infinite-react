import { getColumnApiForColumn } from '../../api/getColumnApi';
import {
  InfiniteTableColumn,
  InfiniteTableColumnRenderParam,
  InfiniteTableComputedColumn,
  InfiniteTableContextValue,
  InfiniteTableRowInfo,
} from '../../types';
import {
  InfiniteTableColumnValueFormatterParams,
  InfiniteTableColumnWithField,
} from '../../types/InfiniteTableColumn';
import { InfiniteTableRowInfoDataDiscriminatorWithColumnAndApis } from '../../types/InfiniteTableProps';

import { InfiniteTableColumnRenderingContext } from './columnRenderingContextType';

function isColumnWithField<T>(
  c: InfiniteTableColumn<T>,
): c is InfiniteTableColumnWithField<T> & InfiniteTableColumn<T> {
  return typeof (c as InfiniteTableColumnWithField<T>).field === 'string';
}

export function getGroupByColumn<T>(options: {
  rowInfo: InfiniteTableRowInfo<T>;
  column: InfiniteTableComputedColumn<T>;
  fieldsToColumn: Map<keyof T, InfiniteTableComputedColumn<T>>;
}) {
  const { column, rowInfo, fieldsToColumn } = options;
  let groupByColumn: InfiniteTableComputedColumn<T> | undefined = undefined;
  if (column.groupByField) {
    if (rowInfo.isGroupRow) {
      groupByColumn = fieldsToColumn.get(
        rowInfo.groupBy[rowInfo.groupBy.length - 1],
      );
    } else if (column.field) {
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
  const { isGroupRow } = rowInfo;
  const column = getComputed().computedColumnsMap.get(columnId)!;

  const { activeRowIndex, keyboardNavigation } = getState();
  const rowActive = rowIndex === activeRowIndex && keyboardNavigation === 'row';

  const {
    formattedValue: value,
    formattedValueContext: { rawValue },
  } = getFormattedValueContextForCell({
    column,
    rowInfo,
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
        isGroupRow: true,
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
        isGroupRow: false,
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
  rowInfo: InfiniteTableRowInfo<T>;
  columnsMap: Map<string, InfiniteTableComputedColumn<T>>;
  fieldsToColumn: Map<keyof T, InfiniteTableComputedColumn<T>>;
  context: InfiniteTableColumnRenderingContext<T>;
}) {
  const { column, context, rowInfo } = options;
  const groupByColumn = getGroupByColumn(options);

  const { getState } = context;
  const { editingCell } = getState();
  const formattedResult = getFormattedValueContextForCell({
    ...options,
    column: groupByColumn || column,
  });
  const { formattedValueContext } = formattedResult;

  const inEdit = context.api.isEditorVisibleForCell({
    columnId: column.id,
    rowIndex: rowInfo.indexInAll,
  });

  return {
    inEdit,
    stylingParam: {
      column: options.column,
      inEdit,
      ...formattedValueContext,
      editError:
        editingCell &&
        editingCell.primaryKey === rowInfo.id &&
        editingCell.columnId === column.id &&
        !editingCell.active &&
        editingCell.accepted instanceof Error
          ? editingCell.accepted
          : undefined,
    },
    formattedValueContext,
    renderFunctions: {
      renderGroupIcon: column.renderGroupIcon || groupByColumn?.renderGroupIcon,
      renderSelectionCheckBox: column.renderSelectionCheckBox,
      renderValue: column.renderValue || groupByColumn?.renderValue,
      renderGroupValue:
        column.renderGroupValue || groupByColumn?.renderGroupValue,
      renderLeafValue: column.renderLeafValue || groupByColumn?.renderLeafValue,
    },
    renderParams: getColumnRenderParam({
      ...options,

      formattedValueContext,
    }),
    groupByColumn,
  };
}

export function getColumnRenderParam<T>(options: {
  column: InfiniteTableComputedColumn<T>;
  rowInfo: InfiniteTableRowInfo<T>;
  formattedValueContext: InfiniteTableColumnValueFormatterParams<T>;
  columnsMap: Map<string, InfiniteTableComputedColumn<T>>;
  fieldsToColumn: Map<keyof T, InfiniteTableComputedColumn<T>>;

  context: InfiniteTableColumnRenderingContext<T>;
}) {
  const {
    column,
    context,
    rowInfo,
    columnsMap,
    fieldsToColumn,
    formattedValueContext,
  } = options;
  const { value } = formattedValueContext;
  const { api: imperativeApi, getDataSourceState, getState } = context;
  const { editingCell } = getState();

  const { indexInAll: rowIndex } = rowInfo;

  const dataSourceState = getDataSourceState();
  const { selectionMode } = dataSourceState;

  const groupByColumn = getGroupByColumn({ rowInfo, column, fieldsToColumn });

  const toggleGroupRow = imperativeApi.toggleGroupRow;

  const renderParam: Omit<InfiniteTableColumnRenderParam<T>, 'domRef'> = {
    column,
    columnsMap,
    fieldsToColumn,

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
    selectRow: imperativeApi.selectionApi.selectRow,
    deselectRow: imperativeApi.selectionApi.deselectRow,
    toggleRowSelection: imperativeApi.selectionApi.toggleRowSelection,
    toggleGroupRowSelection: imperativeApi.selectionApi.toggleGroupRowSelection,
    renderBag: {
      all: null,
      value: typeof value === 'boolean' ? `${value}` : value,

      selectionCheckBox: null,
      groupIcon: null,
    },

    selectCurrentRow: () => {
      return imperativeApi.selectionApi.selectRow(
        rowInfo.id,
        rowInfo.dataSourceHasGrouping ? rowInfo.groupKeys : undefined,
      );
    },
    deselectCurrentRow: () => {
      return imperativeApi.selectionApi.deselectRow(
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
      if (rowInfo.isGroupRow) {
        return;
      }
      return imperativeApi.selectionApi.toggleRowSelection(rowInfo.id);
    },

    toggleCurrentGroupRowSelection: () => {
      if (!rowInfo.isGroupRow) {
        return;
      }
      return imperativeApi.selectionApi.toggleGroupRowSelection(
        rowInfo.isGroupRow ? rowInfo.groupKeys : [],
      );
    },
    rootGroupBy: dataSourceState.groupBy,
    pivotBy: dataSourceState.pivotBy,
  };

  return renderParam;
}

export function getRawValueForCell<T>(
  column: InfiniteTableComputedColumn<T>,
  rowInfo: InfiniteTableRowInfo<T>,
) {
  const { data, isGroupRow, dataSourceHasGrouping } = rowInfo;
  const groupBy = dataSourceHasGrouping ? rowInfo.groupBy : undefined;

  let value =
    isGroupRow && groupBy && column.groupByField
      ? rowInfo.value
      : isColumnWithField(column)
      ? data?.[column.field]
      : null;

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
) {
  const { rowSelected, indexInAll: rowIndex } = rowInfo;
  const { activeRowIndex, keyboardNavigation } = context.getState();
  const rowActive = rowIndex === activeRowIndex && keyboardNavigation === 'row';

  // TS hack to discriminate between the grouped vs non-grouped rows
  return rowInfo.isGroupRow
    ? {
        rowInfo,
        isGroupRow: rowInfo.isGroupRow,
        data: rowInfo.data,
        rowSelected,
        rowActive,
        value,
        rawValue: value,
        field: column.field,
      }
    : {
        rowInfo,
        isGroupRow: rowInfo.isGroupRow,
        data: rowInfo.data,
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
}): {
  formattedValueContext: InfiniteTableColumnValueFormatterParams<T>;
  formattedValue: any;
} {
  const { column, rowInfo, context } = options;
  const rawValue = getRawValueForCell(column, rowInfo);
  const formattedValueContext = getFormattedValueParamForCell(
    rawValue,
    column,
    rowInfo,
    context,
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
