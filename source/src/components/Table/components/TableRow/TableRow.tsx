import * as React from 'react';
import { useEffect, useRef } from 'react';

import { useTable } from '../../hooks/useTable';
import { TableColumnCell } from './TableColumnCell';

import { useRowDOMProps } from './useRowDOMProps';

import { TableRowClassName } from './TableRowClassName';

import type { TableComputedValues } from '../../types';
import type { TableRowProps } from './TableRowTypes';
import { RawList } from '../../../RawList';
import { RenderItem } from '../../../RawList/types';

function TableRowFn<T>(
  props: TableRowProps<T> & React.HTMLAttributes<HTMLDivElement>,
) {
  const {
    rowWidth,
    rowHeight,

    enhancedData,
    rowIndex,
    repaintId,
    //TODO continue here receive columnWidth from props
    brain,
    columns,
  } = props;
  const tableContextValue = useTable<T>();

  useEffect(() => {
    return () => {};
  }, []);

  const {
    computed,
    props: tableProps,
    domRef: tableDOMRef,
  } = tableContextValue;

  const { domProps } = useRowDOMProps(props, tableProps, tableDOMRef);

  const computedRef = useRef<TableComputedValues<T>>(computed);
  computedRef.current = computed;

  const style = {
    width: rowWidth,
    height: rowHeight,
  };

  const renderCellRef = useRef<any>(null);
  const renderCell: RenderItem = React.useCallback(
    ({ domRef, itemIndex }) => {
      const column = columns[itemIndex];

      return (
        <TableColumnCell<T>
          enhancedData={enhancedData}
          virtualized
          rowIndex={rowIndex}
          domRef={domRef}
          column={column}
        />
      );
    },
    [columns, rowIndex, repaintId],
  );

  if (renderCellRef.current !== renderCell) {
    renderCellRef.current = renderCell;
  }
  // (renderCell as any)._colscount = columns.length;

  // (globalThis as any).renderCell = renderCell;

  if (__DEV__) {
    (domProps as any)['data-cmp-name'] = 'ITableRow';
  }

  return (
    <div {...domProps} style={style}>
      <RawList
        brain={brain}
        renderItem={renderCell}
        debugChannel={`${rowIndex}`}
      />
    </div>
  );
}

export const TableRow = React.memo(TableRowFn) as typeof TableRowFn;

export { TableRowClassName };
