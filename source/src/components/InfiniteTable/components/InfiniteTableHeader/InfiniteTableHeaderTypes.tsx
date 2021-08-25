import { InfiniteTableComputedColumn } from '../..';
import { Renderable } from '../../../types/Renderable';
import type { OnResizeFn } from '../../../types/Size';

import { VirtualBrain } from '../../../VirtualBrain';
import { InfiniteTableComputedColumnGroup } from '../../types/InfiniteTableProps';

export type InfiniteTableHeaderProps<T> = {
  repaintId?: string | number;
  brain: VirtualBrain;
  columns: InfiniteTableComputedColumn<T>[];
  totalWidth: number;
  onResize?: OnResizeFn;
};

export type InfiniteTableHeaderGroupProps<T> = {
  columns: InfiniteTableComputedColumn<T>[];
  columnGroup: InfiniteTableComputedColumnGroup;
  children: Renderable;
};

export type InfiniteTableHeaderUnvirtualizedProps<T> = Omit<
  InfiniteTableHeaderProps<T>,
  'repaintId' | 'brain'
> & {
  brain?: VirtualBrain;
  scrollable?: boolean;
};
