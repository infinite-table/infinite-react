import * as React from 'react';
import { CSSProperties, HTMLProps } from 'react';

import {
  AggregationReducer,
  InfiniteTableRowInfo,
  InfiniteTableRowInfoDataDiscriminator,
  InfiniteTableRowInfoDataDiscriminator_LeafNode,
  InfiniteTableRowInfoDataDiscriminator_ParentNode,
  InfiniteTable_HasGrouping_RowInfoGroup,
  PivotBy,
} from '../../../utils/groupAndPivot';
import type {
  ColumnTypeWithInherit,
  DataSourceApi,
  DataSourceFilterValueItem,
  DataSourcePivotBy,
  DataSourcePropSelectionMode,
  DataSourceSingleSortInfo,
  DataSourceState,
} from '../../DataSource/types';
import type { Renderable } from '../../types/Renderable';
import { InfiniteTableCellProps } from '../components/InfiniteTableRow/InfiniteTableCellTypes';

import {
  InfiniteTableColumnApi,
  InfiniteTableColumnPinnedValues,
  InfiniteTableColumnType,
  InfiniteTablePropOnEditAcceptedParams,
  InfiniteTableRowInfoDataDiscriminatorWithColumnAndApis,
} from './InfiniteTableProps';
import type {
  DiscriminatedUnion,
  KeyOfNoSymbol,
  RequireAtLeastOne,
  XOR,
} from './Utility';

import type { InfiniteTableApi, InfiniteTableColumnGroup } from '.';
import { MenuIconProps } from '../components/icons/MenuIcon';
import { NonUndefined } from '../../types/NonUndefined';
import { GroupBy, ValueGetterParams } from '../../../utils/groupAndPivot/types';

export type { DiscriminatedUnion, RequireAtLeastOne };

export type InfiniteTableToggleGroupRowFn = (groupKeys: any[]) => void;
export type InfiniteTableToggleTreeNodeFn = (nodePath: any[]) => void;
export type InfiniteTableToggleRowDetailsFn = (id: any) => void;
export type InfiniteTableSelectRowFn = (id: any) => void;
export type InfiniteTableIsRowSelectedFn = (id: any) => boolean;
export type InfiniteTableIsGroupRowSelectedFn = (groupKeys: any[]) => boolean;

export type InfiniteTableColumnHeaderParam<
  DATA_TYPE,
  COL_TYPE = InfiniteTableComputedColumn<DATA_TYPE>,
> = {
  dragging: boolean;
  column: COL_TYPE;
  columnsMap: Map<string, COL_TYPE>;
  columnSortInfo: DataSourceSingleSortInfo<DATA_TYPE> | null;
  columnFilterValue: DataSourceFilterValueItem<DATA_TYPE> | null;
  selectionMode: DataSourcePropSelectionMode;
  horizontalLayoutPageIndex: null | number;
  allRowsSelected: boolean;
  someRowsSelected: boolean;
  filtered: boolean;
  api: InfiniteTableApi<DATA_TYPE>;
  dataSourceApi: DataSourceApi<DATA_TYPE>;
  columnApi: InfiniteTableColumnApi<DATA_TYPE>;
  renderBag: {
    all?: Renderable;
    header: string | number | Renderable;
    sortIcon?: Renderable;
    menuIcon?: Renderable;
    menuIconProps?: MenuIconProps;
    filterIcon?: Renderable;
    filterEditor?: Renderable;
    selectionCheckBox?: Renderable;
  };
} & (
  | {
      domRef: InfiniteTableCellProps<DATA_TYPE>['domRef'];
      htmlElementRef: React.MutableRefObject<HTMLElement | null>;
      insideColumnMenu: false;
    }
  | {
      insideColumnMenu: true;
    }
);

export type InfiniteTableColumnRenderBag = {
  value: string | number | Renderable;
  groupIcon?: Renderable;
  treeIcon?: Renderable;
  rowDetailsIcon?: Renderable;
  all?: Renderable;
  selectionCheckBox?: Renderable;
};
export type InfiniteTableColumnRenderParamBase<
  DATA_TYPE,
  COL_TYPE = InfiniteTableComputedColumn<DATA_TYPE>,
