import type { VirtualBrain, VirtualBrainOptions } from '../../../VirtualBrain';
import type { ScrollPosition } from '../../../types/ScrollPosition';
import type {
  InfiniteTableComputedColumn,
  InfiniteTableRowInfo,
} from '../../types';
import { InfiniteTableToggleGroupRowFn } from '../../types/InfiniteTableColumn';

export interface InfiniteTableRowProps<T> {
  rowHeight: number;
  rowWidth: number;
  rowIndex: number;
  brain: VirtualBrain;
  verticalBrain: VirtualBrain;
  domRef: React.RefCallback<HTMLElement>;
  rowInfo: InfiniteTableRowInfo<T>;
  getData: () => InfiniteTableRowInfo<T>[];
  toggleGroupRow: InfiniteTableToggleGroupRowFn;
  repaintId?: number | string;
  rowSpan?: VirtualBrainOptions['itemSpan'];

  virtualizeColumns: boolean;
  showZebraRows?: boolean;
  showHoverRows?: boolean;

  columns: InfiniteTableComputedColumn<T>[];

  domProps?: React.HTMLAttributes<HTMLDivElement>;
}
export type InfiniteTableRowApi = {
  setScrollPosition: (scrollPosition: ScrollPosition) => void;
};
