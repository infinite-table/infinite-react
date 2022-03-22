import { CSSProperties } from 'react';
import { InfiniteTableComputedColumn } from '../..';

import { Renderable } from '../../../types/Renderable';
import { OnResizeFn } from '../../../types/Size';
import {
  InfiniteTableRowInfo,
  InfiniteTablePropGroupRenderStrategy,
} from '../../types';
import { InfiniteTableToggleGroupRowFn } from '../../types/InfiniteTableColumn';

export type InfiniteTableCellProps<T> = {
  column: InfiniteTableComputedColumn<T>;
  renderChildren: () => Renderable;

  cssEllipsis?: boolean;
  // children: Renderable;
  virtualized?: boolean;
  skipColumnShifting?: boolean;

  beforeChildren?: Renderable;
  afterChildren?: Renderable;

  offset?: number;
  offsetProperty?: 'left' | 'right';
  cssPosition?: CSSProperties['position'];
  domRef: React.RefCallback<HTMLElement>;
  cellType: 'body' | 'header';
};

export interface InfiniteTableColumnCellProps<T>
  extends Omit<
    InfiniteTableCellProps<T>,
    'children' | 'cellType' | 'renderChildren'
  > {
  virtualized: boolean;
  hidden: boolean;
  rowInfo: InfiniteTableRowInfo<T>;
  groupRenderStrategy: InfiniteTablePropGroupRenderStrategy;
  getData: () => InfiniteTableRowInfo<T>[];
  toggleGroupRow: InfiniteTableToggleGroupRowFn;
  rowIndex: number;
  rowHeight: number;
}

export interface InfiniteTableHeaderCellProps<T>
  extends Omit<
    InfiniteTableCellProps<T>,
    'children' | 'cellType' | 'renderChildren'
  > {
  columns: Map<string, InfiniteTableComputedColumn<T>>;
  headerHeight: number;
  onResize?: OnResizeFn;
}
