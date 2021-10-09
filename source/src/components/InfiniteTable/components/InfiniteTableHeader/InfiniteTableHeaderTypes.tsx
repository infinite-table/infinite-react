import { InfiniteTableComputedColumn } from '../..';
import { Renderable } from '../../../types/Renderable';

import { VirtualBrain } from '../../../VirtualBrain';
import { ScrollListener } from '../../../VirtualBrain/ScrollListener';
import { InfiniteTableComputedColumnGroup } from '../../types/InfiniteTableProps';

export type InfiniteTableHeaderProps<T> = {
  repaintId?: string | number;
  brain: VirtualBrain;
  columns: InfiniteTableComputedColumn<T>[];
  totalWidth: number;
  availableWidth: number;
};

export type InfiniteTableHeaderGroupProps<T> = {
  columns: InfiniteTableComputedColumn<T>[];
  columnGroup: InfiniteTableComputedColumnGroup;
  children: Renderable;
  height: number;
  headerHeight: number;
};

export type InfiniteTableHeaderUnvirtualizedProps<T> = Omit<
  InfiniteTableHeaderProps<T>,
  'repaintId' | 'brain'
> & {
  classNameModifiers?: string[];
  brain?: VirtualBrain;
  scrollListener?: ScrollListener;
  scrollable?: boolean;
};
