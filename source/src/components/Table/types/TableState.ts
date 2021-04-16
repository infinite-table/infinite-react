import type { ScrollPosition } from '../../types/ScrollPosition';
import type {
  TablePropColumnOrder,
  TablePropColumnPinning,
  TablePropColumnVisibility,
} from './TableProps';
import { Size } from '../../types/Size';

export interface TableState<T> {
  columnShifts: null | number[];
  draggingColumnId: null | string;
  // viewportSize: Size;
  bodySize: Size;
  scrollPosition: ScrollPosition;
  columnOrder: TablePropColumnOrder;
  columnVisibility: TablePropColumnVisibility;
  columnPinning: TablePropColumnPinning;

  x?: T;
}
