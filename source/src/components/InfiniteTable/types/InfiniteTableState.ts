import type { ScrollPosition } from '../../types/ScrollPosition';
import type {
  InfiniteTablePropColumnAggregations,
  InfiniteTablePropColumnOrder,
  InfiniteTablePropColumnPinning,
  InfiniteTablePropColumnVisibility,
  InfiniteTableProps,
} from './InfiniteTableProps';
import { Size } from '../../types/Size';
import { ComponentStateActions } from '../../hooks/useComponentState';
import { MutableRefObject } from 'react';
import { SubscriptionCallback } from '../../types/SubscriptionCallback';

export interface InfiniteTableState<T> {
  domRef: MutableRefObject<HTMLDivElement | null>;
  bodyDOMRef: MutableRefObject<HTMLDivElement | null>;
  portalDOMRef: MutableRefObject<HTMLDivElement | null>;

  bodySizeRef: MutableRefObject<Size | null>;
  headerHeightRef: MutableRefObject<number>;

  onRowHeightChange: SubscriptionCallback<number>;

  rowHeight: number | string;

  columnShifts: null | number[];
  draggingColumnId: null | string;
  // viewportSize: Size;
  bodySize: Size;
  scrollPosition: ScrollPosition;
  columnOrder: InfiniteTablePropColumnOrder;
  columnVisibility: InfiniteTablePropColumnVisibility;
  columnPinning: InfiniteTablePropColumnPinning;
  columnAggregations: InfiniteTablePropColumnAggregations<T>;

  x?: T;
}

export interface InfiniteTableComponentState<T>
  extends InfiniteTableState<T>,
    InfiniteTableReadOnlyState<T> {}

export interface InfiniteTableReadOnlyState<T> {
  primaryKey: InfiniteTableProps<T>['primaryKey'];
  showZebraRows: InfiniteTableProps<T>['showZebraRows'];
  header: InfiniteTableProps<T>['header'];
  columnMinWidth: InfiniteTableProps<T>['columnMinWidth'];
  virtualizeColumns: InfiniteTableProps<T>['virtualizeColumns'];
  licenseKey: string;
  domProps: InfiniteTableProps<T>['domProps'];
  rowHeightCSSVar: string;
}

export type InfiniteTableComponentActions<T> = ComponentStateActions<
  InfiniteTableState<T>
>;
