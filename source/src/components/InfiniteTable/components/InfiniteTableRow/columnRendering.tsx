import { DataSourceState } from '../../../DataSource';
import {
  InfiniteTableApi,
  InfiniteTableColumn,
  InfiniteTableColumnRenderParam,
  InfiniteTableComputedColumn,
  InfiniteTableRowInfo,
  InfiniteTableState,
} from '../../types';
import {
  InfiniteTableColumnValueFormatterParams,
  InfiniteTableColumnWithField,
} from '../../types/InfiniteTableColumn';
import { InfiniteTableActions } from '../../types/InfiniteTableState';

function isColumnWithField<T>(
  c: InfiniteTableColumn<T>,
): c is InfiniteTableColumnWithField<T> & InfiniteTableColumn<T> {
  return typeof (c as InfiniteTableColumnWithField<T>).field === 'string';
}

export type InfiniteTableColumnRenderingContext<T> = {
  getState: () => InfiniteTableState<T>;
  getDataSourceState: () => DataSourceState<T>;
  actions: InfiniteTableActions<T>;
  api: InfiniteTableApi<T>;
};
export function getColumnRenderFunction<T>(
  _column: InfiniteTableComputedColumn<T>,
  _rowInfo: InfiniteTableRowInfo<T>,
  _context: InfiniteTableColumnRenderingContext<T> & {
    columnsMap: Map<string, InfiniteTableComputedColumn<T>>;
  },
) {}

export function getGroupByColumn<T>(options: {
  rowInfo: InfiniteTableRowInfo<T>;
  column: InfiniteTableComputedColumn<T>;
  columnsMap: Map<string, InfiniteTableComputedColumn<T>>;
}) {
  const { column, rowInfo, columnsMap } = options;
  const groupByColumn =
    rowInfo.isGroupRow && column.groupByField
      ? columnsMap.get(
          rowInfo.isGroupRow
            ? (rowInfo.groupBy[rowInfo.groupBy.length - 1] as any as string)
            : '',
        )
      : undefined;

  return groupByColumn;
}

export function getColumnRenderingParams<T>(options: {
  column: InfiniteTableComputedColumn<T>;
  rowInfo: InfiniteTableRowInfo<T>;
  columnsMap: Map<string, InfiniteTableComputedColumn<T>>;
  context: InfiniteTableColumnRenderingContext<T>;
}) {
  const { column } = options;
  const groupByColumn = getGroupByColumn(options);

  const formattedResult = getFormattedValueContextForCell({
    ...options,
    column: groupByColumn || column,
  });
  const { formattedValueContext } = formattedResult;

  return {
    stylingParam: {
      column: options.column,
      ...formattedValueContext,
    },
    formattedValueContext,
    renderFunctions: {
      renderGroupIcon: groupByColumn?.renderGroupIcon || column.renderGroupIcon,
      renderSelectionCheckBox: column.renderSelectionCheckBox,
      renderValue: groupByColumn?.renderValue || column.renderValue,
      renderGroupValue:
        groupByColumn?.renderGroupValue || column.renderGroupValue,
      renderLeafValue: groupByColumn?.renderLeafValue || column.renderLeafValue,
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

  context: InfiniteTableColumnRenderingContext<T>;
}) {
  const { column, context, rowInfo, columnsMap, formattedValueContext } =
    options;
  const { value } = formattedValueContext;
  const { api: imperativeApi, getDataSourceState } = context;

  const { indexInAll: rowIndex } = rowInfo;

  const dataSourceState = getDataSourceState();
  const { selectionMode } = dataSourceState;

  const groupByColumn = rowInfo.isGroupRow
    ? columnsMap.get(
        rowInfo.isGroupRow
          ? (rowInfo.groupBy[rowInfo.groupBy.length - 1] as any as string)
          : '',
      )
    : undefined;

  const toggleGroupRow = imperativeApi.toggleGroupRow;

  const renderParam: Omit<InfiniteTableColumnRenderParam<T>, 'domRef'> = {
    column,
    columnsMap,

    ...formattedValueContext,
    groupByColumn,
    selectionMode,
    api: imperativeApi,
    selectRow: imperativeApi.selectionApi.selectRow,
    deselectRow: imperativeApi.selectionApi.deselectRow,
    toggleRowSelection: imperativeApi.selectionApi.toggleRowSelection,
    renderBag: {
      value,
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
  rawValue: any,
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
        value: rawValue,
        field: column.field,
      }
    : {
        rowInfo,
        isGroupRow: rowInfo.isGroupRow,
        data: rowInfo.data,
        rowSelected,
        rowActive,
        value: rawValue,
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
