import { createRef, MutableRefObject } from 'react';
import { buildSubscriptionCallback } from '../../utils/buildSubscriptionCallback';
import { isControlled } from '../../utils/isControlled';
import { InfiniteTableProps, InfiniteTableState } from '../types';
import { InfiniteTableReadOnlyState } from '../types/InfiniteTableState';

export function getInitialState<T>(
  props: InfiniteTableProps<T>,
): InfiniteTableState<T> {
  const headerHeightRef: MutableRefObject<number | null> = createRef();
  headerHeightRef.current = 0;

  return {
    // viewportSize: {
    //   width: 0,
    //   height: 0,
    // },
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
    columnOrder: isControlled('columnOrder', props)
      ? props.columnOrder
      : props.defaultColumnOrder ?? true,
    columnVisibility: isControlled('columnVisibility', props)
      ? props.columnVisibility
      : props.defaultColumnVisibility ?? new Map(),
    columnPinning: isControlled('columnPinning', props)
      ? props.columnPinning
      : props.defaultColumnPinning ?? new Map(),
    columnAggregations: isControlled('columnAggregations', props)
      ? props.columnAggregations
      : props.defaultColumnAggregations ?? new Map(),
    columnShifts: null,
  } as InfiniteTableState<T>;
}

export function deriveReadOnlyState<T>(
  props: InfiniteTableProps<T>,
): InfiniteTableReadOnlyState<T> {
  return {
    domProps: props.domProps,
    primaryKey: props.primaryKey ?? 'id',
    showZebraRows: props.showZebraRows ?? true,
    virtualizeColumns: props.virtualizeColumns ?? true,
    header: props.header ?? true,
    columnMinWidth: props.columnMinWidth ?? 30,
    licenseKey:
      props.licenseKey || (globalThis as any).InfiniteTableLicenseKey || '',
    rowHeightCSSVar: typeof props.rowHeight === 'string' ? props.rowHeight : '',
  };
}
