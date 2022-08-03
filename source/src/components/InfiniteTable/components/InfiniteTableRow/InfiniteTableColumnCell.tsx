import * as React from 'react';
import { useCallback, useContext, useMemo } from 'react';

import { join } from '../../../../utils/join';
import { stripVar } from '../../../../utils/stripVar';
import { useDataSourceContextValue } from '../../../DataSource/publicHooks/useDataSource';

import { useCellClassName } from '../../hooks/useCellClassName';
import { useInfiniteTable } from '../../hooks/useInfiniteTable';
import { internalProps } from '../../internalProps';
import { InternalVars } from '../../theme.css';
import type { InfiniteTableColumn } from '../../types';
import type {
  InfiniteTableColumnWithField,
  InfiniteTableColumnStyleFnParams,
  InfiniteTableColumnRenderParam,
  InfiniteTableColumnCellContextType,
  InfiniteTableColumnRenderFunction,
} from '../../types/InfiniteTableColumn';
import { InfiniteTableRowStyleFnParams } from '../../types/InfiniteTableProps';
import { objectValuesExcept } from '../../utils/objectValuesExcept';
import { RenderCellHookComponent } from '../../utils/RenderHookComponent';
import { ColumnCellRecipe, SelectionCheckboxCls } from '../cell.css';
import { InfiniteCheckBox } from '../CheckBox';

import {
  InfiniteTableCell,
  InfiniteTableCellClassName,
} from './InfiniteTableCell';
import {
  InfiniteTableCellProps,
  InfiniteTableColumnCellProps,
} from './InfiniteTableCellTypes';

const { rootClassName } = internalProps;

const columnZIndexAtIndex = stripVar(InternalVars.columnZIndexAtIndex);

export const InfiniteTableColumnCellContext = React.createContext<
  InfiniteTableColumnCellContextType<any>
>(null as any as InfiniteTableColumnCellContextType<any>);

export const InfiniteTableColumnCellClassName = `${rootClassName}ColumnCell`;

export const defaultRenderSelectionCheckBox: InfiniteTableColumnRenderFunction<
  any
> = (params) => {
  const {
    rowInfo,
    selectCurrentRow,
    deselectCurrentRow,
    toggleCurrentGroupRowSelection,
    column,
  } = params;

  if (rowInfo.isGroupRow && !column.groupByField) {
    return null;
  }
  // if (column.groupByField && !rowInfo.isGroupRow) {
  //   return null;
  // }

  return (
    <InfiniteCheckBox
      domProps={{
        className: SelectionCheckboxCls,
      }}
      onChange={(selected) => {
        if (rowInfo.isGroupRow) {
          toggleCurrentGroupRowSelection();
          return;
        }

        if (selected) {
          selectCurrentRow();
        } else {
          deselectCurrentRow();
        }
      }}
      checked={
        rowInfo.isGroupRow
          ? !rowInfo.rowSelected
            ? rowInfo.childrenSelectedCount > 0
              ? null
              : false
            : true
          : rowInfo.rowSelected
      }
    />
  );
};

function isColumnWithField<T>(
  c: InfiniteTableColumn<T>,
): c is InfiniteTableColumnWithField<T> & InfiniteTableColumn<T> {
  return typeof (c as InfiniteTableColumnWithField<T>).field === 'string';
}

