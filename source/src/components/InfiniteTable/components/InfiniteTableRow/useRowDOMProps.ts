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
  InfiniteTableElement__hover,
} from './InfiniteTableRowClassName';

import type { InfiniteTableRowProps } from './InfiniteTableRowTypes';
import { InfiniteTableState } from '../../types/InfiniteTableState';
import { InfiniteTableRowStyleFnParams } from '../../types/InfiniteTableProps';

export type TableRowHTMLAttributes = React.HTMLAttributes<HTMLDivElement> & {
  'data-virtualize-columns': 'on' | 'off';
  'data-hover-index': number;
  'data-row-index': number;
  'data-row-id': string;
  ref: RefCallback<HTMLElement | null>;
} & any;

export function useRowDOMProps<T>(
  props: InfiniteTableRowProps<T>,
  rowProps: InfiniteTableState<T>['rowProps'],
  rowStyle: InfiniteTableState<T>['rowStyle'],
  rowClassName: InfiniteTableState<T>['rowClassName'],
  groupRenderStrategy: InfiniteTableState<T>['groupRenderStrategy'],
  tableDOMRef: MutableRefObject<HTMLDivElement | null>,
): {
  domProps: TableRowHTMLAttributes;
  domRef: MutableRefObject<HTMLElement | null>;
} {
  const domProps = props.domProps;
  const {
    showZebraRows = false,
    showHoverRows = false,
    rowIndex,
    domRef: domRefFromProps,
    enhancedData,
  } = props;

  const domRef = useRef<HTMLElement | null>(null);
  const rowDOMRef = useCallback((node) => {
    domRefFromProps(node);
    domRef.current = node;
  }, []);

  const rowPropsAndStyleArgs: InfiniteTableRowStyleFnParams<T> = {
    data: enhancedData.data,
    enhancedData,
    rowIndex,
    groupRowsBy: enhancedData.groupBy,
  };

  if (typeof rowProps === 'function') {
    rowProps = rowProps(rowPropsAndStyleArgs);
  }

  let style: CSSProperties | undefined = rowProps ? rowProps.style : undefined;

  const inlineGroupRoot =
    groupRenderStrategy === 'inline' && enhancedData.indexInGroup === 0;

  if (rowStyle) {
    style =
      typeof rowStyle === 'function'
        ? { ...style, ...rowStyle(rowPropsAndStyleArgs) }
        : { ...style, ...rowStyle };
  }

  if (inlineGroupRoot) {
    style = style || {};
    //TODO remove this harcoded value - should be datasource size - ...
    style.zIndex = 2_000_000 - enhancedData.indexInAll;
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
    inlineGroupRoot ? `${InfiniteTableRowClassName}--inline-group-row` : '',
    showZebraRows
      ? `${InfiniteTableRowClassName}--${odd ? 'odd' : 'even'}`
      : null,
    showHoverRows ? `${InfiniteTableRowClassName}--show-hover` : null,
    domProps?.className,
    rowProps?.className,
    rowComputedClassName,
  );

  const initialMouseEnter = rowProps?.onMouseEnter;
  const initialMouseLeave = rowProps?.onMouseLeave;

  // const parentIndex = brain.getItemSpanParent(rowIndex);
  // const covered = parentIndex !== rowIndex;

  const onMouseEnter = useCallback(
    (event) => {
      initialMouseEnter?.(event);

      const rowIndex = event.currentTarget?.dataset.rowIndex * 1;

      const parentNode = tableDOMRef.current;

      if (!parentNode || !showHoverRows) {
        return;
      }

      const hoverSelector = [
        `.${InfiniteTableRowClassName}[data-hover-index="${rowIndex}"]`,
      ];

      const rows = parentNode.querySelectorAll(hoverSelector.join(','));
      rows.forEach((row) => row.classList.add(InfiniteTableElement__hover));
    },
    [initialMouseEnter, showHoverRows],
  );

  const onMouseLeave = useCallback(
    (event) => {
      initialMouseLeave?.(event);

      const rowIndex = event.currentTarget?.dataset.rowIndex;

      const parentNode = tableDOMRef.current;

      if (!parentNode || !showHoverRows) {
        return;
      }

      const hoverSelector = [
        `.${InfiniteTableRowClassName}[data-hover-index="${rowIndex}"]`,
      ];
      const rows = parentNode.querySelectorAll(hoverSelector.join(','));
      rows.forEach((row) => row.classList.remove(InfiniteTableElement__hover));
    },
    [initialMouseLeave, showHoverRows],
  );

  return {
    domRef,
    domProps: {
      ...rowProps,
      ...domProps,
      style,
      'data-virtualize-columns': props.virtualizeColumns ? 'on' : 'off',
      'data-row-index': rowIndex,

      // 'data-hover-index': covered ? null : rowIndex,
      'data-hover-index': rowIndex,
      'data-row-id': `${enhancedData.id}`,
      className,
      onMouseEnter,
      onMouseLeave,
      ref: rowDOMRef,
    },
  };
}