> = {
  domRef: InfiniteTableCellProps<DATA_TYPE>['domRef'];
  htmlElementRef: React.MutableRefObject<HTMLElement | null>;

  rowIndexInHorizontalLayoutPage: null | number;
  horizontalLayoutPageIndex: null | number;

  // TODO type this to be the type of DATA_TYPE[column.field] if possible
  value: string | number | Renderable;

  align: InfiniteTableColumnAlignValues;
  verticalAlign: InfiniteTableColumnVerticalAlignValues;
  renderBag: InfiniteTableColumnRenderBag;
  rowIndex: number;
  rowActive: boolean;

  api: InfiniteTableApi<DATA_TYPE>;
  dataSourceApi: DataSourceApi<DATA_TYPE>;
  editError?: Error;

  column: COL_TYPE;
  columnsMap: Map<string, COL_TYPE>;
  fieldsToColumn: Map<keyof DATA_TYPE, COL_TYPE>;
  groupByColumn?: InfiniteTableComputedColumn<DATA_TYPE>;
  toggleCurrentGroupRow: () => void;
  toggleCurrentTreeNode: () => void;
  expandTreeNode: InfiniteTableToggleTreeNodeFn;
  collapseTreeNode: InfiniteTableToggleTreeNodeFn;

  toggleGroupRow: InfiniteTableToggleGroupRowFn;
  toggleTreeNode: InfiniteTableToggleTreeNodeFn;

  toggleCurrentTreeNodeSelection: () => void;
  toggleCurrentGroupRowSelection: () => void;
  toggleCurrentRowSelection: () => void;

  toggleCurrentRowDetails: () => void;

  toggleRowDetails: InfiniteTableToggleRowDetailsFn;
  expandRowDetails: InfiniteTableToggleRowDetailsFn;
  collapseRowDetails: InfiniteTableToggleRowDetailsFn;

  rowHasSelectedCells: boolean;
  cellSelected: boolean;
  selectCurrentRow: () => void;
  selectRow: InfiniteTableSelectRowFn;
  deselectRow: InfiniteTableSelectRowFn;
  deselectCurrentRow: () => void;

  selectCell: () => void;
  deselectCell: () => void;

  toggleRowSelection: InfiniteTableSelectRowFn;
  toggleGroupRowSelection: InfiniteTableToggleGroupRowFn;

  toggleTreeNodeSelection: InfiniteTableToggleTreeNodeFn;
  selectTreeNode: InfiniteTableToggleTreeNodeFn;
  deselectTreeNode: InfiniteTableToggleTreeNodeFn;

  selectionMode: DataSourcePropSelectionMode | undefined;
  rootGroupBy: DataSourceState<DATA_TYPE>['groupBy'];
  pivotBy?: DataSourceState<DATA_TYPE>['pivotBy'];
};

export type InfiniteTableGroupColumnRenderParams<
  DATA_TYPE,
  COL_TYPE = InfiniteTableComputedColumn<DATA_TYPE>,
> = InfiniteTableColumnRenderParamBase<DATA_TYPE, COL_TYPE> & {
  rowInfo: InfiniteTable_HasGrouping_RowInfoGroup<DATA_TYPE>;
  isGroupRow: true;
  data: Partial<DATA_TYPE> | null;
};

export type InfiniteTableColumnCellContextType<
  DATA_TYPE,
  COL_TYPE = InfiniteTableComputedColumn<DATA_TYPE>,
> = InfiniteTableColumnRenderParamBase<DATA_TYPE, COL_TYPE> &
  InfiniteTableRowInfoDataDiscriminator<DATA_TYPE>;

export type InfiniteTableHeaderCellContextType<DATA_TYPE> =
  InfiniteTableColumnHeaderParam<DATA_TYPE> & {
    domRef: InfiniteTableCellProps<DATA_TYPE>['domRef'];
    htmlElementRef: React.MutableRefObject<HTMLElement | null>;
    insideColumnMenu: false;
  };

export type InfiniteTableGroupColumnRenderIconParam<
  DATA_TYPE,
  COL_TYPE = InfiniteTableComputedColumn<DATA_TYPE>,
> = InfiniteTableGroupColumnRenderParams<DATA_TYPE, COL_TYPE> & {
  collapsed: boolean;
  groupIcon: Renderable;
};

