//@ts-nocheck
import {
  CSSProperties,
  MutableRefObject,
  RefCallback,
  useCallback,
  useRef,
} from 'react';

import { join } from '../../../../utils/join';
import { stripVar } from '../../../../utils/stripVar';
import { ThemeVars } from '../../theme.css';
import { InfiniteTableRowStylingFnParams } from '../../types/InfiniteTableProps';
import { InfiniteTableState } from '../../types/InfiniteTableState';

import {
  InfiniteTableRowClassName,
  InfiniteTableRowClassName__hover,
} from './InfiniteTableRowClassName';
import type { InfiniteTableRowProps } from './InfiniteTableRowTypes';
import { RowClsRecipe, RowHoverCls } from './row.css';

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
    rowInfo,
    rowSpan,
  } = props;

  const domRef = useRef<HTMLElement | null>(null);
  const rowDOMRef = useCallback((node) => {
    domRefFromProps(node);
    domRef.current = node;
  }, []);

  // TS hack to discriminate between for grouped vs non-grouped rows
  const rest = rowInfo.isGroupRow
    ? { data: rowInfo.data, rowInfo }
    : { data: rowInfo.data, rowInfo };

  const rowPropsAndStyleArgs: InfiniteTableRowStylingFnParams<T> = {
    ...rest,
    rowIndex,
  };

  if (typeof rowProps === 'function') {
    rowProps = rowProps(rowPropsAndStyleArgs);
  }

  let style: CSSProperties | undefined = rowProps ? rowProps.style : undefined;

  const inlineGroupRoot =
    groupRenderStrategy === 'inline' && rowInfo.indexInGroup === 0;

  if (rowStyle) {
    style =
      typeof rowStyle === 'function'
        ? { ...style, ...rowStyle(rowPropsAndStyleArgs) }
        : { ...style, ...rowStyle };
  }

  if (inlineGroupRoot || rowSpan) {
    style = style || {};
    //TODO remove this harcoded value - should be datasource size - ...
    style.zIndex = 2_000_000 - rowInfo.indexInAll;
  }

  const odd =
    (rowInfo.indexInAll != null ? rowInfo.indexInAll : rowIndex) % 2 === 1;

  const rowComputedClassName =
    typeof rowClassName === 'function'
      ? rowClassName(rowPropsAndStyleArgs)
      : rowClassName;

  const className = join(
    InfiniteTableRowClassName,

    RowClsRecipe({
      groupRow: rowInfo.isGroupRow,
      inlineGroupRow: inlineGroupRoot,
      zebra: showHoverRows ? (odd ? 'odd' : 'even') : false,
      showHoverRows,
    }),
    `${InfiniteTableRowClassName}--${
      rowInfo.isGroupRow ? 'group' : 'normal'
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

      rows.forEach((row) =>
        row.classList.add(InfiniteTableRowClassName__hover, RowHoverCls),
      );
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
      rows.forEach((row) =>
        row.classList.remove(InfiniteTableRowClassName__hover, RowHoverCls),
      );
    },
    [initialMouseLeave, showHoverRows],
  );

  if (rowInfo.dataSourceHasGrouping) {
    style = style || {};
    //@ts-ignore
    style[stripVar(ThemeVars.components.Row.groupNesting)] =
      rowInfo.groupNesting! - 1;
  }
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
      'data-row-id': `${rowInfo.id}`,
      className,
      onMouseEnter,
      onMouseLeave,
      ref: rowDOMRef,
    },
  };
}
