import * as React from 'react';
import { useCallback, useEffect, useRef } from 'react';

import { ICSS } from '../../../../style/utilities';

import { join } from '../../../../utils/join';

import { TableHeaderCell } from './TableHeaderCell';

import { useTable } from '../../hooks/useTable';

import { internalProps } from '../../internalProps';

import type { TableHeaderProps } from './TableHeaderTypes';

import { RawList } from '../../../RawList';

import type { RenderItem } from '../../../RawList/types';
import { ScrollPosition } from '../../../types/ScrollPosition';

import { useHeaderOnResize } from './useHeaderOnResize';

const { rootClassName } = internalProps;

export const TableHeaderClassName = `${rootClassName}Header`;

function TableHeaderFn<T>(
  props: TableHeaderProps<T> & React.HTMLAttributes<HTMLDivElement>,
) {
  const { repaintId, brain, columns, style, className, onResize } = props;
  const { computed } = useTable<T>();

  const { computedVisibleColumnsMap } = computed;

  const renderColumn: RenderItem = useCallback(
    ({ domRef, itemIndex: columnIndex }) => {
      const column = columns[columnIndex];

      if (!column) {
        debugger;
      }
      return (
        <TableHeaderCell<T>
          domRef={domRef}
          column={column}
          columns={computedVisibleColumnsMap}
        />
      );
    },
    [computedVisibleColumnsMap, columns, repaintId],
  );

  useEffect(() => {
    const onScroll = (scrollPosition: ScrollPosition) => {
      domRef.current!.style.transform = `translate3d(-${scrollPosition.scrollLeft}px, 0px, 0px)`;
    };

    const removeOnScroll = brain.onScroll(onScroll);

    return removeOnScroll;
  }, [brain]);

  const domRef = useRef<HTMLDivElement | null>(null);

  useHeaderOnResize(domRef, onResize);

  const domProps: React.HTMLProps<HTMLDivElement> = {
    ref: domRef,
    className: join(
      ICSS.flexFlow.row,
      TableHeaderClassName,
      `${TableHeaderClassName}--virtualized`,
      className,
    ),
    style,
  };

  return (
    <div {...domProps}>
      <RawList brain={brain} renderItem={renderColumn} />
    </div>
  );
}

export const TableHeader = React.memo(TableHeaderFn) as typeof TableHeaderFn;
// export const TableHeader = TableHeaderFn; //React.memo(TableHeaderFn) as typeof TableHeaderFn;