export type InfiniteTableColumnRenderValueParam<
  DATA_TYPE,
  COL_TYPE = InfiniteTableComputedColumn<DATA_TYPE>,
> = InfiniteTableColumnCellContextType<DATA_TYPE, COL_TYPE>;

export type InfiniteTableColumnRowspanParam<
  DATA_TYPE,
  COL_TYPE = InfiniteTableComputedColumn<DATA_TYPE>,
> = {
  rowInfo: InfiniteTableRowInfo<DATA_TYPE>;
  data: DATA_TYPE | Partial<DATA_TYPE> | null;
  dataArray: InfiniteTableRowInfo<DATA_TYPE>[];
  rowIndex: number;
  column: COL_TYPE;
};

export type InfiniteTableColumnColspanParam<
  DATA_TYPE,
  COL_TYPE = InfiniteTableComputedColumn<DATA_TYPE>,
> = {
  rowInfo: InfiniteTableRowInfo<DATA_TYPE>;
  data: DATA_TYPE | Partial<DATA_TYPE> | null;
  dataArray: InfiniteTableRowInfo<DATA_TYPE>[];
  rowIndex: number;
  column: COL_TYPE;
  computedVisibleIndex: number;
  computedVisibleColumns: COL_TYPE[];
  computedPinnedStartColumns: COL_TYPE[];
  computedPinnedEndColumns: COL_TYPE[];
  computedUnpinnedColumns: COL_TYPE[];
};

export type InfiniteTableColumnRenderFunctionForGroupRows<
  DATA_TYPE,
  COL_TYPE = InfiniteTableComputedColumn<DATA_TYPE>,
> = (
  renderParams: InfiniteTableColumnCellContextType<DATA_TYPE, COL_TYPE> & {
    isGroupRow: true;
  },
) => Renderable | null;

export type InfiniteTableColumnRenderFunctionForParentNode<
  DATA_TYPE,
  COL_TYPE = InfiniteTableComputedColumn<DATA_TYPE>,
> = (
  renderParams: InfiniteTableColumnCellContextType<DATA_TYPE, COL_TYPE> & {
    isTreeNode: true;
    isParentNode: true;
  },
) => Renderable | null;

export type InfiniteTableColumnRenderFunctionForLeafNode<
  DATA_TYPE,
  COL_TYPE = InfiniteTableComputedColumn<DATA_TYPE>,
> = (
  renderParams: InfiniteTableColumnCellContextType<DATA_TYPE, COL_TYPE> & {
    isTreeNode: true;
    isParentNode: false;
  },
) => Renderable | null;

export type InfiniteTableColumnRenderFunctionForNode<
  DATA_TYPE,
  EXTRA_NODE_PARAMS = Partial<
    | InfiniteTableRowInfoDataDiscriminator_ParentNode<DATA_TYPE>
    | InfiniteTableRowInfoDataDiscriminator_LeafNode<DATA_TYPE>
  >,
  COL_TYPE = InfiniteTableComputedColumn<DATA_TYPE>,
> = (
  renderParams: InfiniteTableColumnCellContextType<DATA_TYPE, COL_TYPE> &
    EXTRA_NODE_PARAMS,
) => Renderable | null;
export type InfiniteTableColumnRenderFunctionForNormalRows<
  DATA_TYPE,
  COL_TYPE = InfiniteTableComputedColumn<DATA_TYPE>,
> = (
  renderParams: InfiniteTableColumnCellContextType<DATA_TYPE, COL_TYPE> & {
    isGroupRow: false;
  },
) => Renderable | null;
export type InfiniteTableColumnRenderFunction<
  DATA_TYPE,
  COL_TYPE = InfiniteTableComputedColumn<DATA_TYPE>,
> = (
  renderParams: InfiniteTableColumnCellContextType<DATA_TYPE, COL_TYPE>,
) => Renderable | null;

export type InfiniteTableGroupColumnRenderFunction<
  DATA_TYPE,
  COL_TYPE = InfiniteTableComputedColumn<DATA_TYPE>,
> = (
  renderParams: InfiniteTableGroupColumnRenderParams<DATA_TYPE, COL_TYPE>,
) => Renderable | null;

