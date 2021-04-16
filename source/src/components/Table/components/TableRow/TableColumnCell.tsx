import * as React from 'react';
import type { TableColumn } from '../../types';
import type {
  TableColumnWithRender,
  TableColumnWithField,
} from '../../types/TableColumn';
import type { Renderable } from '../../../types/Renderable';

import { join } from '../../../../utils/join';

import { TableCell, TableCellClassName } from './TableCell';

import { ICSS } from '../../../../style/utilities';
import { internalProps } from '../../internalProps';
import { TableColumnCellProps } from './TableCellTypes';
import { useCellClassName } from '../../hooks/useCellClassName';

const { rootClassName } = internalProps;
const baseCls = `${rootClassName}ColumnCell`;

function isColumnWithField<T>(
  c: TableColumn<T>,
): c is TableColumnWithField<T> & TableColumn<T> {
  return typeof (c as TableColumnWithField<T>).field === 'string';
}
function isColumnWithRender<T>(
  c: TableColumn<T>,
): c is TableColumnWithRender<T> & TableColumn<T> {
  return (c as TableColumnWithRender<T>).render instanceof Function;
}

function TableColumnCellFn<T>(props: TableColumnCellProps<T>) {
  const {
    enhancedData,
    column,
    offsetProperty,
    virtualized,
    rowIndex,
    domRef,
  } = props;

  const { data } = enhancedData;
  const value = isColumnWithField(column) ? data?.[column.field] : null;

  let renderValue: Renderable = isColumnWithRender(column)
    ? column.render({
        value,
        rowIndex,
        column,
        enhancedData,
        data,
      })
    : value;

  return (
    <TableCell<T>
      domRef={domRef}
      offsetProperty={offsetProperty}
      data-name={`Cell`}
      data-column-id={column.id}
      data-column-index={column.computedVisibleIndex}
      column={column}
      offset={virtualized ? 0 : column.computedPinningOffset}
      style={{
        width: column.computedWidth,
      }}
      cssEllipsis={column.cssEllipsis ?? true}
      className={join(
        ICSS.position.absolute,
        ICSS.height['100%'],
        ICSS.top[0],
        useCellClassName(column, [baseCls, TableCellClassName]),
      )}
    >
      {renderValue}
    </TableCell>
  );
}

// export const TableColumnCell = TableColumnCellFn;
export const TableColumnCell = React.memo(
  TableColumnCellFn,
) as typeof TableColumnCellFn;
