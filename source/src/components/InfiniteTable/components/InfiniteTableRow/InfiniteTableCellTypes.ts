import { CSSProperties } from 'react';

import { InfiniteTableComputedColumn } from '../..';
import { Renderable } from '../../../types/Renderable';
import { OnResizeFn } from '../../../types/Size';
import {
  InfiniteTableRowInfo,
  InfiniteTablePropGroupRenderStrategy,
  InfiniteTablePropRowStyle,
  InfiniteTablePropRowClassName,
  InfiniteTablePropHeaderOptions,
} from '../../types';
import {
  InfiniteTableColumnAlignValues,
  InfiniteTableToggleGroupRowFn,
} from '../../types/InfiniteTableColumn';
import {
  InfiniteTablePropCellClassName,
  InfiniteTablePropCellStyle,
  InfiniteTableProps,
} from '../../types/InfiniteTableProps';

export type InfiniteTableBaseCellProps<T> = {
  column: InfiniteTableComputedColumn<T>;
  align?: InfiniteTableColumnAlignValues;

  horizontalLayoutPageIndex: number | null;

  rowId?: any;

  renderChildren: () => Renderable;
  width: number;
  cssEllipsis?: boolean;
  // children: Renderable;
  contentStyle?: CSSProperties;
  contentClassName?: string;
  virtualized?: boolean;
  skipColumnShifting?: boolean;

  beforeChildren?: Renderable;
  afterChildren?: Renderable;

  cssPosition?: CSSProperties['position'];
  domRef?: React.RefCallback<HTMLElement>;
};
export type InfiniteTableCellProps<T> =
  | ({
      cellType: 'header';
    } & InfiniteTableBaseCellProps<T>)
  | ({
      cellType: 'body';
    } & InfiniteTableBaseCellProps<T>);

export interface InfiniteTableColumnCellProps<T>
  extends Omit<
    InfiniteTableCellProps<T>,
    'children' | 'cellType' | 'renderChildren'
  > {
  rowDetailState: false | 'collapsed' | 'expanded';
  columnsMap: Map<string, InfiniteTableComputedColumn<T>>;
  fieldsToColumn: Map<keyof T, InfiniteTableComputedColumn<T>>;
  onMouseEnter?: (event: React.MouseEvent) => void;
  onMouseLeave?: (event: React.MouseEvent) => void;
  onRowMouseEnter?: InfiniteTableProps<T>['onRowMouseEnter'];
  onRowMouseLeave?: InfiniteTableProps<T>['onRowMouseLeave'];
  showZebraRows: boolean;
  virtualized: boolean;
  hidden: boolean;
  rowInfo: InfiniteTableRowInfo<T>;
  groupRenderStrategy: InfiniteTablePropGroupRenderStrategy;
  getData: () => InfiniteTableRowInfo<T>[];
  toggleGroupRow: InfiniteTableToggleGroupRowFn;
  rowIndexInHorizontalLayoutPage: number | null;
  horizontalLayoutPageIndex: number | null;
  rowIndex: number;
  rowHeight: number;
  cellStyle?: InfiniteTablePropCellStyle<T>;
  cellClassName?: InfiniteTablePropCellClassName<T>;
  rowStyle?: InfiniteTablePropRowStyle<T>;
  rowClassName?: InfiniteTablePropRowClassName<T>;
}

export interface InfiniteTableHeaderCellProps<T>
  extends Omit<
    InfiniteTableCellProps<T>,
    'children' | 'cellType' | 'renderChildren'
  > {
  columnsMap: Map<string, InfiniteTableComputedColumn<T>>;
  height: number;
  headerOptions: InfiniteTablePropHeaderOptions;
  onResize?: OnResizeFn;
}
