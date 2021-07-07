import type { VirtualBrain } from '../../../VirtualBrain';
import type { ScrollPosition } from '../../../types/ScrollPosition';
import type {
  InfiniteTableComputedColumn,
  InfiniteTableEnhancedData,
} from '../../types';

export interface InfiniteTableRowProps<T> {
  rowHeight: number;
  rowWidth: number;
  rowIndex: number;
  brain: VirtualBrain;
  domRef: React.RefCallback<HTMLElement>;
  enhancedData: InfiniteTableEnhancedData<T>;
  repaintId?: number | string;

  virtualizeColumns: boolean;
  showZebraRows?: boolean;

  columns: InfiniteTableComputedColumn<T>[];

  domProps?: React.HTMLAttributes<HTMLDivElement>;
}
export type InfiniteTableRowApi = {
  setScrollPosition: (scrollPosition: ScrollPosition) => void;
};