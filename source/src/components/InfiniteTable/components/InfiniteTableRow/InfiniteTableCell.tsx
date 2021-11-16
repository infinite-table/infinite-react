import * as React from 'react';

import { join } from '../../../../utils/join';
import { useInfiniteTableState } from '../../hooks/useInfiniteTableState';

import { internalProps } from '../../internalProps';
import { InfiniteTableCellProps } from './InfiniteTableCellTypes';
import { cellStyle, columnAlignCellStyle } from './style.css';
import { cssEllipsisClassName, justifyContent } from '../../utilities.css';

const { rootClassName } = internalProps;

export const InfiniteTableCellClassName = `${rootClassName}Cell`;

function InfiniteTableCellFn<T>(
  props: InfiniteTableCellProps<T> & React.HTMLAttributes<HTMLElement>,
) {
  const {
    cssEllipsis = true,
    virtualized = true,
    skipColumnShifting = false,
    offsetProperty = 'left',
    column,
    domRef,
    children,
    afterChildren,
    beforeChildren,
    offset,
    ...domProps
  } = props;

  const { columnShifts } = useInfiniteTableState();

  const shifting = !!columnShifts;
  const style: React.CSSProperties = {
    width: column.computedWidth,
    left: offset ?? 0,
    ...domProps.style,
  };

  // if (column.computedPinned === 'end') {
  // style.background = 'red';
  // }

  if (
    !skipColumnShifting &&
    columnShifts &&
    columnShifts[column.computedVisibleIndex]
  ) {
    const shiftLeft = columnShifts[column.computedVisibleIndex] + (offset ?? 0);
    if (virtualized) {
      style.left = shiftLeft;
    } else {
      style.transform = `translate3d(${shiftLeft}px, 0px, 0px)`;
    }
  }

  return (
    <div
      {...domProps}
      ref={domRef}
      style={style}
      data-name={`Cell`}
      className={join(
        cellStyle,
        domProps.className,

        columnAlignCellStyle[column.align ?? 'start'],
        justifyContent[column.align ?? 'start'],
        InfiniteTableCellClassName,
        shifting ? `${InfiniteTableCellClassName}--shifting` : '',
      )}
    >
      {beforeChildren}
      {cssEllipsis ? (
        <div className={`${rootClassName}Cell_content ${cssEllipsisClassName}`}>
          {children}
        </div>
      ) : (
        children
      )}
      {afterChildren}
    </div>
  );
}

export const InfiniteTableCell = React.memo(
  InfiniteTableCellFn,
) as typeof InfiniteTableCellFn;
// export const TableCell = TableCellFn;
