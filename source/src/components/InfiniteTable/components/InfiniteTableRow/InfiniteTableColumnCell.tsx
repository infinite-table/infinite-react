import * as React from 'react';
import type { InfiniteTableColumn } from '../../types';
import type {
  InfiniteTableColumnWithRender,
  InfiniteTableColumnWithField,
  InfiniteTableColumnStyleFnParams,
} from '../../types/InfiniteTableColumn';

import type { Renderable } from '../../../types/Renderable';

import { join } from '../../../../utils/join';

import {
  InfiniteTableCell,
  InfiniteTableCellClassName,
} from './InfiniteTableCell';

import { ICSS } from '../../../../style/utilities';
import { internalProps } from '../../internalProps';
import { InfiniteTableColumnCellProps } from './InfiniteTableCellTypes';
import { useCellClassName } from '../../hooks/useCellClassName';
import { useDataSourceContextValue } from '../../../DataSource/publicHooks/useDataSource';

const { rootClassName } = internalProps;
const baseCls = `${rootClassName}ColumnCell`;

function isColumnWithField<T>(
  c: InfiniteTableColumn<T>,
): c is InfiniteTableColumnWithField<T> & InfiniteTableColumn<T> {
  return typeof (c as InfiniteTableColumnWithField<T>).field === 'string';
}
function isColumnWithRender<T>(
  c: InfiniteTableColumn<T>,
): c is InfiniteTableColumnWithRender<T> & InfiniteTableColumn<T> {
  return (c as InfiniteTableColumnWithRender<T>).render instanceof Function;
}

function InfiniteTableColumnCellFn<T>(props: InfiniteTableColumnCellProps<T>) {
  const {
    enhancedData,
    column,
    offsetProperty,
    toggleGroupRow,
    virtualized,
    rowIndex,
    domRef,
  } = props;

  const { data, isGroupRow, groupBy } = enhancedData;
  let value =
    isGroupRow && groupBy && column.groupByField
      ? enhancedData.value
      : isColumnWithField(column)
      ? data?.[column.field]
      : null;

  if (column.valueGetter) {
    value = column.valueGetter({ data, enhancedData });
  }

  const { componentState: computedDataSource } = useDataSourceContextValue<T>();

  const renderParam: InfiniteTableColumnStyleFnParams<T> = {
    value,
    column,
    enhancedData,
    data,
  };

  let renderValue: Renderable = isColumnWithRender(column)
    ? column.render({
        value,
        column,
        enhancedData,
        data,
        rowIndex,
        toggleGroupRow,
        toggleCurrentGroupRow: () => toggleGroupRow(enhancedData.groupKeys!),
        groupRowsBy: computedDataSource.groupRowsBy,
      })
    : value;

  const colClassName: undefined | string = column.className
    ? typeof column.className === 'function'
      ? column.className(renderParam)
      : column.className
    : undefined;

  const colStyle: undefined | React.CSSProperties = column.style
    ? typeof column.style === 'function'
      ? column.style(renderParam)
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

  return (
    <InfiniteTableCell<T>
      domRef={domRef}
      offsetProperty={offsetProperty}
      data-name={`Cell`}
      data-column-id={column.id}
      data-column-index={column.computedVisibleIndex}
      column={column}
      offset={virtualized ? 0 : column.computedPinningOffset}
      style={style}
      cssEllipsis={column.cssEllipsis ?? true}
      className={join(
        ICSS.position.absolute,
        ICSS.height['100%'],
        ICSS.top[0],
        useCellClassName(column, [baseCls, InfiniteTableCellClassName]),
        colClassName,
      )}
    >
      {renderValue}
    </InfiniteTableCell>
  );
}

// export const TableColumnCell = TableColumnCellFn;
export const InfiniteTableColumnCell = React.memo(
  InfiniteTableColumnCellFn,
) as typeof InfiniteTableColumnCellFn;
