import { InfiniteTableComputedColumn } from '../..';
import { MatrixBrain } from '../../../VirtualBrain/MatrixBrain';
import { ScrollListener } from '../../../VirtualBrain/ScrollListener';
import { InfiniteTableComputedColumnGroup } from '../../types/InfiniteTableProps';

import { ColumnAndGroupTreeInfo } from './buildColumnAndGroupTree';

export type InfiniteTableHeaderProps<T> = {
  repaintId?: string | number;
  brain: MatrixBrain;
  columns: InfiniteTableComputedColumn<T>[];
  columnHeaderHeight: number;
  columnGroupsMaxDepth: number;
  columnAndGroupTreeInfo?: ColumnAndGroupTreeInfo<T>;
};

export type InfiniteTableHeaderGroupProps<T> = {
  columns: InfiniteTableComputedColumn<T>[];
  columnGroup: InfiniteTableComputedColumnGroup;
  height: number;
  width: number;
  domRef?: React.RefCallback<HTMLElement>;
};

export type InfiniteTableHeaderUnvirtualizedProps<T> = Omit<
  InfiniteTableHeaderProps<T>,
  'repaintId' | 'brain'
> & {
  brain?: MatrixBrain;
  scrollListener?: ScrollListener;
  scrollable?: boolean;
};
