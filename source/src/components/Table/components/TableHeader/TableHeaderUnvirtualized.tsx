import { useRef } from 'react';
import * as React from 'react';

import { join } from '../../../../utils/join';

import { TableHeaderCell } from './TableHeaderCell';

import { ICSS } from '../../../../style/utilities';

import type { TableComputedValues } from '../../types';

import { useTable } from '../../hooks/useTable';

import { internalProps } from '../../internalProps';
import { TableHeaderUnvirtualizedProps } from './TableHeaderTypes';

const { rootClassName } = internalProps;
export const TableHeaderClassName = `${rootClassName}Header`;

function TableHeaderUnvirtualizedFn<T>(
  props: TableHeaderUnvirtualizedProps<T> &
    React.HTMLAttributes<HTMLDivElement>,
) {
  const { columns, totalWidth, onResize, ...domProps } = props;
  const { computed } = useTable<T>();

  const computedRef = useRef<TableComputedValues<T>>(computed);
  computedRef.current = computed;

  const domRef = React.useRef<HTMLDivElement | null>(null);

  const columnsMap = computedRef.current.computedVisibleColumnsMap;
  const cells = columns.map((c, i) => {
    return (
      <TableHeaderCell<T>
        key={c.id}
        column={c}
        columns={columnsMap}
        virtualized={false}
        onResize={i === 0 ? onResize : undefined}
      />
    );
  });

  return (
    <div
      ref={domRef}
      {...domProps}
      className={join(
        ICSS.flexFlow.row,
        ICSS.display.flex,
        TableHeaderClassName,
        `${TableHeaderClassName}--unvirtualized`,
        domProps.className,
      )}
    >
      {cells}
    </div>
  );
}

export const TableHeaderUnvirtualized = React.memo(
  TableHeaderUnvirtualizedFn,
) as typeof TableHeaderUnvirtualizedFn;
// export const TableHeader = TableHeaderFn; //React.memo(TableHeaderFn) as typeof TableHeaderFn;