function InfiniteTableColumnCellFn<T>(props: InfiniteTableColumnCellProps<T>) {
  const {
    rowInfo,
    rowStyle,
    rowClassName,

    // getData,
    width,
    column,
    onMouseLeave,
    onMouseEnter,

    toggleGroupRow,
    rowIndex,
    rowHeight,

    domRef,
    hidden,
    showZebraRows,
  } = props;

  if (!column) {
    return <div ref={domRef}>no column</div>;
  }

  const { data, isGroupRow, dataSourceHasGrouping, rowSelected } = rowInfo;
  const groupBy = dataSourceHasGrouping ? rowInfo.groupBy : undefined;

  const groupRowInfo = null;
  //TODO compute this here, so it's not computed in everywhere in rowspan/render/valueGetter methods
  // let groupRowEnhancedData = !groupBy
  //   ? null
  //   : groupRenderStrategy !== 'inline'
  //   ? enhancedData
  //   : // while for inline, we need to still work on group rows, but the current row is a data item
  //     // so we go find the group row via the parents of enhanced data
  //     enhancedData.parents?.[groupIndex] || enhancedData;
  // if (column.id === 'team') {
  //   debugger;
  // }

  const { getState, componentActions, imperativeApi } = useInfiniteTable<T>();
  const { activeRowIndex, keyboardNavigation } = getState();
  const rowActive = rowIndex === activeRowIndex && keyboardNavigation === 'row';
  // const rowSelected =
  //   rowSelection instanceof RowSelectionState
  //     ? rowSelection.isRowSelected(id)
  //     : rowSelection !== false
  //     ? `${rowSelection}` === `${id}`
  //     : false;

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

  if (column.valueFormatter) {
    value = column.valueFormatter(
      // TS hack to discriminate between the grouped vs non-grouped rows
      isGroupRow
        ? {
            data: rowInfo.data,
            isGroupRow,
            rowInfo,
            rowActive,
            field: column.field,
            value,
          }
        : {
            data: rowInfo.data,
            isGroupRow,
            rowActive,
            rowInfo,
            field: column.field,
            value,
          },
    );
  }

  const onClick = useCallback(
    (event) => {
      const colIndex = column.computedVisibleIndex;

      getState().cellClick({
        rowIndex,
        colIndex,
        event,
      });

      if (keyboardNavigation === 'row') {
        componentActions.activeRowIndex = rowIndex;
        return;
      }
      if (keyboardNavigation === 'cell') {
        componentActions.activeCellIndex = [rowIndex, colIndex];
      }
    },
    [rowIndex, column.computedVisibleIndex, keyboardNavigation],
  );

  const { componentState: computedDataSource } = useDataSourceContextValue<T>();

  const { selectionMode } = computedDataSource;

  const rest = rowInfo.isGroupRow
    ? {
        rowInfo,
        isGroupRow: rowInfo.isGroupRow,
        data: rowInfo.data,
        rowActive,

        value,
        field: column.field,
      }
    : {
        rowInfo,
        isGroupRow: rowInfo.isGroupRow,
        data: rowInfo.data,
        rowActive,
        value,
        field: column.field,
      };

  const stylingRenderParam = {
    column,
    ...rest,
  } as InfiniteTableColumnStyleFnParams<T>;

  const renderParam: InfiniteTableColumnRenderParam<T> = {
    column,
    domRef,
    groupRowInfo,
    ...rest,
    selectionMode,
    selectRow: imperativeApi.selectRow,
    deselectRow: imperativeApi.deselectRow,
    toggleRowSelection: imperativeApi.toggleRowSelection,
    renderBag: {
      value,
      selectionCheckBox: null,
      groupIcon: null,
    },

    selectCurrentRow: useCallback(() => {
      return imperativeApi.selectRow(rowInfo.id);
    }, [rowInfo]),
    deselectCurrentRow: useCallback(() => {
      return imperativeApi.deselectRow(rowInfo.id);
    }, [rowInfo]),
    rowIndex,
    toggleGroupRow,
    toggleCurrentGroupRow: useCallback(() => {
      if (!rowInfo.isGroupRow) {
        return;
      }

      toggleGroupRow(rowInfo.groupKeys!);
    }, [rowInfo]),
    toggleCurrentGroupRowSelection: useCallback(() => {
      return imperativeApi.toggleGroupRowSelection(
        rowInfo.isGroupRow ? rowInfo.groupKeys : [],
      );
    }, [rowInfo]),
    groupBy: computedDataSource.groupBy,
    pivotBy: computedDataSource.pivotBy,
  };

  const renderChildren = useCallback(() => {
    if (hidden) {
      return null;
    }

    if (column.renderGroupIcon) {
      renderParam.renderBag.groupIcon = (
        <RenderCellHookComponent
          render={column.renderGroupIcon}
          renderParam={{
            ...renderParam,
            renderBag: { ...renderParam.renderBag },
          }}
        />
      );
    }
    if (column.renderSelectionCheckBox) {
      // make selectionCheckBox available in the render bag
      // when we have column.renderSelectionCheckBox refined as a function
      // as people might want to use the default value
      // and enhance it
      renderParam.renderBag.selectionCheckBox = (
        <RenderCellHookComponent
          render={defaultRenderSelectionCheckBox}
          renderParam={renderParam}
        />
      );

      if (column.renderSelectionCheckBox !== true) {
        renderParam.renderBag.selectionCheckBox = (
          <RenderCellHookComponent
            render={column.renderSelectionCheckBox}
            renderParam={{
              ...renderParam,
              renderBag: { ...renderParam.renderBag },
            }}
          />
        );
      }
    }

    if (column.renderValue) {
      renderParam.renderBag.value = (
        <RenderCellHookComponent
          render={column.renderValue}
          renderParam={{
            ...renderParam,
            renderBag: { ...renderParam.renderBag },
          }}
        />
      );
    }

    if (rowInfo.isGroupRow && column.renderGroupValue) {
      renderParam.renderBag.value = (
        <RenderCellHookComponent
          render={column.renderGroupValue}
          renderParam={{
            ...renderParam,
            renderBag: { ...renderParam.renderBag },
          }}
        />
      );
    }
    if (!rowInfo.isGroupRow && column.renderLeafValue) {
      renderParam.renderBag.value = (
        <RenderCellHookComponent
          render={column.renderLeafValue}
          renderParam={{
            ...renderParam,
            renderBag: { ...renderParam.renderBag },
          }}
        />
      );
    }

    if (column.render) {
      return (
        <RenderCellHookComponent
          render={column.render}
          renderParam={renderParam}
        />
      );
    }

    return (
      <>
        {renderParam.renderBag.groupIcon}
        {renderParam.renderBag.selectionCheckBox}
        {renderParam.renderBag.value}
      </>
    );
  }, [
    column,
    hidden,
    ...objectValuesExcept(renderParam, {
      renderBag: true,
    }),
  ]);

  const rowPropsAndStyleArgs: InfiniteTableRowStyleFnParams<T> = {
    ...rest,
    rowIndex,
  };

  const rowComputedClassName =
    typeof rowClassName === 'function'
      ? rowClassName(rowPropsAndStyleArgs)
      : rowClassName;

  const colClassName: undefined | string = column.className
    ? typeof column.className === 'function'
      ? column.className(stylingRenderParam)
      : column.className
    : undefined;

  let style: React.CSSProperties | undefined;

  if (rowStyle) {
    style =
      typeof rowStyle === 'function'
        ? { ...style, ...rowStyle(rowPropsAndStyleArgs) }
        : { ...style, ...rowStyle };
  }

  style = column.style
    ? typeof column.style === 'function'
      ? { ...style, ...(column.style(stylingRenderParam) || {}) }
      : { ...style, ...column.style }
    : style || {};

  // style.width = width;
  style.height = rowHeight;
  style.zIndex = `var(${columnZIndexAtIndex}-${column.computedVisibleIndex})`;

  const memoizedStyle = useMemo(
    () => style,
    [!style ? null : JSON.stringify(style)],
  );

  const odd =
    (rowInfo.indexInAll != null ? rowInfo.indexInAll : rowIndex) % 2 === 1;

  const zebra = showZebraRows ? (odd ? 'odd' : 'even') : false;

  const cellProps: InfiniteTableCellProps<T> &
    React.HTMLAttributes<HTMLElement> = {
    domRef,
    cellType: 'body',
    column,
    width,

    style: memoizedStyle,
    onMouseLeave,
    onMouseEnter,
    onClick,
    cssEllipsis: column.cssEllipsis ?? true,
    className: join(
      useCellClassName(
        column,
        [InfiniteTableColumnCellClassName, InfiniteTableCellClassName],
        ColumnCellRecipe,
        { dragging: false, zebra, rowActive, rowSelected },
      ),
      colClassName,
      rowComputedClassName,
    ),
    renderChildren,
  };

  // const ContextProvider =
  //   InfiniteTableColumnCellContext.Provider as React.Provider<
  //     InfiniteTableColumnCellContextType<T>
  //   >;

  return <InfiniteTableCell<T> {...cellProps}></InfiniteTableCell>;
}

export const InfiniteTableColumnCell = React.memo(
  InfiniteTableColumnCellFn,
) as typeof InfiniteTableColumnCellFn;

export function useInfiniteColumnCell<T>() {
  const result = useContext(
    InfiniteTableColumnCellContext,
  ) as InfiniteTableColumnCellContextType<T>;

  return result;
}
