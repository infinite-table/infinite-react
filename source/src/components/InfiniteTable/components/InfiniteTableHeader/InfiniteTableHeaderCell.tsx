import * as React from 'react';
import { useCallback, useContext, useEffect, useRef } from 'react';
import { join } from '../../../../utils/join';

import {
  InfiniteTableCell,
  InfiniteTableCellClassName,
} from '../InfiniteTableRow/InfiniteTableCell';
import {
  InfiniteTableColumnHeaderParams,
  InfiniteTableComputedColumn,
  InfiniteTableHeaderCellContextType,
} from '../../types/InfiniteTableColumn';
import { internalProps } from '../../internalProps';
import { useColumnPointerEvents } from '../../hooks/useColumnPointerEvents';
import { setupResizeObserver } from '../../../ResizeObserver';
import { InfiniteTableHeaderCellProps } from '../InfiniteTableRow/InfiniteTableCellTypes';
import { useCellClassName } from '../../hooks/useCellClassName';

import { useInfiniteTable } from '../../hooks/useInfiniteTable';
import { createPortal } from 'react-dom';
import { SortIcon } from '../icons/SortIcon';
import { cursor, userSelect } from '../../utilities.css';
import {
  CellCls,
  HeaderCellRecipe,
  HeaderCellProxy,
  HeaderSortIconCls,
} from './header.css';
import { RenderHookComponent } from '../../utils/RenderHookComponent';

export const InfiniteTableHeaderCellContext = React.createContext<
  InfiniteTableHeaderCellContextType<any>
>(null as any as InfiniteTableHeaderCellContextType<any>);

const defaultStyle: React.CSSProperties = {
  position: 'absolute' as 'absolute',
  top: 0,
};

const { rootClassName } = internalProps;

export const InfiniteTableHeaderCellClassName = `${rootClassName}HeaderCell`;

export function InfiniteTableHeaderCell<T>(
  props: InfiniteTableHeaderCellProps<T>,
) {
  const column: InfiniteTableComputedColumn<T> = props.column;
  const columns: Map<string, InfiniteTableComputedColumn<T>> = props.columns;
  const { onResize, virtualized = true, headerHeight } = props;
  let { cssPosition, offset: offsetFromProps } = props;

  if (virtualized === false) {
    cssPosition = cssPosition ?? 'relative';
    offsetFromProps = offsetFromProps ?? 0;
  }

  const sortInfo = column.computedSortInfo;

  let header = column.header;

  const ref = useCallback(
    (node: HTMLElement | null) => {
      domRef.current = node;
      props.domRef?.(node);
    },
    [props.domRef],
  );
  const sortTool = (
    <SortIcon
      index={
        column.computedMultiSort ? column.computedSortIndex + 1 : undefined
      }
      className={`${InfiniteTableHeaderCellClassName}__sort-icon ${HeaderSortIconCls}`}
      direction={
        column.computedSorted ? (column.computedSortedAsc ? 1 : -1) : 0
      }
    />
  );

  const renderParam: InfiniteTableColumnHeaderParams<T> = {
    domRef: ref,
    column,
    columnSortInfo: sortInfo,
    sortTool,
  };

  const renderChildren = () => {
    if (header instanceof Function) {
      header = (
        <RenderHookComponent render={header} renderParam={renderParam} />
      );
    }
    header = header ?? column.name;

    return header;
  };

  const domRef = useRef<HTMLElement | null>(null);

  const {
    computed: { computedRemainingSpace },
    componentState: { portalDOMRef },
  } = useInfiniteTable<T>();

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

  let style: React.CSSProperties = {
    ...defaultStyle,
    position: cssPosition ?? 'absolute',
    height: headerHeight,
  };

  const { onPointerDown, onPointerUp, dragging, draggingDiff, proxyOffset } =
    useColumnPointerEvents({
      computedRemainingSpace,
      columnId: column.id,
      domRef,
      columns,
    });

  let offset: number =
    offsetFromProps ?? (virtualized ? 0 : column.computedPinningOffset);

  let draggingProxy = null;

  if (dragging) {
    draggingProxy = (
      <div
        className={`${InfiniteTableHeaderCellClassName}Proxy ${HeaderCellProxy}`}
        style={{
          position: 'absolute',
          height: headerHeight,
          width: column.computedWidth,
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
  const ContextProvider =
    InfiniteTableHeaderCellContext.Provider as React.Provider<
      InfiniteTableHeaderCellContextType<T>
    >;

  return (
    <ContextProvider value={renderParam}>
      <InfiniteTableCell<T>
        domRef={ref}
        cellType="header"
        column={column}
        data-name={`HeaderCell`}
        data-column-id={column.id}
        style={style}
        offset={offset}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        className={join(
          InfiniteTableHeaderCellClassName,
          userSelect.none,
          column.computedSortable ? cursor.pointer : '',

          useCellClassName(
            column,
            [InfiniteTableHeaderCellClassName, InfiniteTableCellClassName],
            HeaderCellRecipe,
            { dragging },
          ),
          CellCls,
        )}
        cssEllipsis={column.headerCssEllipsis ?? column.cssEllipsis ?? true}
        afterChildren={sortTool}
        renderChildren={renderChildren}
      />
      {draggingProxy}
    </ContextProvider>
  );
}

export function useInfiniteHeaderCell<T>() {
  const result = useContext(
    InfiniteTableHeaderCellContext,
  ) as InfiniteTableHeaderCellContextType<T>;

  return result;
}