export type InfiniteTableColumnRenderValueFunction<
  DATA_TYPE,
  COL_TYPE = InfiniteTableComputedColumn<DATA_TYPE>,
> = InfiniteTableColumnRenderFunction<DATA_TYPE, COL_TYPE>;

export type InfiniteTableColumnHeaderRenderFunction<T> = (
  headerParams: InfiniteTableColumnHeaderParam<T>,
) => Renderable;

export type InfiniteTableColumnOrHeaderRenderFunction<T> = (
  params:
    | (InfiniteTableColumnCellContextType<T> & {
        rowInfo: InfiniteTableRowInfo<T>;
      })
    | (InfiniteTableColumnHeaderParam<T> & { rowInfo: null }),
) => ReturnType<InfiniteTableColumnRenderFunction<T>>;
export type InfiniteTableColumnContentFocusable<T> =
  | boolean
  | InfiniteTableColumnContentFocusableFn<T>;

export type InfiniteTableColumnEditable<T> =
  | boolean
  | InfiniteTableColumnEditableFn<T>;

export type InfiniteTableColumnContentFocusableFn<T> = (
  params: InfiniteTableColumnContentFocusableParams<T>,
) => boolean;

export type InfiniteTableColumnEditableFn<T> = (
  params: InfiniteTableColumnEditableParams<T>,
) => boolean | Promise<boolean>;

export type InfiniteTableColumnContentFocusableParams<T> =
  InfiniteTableRowInfoDataDiscriminatorWithColumnAndApis<T>;

export type InfiniteTableColumnEditableParams<T> =
  InfiniteTableColumnContentFocusableParams<T>;

export type InfiniteTableColumnGetValueToPersistParams<T> =
  InfiniteTableColumnEditableParams<T> & {
    initialValue: any;
  };
export type InfiniteTableColumnWithField<T> = {
  field: keyof T;
};

export type InfiniteTableColumnWithRender<T> = {
  render: InfiniteTableColumnRenderFunction<T>;
};
export type InfiniteTableColumnWithRenderValue<T> = {
  renderValue: InfiniteTableColumnRenderFunction<T>;
};

export type InfiniteTableColumnAlignValues = 'start' | 'center' | 'end';
export type InfiniteTableColumnVerticalAlignValues = 'start' | 'center' | 'end';

export type InfiniteTableColumnHeader<T> =
  | Renderable
  | InfiniteTableColumnHeaderRenderFunction<T>;

export type InfiniteTableDataTypeNames = 'string' | 'number' | 'date' | string;

export type InfiniteTableColumnTypeNames =
  | 'string'
  | 'number'
  | 'date'
  | string;

// field|valueGetter => THE_VALUE
// |
// \/
export type InfiniteTableColumnWithRenderDescriptor<T> = RequireAtLeastOne<
  {
    /**
     * Determines the field property of the column.
     */
    field?: keyof T;
    render?: InfiniteTableColumnRenderFunction<T>;
    renderValue?: InfiniteTableColumnRenderFunction<T>;
    valueGetter?: InfiniteTableColumnValueGetter<T>;
    valueFormatter?: InfiniteTableColumnValueFormatter<T>;
  },
  'render' | 'renderValue' | 'field' | 'valueGetter' | 'valueFormatter'
>;

export type InfiniteTableColumnStylingFnParams<T> = {
  value: Renderable;
  column: InfiniteTableComputedColumn<T>;
  rowIndexInHorizontalLayoutPage: null | number;
  horizontalLayoutPageIndex: null | number;
  inEdit: boolean;
  rowHasSelectedCells: boolean;
  editError: InfiniteTableColumnRenderParamBase<T>['editError'];
} & InfiniteTableRowInfoDataDiscriminator<T>;

export type InfiniteTableColumnStyleFn<T> = (
  params: InfiniteTableColumnStylingFnParams<T>,
) => undefined | React.CSSProperties;

export type InfiniteTableColumnHeaderClassNameFn<T> = (
  params: InfiniteTableColumnHeaderParam<T>,
) => undefined | string;

export type InfiniteTableColumnHeaderStyleFn<T> = (
  params: InfiniteTableColumnHeaderParam<T>,
) => undefined | React.CSSProperties;

