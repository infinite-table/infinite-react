import * as React from 'react';
import type { InfiniteTableColumn } from '../../types';
import type {
  InfiniteTableColumnWithField,
  InfiniteTableColumnStyleFnParams,
  InfiniteTableColumnRenderParams,
  InfiniteTableColumnCellContextType,
} from '../../types/InfiniteTableColumn';

import type { Renderable } from '../../../types/Renderable';

import { join } from '../../../../utils/join';

import {
  InfiniteTableCell,
  InfiniteTableCellClassName,
} from './InfiniteTableCell';

import { internalProps } from '../../internalProps';
import {
  InfiniteTableCellProps,
  InfiniteTableColumnCellProps,
} from './InfiniteTableCellTypes';
import { useCellClassName } from '../../hooks/useCellClassName';
import { useDataSourceContextValue } from '../../../DataSource/publicHooks/useDataSource';
import { ColumnCellRecipe } from '../cell.css';
import { useContext } from 'react';
import { RenderHookComponent } from '../../utils/RenderHookComponent';

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
    getData,
    column,
    offsetProperty,
    toggleGroupRow,
    virtualized,
    rowIndex,
    rowHeight,
    domRef,
    hidden,
  } = props;

  if (!column) {
    return null;
  }

  const { data, isGroupRow, groupBy } = rowInfo;

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

  let value =
    isGroupRow && groupBy && column.groupByField
      ? rowInfo.value
      : isColumnWithField(column)
      ? data?.[column.field]
      : null;

  if (column.valueGetter) {
    value = column.valueGetter(
      // TS hack to discriminate between the grouped vs non-grouped rows
      isGroupRow
        ? {
            data: rowInfo.data,
            rowInfo,
          }
        : {
            data: rowInfo.data,
            rowInfo,
          },
    );
  }

  const { componentState: computedDataSource } = useDataSourceContextValue<T>();

  const rest = rowInfo.isGroupRow
    ? {
        rowInfo,
        data: rowInfo.data,
      }
    : {
        rowInfo,
        data: rowInfo.data,
      };

  const stylingRenderParam: InfiniteTableColumnStyleFnParams<T> = {
    value,
    column,
    ...rest,
  };

  let renderValue: Renderable = value;

  const renderParam: InfiniteTableColumnRenderParams<T> = {
    value,
    column,
    domRef,
    groupRowInfo,
    ...rest,
    rowIndex,
    toggleGroupRow,
    toggleCurrentGroupRow: () => toggleGroupRow(rowInfo.groupKeys!),
    groupBy: computedDataSource.groupBy,
    pivotBy: computedDataSource.pivotBy,
  };

  const renderChildren = () => {
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
  };

  const colClassName: undefined | string = column.className
    ? typeof column.className === 'function'
      ? column.className(stylingRenderParam)
      : column.className
    : undefined;

  const colStyle: undefined | React.CSSProperties = column.style
    ? typeof column.style === 'function'
      ? column.style(stylingRenderParam)
      : column.style
    : undefined;

  const style = colStyle
    ? {
        ...colStyle,
        width: column.computedWidth,
      }
    : {
        width: column.computedWidth,
      };

  const dataset: any = {
    'data-name': `Cell`,
    'data-column-id': column.id,
    'data-column-index': column.computedVisibleIndex,
  };

  if (typeof column.rowspan === 'function') {
    const rowspan = column.rowspan({
      dataArray: getData(),
      column,
      rowInfo: rowInfo,
      rowIndex,
      data: rowInfo.data,
    });

    if (rowspan > 1) {
      style.height = rowspan * rowHeight;

      for (let i = 0; i < rowspan; i++) {
        dataset[`data-hover-${rowIndex + i}`] = true;
      }
    }
  }
  const cellProps: InfiniteTableCellProps<T> = {
    domRef,
    offsetProperty,
    ...dataset,
    cellType: 'body',
    column,
    offset: virtualized ? 0 : column.computedPinningOffset,
    style,
    cssEllipsis: column.cssEllipsis ?? true,
    className: join(
      useCellClassName(
        column,
        [InfiniteTableColumnCellClassName, InfiniteTableCellClassName],
        ColumnCellRecipe,
        { dragging: false },
      ),
      colClassName,
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
