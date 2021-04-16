import * as React from 'react';

import type { TableRowProps } from './TableRowTypes';

import { TableColumnCell } from './TableColumnCell';
import { VirtualBrain } from '../../../VirtualBrain';
import { useRowDOMProps } from './useRowDOMProps';
import { useTable } from '../../hooks/useTable';

function TableRowUnvirtualizedFn<T>(
  props: TableRowProps<T> & {
    brain: VirtualBrain | null | undefined;
  },
) {
  const { rowHeight, rowWidth, enhancedData, rowIndex, columns } = props;

  const tableContextValue = useTable<T>();
  const { props: tableProps, domRef: tableDOMRef } = tableContextValue;
  const { domProps } = useRowDOMProps(props, tableProps, tableDOMRef);

  const style = {
    width: rowWidth,
    height: rowHeight,
  };

  const children = columns.map((col) => {
    return (
      <TableColumnCell<T>
        key={col.id}
        virtualized={false}
        enhancedData={enhancedData}
        rowIndex={rowIndex}
        column={col}
      />
    );
  });

  return (
    <div {...domProps} style={style}>
      {children}
    </div>
  );
}

export const TableRowUnvirtualized = React.memo(
  TableRowUnvirtualizedFn,
) as typeof TableRowUnvirtualizedFn;
// export const TableRow = TableRowUnvirtualizedFn;