export type InfiniteTableColumnClassNameFn<T> = (
  params: InfiniteTableColumnStylingFnParams<T>,
) => undefined | string;

export type InfiniteTableColumnStyle<T> =
  | CSSProperties
  | InfiniteTableColumnStyleFn<T>;

export type InfiniteTableColumnAlign<T> =
  | InfiniteTableColumnAlignValues
  | InfiniteTableColumnAlignFn<T>;

export type InfiniteTableColumnVerticalAlign<T> =
  | InfiniteTableColumnVerticalAlignValues
  | InfiniteTableColumnVerticalAlignFn<T>;

export type InfiniteTableColumnAlignFn<T> = (
  params: InfiniteTableColumnAlignFnParams<T>,
) => InfiniteTableColumnAlignValues;

export type InfiniteTableColumnAlignFnParams<T> = XOR<
  { isHeader: true; column: InfiniteTableComputedColumn<T> },
  InfiniteTableColumnStylingFnParams<T> & { isHeader: false }
>;

export type InfiniteTableColumnVerticalAlignFn<T> = (
  params: InfiniteTableColumnAlignFnParams<T>,
) => InfiniteTableColumnVerticalAlignValues;

export type InfiniteTableColumnHeaderStyle<T> =
  | CSSProperties
  | InfiniteTableColumnHeaderStyleFn<T>;
export type InfiniteTableColumnClassName<T> =
  | string
  | InfiniteTableColumnClassNameFn<T>;
export type InfiniteTableColumnHeaderClassName<T> =
  | string
  | InfiniteTableColumnHeaderClassNameFn<T>;

export type InfiniteTableColumnValueGetterParams<T> = ValueGetterParams<T>;

export type InfiniteTableColumnValueFormatterParams<T> =
  InfiniteTableRowInfoDataDiscriminator<T>;

export type InfiniteTableColumnValueGetter<
  T,
  VALUE_GETTER_TYPE = string | number | boolean | Date | null | undefined,
> = (params: InfiniteTableColumnValueGetterParams<T>) => VALUE_GETTER_TYPE;
export type InfiniteTableColumnValueFormatter<
  T,
  VALUE_FORMATTER_TYPE = string | number | boolean | Date | null | undefined,
> = (
  params: InfiniteTableColumnValueFormatterParams<T>,
) => VALUE_FORMATTER_TYPE;

export type InfiniteTableColumnRowspanFn<T> = (
  params: InfiniteTableColumnRowspanParam<T>,
) => number;
export type InfiniteTableColumnColspanFn<T> = (
  params: InfiniteTableColumnColspanParam<T>,
) => number;

export type InfiniteTableColumnComparer<T> = (a: T, b: T) => number;

export type InfiniteTableColumnSortableFn<T> = (context: {
  api: InfiniteTableApi<T>;
  columnApi: InfiniteTableColumnApi<T>;
  column: InfiniteTableComputedColumn<T>;
  columns: Map<string, InfiniteTableComputedColumn<T>>;
}) => boolean;

export type InfiniteTableColumnSortable<T> =
  | boolean
  | InfiniteTableColumnSortableFn<T>;

/**
 * Defines a column in the table.
 *
 * @typeParam DATA_TYPE The type of the data in the table.
 *
 * Can be bound to a field which is a `keyof DATA_TYPE`.
 */
