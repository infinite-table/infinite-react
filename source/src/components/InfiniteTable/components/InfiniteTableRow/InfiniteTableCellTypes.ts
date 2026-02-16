import { CSSProperties } from 'react';

import { InfiniteTableComputedColumn } from '../..';
import { RowInfoStore } from '../../../DataSource/RowInfoStore';
import {
  DataSourceApi,
  DataSourceComponentActions,
  DataSourceMasterDetailContextValue,
  DataSourceState,
} from '../../../DataSource/types';
import { Renderable } from '../../../types/Renderable';
import { OnResizeFn } from '../../../types/Size';
import {
  InfiniteTableRowInfo,
  InfiniteTablePropGroupRenderStrategy,
  InfiniteTablePropRowStyle,
  InfiniteTablePropRowClassName,
  InfiniteTablePropHeaderOptions,
  InfiniteTableComputedValues,
  InfiniteTableState,
  InfiniteTableApi,
} from '../../types';
import { InfiniteTableActions } from '../../types/InfiniteTableState';
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

  renderChildren: React.ReactNode | (() => Renderable);
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

  repaintId?: number | string;
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
  dataSourceStatePartialForCell: {
    isNodeReadOnly: DataSourceState<T>['isNodeReadOnly'];
    selectionMode: DataSourceState<T>['selectionMode'];
    cellSelection: DataSourceState<T>['cellSelection'];
  };
  rowDetailState: false | 'collapsed' | 'expanded';
  columnsMap: Map<string, InfiniteTableComputedColumn<T>>;
  fieldsToColumn: Map<keyof T, InfiniteTableComputedColumn<T>>;
  onMouseEnter?: (event: React.MouseEvent<HTMLElement>) => void;
  onMouseLeave?: (event: React.MouseEvent<HTMLElement>) => void;
  onRowMouseEnter?: InfiniteTableProps<T>['onRowMouseEnter'];
  onRowMouseLeave?: InfiniteTableProps<T>['onRowMouseLeave'];
  showZebraRows: boolean;
  virtualized: boolean;
  hidden: boolean;
  rowInfoStore: RowInfoStore<T>;
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

  // DataSource context values passed as props to avoid context re-renders
  getDataSourceState: () => DataSourceState<T>;
  dataSourceApi: DataSourceApi<T>;
  dataSourceActions: DataSourceComponentActions<T>;

  // InfiniteTable context values passed as props to avoid context re-renders
  getState: () => InfiniteTableState<T>;
  componentActions: InfiniteTableActions<T>;
  imperativeApi: InfiniteTableApi<T>;

  getComputed: () => InfiniteTableComputedValues<T>;
  getDataSourceMasterContext: () =>
    | DataSourceMasterDetailContextValue
    | undefined;

  /**
   * Whether this cell is currently being edited.
   * Passed as a prop to ensure the cell re-renders when editing state changes.
   */
  inEditMode: boolean;
}

export interface InfiniteTableHeaderCellProps<T>
  extends Omit<
    InfiniteTableCellProps<T>,
    'children' | 'cellType' | 'renderChildren'
  > {
  // DataSource context values passed as props to avoid context re-renders
  getDataSourceState: () => DataSourceState<T>;
  dataSourceApi: DataSourceApi<T>;
  dataSourceActions: DataSourceComponentActions<T>;
  dataSourceStatePartialForHeaderCell: {
    allRowsSelected: DataSourceState<T>['allRowsSelected'];
    someRowsSelected: DataSourceState<T>['someRowsSelected'];
    selectionMode: DataSourceState<T>['selectionMode'];
  };
  filterTypes: DataSourceState<T>['filterTypes'];
  filterDelay: DataSourceState<T>['filterDelay'];
  columnsMap: Map<string, InfiniteTableComputedColumn<T>>;
  height: number;
  headerOptions: InfiniteTablePropHeaderOptions;
  onResize?: OnResizeFn;
}
