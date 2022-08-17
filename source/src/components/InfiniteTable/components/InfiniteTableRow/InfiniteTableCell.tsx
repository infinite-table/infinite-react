import * as React from 'react';

import { join } from '../../../../utils/join';
import { stripVar } from '../../../../utils/stripVar';

import { internalProps } from '../../internalProps';
import { InternalVars } from '../../theme.css';
import {
  cssEllipsisClassName,
  justifyContent,
  overflow,
} from '../../utilities.css';
import { ColumnCellCls } from '../cell.css';

import { InfiniteTableCellProps } from './InfiniteTableCellTypes';

const { rootClassName } = internalProps;

export const InfiniteTableCellClassName = `${rootClassName}Cell`;
export const InfiniteTableCellContentClassName = `${rootClassName}Cell_content`;

const columnWidthAtIndex = stripVar(InternalVars.columnWidthAtIndex);
const columnReorderEffectDurationAtIndex = stripVar(
  InternalVars.columnReorderEffectDurationAtIndex,
);

function InfiniteTableCellFn<T>(
  props: InfiniteTableCellProps<T> & React.HTMLAttributes<HTMLElement>,
) {
  const {
    cssEllipsis = true,
    virtualized = true,
    skipColumnShifting = false,

    contentStyle,
    column,
    domRef,
    width,

    contentClassName,

    rowId,

    afterChildren,
    beforeChildren,

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
  const style = {
    width: `var(${columnWidthAtIndex}-${column.computedVisibleIndex})`,
    transition: `transform var(${columnReorderEffectDurationAtIndex}-${column.computedVisibleIndex}, 0s)`,
    ...domProps.style,
  } as React.CSSProperties;

  const finalDOMProps = {
    ...domProps,
    style,

    // do not remove this from here, as it's being used by auto sizing - the `useAutoSizeColumns` fn hook
    'data-column-id': column.id,
    'data-z-index': style.zIndex,
    className: join(
      domProps.className,

      justifyContent[column.align ?? 'start'],
      InfiniteTableCellClassName,
      ColumnCellCls,
      // shifting
      //   ? `${InfiniteTableCellClassName}--shifting ${CellClsVariants.shifting}`
      //   : '',
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

  if (rowId != null) {
    //@ts-ignore
    finalDOMProps['data-row-id'] = `${rowId}`;
  }

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
