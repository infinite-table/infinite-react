export const dts = `
/// <reference types="react" />

import * as React from "react";

export declare const InfiniteTableClassName: string

export declare const InfiniteTableFactory: <T extends unknown>(_cfg?: InfiniteTableFactoryConfig) => {
    (props: InfiniteTableProps<T>): JSX.Element;
    defaultProps: Partial<InfiniteTableProps<T>>;
}

declare type InfiniteTablePropColumnOrderNormalized = string[];

export interface InfiniteTableComputedValues<T> extends InfiniteTableProps<T> {
    computedPinnedStartColumns: InfiniteTableComputedColumn<T>[];
    computedPinnedEndColumns: InfiniteTableComputedColumn<T>[];
    computedUnpinnedColumns: InfiniteTableComputedColumn<T>[];
    computedVisibleColumns: InfiniteTableComputedColumn<T>[];
    computedVisibleColumnsMap: Map<string, InfiniteTableComputedColumn<T>>;
    computedColumnVisibility: InfiniteTablePropColumnVisibility;
    computedColumnOrder: InfiniteTablePropColumnOrderNormalized;
    computedPinnedStartColumnsWidth: number;
    computedPinnedEndColumnsWidth: number;
    computedUnpinnedColumnsWidth: number;
    computedUnpinnedOffset: number;
    computedPinnedEndOffset: number;
    computedRemainingSpace: number;
    showZebraRows: boolean;
    unpinnedColumnRenderCount: number;
    columnRenderStartIndex: number;
    setColumnPinning: (columnPinning: InfiniteTablePropColumnPinning) => void;
    setColumnOrder: (columnOrder: InfiniteTablePropColumnOrder) => void;
    setColumnVisibility: (columnVisibility: InfiniteTablePropColumnVisibility) => void;
    rowHeight: number;
}

export declare type InfiniteTableEnhancedData<T> = {
    data: T | null;
    groupData?: T[];
    value?: any;
    isGroupRow?: boolean;
    groupNesting?: number;
    groupKeys?: any[];
    groupCount?: number;
};

export declare type InfiniteTablePropColumnOrder = InfiniteTablePropColumnOrderNormalized | true;

export declare type InfiniteTablePropColumnVisibility = Map<string, false>;

export declare type InfiniteTablePropColumnPinning = Map<string, true | 'start' | 'end'>;

declare type InfiniteTableColumnTypes = 'string' | 'number' | 'date';

declare type InfiniteTableColumnAlign = 'start' | 'center' | 'end';

declare type InfiniteTableColumnVerticalAlign = 'start' | 'center' | 'end';

declare type Renderable = React.ReactNode;

interface InfiniteTableColumnHeaderRenderParams<T> {
    column: InfiniteTableComputedColumn<T>;
    columnSortInfo: DataSourceSingleSortInfo<T> | null | undefined;
}

declare type InfiniteTableColumnHeaderRenderFunction<T> = ({ columnSortInfo, column, }: InfiniteTableColumnHeaderRenderParams<T>) => Renderable;

declare type InfiniteTableColumnHeader<T> = Renderable | InfiniteTableColumnHeaderRenderFunction<T>;

declare type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> & {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
}[Keys];

declare type InfiniteTableColumnRenderFunction<DATA_TYPE> = ({ value, rowIndex, column, data, enhancedData, }: InfiniteTableColumnRenderParams<DATA_TYPE>) => Renderable | null;

declare type InfiniteTableColumnWithRenderOrField<T> = RequireAtLeastOne<{
    field?: keyof T;
    render?: InfiniteTableColumnRenderFunction<T>;
}, 'render' | 'field'>;

declare type DiscriminatedUnion<A, B> = (A & {
    [K in keyof B]?: undefined;
}) | (B & {
    [K in keyof A]?: undefined;
});

declare type InfiniteTableColumnWithFlex = {
    flex?: number;
    defaultFlex?: number;
};

declare type InfiniteTableColumnWithWidth = {
    width?: number;
    defaultWidth?: number;
};

declare type InfiniteTableColumnWithSize = DiscriminatedUnion<InfiniteTableColumnWithFlex, InfiniteTableColumnWithWidth>;

export declare type InfiniteTableColumn<T> = {
    maxWidth?: number;
    minWidth?: number;
    type?: InfiniteTableColumnTypes;
    sortable?: boolean;
    draggable?: boolean;
    align?: InfiniteTableColumnAlign;
    verticalAlign?: InfiniteTableColumnVerticalAlign;
    header?: InfiniteTableColumnHeader<T>;
    name?: Renderable;
    cssEllipsis?: boolean;
    headerCssEllipsis?: boolean;
} & InfiniteTableColumnWithRenderOrField<T> & InfiniteTableColumnWithSize;

declare type InfiniteTableColumnPinned = 'start' | 'end' | false;

declare type InfiniteTableComputedColumnBase<T> = {
    computedWidth: number;
    computedOffset: number;
    computedPinningOffset: number;
    computedAbsoluteOffset: number;
    computedSortable: boolean;
    computedSortInfo: DataSourceSingleSortInfo<T> | null;
    computedSorted: boolean;
    computedSortedAsc: boolean;
    computedSortedDesc: boolean;
    computedVisibleIndex: number;
    computedPinned: InfiniteTableColumnPinned;
    computedDraggable: boolean;
    computedFirstInCategory: boolean;
    computedLastInCategory: boolean;
    computedFirst: boolean;
    computedLast: boolean;
    toggleSort: () => void;
    id: string;
};

export declare type InfiniteTableComputedColumn<T> = InfiniteTableColumn<T> & InfiniteTableComputedColumnBase<T>;

export interface InfiniteTableColumnRenderParams<DATA_TYPE> {
    value: string | number | Renderable | void;
    data: DATA_TYPE | null;
    enhancedData: InfiniteTableEnhancedData<DATA_TYPE>;
    rowIndex: number;
    column: InfiniteTableComputedColumn<DATA_TYPE>;
}

interface Setter<T> extends React.Dispatch<React.SetStateAction<T>> {
}

interface Size {
    width: number;
    height: number;
}

interface ScrollPosition {
    scrollTop: number;
    scrollLeft: number;
}

interface InfiniteTableActions<T> {
    setBodySize: Setter<Size>;
    setScrollPosition: Setter<ScrollPosition>;
    setColumnOrder: Setter<InfiniteTablePropColumnOrder>;
    setColumnVisibility: Setter<InfiniteTablePropColumnVisibility>;
    setColumnPinning: Setter<InfiniteTablePropColumnPinning>;
    setColumnShifts: Setter<number[] | null>;
    setDraggingColumnId: Setter<string | null>;
    x?: T;
}

declare type VoidFn = () => void;

declare type SubscriptionCallbackOnChangeFn<T> = (node: T | null) => void;

interface SubscriptionCallback<T> {
    (node: T): void;
    get: () => T | null;
    destroy: VoidFn;
    onChange: (fn: SubscriptionCallbackOnChangeFn<T>) => VoidFn;
}

interface InfiniteTableInternalActions<T> {
    onRowHeightChange: SubscriptionCallback<number>;
    x?: T;
}

export interface InfiniteTableContextValue<T> {
    props: InfiniteTableProps<T>;
    ownProps: InfiniteTableOwnProps<T>;
    state: InfiniteTableState<T>;
    computed: InfiniteTableComputedValues<T>;
    actions: InfiniteTableActions<T>;
    internalActions: InfiniteTableInternalActions<T>;
    dispatch: React.Dispatch<InfiniteTableAction>;
    domRef: React.MutableRefObject<HTMLDivElement | null>;
    bodyDOMRef: React.RefObject<HTMLDivElement | null>;
    portalDOMRef: React.RefObject<HTMLDivElement | null>;
}

export interface InfiniteTableFactoryConfig {
}

export interface InfiniteTableState<T> {
    columnShifts: null | number[];
    draggingColumnId: null | string;
    bodySize: Size;
    scrollPosition: ScrollPosition;
    columnOrder: InfiniteTablePropColumnOrder;
    columnVisibility: InfiniteTablePropColumnVisibility;
    columnPinning: InfiniteTablePropColumnPinning;
    x?: T;
}

export declare type InfiniteTableAction = {
    type: InfiniteTableActionType;
    payload?: any;
};

export interface InfiniteTableReducer<T> {
    (state: InfiniteTableState<T>, action: InfiniteTableAction): InfiniteTableState<T>;
}

export interface TableScopedReducer<T> {
    (state: T, action: InfiniteTableAction): T;
}

declare type InfiniteTablePropVirtualizeColumns<T> = boolean | ((columns: InfiniteTableComputedColumn<T>[]) => boolean);

export declare type InfiniteTableProps<T> = {
    columns: Map<string, InfiniteTableColumn<T>>;
    columnVisibility?: InfiniteTablePropColumnVisibility;
    defaultColumnVisibility?: InfiniteTablePropColumnVisibility;
    columnPinning?: InfiniteTablePropColumnPinning;
    defaultColumnPinning?: InfiniteTablePropColumnPinning;
    onColumnVisibilityChange?: (columnVisibility: InfiniteTablePropColumnVisibility) => void;
    primaryKey: string;
    rowHeight: number | string;
    domProps?: React.HTMLProps<HTMLDivElement>;
    showZebraRows?: boolean;
    sortable?: boolean;
    draggableColumns?: boolean;
    header?: boolean;
    columnDefaultWidth?: number;
    columnMinWidth?: number;
    columnMaxWidth?: number;
    virtualizeColumns?: InfiniteTablePropVirtualizeColumns<T>;
    virtualizeRows?: boolean;
    defaultColumnOrder?: InfiniteTablePropColumnOrder;
    columnOrder?: InfiniteTablePropColumnOrder;
    onColumnOrderChange?: (columnOrder: InfiniteTablePropColumnOrder) => void;
    onReady?: (api: InfiniteTableImperativeApi<T>) => void;
    rowProps?: React.HTMLProps<HTMLDivElement> | ((rowArgs: {
        rowIndex: number;
        data: T | null;
    }) => React.HTMLProps<HTMLDivElement>);
    licenseKey?: string;
};

export declare type InfiniteTableOwnProps<T> = InfiniteTableProps<T> & {
    rowHeight: number;
    rowHeightCSSVar: string;
    onHeaderResize: (height: number) => void;
    bodyDOMRef?: React.RefObject<HTMLDivElement | null>;
};

export declare type InfiniteTableImperativeApi<T> = {
    setColumnOrder: (columnOrder: InfiniteTablePropColumnOrder) => void;
    setColumnVisibility: (columnVisibility: InfiniteTablePropColumnVisibility) => void;
    x?: T;
};

export declare enum InfiniteTableActionType {
    SET_COLUMN_SIZE = 0,
    SET_SCROLL_POSITION = 1,
    SET_BODY_SIZE = 2,
    SET_COLUMN_ORDER = 3,
    SET_COLUMN_VISIBILITY = 4,
    SET_COLUMN_SHIFTS = 5,
    SET_COLUMN_PINNING = 6,
    SET_DRAGGING_COLUMN_ID = 7
}

export declare function useDataSource<T>(): DataSourceComputedValues<T>;

export declare function DataSource<T>(props: DataSourceProps<T>): JSX.Element;


export declare type DataSourceEnhancedData<T> = {
    data: T | null;
};

export interface DataSourceDataInfo<T> {
    originalDataArray: T[];
}

declare type SortDir = 1 | -1;

declare type MultisortInfo<T> = {
    /**
     * The sorting direction
     */
    dir: SortDir;
    /**
     * a property whose value to use for sorting on the array items
     */
    field?: keyof T;
    /**
     * for now 'string' and 'number' are known types, meaning they have
     * sort functions already implemented
     */
    type?: string;
    fn?: (a: any, b: any) => number;
};

export declare type DataSourceSingleSortInfo<T> = MultisortInfo<T> & {
    field?: keyof T;
    id?: string;
};

export declare type DataSourceGroupBy<T> = (keyof T)[];

export declare type DataSourceSortInfo<T> = null | undefined | DataSourceSingleSortInfo<T> | DataSourceSingleSortInfo<T>[];

export declare type DataSourceData<T> = T[] | Promise<T[] | {
    data: T[];
}> | (() => T[] | Promise<T[] | {
    data: T[];
}>);

export interface DataSourceProps<T> {
    children: React.ReactNode | ((contextData: DataSourceComputedValues<T>) => React.ReactNode);
    primaryKey: keyof T;
    fields?: (keyof T)[];
    data: DataSourceData<T>;
    loading?: boolean;
    defaultLoading?: boolean;
    onLoadingChange?: (loading: boolean) => void;
    groupBy?: DataSourceGroupBy<T>;
    defaultGroupBy?: DataSourceGroupBy<T>;
    onGroupByChange?: (groupBy: DataSourceGroupBy<T>) => void;
    sortInfo?: DataSourceSortInfo<T>;
    defaultSortInfo?: DataSourceSortInfo<T>;
    onSortInfoChange?: (sortInfo: DataSourceSortInfo<T>) => void;
}

export interface DataSourceState<T> extends DataSourceDataInfo<T> {
    loading: boolean;
    sortInfo: DataSourceSingleSortInfo<T>[];
    originalDataArray: T[];
    dataArray: InfiniteTableEnhancedData<T>[];
    groupBy: DataSourceGroupBy<T>;
}

export interface DataSourceComputedValues<T> extends DataSourceState<T> {
    loading: boolean;
    dataArray: DataSourceEnhancedData<T>[];
    originalDataArray: T[];
    primaryKey: keyof T;
    sortInfo: DataSourceSingleSortInfo<T>[];
}

export interface DataSourceContextValue<T> {
    computed: DataSourceComputedValues<T>;
    props: DataSourceProps<T>;
    state: DataSourceState<T>;
    actions: DataSourceActions<T>;
    dispatch: React.Dispatch<DataSourceAction<any>>;
}

export interface DataSourceActions<T> {
    setLoading: Setter<boolean>;
    setDataSourceInfo: Setter<DataSourceDataInfo<T>>;
    setSortInfo: Setter<DataSourceSortInfo<T>>;
    setGroupBy: Setter<DataSourceGroupBy<T>>;
}

export declare enum DataSourceActionType {
    INIT = "INIT",
    SET_LOADING = "SET_LOADING",
    SET_GROUP_BY = "SET_GROUP_BY",
    SET_DATA_SOURCE_INFO = "SET_DATA_SOURCE_INFO",
    SET_SORT_INFO = "SET_SORT_INFO"
}

export interface DataSourceAction<T> {
    type: DataSourceActionType;
    payload: T;
}

export interface DataSourceReducer<T> {
    (state: DataSourceState<T>, action: DataSourceAction<any>): DataSourceState<T>;
}

declare type GroupKeyType = any;

declare type GroupParams<DataType> = {
    groupBy: (keyof DataType)[];
    groupToKey?: (value: any, item: DataType) => GroupKeyType;
};

declare type Pair<KeyType, ValueType> = {
    value?: ValueType;
    map?: Map<KeyType, Pair<KeyType, ValueType>>;
    revision?: number;
};

declare class DeepMap<KeyType, ValueType> {
    private map;
    private length;
    private revision;
    set(keys: KeyType[] & {
        length: Omit<number, 0>;
    }, value: ValueType): this;
    get(keys: KeyType[]): ValueType | undefined;
    get size(): number;
    delete(keys: KeyType[]): boolean;
    has(keys: KeyType[]): boolean;
    private visitKey;
    visit: (fn: (pair: Pair<KeyType, ValueType>, keys: KeyType[]) => void) => void;
    private sortedIterator;
    private getArray;
    
    topDownEntries(): [KeyType[], ValueType][];
    topDownKeys(): KeyType[][];
    topDownValues(): ValueType[];
}

declare type DataGroupResult<DataType> = {
    deepMap: DeepMap<GroupKeyType, DataType[]>;
    groupParams: GroupParams<DataType>;
};

export declare function group<DataType>(groupParams: GroupParams<DataType>, data: DataType[]): DataGroupResult<DataType>;

export declare function flatten<DataType>(groupResult: DataGroupResult<DataType>): DataType[];

export {}
`;