export type InfiniteTableColumn<DATA_TYPE> = {
  // TODO revisit this and use AllXOR with either field, valueGetter or both
  field?: KeyOfNoSymbol<DATA_TYPE>;
  valueGetter?: InfiniteTableColumnValueGetter<DATA_TYPE>;
  defaultSortable?: InfiniteTableColumnSortable<DATA_TYPE>;
  /**
   * Whether the column is draggable by default.
   *
   * This prop overrides the top-level columnDefaultDraggable prop, but is
   * overridden by the top-level draggableColumns prop.
   */
  defaultDraggable?: boolean;

  resizable?: boolean;

  shouldAcceptEdit?: (
    params: InfiniteTablePropOnEditAcceptedParams<DATA_TYPE>,
  ) => boolean | Error | Promise<boolean | Error>;

  contentFocusable?: InfiniteTableColumnContentFocusable<DATA_TYPE>;
  defaultEditable?: InfiniteTableColumnEditable<DATA_TYPE>;
  getValueToEdit?: (
    params: InfiniteTableColumnEditableParams<DATA_TYPE>,
  ) => any | Promise<any>;

  getValueToPersist?: (
    params: InfiniteTableColumnGetValueToPersistParams<DATA_TYPE>,
  ) => any | Promise<any>;

  comparer?: InfiniteTableColumnComparer<DATA_TYPE>;
  defaultHiddenWhenGroupedBy?:
    | '*'
    | true
    | keyof DATA_TYPE
    | { [k in keyof Partial<DATA_TYPE>]: true };

  align?: InfiniteTableColumnAlign<DATA_TYPE>;
  headerAlign?: InfiniteTableColumnAlign<DATA_TYPE>;
  verticalAlign?: InfiniteTableColumnVerticalAlign<DATA_TYPE>;
  columnGroup?: string;

  header?: InfiniteTableColumnHeader<DATA_TYPE>;
  renderHeader?: InfiniteTableColumnHeaderRenderFunction<DATA_TYPE>;
  name?: Renderable;
  cssEllipsis?: boolean;
  headerCssEllipsis?: boolean;
  type?: InfiniteTableColumnTypeNames | InfiniteTableColumnTypeNames[] | null;
  dataType?: InfiniteTableDataTypeNames;
  sortType?: string | string[];
  filterType?: string;

  style?: InfiniteTableColumnStyle<DATA_TYPE>;
  headerStyle?: InfiniteTableColumnHeaderStyle<DATA_TYPE>;
  headerClassName?: InfiniteTableColumnHeaderClassName<DATA_TYPE>;
  className?: InfiniteTableColumnClassName<DATA_TYPE>;

  rowspan?: InfiniteTableColumnRowspanFn<DATA_TYPE>;
  // colspan?: InfiniteTableColumnColspanFn<T>;

  render?: InfiniteTableColumnRenderFunction<DATA_TYPE>;
  renderValue?: InfiniteTableColumnRenderFunction<DATA_TYPE>;
  renderGroupValue?: InfiniteTableColumnRenderFunctionForGroupRows<DATA_TYPE>;
  renderLeafValue?: InfiniteTableColumnRenderFunctionForNormalRows<DATA_TYPE>;

  valueFormatter?: InfiniteTableColumnValueFormatter<DATA_TYPE, Renderable>;

  defaultWidth?: number;
  defaultFlex?: number;
  defaultFilterable?: boolean;

  minWidth?: number;
  maxWidth?: number;

  renderGroupIcon?: InfiniteTableColumnRenderFunctionForGroupRows<DATA_TYPE>;
  renderRowDetailIcon?: boolean | InfiniteTableColumnRenderFunction<DATA_TYPE>;
  renderTreeIcon?:
    | boolean
    | InfiniteTableColumnRenderFunctionForNode<
        DATA_TYPE,
        {
          isTreeNode: true;
          isParentNode: boolean;
          isGroupRow: false;
          nodeExpanded: boolean;
        }
      >;
  renderTreeIconForParentNode?: InfiniteTableColumnRenderFunctionForParentNode<
    DATA_TYPE,
    {
      isTreeNode: true;
      isGroupRow: true;
      isParentNode: true;
    }
  >;
  renderTreeIconForLeafNode?: InfiniteTableColumnRenderFunctionForLeafNode<
    DATA_TYPE,
    {
      isTreeNode: true;
      isGroupRow: false;
      isLeafNode: true;
    }
  >;
  renderSortIcon?: InfiniteTableColumnHeaderRenderFunction<DATA_TYPE>;
  renderFilterIcon?: InfiniteTableColumnHeaderRenderFunction<DATA_TYPE>;
  renderSelectionCheckBox?:
    | boolean
    | InfiniteTableColumnOrHeaderRenderFunction<DATA_TYPE>;
  renderMenuIcon?: boolean | InfiniteTableColumnHeaderRenderFunction<DATA_TYPE>;

  renderHeaderSelectionCheckBox?:
    | boolean
    | InfiniteTableColumnHeaderRenderFunction<DATA_TYPE>;

  components?: {
    ColumnCell?: React.ComponentType<HTMLProps<HTMLDivElement>>;
    HeaderCell?: React.ComponentType<HTMLProps<HTMLDivElement>>;

    Editor?: React.ComponentType<HTMLProps<HTMLDivElement>>;
    FilterEditor?: React.ComponentType<HTMLProps<HTMLDivElement>>;
    FilterOperatorSwitch?: React.ComponentType<HTMLProps<HTMLDivElement>>;

    MenuIcon?: React.ComponentType<MenuIconProps>;
  };
};

