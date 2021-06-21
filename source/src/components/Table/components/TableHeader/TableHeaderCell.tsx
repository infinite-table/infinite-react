import * as React from 'react';
import { useCallback, useEffect, useRef } from 'react';
import { join } from '../../../../utils/join';

import { TableCell, TableCellClassName } from '../TableRow/TableCell';
import { TableComputedColumn } from '../../types/TableColumn';
import { ICSS } from '../../../../style/utilities';
import { internalProps } from '../../internalProps';
import { ArrowDown } from '../icons/ArrowDown';
import { ArrowUp } from '../icons/ArrowUp';
import { useColumnPointerEvents } from '../../hooks/useColumnPointerEvents';
import { setupResizeObserver } from '../../../ResizeObserver';
import { TableHeaderCellProps } from '../TableRow/TableCellTypes';
import { useCellClassName } from '../../hooks/useCellClassName';

import { useTable } from '../../hooks/useTable';
import { createPortal } from 'react-dom';

const defaultStyle: React.CSSProperties = {
  position: 'absolute' as 'absolute',
  top: 0,
};

const { rootClassName } = internalProps;

const baseCls = `${rootClassName}HeaderCell`;

export function TableHeaderCell<T>(props: TableHeaderCellProps<T>) {
  const column: TableComputedColumn<T> = props.column;
  const columns: Map<string, TableComputedColumn<T>> = props.columns;
  const { onResize, virtualized = true } = props;

  const sortInfo = column.computedSortInfo;

  let header = column.header;
  if (header instanceof Function) {
    header = header({
      column,
      columnSortInfo: sortInfo,
    });
  }
  header = header ?? column.name;

  const sortTool = column.computedSorted ? (
    column.computedSortedAsc ? (
      <ArrowUp />
    ) : (
      <ArrowDown />
    )
  ) : null;

  // const onClick = useCallback(() => {
  // if (column.computedSortable) {
  // column.toggleSort();
  // }
  // }, [column, sortInfo]);

  const domRef = useRef<HTMLElement | null>(null);
  const ref = useCallback(
    (node: HTMLElement | null) => {
      domRef.current = node;
      props.domRef?.(node);
    },
    [props.domRef],
  );

  const {
    computed: { computedRemainingSpace },
    portalDOMRef,
  } = useTable<T>();

  useEffect(() => {
    let clearOnResize: null | (() => void) = null;
    const node = domRef.current;

    if (onResize && node) {
      clearOnResize = setupResizeObserver(node, onResize);
    }

    return () => {
      clearOnResize?.();
    };
  }, [domRef.current, props.onResize]);

  let style = { ...defaultStyle };
  const { onPointerDown, onPointerUp, dragging, draggingDiff, proxyOffset } =
    useColumnPointerEvents({
      computedRemainingSpace,
      columnId: column.id,
      domRef,
      columns,
    });

  let offset: number = virtualized ? 0 : column.computedPinningOffset;

  let draggingProxy = null;

  if (dragging) {
    draggingProxy = (
      <div
        className={`${baseCls}Proxy`}
        style={{
          position: 'absolute',
          left:
            column.computedAbsoluteOffset +
            draggingDiff.left +
            (proxyOffset?.left ?? 0),

          top: draggingDiff?.top + (proxyOffset?.top ?? 0),
          zIndex: 1,
        }}
      >
        {header}
      </div>
    );

    draggingProxy = createPortal(draggingProxy, portalDOMRef.current!);
  }

  return (
    <>
      <TableCell<T>
        domRef={ref}
        column={column}
        data-name={`HeaderCell`}
        data-column-id={column.id}
        style={style}
        offset={offset}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        className={join(
          baseCls,
          ICSS.userSelect.none,
          column.computedSortable ? ICSS.cursor.pointer : '',

          useCellClassName(column, [baseCls, TableCellClassName]),

          dragging
            ? `${TableCellClassName}--dragging ${baseCls}--dragging`
            : '',
        )}
        cssEllipsis={column.headerCssEllipsis ?? column.cssEllipsis ?? true}
        outerChildren={sortTool}
      >
        {header}
      </TableCell>
      {draggingProxy}
    </>
  );
}
