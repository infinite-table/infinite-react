import { createRef } from 'react';
import { buildSubscriptionCallback } from '../../utils/buildSubscriptionCallback';
import { isControlled } from '../../utils/isControlled';
import { InfiniteTableProps, InfiniteTableState } from '../types';
import { InfiniteTableGeneratedColumns } from '../types/InfiniteTableProps';
import { InfiniteTableReadOnlyState } from '../types/InfiniteTableState';
import { computeColumnGroupsDepths } from './computeColumnGroupsDepths';

export function getInitialState<T>(
  props: InfiniteTableProps<T>,
): InfiniteTableState<T> {
  const columnGroups =
    (isControlled('columnGroups', props)
      ? props.columnGroups
      : props.defaultColumnGroups) ?? new Map();

  const collapsedColumnGroups =
    (isControlled('collapsedColumnGroups', props)
      ? props.collapsedColumnGroups
      : props.defaultCollapsedColumnGroups) ?? new Map();

  const columnGroupsDepthsMap = computeColumnGroupsDepths(columnGroups);

  const generatedColumns: InfiniteTableGeneratedColumns<T> = new Map();

  return {
    rowHeight: typeof props.rowHeight === 'number' ? props.rowHeight : 0,
    headerHeight:
      typeof props.headerHeight === 'number' ? props.headerHeight : 0,
    domRef: createRef(),
    bodyDOMRef: createRef(),
    portalDOMRef: createRef(),
    bodySizeRef: createRef(),

    onRowHeightChange: buildSubscriptionCallback<number>(),
    onHeaderHeightChange: buildSubscriptionCallback<number>(),

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
    generatedColumns,

    columnOrder:
      (isControlled('columnOrder', props)
        ? props.columnOrder
        : props.defaultColumnOrder) ?? true,
    columnGroups,
    collapsedColumnGroups,
    columnGroupsDepthsMap,
    columnGroupsMaxDepth: Math.max(...columnGroupsDepthsMap.values(), 0),

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
    groupColumn: props.groupColumn,
    onReady: props.onReady,
    domProps: props.domProps,
    showZebraRows: props.showZebraRows ?? true,
    virtualizeColumns,
    virtualizeHeader,
    header,
    groupRenderStrategy: props.groupRenderStrategy ?? 'multi-column',
    rowProps: props.rowProps,
    columnMinWidth: props.columnMinWidth ?? 30,
    columnMaxWidth: props.columnMaxWidth ?? 2000,
    columnDefaultWidth: props.columnDefaultWidth ?? 300,
    draggableColumns: props.draggableColumns ?? true,
    sortable: props.sortable ?? true,
    columnGroupsDepthsMap,
    columnGroupsMaxDepth: Math.max(...columnGroupsDepthsMap.values(), 0),

    licenseKey:
      props.licenseKey || (globalThis as any).InfiniteTableLicenseKey || '',
    rowHeightCSSVar: typeof props.rowHeight === 'string' ? props.rowHeight : '',
    headerHeightCSSVar:
      typeof props.headerHeight === 'string' ? props.headerHeight : '',
  };
}