export type InfiniteTableGeneratedGroupColumn<T> = Omit<
  InfiniteTableColumn<T>,
  'defaultSortable'
> & {
  groupByForColumn: GroupBy<T> | GroupBy<T>[];
  id?: string;
};

export type InfiniteTablePivotColumn<T> = InfiniteTableColumn<T> &
  ColumnTypeWithInherit<Partial<InfiniteTablePivotFinalColumnVariant<T, any>>>;

export type InfiniteTablePivotFinalColumnGroup<
  DataType,
  KeyType extends any = any,
> = InfiniteTableColumnGroup & {
  pivotBy: DataSourcePivotBy<DataType>[];
  pivotTotalColumnGroup?: true;
  pivotGroupKeys: KeyType[];
  pivotByAtIndex: PivotBy<DataType, KeyType>;
  pivotGroupKey: KeyType;
  pivotIndex: number;
};
export type InfiniteTablePivotFinalColumn<
  DataType,
  KeyType extends any = any,
> = InfiniteTableColumn<DataType> & {
  pivotBy: DataSourcePivotBy<DataType>[];
  pivotColumn: true;
  pivotTotalColumn: boolean;
  pivotAggregator: AggregationReducer<DataType, any>;
  pivotAggregatorIndex: number;

  pivotGroupKeys: KeyType[];
  pivotByAtIndex?: PivotBy<DataType, KeyType>;
  pivotIndex: number;
  pivotGroupKey: KeyType;
};

export type InfiniteTablePivotFinalColumnVariant<
  DataType,
  KeyType extends any = any,
> = InfiniteTablePivotFinalColumn<DataType, KeyType>;
// export type InfiniteTablePivotFinalColumnVariant<
//   DataType,
//   KeyType extends any = any,
// > = Omit<InfiniteTablePivotFinalColumn<DataType, KeyType>, 'pivotByAtIndex'> & {
//   pivotByAtIndex?: PivotBy<DataType, KeyType>;
// };

type InfiniteTableComputedColumnBase<T> = {
  computedFilterType: string;
  computedSortType: string | string[];
  computedDataType: string;
  computedWidth: number;
  computedFlex: number | null;
  computedMinWidth: number;
  computedMaxWidth: number;
  computedOffset: number;
  computedPinningOffset: number;
  computedAbsoluteOffset: number;
  computedSortInfo: DataSourceSingleSortInfo<T> | null;
  computedSorted: boolean;
  computedSortedAsc: boolean;
  computedSortedDesc: boolean;
  computedSortIndex: number;
  computedVisible: boolean;
  computedVisibleIndex: number;
  computedVisibleIndexInCategory: number;
  computedMultiSort: boolean;
  computedFiltered: boolean;
  computedFilterable: boolean;
  computedFilterValue: DataSourceFilterValueItem<T> | null;

  computedPinned: InfiniteTableColumnPinnedValues;
  computedDraggable: boolean;
  computedResizable: boolean;
  computedFirstInCategory: boolean;
  computedLastInCategory: boolean;
  computedFirst: boolean;
  computedLast: boolean;
  computedEditable: NonUndefined<InfiniteTableColumn<T>['defaultEditable']>;
  computedSortable: NonUndefined<InfiniteTableColumn<T>['defaultSortable']>;
  colType: InfiniteTableColumnType<T>;
  id: string;
};

export type InfiniteTableComputedColumn<T> = InfiniteTableColumn<T> &
  InfiniteTableComputedColumnBase<T> &
  Partial<InfiniteTablePivotFinalColumn<T>> &
  Partial<InfiniteTableGeneratedGroupColumn<T>>;

export type InfiniteTableComputedPivotFinalColumn<T> =
  InfiniteTableComputedColumn<T> & InfiniteTablePivotFinalColumn<T>;
