import { TableComputedColumn } from '../..';

import { Renderable } from '../../../types/Renderable';
import { OnResizeFn } from '../../../types/Size';
import { TableEnhancedData } from '../../types';

export interface TableCellProps<T> {
  column: TableComputedColumn<T>;

  cssEllipsis?: boolean;
  children: Renderable;
  virtualized?: boolean;
  skipColumnShifting?: boolean;
  outerChildren?: Renderable;
  offset?: number;
  offsetProperty?: 'left' | 'right';
  domRef?: React.RefCallback<HTMLElement>;
}

export interface TableColumnCellProps<T>
  extends Omit<TableCellProps<T>, 'children'> {
  virtualized: boolean;
  enhancedData: TableEnhancedData<T>;
  rowIndex: number;
}

export interface TableHeaderCellProps<T>
  extends Omit<TableCellProps<T>, 'children'> {
  columns: Map<string, TableComputedColumn<T>>;
  onResize?: OnResizeFn;
}
