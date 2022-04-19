import { InfiniteTableComputedColumn } from '../..';
import { Renderable } from '../../../types/Renderable';

import { MatrixBrain } from '../../../VirtualBrain/MatrixBrain';
import { ScrollListener } from '../../../VirtualBrain/ScrollListener';

import { InfiniteTableComputedColumnGroup } from '../../types/InfiniteTableProps';
import { ColumnAndGroupTreeInfo } from './buildColumnAndGroupTree';

export type InfiniteTableHeaderProps<T> = {
  repaintId?: string | number;
  brain: MatrixBrain;
  columns: InfiniteTableComputedColumn<T>[];
  headerHeight: number;
  columnGroupsMaxDepth: number;
  columnAndGroupTreeInfo?: ColumnAndGroupTreeInfo<T>;
};

export type InfiniteTableHeaderGroupProps<T> = {
  columns: InfiniteTableComputedColumn<T>[];
  columnGroup: InfiniteTableComputedColumnGroup;
  children?: Renderable;
  height: number;
  width: number;
  domRef?: React.RefCallback<HTMLElement>;
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
