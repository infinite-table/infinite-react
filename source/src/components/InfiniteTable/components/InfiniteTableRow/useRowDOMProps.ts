import { MutableRefObject, RefCallback, useCallback, useRef } from 'react';

import { ICSS } from '../../../../style/utilities';
import { join } from '../../../../utils/join';
import {
  InfiniteTableRowClassName,
  InfiniteTableRowClassName__hover,
} from './InfiniteTableRowClassName';

import type { InfiniteTableOwnProps } from '../../types';
import type { InfiniteTableRowProps } from './InfiniteTableRowTypes';

export type TableRowHTMLAttributes = React.HTMLAttributes<HTMLDivElement> & {
  'data-virtualize-columns': 'on' | 'off';
  'data-row-index': number;
  ref: RefCallback<HTMLElement | null>;
};

export function useRowDOMProps<T>(
  props: InfiniteTableRowProps<T>,
  tableProps: InfiniteTableOwnProps<T>,
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

  let rowProps = tableProps.rowProps;

  if (typeof rowProps === 'function') {
    rowProps = rowProps({ rowIndex, data: props.enhancedData.data });
  }

  const odd =
    (enhancedData.indexInGroup != null ? enhancedData.indexInGroup : rowIndex) %
      2 ===
    1;

  const className = join(
    ICSS.position.absolute,
    ICSS.top[0],
    ICSS.left[0],
    InfiniteTableRowClassName,
    `${InfiniteTableRowClassName}--${
      enhancedData.isGroupRow ? 'group' : 'normal'
    }-row`,
    showZebraRows && !enhancedData.isGroupRow
      ? `${InfiniteTableRowClassName}--${odd ? 'odd' : 'even'}`
      : null,
    domProps?.className,
    rowProps?.className,
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
      'data-virtualize-columns': props.virtualizeColumns ? 'on' : 'off',
      'data-row-index': rowIndex,
      className,
      onMouseEnter,
      onMouseLeave,
      ref: rowDOMRef,
    },
  };
}
