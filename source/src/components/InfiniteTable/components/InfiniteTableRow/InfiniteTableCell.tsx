import * as React from 'react';

import { join } from '../../../../utils/join';
import { useInfiniteTableState } from '../../hooks/useInfiniteTableState';
import { internalProps } from '../../internalProps';
import {
  cssEllipsisClassName,
  justifyContent,
  overflow,
} from '../../utilities.css';
import { ColumnCellCls, CellClsVariants } from '../cell.css';

import { InfiniteTableCellProps } from './InfiniteTableCellTypes';

const { rootClassName } = internalProps;

export const InfiniteTableCellClassName = `${rootClassName}Cell`;
export const InfiniteTableCellContentClassName = `${rootClassName}Cell_content`;

function InfiniteTableCellFn<T>(
  props: InfiniteTableCellProps<T> & React.HTMLAttributes<HTMLElement>,
) {
  const {
    cssEllipsis = true,
    virtualized = true,
    skipColumnShifting = false,
    offsetProperty = 'left',
    contentStyle,
    column,
    domRef,
    width,

    contentClassName,

    afterChildren,
    beforeChildren,
    offset,
    cellType,
    cssPosition: _cssPosition,
    renderChildren,
    ...domProps
  } = props;

  const children = renderChildren();

  // TODO very important - dont access any context here,
  // otherwise we'll be re-rendering all cells every time
  // something changes, and this could be very costly for performance
  // so remove the call to useInfiniteTableState
  const { columnShifts } = useInfiniteTableState();
  // const columnShifts = null;

  const shifting = !!columnShifts;
  const style: React.CSSProperties = {
    width,
    ...domProps.style,
  };

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

  const finalDOMProps = {
    ...domProps,
    style,
    // do not remove this from here, as it's being used by auto sizing - the `useAutoSizeColumns` fn hook
    'data-column-id': column.id,
    className: join(
      domProps.className,

      justifyContent[column.align ?? 'start'],
      InfiniteTableCellClassName,
      ColumnCellCls,
      shifting
        ? `${InfiniteTableCellClassName}--shifting ${CellClsVariants.shifting}`
        : '',
    ),
    children: (
      <>
        {beforeChildren}
        {
          <div
            className={join(
              InfiniteTableCellContentClassName,
              cssEllipsis ? cssEllipsisClassName : overflow.hidden,
              contentClassName,
            )}
            style={contentStyle}
          >
            {children}
          </div>
        }
        {afterChildren}
      </>
    ),
  };

  const RenderComponent =
    cellType === 'body'
      ? column.components?.ColumnCell
      : column.components?.HeaderCell;
  if (RenderComponent) {
    return <RenderComponent {...finalDOMProps} />;
  }
  return <div {...finalDOMProps} ref={domRef} />;
}

export const InfiniteTableCell = React.memo(
  InfiniteTableCellFn,
) as typeof InfiniteTableCellFn;
// export const TableCell = TableCellFn;
