import { useRef } from 'react';
import * as React from 'react';

import { join } from '../../../../utils/join';

import { InfiniteTableHeaderCell } from './InfiniteTableHeaderCell';

import { ICSS } from '../../../../style/utilities';

import type { InfiniteTableComputedValues } from '../../types';

import { useInfiniteTable } from '../../hooks/useInfiniteTable';

import { internalProps } from '../../internalProps';
import { InfiniteTableHeaderUnvirtualizedProps } from './InfiniteTableHeaderTypes';

const { rootClassName } = internalProps;
export const TableHeaderClassName = `${rootClassName}Header`;

function InfiniteTableHeaderUnvirtualizedFn<T>(
  props: InfiniteTableHeaderUnvirtualizedProps<T> &
    React.HTMLAttributes<HTMLDivElement>,
) {
  const { columns, totalWidth, onResize, ...domProps } = props;
  const { computed } = useInfiniteTable<T>();

  const computedRef = useRef<InfiniteTableComputedValues<T>>(computed);
  computedRef.current = computed;

  const domRef = React.useRef<HTMLDivElement | null>(null);

  const columnsMap = computedRef.current.computedVisibleColumnsMap;
  const cells = columns.map((c, i) => {
    return (
      <InfiniteTableHeaderCell<T>
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

export const InfiniteTableHeaderUnvirtualized = React.memo(
  InfiniteTableHeaderUnvirtualizedFn,
) as typeof InfiniteTableHeaderUnvirtualizedFn;
// export const TableHeader = TableHeaderFn; //React.memo(TableHeaderFn) as typeof TableHeaderFn;
