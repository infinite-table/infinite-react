import type { VirtualBrain } from '../../../VirtualBrain';
import type { ScrollPosition } from '../../../types/ScrollPosition';
import type { TableComputedColumn, TableEnhancedData } from '../../types';

export interface TableRowProps<T> {
  rowHeight: number;
  rowWidth: number;
  rowIndex: number;
  brain: VirtualBrain;
  domRef: React.RefCallback<HTMLElement>;
  enhancedData: TableEnhancedData<T>;
  repaintId?: number | string;

  virtualizeColumns: boolean;
  showZebraRows?: boolean;

  columns: TableComputedColumn<T>[];

  domProps?: React.HTMLAttributes<HTMLDivElement>;
}
export type TableRowApi = {
  setScrollPosition: (scrollPosition: ScrollPosition) => void;
};
