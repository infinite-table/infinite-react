import * as React from 'react';

import { join } from '../../../../utils/join';
import { cssEllipsisClassName } from '../../../../style/css';

import { ICSS } from '../../../../style/utilities';
import { useTableState } from '../../hooks/useTableState';

import { internalProps } from '../../internalProps';
import { TableCellProps } from './TableCellTypes';

const { rootClassName } = internalProps;

export const TableCellClassName = `${rootClassName}Cell`;

function TableCellFn<T>(
  props: TableCellProps<T> & React.HTMLAttributes<HTMLElement>,
) {
  const {
    cssEllipsis = true,
    virtualized = true,
    skipColumnShifting = false,
    offsetProperty = 'left',
    column,
    domRef,
    children,
    outerChildren,
    offset,
    ...domProps
  } = props;

  const { columnShifts } = useTableState();

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
        domProps.className,

        ICSS.display.flex,
        ICSS.flexFlow.row,
        ICSS.alignItems.center,

        ICSS.justifyContent[
          (column.align === 'center'
            ? column.align
            : `flex-${column.align}`) as 'flex-start' | 'flex-end' | 'center'
        ],
        TableCellClassName,
        shifting ? `${TableCellClassName}--shifting` : '',
      )}
    >
      {cssEllipsis ? (
        <div className={`${rootClassName}Cell_content ${cssEllipsisClassName}`}>
          {children}
        </div>
      ) : (
        children
      )}
      {outerChildren}
    </div>
  );
}

export const TableCell = React.memo(TableCellFn) as typeof TableCellFn;
// export const TableCell = TableCellFn;
