import type { HTMLProps, RefObject } from 'react';
import type { TableColumn, TableComputedColumn } from './TableColumn';

// export type TablePropColumnOrderItem = string | { id: string; visible: boolean };
export type TablePropColumnOrderNormalized = string[];
export type TablePropColumnOrder = TablePropColumnOrderNormalized | true;

export type TablePropColumnVisibility = Map<string, false>;
export type TablePropColumnPinning = Map<string, true | 'start' | 'end'>;

export type TableImperativeApi<T> = {
  setColumnOrder: (columnOrder: TablePropColumnOrder) => void;
  setColumnVisibility: (columnVisibility: TablePropColumnVisibility) => void;
  x?: T;
};
export type TablePropVirtualizeColumns<T> =
  | boolean
  | ((columns: TableComputedColumn<T>[]) => boolean);

export type TableInternalProps<T> = {
  onHeaderResize: (height: number) => void;
  bodyDOMRef?: RefObject<HTMLDivElement | null>;
  ___t?: T;
};
export type TableProps<T> = {
  columns: Map<string, TableColumn<T>>;

  columnVisibility?: TablePropColumnVisibility;
  defaultColumnVisibility?: TablePropColumnVisibility;
  columnPinning?: TablePropColumnPinning;
  defaultColumnPinning?: TablePropColumnPinning;
  onColumnVisibilityChange?: (
    columnVisibility: TablePropColumnVisibility,
  ) => void;
  // columnVisibilityAssumeVisible?: boolean;

  primaryKey: string;
  rowHeight: number;
  domProps?: HTMLProps<HTMLDivElement>;
  showZebraRows?: boolean;
  sortable?: boolean;
  draggableColumns?: boolean;
  header?: boolean;
  columnDefaultWidth?: number;
  columnMinWidth?: number;
  columnMaxWidth?: number;
  virtualizeColumns?: TablePropVirtualizeColumns<T>;
  virtualizeRows?: boolean;

  defaultColumnOrder?: TablePropColumnOrder;
  columnOrder?: TablePropColumnOrder;
  onColumnOrderChange?: (columnOrder: TablePropColumnOrder) => void;

  onReady?: (api: TableImperativeApi<T>) => void;

  rowProps?:
    | HTMLProps<HTMLDivElement>
    | ((rowArgs: {
        rowIndex: number;
        data: T | null;
      }) => HTMLProps<HTMLDivElement>);
};
