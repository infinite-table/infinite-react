import * as React from 'react';
import type { InfiniteTableColumn } from '../../types';
import type {
  InfiniteTableColumnWithRender,
  InfiniteTableColumnWithField,
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
  const value =
    isGroupRow && groupBy && column.groupByField
      ? enhancedData.value
      : isColumnWithField(column)
      ? data?.[column.field]
      : null;

  const { componentState: computedDataSource } = useDataSourceContextValue<T>();

  let renderValue: Renderable = isColumnWithRender(column)
    ? column.render({
        value,
        rowIndex,
        column,
        enhancedData,
        toggleGroupRow,
        toggleCurrentGroupRow: () => toggleGroupRow(enhancedData.groupKeys!),
        groupRowsBy: computedDataSource.groupRowsBy,
        data,
      })
    : value;

  return (
    <InfiniteTableCell<T>
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
        useCellClassName(column, [baseCls, InfiniteTableCellClassName]),
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
