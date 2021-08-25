import { createRef, MutableRefObject } from 'react';
import { buildSubscriptionCallback } from '../../utils/buildSubscriptionCallback';
import { isControlled } from '../../utils/isControlled';
import { InfiniteTableProps, InfiniteTableState } from '../types';
import { InfiniteTableReadOnlyState } from '../types/InfiniteTableState';
import { computeColumnGroupsDepths } from './computeColumnGroupsDepths';

export function getInitialState<T>(
  props: InfiniteTableProps<T>,
): InfiniteTableState<T> {
  const headerHeightRef = createRef() as MutableRefObject<number>;
  headerHeightRef.current = 0;

  const columnGroups =
    (isControlled('columnGroups', props)
      ? props.columnGroups
      : props.defaultColumnGroups) ?? new Map();

  const collapsedColumnGroups =
    (isControlled('collapsedColumnGroups', props)
      ? props.collapsedColumnGroups
      : props.defaultCollapsedColumnGroups) ?? new Map();

  return {
    rowHeight: typeof props.rowHeight === 'number' ? props.rowHeight : 0,
    domRef: createRef(),
    bodyDOMRef: createRef(),
    portalDOMRef: createRef(),
    bodySizeRef: createRef(),
    headerHeightRef,

    onRowHeightChange: buildSubscriptionCallback<number>(),

    bodySize: {
      width: 0,
      height: 0,
    },
    scrollPosition: {
      scrollTop: 0,
      scrollLeft: 0,
    },
    draggingColumnId: null,
    columns: props.columns,
    columnOrder:
      (isControlled('columnOrder', props)
        ? props.columnOrder
        : props.defaultColumnOrder) ?? true,
    columnGroups,
    collapsedColumnGroups,
    columnGroupsDepthsMap: computeColumnGroupsDepths(columnGroups),

    columnVisibility:
      (isControlled('columnVisibility', props)
        ? props.columnVisibility
        : props.defaultColumnVisibility) ?? new Map(),
    columnPinning:
      (isControlled('columnPinning', props)
        ? props.columnPinning
        : props.defaultColumnPinning) ?? new Map(),
    columnAggregations:
      (isControlled('columnAggregations', props)
        ? props.columnAggregations
        : props.defaultColumnAggregations) ?? new Map(),
    columnShifts: null,
  };
}

export function deriveReadOnlyState<T>(
  props: InfiniteTableProps<T>,
  state: InfiniteTableState<T>,
  updated: Partial<InfiniteTableState<T>> | null,
): InfiniteTableReadOnlyState<T> {
  const virtualizeColumns = props.virtualizeColumns ?? true;
  const header = props.header ?? true;
  const virtualizeHeader =
    header &&
    virtualizeColumns &&
    (!props.columnGroups || props.columnGroups?.size === 0);

  const columnGroupsDepthsMap = updated?.columnGroups
    ? computeColumnGroupsDepths(updated.columnGroups)
    : state.columnGroupsDepthsMap;
  return {
    onReady: props.onReady,
    domProps: props.domProps,
    showZebraRows: props.showZebraRows ?? true,
    virtualizeColumns,
    virtualizeHeader,
    header,
    rowProps: props.rowProps,
    columnMinWidth: props.columnMinWidth ?? 30,
    columnMaxWidth: props.columnMaxWidth ?? 2000,
    columnDefaultWidth: props.columnDefaultWidth ?? 300,
    draggableColumns: props.draggableColumns ?? true,
    sortable: props.sortable ?? true,
    columnGroupsDepthsMap,

    licenseKey:
      props.licenseKey || (globalThis as any).InfiniteTableLicenseKey || '',
    rowHeightCSSVar: typeof props.rowHeight === 'string' ? props.rowHeight : '',
  };
}
