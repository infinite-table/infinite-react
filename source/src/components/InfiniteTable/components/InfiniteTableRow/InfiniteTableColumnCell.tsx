import * as React from 'react';
import { useCallback, useContext, useMemo } from 'react';

import { join } from '../../../../utils/join';
import { useDataSourceContextValue } from '../../../DataSource/publicHooks/useDataSource';
import type { Renderable } from '../../../types/Renderable';
import { useCellClassName } from '../../hooks/useCellClassName';
import { useInfiniteTable } from '../../hooks/useInfiniteTable';
import { internalProps } from '../../internalProps';
import type { InfiniteTableColumn } from '../../types';
import type {
  InfiniteTableColumnWithField,
  InfiniteTableColumnStyleFnParams,
  InfiniteTableColumnRenderParam,
  InfiniteTableColumnCellContextType,
} from '../../types/InfiniteTableColumn';
import { InfiniteTableRowStyleFnParams } from '../../types/InfiniteTableProps';
import { RenderHookComponent } from '../../utils/RenderHookComponent';
import { ColumnCellRecipe } from '../cell.css';

import {
  InfiniteTableCell,
  InfiniteTableCellClassName,
} from './InfiniteTableCell';
import {
  InfiniteTableCellProps,
  InfiniteTableColumnCellProps,
} from './InfiniteTableCellTypes';

const { rootClassName } = internalProps;

export const InfiniteTableColumnCellContext = React.createContext<
  InfiniteTableColumnCellContextType<any>
>(null as any as InfiniteTableColumnCellContextType<any>);

export const InfiniteTableColumnCellClassName = `${rootClassName}ColumnCell`;

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
    offsetProperty,
    toggleGroupRow,
    virtualized,
    rowIndex,
    rowHeight,

    domRef,
    hidden,
    showZebraRows,
  } = props;

  if (!column) {
    return <div ref={domRef}>no column</div>;
  }

  const { data, isGroupRow, dataSourceHasGrouping } = rowInfo;
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

  const { getState, componentActions } = useInfiniteTable<T>();
  const { activeRowIndex, keyboardNavigation } = getState();
  const rowActive = rowIndex === activeRowIndex && keyboardNavigation === 'row';

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

  const onClick = useCallback(() => {
    if (keyboardNavigation === 'row') {
      componentActions.activeRowIndex = rowIndex;
      return;
    }
    if (keyboardNavigation === 'cell') {
      componentActions.activeCellIndex = [
        rowIndex,
        column.computedVisibleIndex,
      ];
    }
  }, [rowIndex, column.computedVisibleIndex, keyboardNavigation]);

  const { componentState: computedDataSource } = useDataSourceContextValue<T>();

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

  const renderValue: Renderable = value;

  const renderParam: InfiniteTableColumnRenderParam<T> = {
    column,
    domRef,
    groupRowInfo,
    ...rest,
    isGroupRow,
    rowIndex,
    toggleGroupRow,
    toggleCurrentGroupRow: useCallback(() => {
      if (!rowInfo.isGroupRow) {
        return;
      }

      toggleGroupRow(rowInfo.groupKeys!);
    }, []),
    groupBy: computedDataSource.groupBy,
    pivotBy: computedDataSource.pivotBy,
  } as InfiniteTableColumnRenderParam<T>;

  const renderChildren = useCallback(() => {
    if (hidden) {
      return null;
    }

    const renderFn = column.render || column.renderValue;
    if (renderFn) {
      return (
        <RenderHookComponent render={renderFn} renderParam={renderParam} />
      );
    }
    return renderValue;
  }, [column, hidden, ...Object.values(renderParam)]);

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
    offsetProperty,
    cellType: 'body',
    column,
    width,
    offset: virtualized ? 0 : column.computedPinningOffset,
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
        { dragging: false, zebra, rowActive },
      ),
      colClassName,
      rowComputedClassName,
    ),
    renderChildren,
  };

  const ContextProvider =
    InfiniteTableColumnCellContext.Provider as React.Provider<
      InfiniteTableColumnCellContextType<T>
    >;

  return (
    <ContextProvider
      value={renderParam as InfiniteTableColumnCellContextType<T>}
    >
      <InfiniteTableCell<T> {...cellProps}></InfiniteTableCell>
    </ContextProvider>
  );
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
