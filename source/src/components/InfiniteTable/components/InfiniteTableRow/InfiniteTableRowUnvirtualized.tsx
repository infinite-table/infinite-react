//@ts-nocheck - this file is not being used
import * as React from 'react';

import type { InfiniteTableRowProps } from './InfiniteTableRowTypes';

import { InfiniteTableColumnCell } from './InfiniteTableColumnCell';
import { VirtualBrain } from '../../../VirtualBrain';
import { useRowDOMProps } from './useRowDOMProps';
import { useInfiniteTable } from '../../hooks/useInfiniteTable';

function TableRowUnvirtualizedFn<T>(
  props: InfiniteTableRowProps<T> & {
    brain: VirtualBrain | null | undefined;
    verticalBrain: VirtualBrain;
  },
) {
  const {
    rowHeight,
    rowWidth,
    getData,
    rowInfo,
    rowIndex,
    columns,
    toggleGroupRow,
  } = props;

  const tableContextValue = useInfiniteTable<T>();

  const { state: componentState } = tableContextValue;
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
    // const parentIndex = verticalBrain.getItemSpanParent(rowIndex);
    const hidden = false; //parentIndex < rowIndex;
    return (
      <InfiniteTableColumnCell<T>
        key={col.id}
        virtualized={false}
        rowHeight={rowHeight}
        getData={getData}
        hidden={hidden}
        groupRenderStrategy={componentState.groupRenderStrategy}
        toggleGroupRow={toggleGroupRow}
        rowInfo={rowInfo}
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
