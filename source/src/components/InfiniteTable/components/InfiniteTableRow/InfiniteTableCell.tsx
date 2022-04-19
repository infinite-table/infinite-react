import * as React from 'react';

import { join } from '../../../../utils/join';
import { useInfiniteTableState } from '../../hooks/useInfiniteTableState';

import { internalProps } from '../../internalProps';
import { InfiniteTableCellProps } from './InfiniteTableCellTypes';

import {
  cssEllipsisClassName,
  justifyContent,
  overflow,
} from '../../utilities.css';
import {
  ColumnCellCls,
  CellClsVariants,
  columnAlignCellStyle,
} from '../cell.css';

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
    column,
    domRef,
    width,

    afterChildren,
    beforeChildren,
    offset,
    cellType,
    cssPosition: _cssPosition,
    renderChildren,
    ...domProps
  } = props;

  const children = renderChildren();

  const { columnShifts } = useInfiniteTableState();

  const shifting = !!columnShifts;
  const style: React.CSSProperties = {
    width,
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

  const finalDOMProps = {
    ...domProps,
    style,
    'data-name': 'Cell',
    className: join(
      domProps.className,

      columnAlignCellStyle[column.align ?? 'start'],
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
            className={`${InfiniteTableCellContentClassName} ${
              cssEllipsis ? cssEllipsisClassName : overflow.hidden
            }`}
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
