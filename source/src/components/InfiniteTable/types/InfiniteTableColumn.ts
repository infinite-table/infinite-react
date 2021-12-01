import type { Renderable } from '../../types/Renderable';

import type {
  DataSourcePivotBy,
  DataSourceSingleSortInfo,
  DataSourceState,
} from '../../DataSource/types';
import type { DiscriminatedUnion, RequireAtLeastOne } from './Utility';
import type { InfiniteTableRowInfo } from '.';
import { CSSProperties } from 'react';
import { PivotBy } from '../../../utils/groupAndPivot';

export type { DiscriminatedUnion, RequireAtLeastOne };

export type InfiniteTableToggleGroupRowFn = (groupKeys: any[]) => void;
export interface InfiniteTableColumnRenderParam<
  DATA_TYPE,
  COL_TYPE = InfiniteTableComputedColumn<DATA_TYPE>,
> {
  // TODO type this to be the type of DATA_TYPE[column.field] if possible
  value: string | number | Renderable;
  data: DATA_TYPE | null;
  rowInfo: InfiniteTableRowInfo<DATA_TYPE>;
  groupRowInfo: InfiniteTableRowInfo<DATA_TYPE> | null;
  rowIndex: number;
  column: COL_TYPE;
  toggleCurrentGroupRow: () => void;
  toggleGroupRow: InfiniteTableToggleGroupRowFn;
  groupRowsBy: DataSourceState<DATA_TYPE>['groupRowsBy'];
}

export type InfiniteTableColumnRenderValueParam<
  DATA_TYPE,
  COL_TYPE = InfiniteTableComputedColumn<DATA_TYPE>,
> = InfiniteTableColumnRenderParam<DATA_TYPE, COL_TYPE>;

export type InfiniteTableColumnRowspanFnParams<
  DATA_TYPE,
  COL_TYPE = InfiniteTableComputedColumn<DATA_TYPE>,
> = {
  data: DATA_TYPE | null;
  rowInfo: InfiniteTableRowInfo<DATA_TYPE>;
  groupRowInfo: InfiniteTableRowInfo<DATA_TYPE> | null;
  dataArray: InfiniteTableRowInfo<DATA_TYPE>[];
  rowIndex: number;
  column: COL_TYPE;
};
export interface InfiniteTableColumnHeaderRenderParams<T> {
  column: InfiniteTableComputedColumn<T>;
  columnSortInfo: DataSourceSingleSortInfo<T> | null | undefined;
}

export type InfiniteTableColumnPinned = 'start' | 'end' | false;

export type InfiniteTableColumnRenderFunction<
  DATA_TYPE,
  COL_TYPE = InfiniteTableComputedColumn<DATA_TYPE>,
> = ({
  value,
  rowIndex,
  column,
  data,
  toggleGroupRow,
  toggleCurrentGroupRow,
  rowInfo,
  groupRowsBy,
}: InfiniteTableColumnRenderParam<DATA_TYPE, COL_TYPE>) => Renderable | null;

export type InfiniteTableColumnRenderValueFunction<
  DATA_TYPE,
  COL_TYPE = InfiniteTableComputedColumn<DATA_TYPE>,
> = InfiniteTableColumnRenderFunction<DATA_TYPE, COL_TYPE>;

export type InfiniteTableColumnHeaderRenderFunction<T> = ({
  columnSortInfo,
  column,
}: InfiniteTableColumnHeaderRenderParams<T>) => Renderable;

export type InfiniteTableColumnWithField<T> = {
  field: keyof T;
};

export type InfiniteTableColumnWithRender<T> = {
  render: InfiniteTableColumnRenderFunction<T>;
};
export type InfiniteTableColumnWithRenderValue<T> = {
  renderValue: InfiniteTableColumnRenderFunction<T>;
};

export type InfiniteTableColumnAlign = 'start' | 'center' | 'end';
export type InfiniteTableColumnVerticalAlign = 'start' | 'center' | 'end';

export type InfiniteTableColumnHeader<T> =
  | Renderable
  | InfiniteTableColumnHeaderRenderFunction<T>;

type InfiniteTableColumnWithFlex = {
  flex?: number;
  defaultFlex?: number;
};

type InfiniteTableColumnWithWidth = {
  width?: number;
  defaultWidth?: number;
};

export type InfiniteTableColumnWithSize = DiscriminatedUnion<
  InfiniteTableColumnWithFlex,
  InfiniteTableColumnWithWidth
>;

export type InfiniteTableColumnTypes = 'string' | 'number' | 'date';

