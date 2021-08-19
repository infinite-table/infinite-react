import * as React from 'react';

import type { InfiniteTableRowProps } from './InfiniteTableRowTypes';

import { InfiniteTableColumnCell } from './InfiniteTableColumnCell';
import { VirtualBrain } from '../../../VirtualBrain';
import { useRowDOMProps } from './useRowDOMProps';
import { useInfiniteTable } from '../../hooks/useInfiniteTable';

function TableRowUnvirtualizedFn<T>(
  props: InfiniteTableRowProps<T> & {
    brain: VirtualBrain | null | undefined;
  },
) {
  const { rowHeight, rowWidth, enhancedData, rowIndex, columns } = props;

  const tableContextValue = useInfiniteTable<T>();

  const { componentState } = tableContextValue;
  const { domRef: tableDOMRef } = componentState;
  const { domProps } = useRowDOMProps(
    props,
    componentState.rowProps,
    tableDOMRef,
  );

  const style = {
    width: rowWidth,
    height: rowHeight,
  };

  const children = columns.map((col) => {
    return (
      <InfiniteTableColumnCell<T>
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
