import type { ScrollPosition } from '../../../types/ScrollPosition';
import type {
  InfiniteTableComputedColumn,
  InfiniteTableRowInfo,
} from '../../types';
import { InfiniteTableToggleGroupRowFn } from '../../types/InfiniteTableColumn';
import { MatrixBrain } from '../../../VirtualBrain/MatrixBrain';

export interface InfiniteTableRowProps<T> {
  rowHeight: number;
  rowWidth: number;
  rowIndex: number;
  brain: MatrixBrain;

  domRef: React.RefCallback<HTMLElement>;
  rowInfo: InfiniteTableRowInfo<T>;
  getData: () => InfiniteTableRowInfo<T>[];
  toggleGroupRow: InfiniteTableToggleGroupRowFn;
  repaintId?: number | string;
  // rowSpan?: VirtualBrainOptions['itemSpan'];

  virtualizeColumns: boolean;
  showZebraRows?: boolean;
  showHoverRows?: boolean;

  columns: InfiniteTableComputedColumn<T>[];

  domProps?: React.HTMLAttributes<HTMLDivElement>;
}
export type InfiniteTableRowApi = {
  setScrollPosition: (scrollPosition: ScrollPosition) => void;
};
