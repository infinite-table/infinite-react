import { InfiniteTableComputedColumn } from '../..';
import { Renderable } from '../../../types/Renderable';

import { MatrixBrain } from '../../../VirtualBrain/MatrixBrain';
import { ScrollListener } from '../../../VirtualBrain/ScrollListener';

import { InfiniteTableComputedColumnGroup } from '../../types/InfiniteTableProps';

export type InfiniteTableHeaderProps<T> = {
  repaintId?: string | number;
  brain: MatrixBrain;
  columns: InfiniteTableComputedColumn<T>[];
  totalWidth: number;
  availableWidth: number;
  headerHeight: number;
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
  brain?: MatrixBrain;
  scrollListener?: ScrollListener;
  scrollable?: boolean;
};
