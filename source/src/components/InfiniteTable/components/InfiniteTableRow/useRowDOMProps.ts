import {
  CSSProperties,
  MutableRefObject,
  RefCallback,
  useCallback,
  useRef,
} from 'react';

import { ICSS } from '../../../../style/utilities';
import { join } from '../../../../utils/join';
import {
  InfiniteTableRowClassName,
  InfiniteTableRowClassName__hover,
} from './InfiniteTableRowClassName';

import type { InfiniteTableRowProps } from './InfiniteTableRowTypes';
import { InfiniteTableComponentState } from '../../types/InfiniteTableState';
import { InfiniteTableRowStyleFnRenderParams } from '../../types/InfiniteTableProps';

export type TableRowHTMLAttributes = React.HTMLAttributes<HTMLDivElement> & {
  'data-virtualize-columns': 'on' | 'off';
  'data-row-index': number;
  'data-row-id': string;
  ref: RefCallback<HTMLElement | null>;
};

export function useRowDOMProps<T>(
  props: InfiniteTableRowProps<T>,
  rowProps: InfiniteTableComponentState<T>['rowProps'],
  rowStyle: InfiniteTableComponentState<T>['rowStyle'],
  rowClassName: InfiniteTableComponentState<T>['rowClassName'],
  tableDOMRef: MutableRefObject<HTMLDivElement | null>,
): {
  domProps: TableRowHTMLAttributes;
  domRef: MutableRefObject<HTMLElement | null>;
} {
  const domProps = props.domProps;
  const {
    showZebraRows = false,
    rowIndex,
    domRef: domRefFromProps,
    enhancedData,
  } = props;

  const domRef = useRef<HTMLElement | null>(null);
  const rowDOMRef = useCallback((node) => {
    domRefFromProps(node);
    domRef.current = node;
  }, []);

  const rowPropsAndStyleArgs: InfiniteTableRowStyleFnRenderParams<T> = {
    data: enhancedData.data,
    enhancedData,
    rowIndex,
    groupRowsBy: enhancedData.groupBy,
  };

  if (typeof rowProps === 'function') {
    rowProps = rowProps(rowPropsAndStyleArgs);
  }

  let style: CSSProperties | undefined = rowProps ? rowProps.style : undefined;

  if (rowStyle) {
    style =
      typeof rowStyle === 'function'
        ? { ...style, ...rowStyle(rowPropsAndStyleArgs) }
        : { ...style, ...rowStyle };
  }

  const odd =
    (enhancedData.indexInAll != null ? enhancedData.indexInAll : rowIndex) %
      2 ===
    1;

  let rowComputedClassName =
    typeof rowClassName === 'function'
      ? rowClassName(rowPropsAndStyleArgs)
      : rowClassName;

  const className = join(
    ICSS.position.absolute,
    ICSS.top[0],
    ICSS.left[0],
    InfiniteTableRowClassName,
    `${InfiniteTableRowClassName}--${
      enhancedData.isGroupRow ? 'group' : 'normal'
    }-row`,
    showZebraRows
      ? `${InfiniteTableRowClassName}--${odd ? 'odd' : 'even'}`
      : null,
    domProps?.className,
    rowProps?.className,
    rowComputedClassName,
  );

  const initialMouseEnter = rowProps?.onMouseEnter;
  const initialMouseLeave = rowProps?.onMouseLeave;

  const onMouseEnter = useCallback(
    (event) => {
      initialMouseEnter?.(event);

      const rowIndex = event.currentTarget?.dataset.rowIndex;

      const parentNode = tableDOMRef.current;

      if (!parentNode) {
        return;
      }

      const rows = parentNode.querySelectorAll(
        `.${InfiniteTableRowClassName}[data-row-index="${rowIndex}"]`,
      );
      rows.forEach((row) =>
        row.classList.add(InfiniteTableRowClassName__hover),
      );
    },
    [initialMouseEnter],
  );

  const onMouseLeave = useCallback(
    (event) => {
      initialMouseLeave?.(event);

      const rowIndex = event.currentTarget?.dataset.rowIndex;

      const parentNode = tableDOMRef.current;

      if (!parentNode) {
        return;
      }

      const rows = parentNode.querySelectorAll(
        `.${InfiniteTableRowClassName}[data-row-index="${rowIndex}"]`,
      );
      rows.forEach((row) =>
        row.classList.remove(InfiniteTableRowClassName__hover),
      );
    },
    [initialMouseLeave],
  );

  return {
    domRef,
    domProps: {
      ...rowProps,
      ...domProps,
      style,
      'data-virtualize-columns': props.virtualizeColumns ? 'on' : 'off',
      'data-row-index': rowIndex,
      'data-row-id': `${enhancedData.id}`,
      className,
      onMouseEnter,
      onMouseLeave,
      ref: rowDOMRef,
    },
  };
}