// field|valueGetter => THE_VALUE
// |
// \/
export type InfiniteTableColumnWithRenderOrRenderValueOrFieldOrValueGetter<T> =
  RequireAtLeastOne<
    {
      field?: keyof T;
      render?: InfiniteTableColumnRenderFunction<T>;
      renderValue?: InfiniteTableColumnRenderFunction<T>;
      valueGetter?: InfiniteTableColumnValueGetter<T>;
    },
    'render' | 'renderValue' | 'field' | 'valueGetter'
  >;

export type InfiniteTableColumnStyleFnParams<T> = {
  data: T | null;
  value: Renderable;
  rowInfo: InfiniteTableRowInfo<T>;
  column: InfiniteTableColumn<T>;
};
export type InfiniteTableColumnStyleFn<T> = (
  params: InfiniteTableColumnStyleFnParams<T>,
) => undefined | React.CSSProperties;

export type InfiniteTableColumnClassNameFn<T> = (
  params: InfiniteTableColumnStyleFnParams<T>,
) => undefined | string;

export type InfiniteTableColumnStyle<T> =
  | CSSProperties
  | InfiniteTableColumnStyleFn<T>;
export type InfiniteTableColumnClassName<T> =
  | string
  | InfiniteTableColumnClassNameFn<T>;

export type InfiniteTableColumnValueGetterParams<T> = {
  data: T | null;
  rowInfo: InfiniteTableRowInfo<T>;
  groupRowInfo: InfiniteTableRowInfo<T> | null;
};
export type InfiniteTableColumnValueGetter<
  T,
  VALUE_GETTER_TYPE = Renderable,
> = (params: InfiniteTableColumnValueGetterParams<T>) => VALUE_GETTER_TYPE;

export type InfiniteTableColumnRowspanFn<T> = (
  params: InfiniteTableColumnRowspanFnParams<T>,
) => number;

export type InfiniteTableBaseColumn<T> = {
  maxWidth?: number;
  minWidth?: number;

  sortable?: boolean;
  draggable?: boolean;

  align?: InfiniteTableColumnAlign;
  verticalAlign?: InfiniteTableColumnVerticalAlign;
  columnGroup?: string;

  header?: InfiniteTableColumnHeader<T>;
  name?: Renderable;
  cssEllipsis?: boolean;
  headerCssEllipsis?: boolean;
  type?: InfiniteTableColumnTypes;

  style?: InfiniteTableColumnStyle<T>;
  className?: InfiniteTableColumnClassName<T>;

  rowspan?: InfiniteTableColumnRowspanFn<T>;

  valueGetter?: InfiniteTableColumnValueGetter<T>;

  // value
};
export type InfiniteTableColumn<T> = {} & InfiniteTableBaseColumn<T> &
  InfiniteTableColumnWithRenderOrRenderValueOrFieldOrValueGetter<T> &
  InfiniteTableColumnWithSize;

export type InfiniteTableGeneratedGroupColumn<T> = InfiniteTableColumn<T> & {
  groupByField?: string | string[];
};

export type InfiniteTablePivotColumn<T> = InfiniteTableColumn<T> & {
  pivotBy?: DataSourcePivotBy<T>[];
  pivotColumn?: true;
  pivotTotalColumn?: true;
  pivotGroupKeys?: any[];
  pivotByForColumn?: DataSourcePivotBy<T>;
  pivotIndexForColumn?: number;
  pivotGroupKeyForColumn?: any;
  // groupByField?: string | string[];
  // renderValue?: InfiniteTableColumnRenderValueFunction<T>;
};

export type InfiniteTablePivotFinalColumn<
  DataType,
  KeyType extends any = any,
> = InfiniteTablePivotColumn<DataType> & {
  pivotBy: DataSourcePivotBy<DataType>[];
  pivotGroupKeys: KeyType[];
  pivotByForColumn: PivotBy<DataType, KeyType>;
  pivotIndexForColumn: number;
  pivotGroupKeyForColumn: KeyType;
};

type InfiniteTableComputedColumnBase<T> = {
  computedWidth: number;
  computedOffset: number;
  computedPinningOffset: number;
  computedAbsoluteOffset: number;
  computedSortable: boolean;
  computedSortInfo: DataSourceSingleSortInfo<T> | null;
  computedSorted: boolean;
  computedSortedAsc: boolean;
  computedSortedDesc: boolean;
  computedSortIndex: number;
  computedVisibleIndex: number;
  computedMultiSort: boolean;

  computedPinned: InfiniteTableColumnPinned;
  computedDraggable: boolean;
  computedFirstInCategory: boolean;
  computedLastInCategory: boolean;
  computedFirst: boolean;
  computedLast: boolean;
  toggleSort: () => void;
  id: string;
};

export type InfiniteTableComputedColumn<T> = InfiniteTableColumn<T> &
  InfiniteTableComputedColumnBase<T> &
  InfiniteTablePivotColumn<T> &
  InfiniteTableGeneratedGroupColumn<T>;
