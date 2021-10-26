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
  const {
    rowHeight,
    rowWidth,
    getData,
    enhancedData,
    rowIndex,
    columns,
    toggleGroupRow,
  } = props;

  const tableContextValue = useInfiniteTable<T>();

  const { componentState } = tableContextValue;
  const { domRef: tableDOMRef } = componentState;
  const { domProps } = useRowDOMProps(
    props,
    componentState.rowProps,
    componentState.rowStyle,
    componentState.rowClassName,
    componentState.groupRenderStrategy,
    tableDOMRef,
  );

  const style = {
    width: rowWidth,
    height: rowHeight,
    ...domProps.style,
  };

  const children = columns.map((col) => {
    return (
      <InfiniteTableColumnCell<T>
        key={col.id}
        virtualized={false}
        rowHeight={rowHeight}
        getData={getData}
        toggleGroupRow={toggleGroupRow}
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
