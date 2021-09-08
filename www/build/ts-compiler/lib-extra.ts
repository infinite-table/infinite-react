export const dts = `/// <reference types="react" />
declare module "components/types/ScrollPosition" {
    export interface ScrollPosition {
        scrollTop: number;
        scrollLeft: number;
    }
    export type OnScrollFn = (scrollPosition: ScrollPosition) => void;
    export type SetScrollPosition = OnScrollFn;
}
declare module "utils/multisort/sortTypes" {
    const sortTypes: {
        [key: string]: (first: any, second: any) => number;
    };
    export default sortTypes;
}
declare module "utils/multisort/index" {
    export type SortDir = 1 | -1;
    export type MultisortInfo<T> = {
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
    export interface MultisortFn<T> {
        (sortInfo: MultisortInfo<T>[], array: T[]): T[];
        knownTypes: {
            [key: string]: (first: T, second: T) => number;
        };
    }
    export const multisort: {
        <T>(sortInfo: MultisortInfo<T>[], array: T[], get?: ((item: any) => T) | undefined): T[];
        knownTypes: {
            [key: string]: (first: any, second: any) => number;
        };
    };
    const getSortFunctions: <T>(sortInfo: MultisortInfo<T>[]) => (((first: T, second: T) => number) | undefined)[];
    const getMultisortFunction: <T>(sortInfo: MultisortInfo<T>[], get?: ((item: any) => T) | undefined) => (first: T, second: T) => number;
    export { getMultisortFunction, getSortFunctions };
}
declare module "components/hooks/useOnce" {
    export function once<ReturnType>(fn: () => ReturnType): () => ReturnType;
    export function useOnce<ReturnType>(fn: () => ReturnType): ReturnType;
}
declare module "components/types/VoidFn" {
    export type VoidFn = () => void;
}
declare module "utils/sortAscending" {
    export const sortAscending: (a: number, b: number) => number;
}
declare module "utils/DeepMap" {
    import { VoidFn } from "components/types/VoidFn";
    type Pair<KeyType, ValueType> = {
        value?: ValueType;
        map?: Map<KeyType, Pair<KeyType, ValueType>>;
        revision?: number;
    };
    export type DeepMapVisitFn<KeyType, ValueType> = (pair: Pair<KeyType, ValueType>, keys: KeyType[], next: VoidFn) => void;
    export class DeepMap<KeyType, ValueType> {
        private map;
        private length;
        private revision;
        constructor(initial?: [KeyType[], ValueType][]);
        set(keys: KeyType[] & {
            length: Omit<number, 0>;
        }, value: ValueType): this;
        get(keys: KeyType[]): ValueType | undefined;
        get size(): number;
        clear(): void;
        delete(keys: KeyType[]): boolean;
        has(keys: KeyType[]): boolean;
        private visitKey;
        visit: (fn: DeepMapVisitFn<KeyType, ValueType>) => void;
        visitDepthFirst: (fn: (value: ValueType, keys: KeyType[], indexInGroup: number, next?: VoidFn | undefined) => void) => void;
        private visitWithNext;
        private getArray;
        values(): Generator<ValueType, void, unknown>;
        keys(): Generator<KeyType[], void, unknown>;
        entries(): Generator<[KeyType[], ValueType], void, unknown>;
        topDownEntries(): [KeyType[], ValueType][];
        topDownKeys(): KeyType[][];
        topDownValues(): ValueType[];
        private sortedIterator;
    }
}
declare module "utils/debug" {
    export interface LogFn {
        (...args: any[]): LogFn;
        extend: (channelName: string) => LogFn;
    }
    export const dbg: (channelName: string) => LogFn;
    export const err: (channelName: string) => LogFn;
    export class Logger {
        debug: LogFn;
        error: LogFn;
        constructor(channelName: string);
    }
}
declare module "components/utils/isControlledValue" {
    export function isControlledValue(value: any): boolean;
}
declare module "components/utils/isControlled" {
    export function isControlled<V extends keyof T, T>(propName: V, props: T): boolean;
}
declare module "components/hooks/useLatest" {
    export const useLatest: <T>(value: T) => () => T;
}
declare module "components/hooks/usePrevious" {
    export const usePrevious: <T>(value: T, initialValue?: T | undefined) => T;
}
declare module "utils/toUpperFirst" {
    export const toUpperFirst: (s: string) => string;
    export default toUpperFirst;
}
declare module "components/types/Setter" {
    import * as React from 'react';
    export interface Setter<T> extends React.Dispatch<React.SetStateAction<T>> {
    }
}
declare module "components/hooks/useProperty" {
    import { Setter } from "components/types/Setter";
    export const notifyChange: (props: any, propName: string, newValue: any) => void;
    function useProperty<V extends keyof T_PROPS, T_PROPS, NORMALIZED>(propName: V, props: T_PROPS, config: {
        fromState: (defaultValue?: NORMALIZED) => NORMALIZED;
        setState: (v: NORMALIZED) => void;
    } & {
        defaultValue?: T_PROPS[V];
        normalize?: (v?: NORMALIZED | T_PROPS[V]) => NORMALIZED;
        onControlledChange?: (n: NORMALIZED, v: NORMALIZED | T_PROPS[V]) => void;
    }): [NORMALIZED, Setter<NORMALIZED | T_PROPS[V]>];
    export { useProperty };
}
declare module "components/hooks/useComponentState" {
    import * as React from 'react';
    export function getComponentStateContext<T>(): React.Context<T>;
    type ComponentStateContext<T_STATE, T_ACTIONS> = {
        getComponentState: () => T_STATE;
        componentState: T_STATE;
        componentActions: T_ACTIONS;
        updateStateProperty: <T extends keyof T_STATE>(propertyName: T, propertyValue: T_STATE[T]) => void;
    };
    type ComponentStateGeneratedActions<T_STATE> = {
        [k in keyof T_STATE]: T_STATE[k] | React.SetStateAction<T_STATE[k]>;
    };
    export type ComponentStateActions<T_STATE, T_ACTIONS = {}> = ComponentStateGeneratedActions<T_STATE> & T_ACTIONS;
    type ComponentStateRootConfig<T_PROPS, T_STATE, T_READONLY_STATE = {}, T_ACTIONS = {}> = {
        getInitialState: (props: T_PROPS) => T_STATE;
        concludeReducer?: (previousState: T_STATE, currentState: T_STATE, updated: Partial<T_STATE> | null) => T_STATE;
        getReducerActions?: (dispatch: React.Dispatch<any>) => T_ACTIONS;
        deriveReadOnlyState?: (props: T_PROPS, state: T_STATE, updated: Partial<T_STATE> | null) => T_READONLY_STATE;
        onControlledPropertyChange?: (name: string, newValue: any, oldValue: any) => void | ((value: any, oldValue: any) => any);
    };
    export function getComponentStateRoot<T_PROPS, T_STATE extends object, T_READONLY_STATE extends object = {}, T_ACTIONS = {}>(config: ComponentStateRootConfig<T_PROPS, T_STATE, T_READONLY_STATE, T_ACTIONS>): React.NamedExoticComponent<T_PROPS & {
        children: React.ReactNode;
    }>;
    export function useComponentState<T_STATE, T_READONLY_STATE = {}, T_ACTIONS = {}>(): ComponentStateContext<T_STATE & T_READONLY_STATE, ComponentStateActions<T_STATE, T_ACTIONS>>;
}
declare module "components/DataSource/types" {
    import * as React from 'react';
    import { MultisortInfo } from "utils/multisort/index";
    import { DeepMap } from "utils/DeepMap";
    import { AggregationReducer, DeepMapGroupValueType, GroupBy, GroupKeyType, PivotBy } from "utils/groupAndPivot/index";
    import { InfiniteTableColumn, InfiniteTableColumnGroup, InfiniteTableEnhancedData } from "components/InfiniteTable/index";
    import { ComponentStateActions } from "components/hooks/useComponentState";
    import { GroupRowsState } from "components/DataSource/GroupRowsState";
    export interface DataSourceDataInfo<T> {
        originalDataArray: T[];
    }
    export type DataSourceSingleSortInfo<T> = MultisortInfo<T> & {
        field?: keyof T;
        id?: string;
    };
    export type DataSourceGroupRowsBy<T> = GroupBy<T, any>;
    export type DataSourcePivotBy<T> = PivotBy<T, any>;
    export type DataSourceSortInfo<T> = null | DataSourceSingleSortInfo<T> | DataSourceSingleSortInfo<T>[];
    export type DataSourceData<T> = T[] | Promise<T[] | {
        data: T[];
    }> | (() => T[] | Promise<T[] | {
        data: T[];
    }>);
    export type DataSourceGroupRowsList<KeyType> = true | KeyType[][];
    export type DataSourceExpandedAndCollapsedGroupRows<KeyType> = {
        expandedRows: DataSourceGroupRowsList<KeyType>;
        collapsedRows: DataSourceGroupRowsList<KeyType>;
    };
    export interface DataSourceProps<T> {
        children: React.ReactNode | ((contextData: DataSourceComponentState<T>) => React.ReactNode);
        primaryKey: keyof T;
        fields?: (keyof T)[];
        data: DataSourceData<T>;
        loading?: boolean;
        defaultLoading?: boolean;
        onLoadingChange?: (loading: boolean) => void;
        pivotBy?: DataSourcePivotBy<T>[];
        defaultPivotBy?: DataSourcePivotBy<T>[];
        onPivotByChange?: (pivotBy: DataSourcePivotBy<T>[]) => void;
        groupRowsBy?: DataSourceGroupRowsBy<T>[];
        defaultGroupRowsBy?: DataSourceGroupRowsBy<T>[];
        onGroupRowsByChange?: (groupBy: DataSourceGroupRowsBy<T>[]) => void;
        groupRowsState?: GroupRowsState;
        defaultGroupRowsState?: GroupRowsState;
        onGroupRowsStateChange?: (groupRowsState: GroupRowsState) => void;
        sortInfo?: DataSourceSortInfo<T>;
        defaultSortInfo?: DataSourceSortInfo<T>;
        onSortInfoChange?: (sortInfo: DataSourceSortInfo<T>) => void;
    }
    export interface DataSourceState<T> extends DataSourceDataInfo<T> {
        data: DataSourceData<T>;
        loading: boolean;
        sortInfo?: DataSourceSortInfo<T>;
        dataArray: InfiniteTableEnhancedData<T>[];
        groupRowsBy: DataSourceGroupRowsBy<T>[];
        pivotBy?: DataSourcePivotBy<T>[];
        pivotColumns?: Map<string, InfiniteTableColumn<T>>;
        pivotColumnGroups?: Map<string, InfiniteTableColumnGroup>;
        aggregationReducers?: AggregationReducer<T, any>[];
        groupRowsState: GroupRowsState;
        sortedAt: number;
        groupedAt: number;
        updatedAt: number;
        reducedAt: number;
    }
    export interface DataSourceReadOnlyState<T> {
        multiSort: boolean;
        sortInfo: DataSourceSingleSortInfo<T>[];
        primaryKey: keyof T;
        groupDeepMap?: DeepMap<GroupKeyType, DeepMapGroupValueType<T, any>>;
        lastSortDataArray?: T[];
        postSortDataArray?: T[];
        lastGroupDataArray?: InfiniteTableEnhancedData<T>[];
        postGroupDataArray?: InfiniteTableEnhancedData<T>[];
    }
    export interface DataSourceComponentState<T> extends Omit<DataSourceState<T>, 'sortInfo'>, DataSourceReadOnlyState<T> {
    }
    export type DataSourceComponentActions<T> = ComponentStateActions<DataSourceState<T>>;
    export interface DataSourceContextValue<T> {
        getState: () => DataSourceComponentState<T>;
        componentState: DataSourceComponentState<T>;
        componentActions: DataSourceComponentActions<T>;
    }
    export enum DataSourceActionType {
        INIT = "INIT"
    }
    export interface DataSourceAction<T> {
        type: DataSourceActionType;
        payload: T;
    }
    export interface DataSourceReducer<T> {
        (state: DataSourceState<T>, action: DataSourceAction<any>): DataSourceState<T>;
    }
}
declare module "components/DataSource/DataSourceContext" {
    import * as React from 'react';
    import { DataSourceContextValue } from "components/DataSource/types";
    export function getDataSourceContext<T>(): React.Context<DataSourceContextValue<T>>;
}
declare module "components/DataSource/publicHooks/useDataSource" {
    import { DataSourceComponentState, DataSourceContextValue } from "components/DataSource/types";
    export function useDataSource<T>(): DataSourceComponentState<T>;
    export function useDataSourceContextValue<T>(): DataSourceContextValue<T>;
}
declare module "components/DataSource/privateHooks/buildDataSourceDataInfo" {
    import { DataSourceDataInfo } from "components/DataSource/types";
    export function buildDataSourceDataInfo<T>(dataParam: T[] | {
        data: T[];
    }): DataSourceDataInfo<T>;
}
declare module "components/DataSource/privateHooks/loadDataAsync" {
    import { DataSourceData, DataSourceDataInfo } from "components/DataSource/types";
    export function loadDataAsync<T>(data: DataSourceData<T>): Promise<DataSourceDataInfo<T>>;
}
declare module "components/DataSource/privateHooks/useLoadData" {
    export function useLoadData<T>(): void;
}
declare module "components/DataSource/state/normalizeSortInfo" {
    import { DataSourceSingleSortInfo, DataSourceSortInfo } from "components/DataSource/types";
    export const normalizeSortInfo: <T>(sortInfo?: DataSourceSortInfo<T> | undefined) => DataSourceSingleSortInfo<T>[];
}
declare module "components/DataSource/state/getInitialState" {
    import { DataSourceProps, DataSourceReadOnlyState, DataSourceState } from "components/DataSource/types";
    export function getInitialState<T>(initialProps: DataSourceProps<T>): DataSourceState<T>;
    export function deriveReadOnlyState<T extends any>(props: DataSourceProps<T>, state: DataSourceState<T>, _updated: Partial<DataSourceState<T>> | null): DataSourceReadOnlyState<T>;
}
declare module "components/DataSource/state/reducer" {
    import type { DataSourceState, DataSourceReadOnlyState } from "components/DataSource/types";
    export function concludeReducer<T>(previousState: DataSourceState<T> & DataSourceReadOnlyState<T>, state: DataSourceState<T> & DataSourceReadOnlyState<T>, updated: Partial<DataSourceState<T> & DataSourceReadOnlyState<T>> | null): DataSourceState<T> & DataSourceReadOnlyState<T>;
}
declare module "components/DataSource/index" {
    import { DataSourceProps } from "components/DataSource/types";
    import { useDataSource } from "components/DataSource/publicHooks/useDataSource";
    import { GroupRowsState } from "components/DataSource/GroupRowsState";
    function DataSource<T>(props: DataSourceProps<T>): JSX.Element;
    export { useDataSource, DataSource, GroupRowsState };
    export * from "components/DataSource/types";
}
declare module "components/DataSource/GroupRowsState" {
    import { DataSourceExpandedAndCollapsedGroupRows } from "components/DataSource/index";
    export class GroupRowsState<KeyType extends any = any> {
        private expandedMap?;
        private collapsedMap?;
        private collapsedAll;
        private expandedAll;
        private initialState;
        constructor(state: DataSourceExpandedAndCollapsedGroupRows<KeyType> | GroupRowsState<KeyType>);
        getState(): DataSourceExpandedAndCollapsedGroupRows<KeyType>;
        destroy(): void;
        private update;
        areAllCollapsed(): boolean;
        areAllExpanded(): boolean;
        collapseAll(): void;
        expandAll(): void;
        isGroupRowExpanded(keys: KeyType[]): boolean | undefined;
        isGroupRowCollapsed(keys: KeyType[]): boolean;
        setGroupRowExpanded(keys: KeyType[], shouldExpand: boolean): void;
        collapseGroupRow(keys: KeyType[]): void;
        expandGroupRow(keys: KeyType[]): void;
        toggleGroupRow(keys: KeyType[]): void;
    }
}
declare module "utils/groupAndPivot/index" {
    import { GroupRowsState } from "components/DataSource/GroupRowsState";
    import { InfiniteTableGroupColumnBase, InfiniteTablePropColumnGroups, InfiniteTablePropColumns } from "components/InfiniteTable/types/InfiniteTableProps";
    import { DeepMap } from "utils/DeepMap";
    export type AggregationReducer<T, AggregationResultType> = {
        initialValue: AggregationResultType;
        getter: (data: T) => any;
        reducer: (accumulator: any, value: any, data: T) => AggregationResultType | any;
        done?: (accumulatedValue: AggregationResultType | any, array: T[]) => AggregationResultType;
    };
    export interface InfiniteTableEnhancedData<T> {
        id: any;
        data: T | null;
        groupData?: T[];
        value?: any;
        isGroupRow?: boolean;
        collapsed: boolean;
        groupNesting?: number;
        groupKeys?: any[];
        parentGroupKeys?: any[];
        indexInGroup: number;
        indexInAll: number;
        groupCount?: number;
        groupBy?: (keyof T)[];
        pivotValuesMap?: PivotValuesDeepMap<T, any>;
        reducerResults?: any[];
    }
    export interface InfiniteTableEnhancedGroupData<T> extends InfiniteTableEnhancedData<T> {
        data: null;
        groupData: T[];
        value: any;
        isGroupRow: true;
        groupNesting: number;
        groupKeys?: any[];
        groupCount: number;
        groupBy: (keyof T)[];
        pivotValuesMap?: PivotValuesDeepMap<T, any>;
    }
    export type GroupKeyType<T extends any = any> = T;
    type PivotReducerResults<T = any> = T[];
    type PivotGroupValueType<DataType, KeyType> = {
        reducerResults: PivotReducerResults<KeyType>;
        items: DataType[];
    };
    export type PivotValuesDeepMap<DataType, KeyType> = DeepMap<GroupKeyType<KeyType>, PivotGroupValueType<DataType, KeyType>>;
    export type DeepMapGroupValueType<DataType, KeyType> = {
        items: DataType[];
        reducerResults: any[];
        pivotDeepMap?: DeepMap<GroupKeyType<KeyType>, PivotGroupValueType<DataType, KeyType>>;
    };
    export type GroupBy<DataType, KeyType> = {
        field: keyof DataType;
        toKey?: (value: any, data: DataType) => GroupKeyType<KeyType>;
        column?: InfiniteTableGroupColumnBase<DataType>;
    };
    export type PivotBy<DataType, KeyType> = GroupBy<DataType, KeyType>;
    type GroupParams<DataType, KeyType> = {
        groupBy: GroupBy<DataType, KeyType>[];
        defaultToKey?: (value: any, item: DataType) => GroupKeyType<KeyType>;
        pivot?: PivotBy<DataType, KeyType>[];
        reducers?: AggregationReducer<DataType, any>[];
    };
    export type DataGroupResult<DataType, KeyType extends any> = {
        deepMap: DeepMap<GroupKeyType<KeyType>, DeepMapGroupValueType<DataType, KeyType>>;
        groupParams: GroupParams<DataType, KeyType>;
        initialData: DataType[];
        reducerResults?: any[];
        topLevelPivotColumns?: DeepMap<GroupKeyType<KeyType>, boolean>;
        pivot?: PivotBy<DataType, KeyType>[];
    };
    export function group<DataType, KeyType = any>(groupParams: GroupParams<DataType, KeyType>, data: DataType[]): DataGroupResult<DataType, KeyType>;
    export function flatten<DataType, KeyType extends any>(groupResult: DataGroupResult<DataType, KeyType>): DataType[];
    export function enhancedFlatten<DataType, KeyType = any>(groupResult: DataGroupResult<DataType, KeyType>, toPrimaryKey: (data: DataType) => any, groupRowsState?: GroupRowsState): {
        data: InfiniteTableEnhancedData<DataType>[];
    };
    export type ComputedColumnsAndGroups<DataType> = {
        columns: InfiniteTablePropColumns<DataType>;
        columnGroups: InfiniteTablePropColumnGroups;
    };
    export function getPivotColumnsAndColumnGroups<DataType, KeyType = any>(deepMap: DeepMap<KeyType, boolean>, pivotLength: number): ComputedColumnsAndGroups<DataType>;
}
declare module "components/types/Renderable" {
    import * as React from 'react';
    export type Renderable = React.ReactNode | string | number | null;
}
declare module "components/InfiniteTable/types/Utility" {
    export type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType extends readonly (infer ElementType)[] ? ElementType : never;
    export type RequireOnlyOneProperty<T, Keys extends keyof T> = Pick<T, Exclude<keyof T, Keys>> & {
        [K in Keys]-?: Required<Pick<T, K>> & Partial<Record<Exclude<Keys, K>, undefined>>;
    }[Keys];
    export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> & {
        [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
    }[Keys];
    export type DiscriminatedUnion<A, B> = (A & {
        [K in keyof B]?: undefined;
    }) | (B & {
        [K in keyof A]?: undefined;
    });
    export type AllPropertiesOrNone<DATA_TYPE> = DATA_TYPE | {
        [KEY in keyof DATA_TYPE]?: never;
    };
}
declare module "components/InfiniteTable/types/InfiniteTableColumn" {
    import type { Renderable } from "components/types/Renderable";
    import type { DataSourceComponentState, DataSourceSingleSortInfo } from "components/DataSource/types";
    import type { DiscriminatedUnion, RequireAtLeastOne } from "components/InfiniteTable/types/Utility";
    import type { InfiniteTableEnhancedData } from "components/InfiniteTable/types/index";
    export type { DiscriminatedUnion, RequireAtLeastOne };
    export type InfiniteTableToggleGroupRowFn = (groupKeys: any[]) => void;
    export interface InfiniteTableColumnRenderParams<DATA_TYPE> {
        value: string | number | Renderable | void;
        data: DATA_TYPE | null;
        enhancedData: InfiniteTableEnhancedData<DATA_TYPE>;
        rowIndex: number;
        column: InfiniteTableComputedColumn<DATA_TYPE>;
        toggleCurrentGroupRow: () => void;
        toggleGroupRow: InfiniteTableToggleGroupRowFn;
        groupRowsBy: DataSourceComponentState<DATA_TYPE>['groupRowsBy'];
    }
    export interface InfiniteTableColumnHeaderRenderParams<T> {
        column: InfiniteTableComputedColumn<T>;
        columnSortInfo: DataSourceSingleSortInfo<T> | null | undefined;
    }
    export type InfiniteTableColumnPinned = 'start' | 'end' | false;
    export type InfiniteTableColumnRenderFunction<DATA_TYPE> = ({ value, rowIndex, column, data, toggleGroupRow, toggleCurrentGroupRow, enhancedData, groupRowsBy: groupBy, }: InfiniteTableColumnRenderParams<DATA_TYPE>) => Renderable | null;
    export type InfiniteTableColumnHeaderRenderFunction<T> = ({ columnSortInfo, column, }: InfiniteTableColumnHeaderRenderParams<T>) => Renderable;
    export type InfiniteTableColumnWithField<T> = {
        field: keyof T;
    };
    export type InfiniteTableColumnWithRender<T> = {
        render: InfiniteTableColumnRenderFunction<T>;
    };
    export type InfiniteTableColumnAlign = 'start' | 'center' | 'end';
    export type InfiniteTableColumnVerticalAlign = 'start' | 'center' | 'end';
    export type InfiniteTableColumnHeader<T> = Renderable | InfiniteTableColumnHeaderRenderFunction<T>;
    type InfiniteTableColumnWithFlex = {
        flex?: number;
        defaultFlex?: number;
    };
    type InfiniteTableColumnWithWidth = {
        width?: number;
        defaultWidth?: number;
    };
    export type InfiniteTableColumnWithSize = DiscriminatedUnion<InfiniteTableColumnWithFlex, InfiniteTableColumnWithWidth>;
    export type InfiniteTableColumnTypes = 'string' | 'number' | 'date';
    export type InfiniteTableColumnWithRenderOrField<T> = RequireAtLeastOne<{
        field?: keyof T;
        render?: InfiniteTableColumnRenderFunction<T>;
    }, 'render' | 'field'>;
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
    };
    export type InfiniteTableColumn<T> = {} & InfiniteTableBaseColumn<T> & InfiniteTableColumnWithRenderOrField<T> & InfiniteTableColumnWithSize;
    export type InfiniteTableGeneratedColumn<T> = InfiniteTableColumn<T> & {
        groupByField?: string | string[];
        renderValue?: InfiniteTableColumnRenderFunction<T>;
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
    export type InfiniteTableComputedColumn<T> = InfiniteTableColumn<T> & InfiniteTableComputedColumnBase<T> & InfiniteTableGeneratedColumn<T>;
}
declare module "components/InfiniteTable/types/InfiniteTableProps" {
    import * as React from 'react';
    import { AggregationReducer, InfiniteTableEnhancedData } from "utils/groupAndPivot/index";
    import { DataSourceGroupRowsBy } from "components/DataSource/index";
    import { Renderable } from "components/types/Renderable";
    import type { InfiniteTableBaseColumn, InfiniteTableColumn, InfiniteTableColumnRenderFunction, InfiniteTableColumnWithSize, InfiniteTableComputedColumn, InfiniteTableGeneratedColumn } from "components/InfiniteTable/types/InfiniteTableColumn";
    export type InfiniteTablePropColumnOrderNormalized = string[];
    export type InfiniteTablePropColumnOrder = InfiniteTablePropColumnOrderNormalized | true;
    export type InfiniteTablePropColumnVisibility = Map<string, false>;
    export type InfiniteTablePropColumnPinning = Map<string, true | 'start' | 'end'>;
    export type InfiniteTableRowStyleFnRenderParams<T> = {
        data: T | null;
        enhancedData: InfiniteTableEnhancedData<T>;
        rowIndex: number;
        groupRowsBy?: (keyof T)[];
    };
    export type InfiniteTableRowStyleFn<T> = (params: InfiniteTableRowStyleFnRenderParams<T>) => undefined | React.CSSProperties;
    export type InfiniteTableRowClassNameFn<T> = (params: InfiniteTableRowStyleFnRenderParams<T>) => string | undefined;
    export type InfiniteTablePropRowStyle<T> = React.CSSProperties | InfiniteTableRowStyleFn<T>;
    export type InfiniteTablePropRowClassName<T> = string | InfiniteTableRowClassNameFn<T>;
    export type InfiniteTableColumnAggregator<T, AggregationResultType> = Omit<AggregationReducer<T, AggregationResultType>, 'getter'> & {
        getter?: AggregationReducer<T, AggregationResultType>['getter'];
    };
    export type InfiniteTablePropColumnAggregations<T> = Map<string, InfiniteTableColumnAggregator<T, any>>;
    export type InfiniteTableImperativeApi<T> = {
        setColumnOrder: (columnOrder: InfiniteTablePropColumnOrder) => void;
        setColumnVisibility: (columnVisibility: InfiniteTablePropColumnVisibility) => void;
        setColumnAggregations: (columnAggregations: InfiniteTablePropColumnAggregations<T>) => void;
        x?: T;
    };
    export type InfiniteTablePropVirtualizeColumns<T> = boolean | ((columns: InfiniteTableComputedColumn<T>[]) => boolean);
    export type InfiniteTableInternalProps<T> = {
        rowHeight: number;
        ___t?: T;
    };
    export type InfiniteTablePropColumns<T> = Map<string, InfiniteTableColumn<T>>;
    export type InfiniteTableGeneratedColumns<T> = Map<string, InfiniteTableGeneratedColumn<T>>;
    export type InfiniteTablePropColumnGroups = Map<string, InfiniteTableColumnGroup>;
    /**
     * the keys is an array of strings: first string in the array is the column group id, next strings are the ids of all columns in the group
     * the value is the id of the column to leave as visible
     */
    export type InfiniteTablePropCollapsedColumnGroups = Map<string[], string>;
    export type InfiniteTableColumnGroupHeaderRenderParams = {
        columnGroup: InfiniteTableComputedColumnGroup;
    };
    export type InfiniteTableColumnGroupHeaderRenderFunction = (params: InfiniteTableColumnGroupHeaderRenderParams) => Renderable;
    export type InfiniteTableColumnGroup = {
        columnGroup?: string;
        header?: Renderable | InfiniteTableColumnGroupHeaderRenderFunction;
    };
    export type InfiniteTableComputedColumnGroup = InfiniteTableColumnGroup & {
        id: string;
        groupOffset: number;
        computedWidth: number;
        uniqueGroupId: string[];
        columns: string[];
        depth: number;
    };
    export type GroupColumnGetterOptions<T> = {
        groupIndex?: number;
        groupCount: number;
        groupBy?: DataSourceGroupRowsBy<T>;
        groupRowsBy: DataSourceGroupRowsBy<T>[];
    };
    export type InfiniteTablePropGroupRenderStrategy = 'single-column' | 'multi-column' | 'row';
    export type InfiniteTableGroupColumnBase<T> = InfiniteTableBaseColumn<T> & InfiniteTableColumnWithSize & {
        renderValue?: InfiniteTableColumnRenderFunction<T>;
    };
    export type InfiniteTablePropGroupColumn<T> = InfiniteTableGroupColumnBase<T> | ((options: GroupColumnGetterOptions<T>, toggleGroupRow: (groupKeys: any[]) => void) => InfiniteTableGroupColumnBase<T>);
    export type InfiniteTableProps<T> = {
        columns: InfiniteTablePropColumns<T>;
        groupColumn?: InfiniteTablePropGroupColumn<T>;
        groupRenderStrategy?: InfiniteTablePropGroupRenderStrategy;
        columnVisibility?: InfiniteTablePropColumnVisibility;
        defaultColumnVisibility?: InfiniteTablePropColumnVisibility;
        columnPinning?: InfiniteTablePropColumnPinning;
        defaultColumnPinning?: InfiniteTablePropColumnPinning;
        defaultColumnAggregations?: InfiniteTablePropColumnAggregations<T>;
        columnAggregations?: InfiniteTablePropColumnAggregations<T>;
        columnGroups?: InfiniteTablePropColumnGroups;
        defaultColumnGroups?: InfiniteTablePropColumnGroups;
        defaultCollapsedColumnGroups?: InfiniteTablePropCollapsedColumnGroups;
        collapsedColumnGroups?: InfiniteTablePropCollapsedColumnGroups;
        onColumnVisibilityChange?: (columnVisibility: InfiniteTablePropColumnVisibility) => void;
        rowHeight: number | string;
        rowStyle?: InfiniteTablePropRowStyle<T>;
        rowClassName?: InfiniteTablePropRowClassName<T>;
        headerHeight: number | string;
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
        rowProps?: React.HTMLProps<HTMLDivElement> | ((rowArgs: InfiniteTableRowStyleFnRenderParams<T>) => React.HTMLProps<HTMLDivElement>);
        licenseKey?: string;
    };
}
declare module "components/types/Size" {
    export interface Size {
        width: number;
        height: number;
    }
    export type OnResizeFn = (size: {
        width: number;
        height: number;
    }) => void;
}
declare module "components/types/SubscriptionCallback" {
    import { VoidFn } from "components/types/VoidFn";
    export type SubscriptionCallbackOnChangeFn<T> = (node: T | null) => void;
    export interface SubscriptionCallback<T> {
        (node: T): void;
        get: () => T | null;
        destroy: VoidFn;
        onChange: (fn: SubscriptionCallbackOnChangeFn<T>) => VoidFn;
    }
}
declare module "components/InfiniteTable/types/InfiniteTableState" {
    import type { ScrollPosition } from "components/types/ScrollPosition";
    import type { InfiniteTableColumnGroup, InfiniteTableGeneratedColumns, InfiniteTablePropCollapsedColumnGroups, InfiniteTablePropColumnAggregations, InfiniteTablePropColumnGroups, InfiniteTablePropColumnOrder, InfiniteTablePropColumnPinning, InfiniteTablePropColumnVisibility, InfiniteTablePropGroupRenderStrategy, InfiniteTableProps } from "components/InfiniteTable/types/InfiniteTableProps";
    import { Size } from "components/types/Size";
    import { ComponentStateActions } from "components/hooks/useComponentState";
    import { MutableRefObject } from 'react';
    import { SubscriptionCallback } from "components/types/SubscriptionCallback";
    export interface InfiniteTableState<T> {
        domRef: MutableRefObject<HTMLDivElement | null>;
        bodyDOMRef: MutableRefObject<HTMLDivElement | null>;
        portalDOMRef: MutableRefObject<HTMLDivElement | null>;
        bodySizeRef: MutableRefObject<Size | null>;
        onRowHeightChange: SubscriptionCallback<number>;
        onHeaderHeightChange: SubscriptionCallback<number>;
        rowHeight: number;
        headerHeight: number;
        columnShifts: null | number[];
        draggingColumnId: null | string;
        bodySize: Size;
        scrollPosition: ScrollPosition;
        columnOrder: InfiniteTablePropColumnOrder;
        columnVisibility: InfiniteTablePropColumnVisibility;
        columnPinning: InfiniteTablePropColumnPinning;
        columnAggregations: InfiniteTablePropColumnAggregations<T>;
        columnGroups: InfiniteTablePropColumnGroups;
        collapsedColumnGroups: InfiniteTablePropCollapsedColumnGroups;
        columnGroupsDepthsMap: InfiniteTableColumnGroupsDepthsMap;
        columnGroupsMaxDepth: number;
        columns: InfiniteTableProps<T>['columns'];
        generatedColumns: InfiniteTableGeneratedColumns<T>;
        x?: T;
    }
    export type InfiniteTableComputedColumnGroup = InfiniteTableColumnGroup & {
        depth: number;
    };
    export type InfiniteTableColumnGroupsDepthsMap = Map<string, number>;
    export interface InfiniteTableComponentState<T> extends InfiniteTableState<T>, InfiniteTableReadOnlyState<T> {
    }
    export interface InfiniteTableReadOnlyState<T> {
        groupRenderStrategy: InfiniteTablePropGroupRenderStrategy;
        onReady: InfiniteTableProps<T>['onReady'];
        rowProps: InfiniteTableProps<T>['rowProps'];
        rowStyle: InfiniteTableProps<T>['rowStyle'];
        rowClassName: InfiniteTableProps<T>['rowClassName'];
        groupColumn: InfiniteTableProps<T>['groupColumn'];
        showZebraRows: InfiniteTableProps<T>['showZebraRows'];
        header: InfiniteTableProps<T>['header'];
        columnMinWidth: InfiniteTableProps<T>['columnMinWidth'];
        columnMaxWidth: InfiniteTableProps<T>['columnMaxWidth'];
        columnDefaultWidth: InfiniteTableProps<T>['columnDefaultWidth'];
        sortable: InfiniteTableProps<T>['sortable'];
        virtualizeColumns: InfiniteTableProps<T>['virtualizeColumns'];
        virtualizeHeader: boolean;
        licenseKey: string;
        domProps: InfiniteTableProps<T>['domProps'];
        draggableColumns: boolean;
        columnGroupsDepthsMap: InfiniteTableColumnGroupsDepthsMap;
        columnGroupsMaxDepth: number;
        rowHeightCSSVar: string;
        headerHeightCSSVar: string;
    }
    export type InfiniteTableComponentActions<T> = ComponentStateActions<InfiniteTableState<T>>;
}
declare module "components/InfiniteTable/types/InfiniteTableActionType" {
    export enum InfiniteTableActionType {
        SET_COLUMN_SIZE = 0,
        SET_SCROLL_POSITION = 1,
        SET_BODY_SIZE = 2,
        SET_COLUMN_ORDER = 3,
        SET_COLUMN_VISIBILITY = 4,
        SET_COLUMN_SHIFTS = 5,
        SET_COLUMN_PINNING = 6,
        SET_COLUMN_AGGREGATIONS = 7,
        SET_DRAGGING_COLUMN_ID = 8
    }
}
declare module "components/InfiniteTable/types/InfiniteTableAction" {
    import { InfiniteTableActionType } from "components/InfiniteTable/types/InfiniteTableActionType";
    export type InfiniteTableAction = {
        type: InfiniteTableActionType;
        payload?: any;
    };
}
declare module "components/InfiniteTable/types/InfiniteTableComputedValues" {
    import type { InfiniteTableComputedColumn } from "components/InfiniteTable/types/InfiniteTableColumn";
    import type { InfiniteTablePropColumnOrderNormalized, InfiniteTablePropColumnVisibility } from "components/InfiniteTable/types/InfiniteTableProps";
    export interface InfiniteTableComputedValues<T> {
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
        unpinnedColumnRenderCount: number;
        columnRenderStartIndex: number;
    }
}
declare module "components/InfiniteTable/types/InfiniteTableContextValue" {
    import { InfiniteTableComponentActions, InfiniteTableComponentState } from "components/InfiniteTable/types/InfiniteTableState";
    import { InfiniteTableComputedValues } from "components/InfiniteTable/types/InfiniteTableComputedValues";
    export interface InfiniteTableContextValue<T> {
        componentState: InfiniteTableComponentState<T>;
        componentActions: InfiniteTableComponentActions<T>;
        computed: InfiniteTableComputedValues<T>;
        getComputed: () => InfiniteTableComputedValues<T>;
        getState: () => InfiniteTableComponentState<T>;
    }
}
declare module "components/InfiniteTable/types/index" {
    import type { InfiniteTableState } from "components/InfiniteTable/types/InfiniteTableState";
    import type { InfiniteTableAction } from "components/InfiniteTable/types/InfiniteTableAction";
    import type { InfiniteTableActionType } from "components/InfiniteTable/types/InfiniteTableActionType";
    import type { InfiniteTableProps, InfiniteTableImperativeApi, InfiniteTablePropColumnOrder, InfiniteTablePropColumnVisibility, InfiniteTablePropColumnPinning, InfiniteTableColumnAggregator, InfiniteTableColumnGroup, InfiniteTablePropGroupRenderStrategy, InfiniteTablePropColumnAggregations, InfiniteTablePropColumnGroups, InfiniteTablePropRowStyle, InfiniteTableRowStyleFn, InfiniteTableRowClassNameFn, InfiniteTablePropRowClassName } from "components/InfiniteTable/types/InfiniteTableProps";
    import type { InfiniteTableColumn, InfiniteTableComputedColumn, InfiniteTableColumnRenderParams } from "components/InfiniteTable/types/InfiniteTableColumn";
    import type { InfiniteTableComputedValues } from "components/InfiniteTable/types/InfiniteTableComputedValues";
    import type { InfiniteTableContextValue } from "components/InfiniteTable/types/InfiniteTableContextValue";
    import type { InfiniteTableEnhancedData } from "utils/groupAndPivot/index";
    export type { InfiniteTableColumnAggregator, InfiniteTableComputedValues, InfiniteTableEnhancedData, InfiniteTablePropColumnOrder, InfiniteTablePropColumnVisibility, InfiniteTablePropColumnPinning, InfiniteTableColumnGroup, InfiniteTableColumn, InfiniteTableComputedColumn, InfiniteTableColumnRenderParams, InfiniteTableContextValue, InfiniteTablePropGroupRenderStrategy, InfiniteTablePropColumnAggregations, InfiniteTablePropColumnGroups, InfiniteTableState, InfiniteTableAction, InfiniteTableProps, InfiniteTableImperativeApi, InfiniteTableActionType, InfiniteTablePropRowStyle, InfiniteTablePropRowClassName, InfiniteTableRowStyleFn, InfiniteTableRowClassNameFn, };
}
declare module "utils/join" {
    const join: (...args: (string | number | void | null)[]) => string;
    export { join };
}
declare module "components/InfiniteTable/internalProps" {
    export const rootClassName = "ITable";
    export const internalProps: {
        rootClassName: string;
    };
}
declare module "components/InfiniteTable/InfiniteTableContext" {
    import { InfiniteTableContextValue } from "components/InfiniteTable/types/InfiniteTableContextValue";
    export function getInfiniteTableContext<T>(): React.Context<InfiniteTableContextValue<T>>;
}
declare module "components/utils/buildSubscriptionCallback" {
    import { SubscriptionCallback } from "components/types/SubscriptionCallback";
    export function buildSubscriptionCallback<T>(): SubscriptionCallback<T>;
}
declare module "components/InfiniteTable/state/computeColumnGroupsDepths" {
    import type { InfiniteTablePropColumnGroups } from "components/InfiniteTable/types/InfiniteTableProps";
    import type { InfiniteTableColumnGroupsDepthsMap } from "components/InfiniteTable/types/InfiniteTableState";
    export function computeColumnGroupsDepths(columnGroups: InfiniteTablePropColumnGroups): InfiniteTableColumnGroupsDepthsMap;
}
declare module "components/InfiniteTable/state/getInitialState" {
    import { InfiniteTableProps, InfiniteTableState } from "components/InfiniteTable/types/index";
    import { InfiniteTableReadOnlyState } from "components/InfiniteTable/types/InfiniteTableState";
    export function getInitialState<T>(props: InfiniteTableProps<T>): InfiniteTableState<T>;
    export function deriveReadOnlyState<T>(props: InfiniteTableProps<T>, state: InfiniteTableState<T>, updated: Partial<InfiniteTableState<T>> | null): InfiniteTableReadOnlyState<T>;
}
declare module "components/ResizeObserver/index" {
    import * as React from 'react';
    import { OnResizeFn } from "components/types/Size";
    interface ResizeObserverProps {
        /**
         * Specifies whether to call onResize after the initial render (on mount)
         *
         * @default true
         */
        notifyOnMount?: boolean;
        /**
         * If set to true, it will be attached using useLayoutEffect. If false, will be attached using useEffect
         * @default false
         */
        earlyAttach?: boolean;
        onResize: OnResizeFn;
    }
    export const setupResizeObserver: (node: HTMLElement, callback: OnResizeFn) => (() => void);
    /**
     * A hook that notifies you when a certain DOM element has changed it's size
     *
     * @param ref A React ref to a DOM element
     * @param callback The function to be called when the element is resized.
     */
    export const useResizeObserver: (ref: React.MutableRefObject<HTMLElement | null>, callback: OnResizeFn, config?: {
        earlyAttach: boolean;
    }) => void;
    const ReactResizeObserver: {
        (props: ResizeObserverProps): JSX.Element;
        defaultProps: {
            notifyOnMount: boolean;
            earlyAttach: boolean;
        };
    };
    export default ReactResizeObserver;
}
declare module "components/InfiniteTable/hooks/useInfiniteTable" {
    import type { InfiniteTableContextValue } from "components/InfiniteTable/types/index";
    export const useInfiniteTable: <T>() => InfiniteTableContextValue<T>;
}
declare module "components/flexbox/index" {
    import { RequireAtLeastOne } from "components/InfiniteTable/types/Utility";
    type FlexItem = {
        size?: number;
        flex?: number;
        maxSize?: number;
        minSize?: number;
    };
    type FlexItemWithSizeOrFlex = RequireAtLeastOne<FlexItem, 'size' | 'flex'>;
    type FlexComputeParams = {
        availableSize: number;
        minSize?: number;
        maxSize?: number;
        items: FlexItemWithSizeOrFlex[];
    };
    type SizedFlexItem = FlexItem & {
        flexSize?: number;
        computedSize?: number;
    };
    type FlexComputeResult = {
        items: SizedFlexItem[];
        flexSizes: number[];
        computedSizes: number[];
        remainingSize: number;
    };
    export const computeFlex: (params: FlexComputeParams) => FlexComputeResult;
}
declare module "components/InfiniteTable/utils/adjustColumnOrderForPinning" {
    import { InfiniteTablePropColumnPinning } from "components/InfiniteTable/types/index";
    import { InfiniteTablePropColumnOrderNormalized } from "components/InfiniteTable/types/InfiniteTableProps";
    export const adjustColumnOrderForPinning: (columnOrder: InfiniteTablePropColumnOrderNormalized, columnPinning: InfiniteTablePropColumnPinning) => InfiniteTablePropColumnOrderNormalized;
}
declare module "components/InfiniteTable/utils/getComputedVisibleColumns" {
    import type { InfiniteTableColumn, InfiniteTableComputedColumn } from "components/InfiniteTable/types/InfiniteTableColumn";
    import type { Size } from "components/types/Size";
    import type { DataSourceSingleSortInfo } from "components/DataSource/types";
    import type { InfiniteTableGeneratedColumns, InfiniteTablePropColumnOrder, InfiniteTablePropColumnOrderNormalized, InfiniteTablePropColumnPinning, InfiniteTablePropColumnVisibility } from "components/InfiniteTable/types/InfiniteTableProps";
    export type SortInfoMap<T> = {
        [key: string]: {
            sortInfo: DataSourceSingleSortInfo<T>;
            index: number;
        };
    };
    export type GetComputedVisibleColumnsResult<T> = {
        computedRemainingSpace: number;
        computedPinnedStartColumnsWidth: number;
        computedPinnedEndColumnsWidth: number;
        computedUnpinnedColumnsWidth: number;
        columnMinWidth?: number;
        columnMaxWidth?: number;
        columnDefaultWidth?: number;
        computedPinnedStartColumns: InfiniteTableComputedColumn<T>[];
        computedPinnedEndColumns: InfiniteTableComputedColumn<T>[];
        computedUnpinnedColumns: InfiniteTableComputedColumn<T>[];
        computedColumnOrder: InfiniteTablePropColumnOrderNormalized;
        computedUnpinnedOffset: number;
        computedPinnedEndOffset: number;
        computedVisibleColumns: InfiniteTableComputedColumn<T>[];
        computedVisibleColumnsMap: Map<string, InfiniteTableComputedColumn<T>>;
    };
    type GetComputedVisibleColumnsParam<T> = {
        columns: Map<string, InfiniteTableColumn<T>>;
        generatedColumns: InfiniteTableGeneratedColumns<T>;
        bodySize: Size;
        columnMinWidth?: number;
        columnMaxWidth?: number;
        columnDefaultWidth?: number;
        sortable?: boolean;
        multiSort: boolean;
        sortInfo?: DataSourceSingleSortInfo<T>[];
        setSortInfo: (sortInfo: DataSourceSingleSortInfo<T>[]) => void;
        draggableColumns?: boolean;
        columnOrder: InfiniteTablePropColumnOrder;
        columnPinning: InfiniteTablePropColumnPinning;
        columnVisibility: InfiniteTablePropColumnVisibility;
        columnVisibilityAssumeVisible: boolean;
    };
    export const getComputedVisibleColumns: <T extends unknown>({ columns, generatedColumns, bodySize, columnMinWidth, columnMaxWidth, columnDefaultWidth, sortable, sortInfo, setSortInfo, multiSort, draggableColumns, columnOrder, columnPinning, columnVisibility, columnVisibilityAssumeVisible, }: GetComputedVisibleColumnsParam<T>) => GetComputedVisibleColumnsResult<T>;
}
declare module "components/hooks/useRerender" {
    export const useRerender: () => [number, () => void];
}
declare module "components/hooks/useInterceptedMap" {
    type InterceptedMapFns<K, V> = {
        set?: (k: K, v: V) => void;
        beforeClear?: (map: Map<K, V>) => void;
        clear?: () => void;
        delete?: (k: K) => void;
    };
    /**
     *
     * @param map Map to intercept
     * @param fns fns to inject
     * @returns a function to restore the map to initial methods
     */
    export function interceptMap<K, V>(map: Map<K, V>, fns: InterceptedMapFns<K, V>): () => void;
    export function useInterceptedMap<K, V>(map: Map<K, V>, fns: InterceptedMapFns<K, V>): void;
}
declare module "components/InfiniteTable/utils/rafFn" {
    export const rafFn: (fn: () => void) => () => void;
}
declare module "components/InfiniteTable/hooks/useRerenderOnKeyChange" {
    export const useRerenderOnKeyChange: <K extends unknown, V extends unknown>(map: Map<K, V>) => number;
}
declare module "components/InfiniteTable/hooks/useComputedVisibleColumns" {
    import type { DataSourceSingleSortInfo } from "components/DataSource/types";
    import type { InfiniteTableColumn } from "components/InfiniteTable/types/index";
    import type { InfiniteTableGeneratedColumns, InfiniteTablePropColumnOrder, InfiniteTablePropColumnPinning, InfiniteTablePropColumnVisibility } from "components/InfiniteTable/types/InfiniteTableProps";
    import type { Size } from "components/types/Size";
    import type { GetComputedVisibleColumnsResult } from "components/InfiniteTable/utils/getComputedVisibleColumns";
    type UseComputedVisibleColumnsParam<T> = {
        columns: Map<string, InfiniteTableColumn<T>>;
        generatedColumns: InfiniteTableGeneratedColumns<T>;
        bodySize: Size;
        columnMinWidth?: number;
        columnMaxWidth?: number;
        columnDefaultWidth?: number;
        sortable?: boolean;
        draggableColumns?: boolean;
        multiSort: boolean;
        sortInfo?: DataSourceSingleSortInfo<T>[];
        setSortInfo: (sortInfo: DataSourceSingleSortInfo<T>[]) => void;
        columnPinning: InfiniteTablePropColumnPinning;
        columnOrder: InfiniteTablePropColumnOrder;
        columnVisibility: InfiniteTablePropColumnVisibility;
        columnVisibilityAssumeVisible?: boolean;
    };
    type UseComputedVisibleColumnsResult<T> = {
        columns: UseComputedVisibleColumnsParam<T>['columns'];
        computedRemainingSpace: GetComputedVisibleColumnsResult<T>['computedRemainingSpace'];
        computedUnpinnedOffset: GetComputedVisibleColumnsResult<T>['computedUnpinnedOffset'];
        computedPinnedEndOffset: GetComputedVisibleColumnsResult<T>['computedPinnedEndOffset'];
        computedPinnedStartColumnsWidth: GetComputedVisibleColumnsResult<T>['computedPinnedStartColumnsWidth'];
        computedPinnedEndColumnsWidth: GetComputedVisibleColumnsResult<T>['computedPinnedEndColumnsWidth'];
        computedUnpinnedColumnsWidth: GetComputedVisibleColumnsResult<T>['computedUnpinnedColumnsWidth'];
        computedPinnedStartColumns: GetComputedVisibleColumnsResult<T>['computedPinnedStartColumns'];
        computedPinnedEndColumns: GetComputedVisibleColumnsResult<T>['computedPinnedEndColumns'];
        computedUnpinnedColumns: GetComputedVisibleColumnsResult<T>['computedUnpinnedColumns'];
        computedVisibleColumns: GetComputedVisibleColumnsResult<T>['computedVisibleColumns'];
        computedVisibleColumnsMap: GetComputedVisibleColumnsResult<T>['computedVisibleColumnsMap'];
        computedColumnOrder: GetComputedVisibleColumnsResult<T>['computedColumnOrder'];
    };
    export const useComputedVisibleColumns: <T extends unknown>({ columns, generatedColumns, bodySize, columnMinWidth, columnMaxWidth, columnDefaultWidth, sortable, draggableColumns, sortInfo, multiSort, setSortInfo, columnOrder, columnPinning, columnVisibility, columnVisibilityAssumeVisible, }: UseComputedVisibleColumnsParam<T>) => UseComputedVisibleColumnsResult<T>;
}
declare module "components/DataSource/publicHooks/useDataSourceActions" {
    import { DataSourceComponentActions } from "components/DataSource/types";
    export default function useDataSourceActions<T>(): DataSourceComponentActions<T>;
}
declare module "components/InfiniteTable/hooks/useColumnAggregations" {
    export function useColumnAggregations<T>(): void;
}
declare module "components/InfiniteTable/hooks/useColumnGroups" {
    export function useColumnGroups<T>(): void;
}
declare module "style/utilities" {
    export const ICSS: {
        variables: {
            space: [string, string, string, string, string, string, string, string, string, string, string];
            borderRadius: string;
            fontSize: [string, string, string, string, string, string, string, string];
        };
        alignItems: {
            center: string;
            stretch: string;
        };
        justifyContent: {
            center: string;
            'flex-start': string;
            flexStart: string;
            'flex-end': string;
            flexEnd: string;
        };
        overflow: {
            hidden: string;
            visible: string;
            auto: string;
        };
        overflowX: {
            hidden: string;
            visible: string;
            auto: string;
        };
        overflowY: {
            hidden: string;
            visible: string;
            auto: string;
        };
        cursor: {
            pointer: string;
        };
        height: {
            0: string;
            '100%': string;
        };
        width: {
            0: string;
            '100%': string;
        };
        top: {
            0: string;
            '100%': string;
        };
        left: {
            0: string;
            '100%': string;
        };
        transform: {
            translate3D000: string;
        };
        willChange: {
            transform: string;
        };
        position: {
            relative: string;
            absolute: string;
            fixed: string;
        };
        display: {
            flex: string;
        };
        flexFlow: {
            row: string;
            column: string;
        };
        whiteSpace: {
            nowrap: string;
        };
        textOverflow: {
            ellipsis: string;
        };
        userSelect: {
            none: string;
        };
    };
}
declare module "style/css" {
    export const cssEllipsisClassName: string;
}
declare module "components/InfiniteTable/components/icons/ExpanderIcon" {
    import * as React from 'react';
    type ExpanderIconProps = {
        size?: number;
        expanded?: boolean;
        defaultExpanded?: boolean;
        onChange?: (expanded: boolean) => void;
        style?: React.CSSProperties;
        className?: string;
    };
    export function ExpanderIcon(props: ExpanderIconProps): JSX.Element;
}
declare module "components/InfiniteTable/utils/getColumnForGroupBy" {
    import { DataSourceGroupRowsBy } from "components/DataSource/index";
    import { InfiniteTableGeneratedColumn } from "components/InfiniteTable/types/InfiniteTableColumn";
    import { GroupColumnGetterOptions, InfiniteTablePropGroupColumn } from "components/InfiniteTable/types/InfiniteTableProps";
    export function getColumnForGroupBy<T>(options: GroupColumnGetterOptions<T> & {
        groupIndex: number;
        groupBy: DataSourceGroupRowsBy<T>;
    }, toggleGroupRow: (groupRowKeys: any[]) => void, groupColumnFromProps?: InfiniteTablePropGroupColumn<T>): InfiniteTableGeneratedColumn<T>;
    export function getSingleGroupColumn<T>(options: GroupColumnGetterOptions<T>, toggleGroupRow: (groupRowKeys: any[]) => void, groupColumnFromProps?: InfiniteTablePropGroupColumn<T>): InfiniteTableGeneratedColumn<T>;
}
declare module "components/InfiniteTable/hooks/useGroupRowsBy" {
    export function useGroupRowsBy<T>(): void;
}
declare module "components/InfiniteTable/hooks/useComputed" {
    import { InfiniteTableComputedValues } from "components/InfiniteTable/types/index";
    export function useComputed<T>(): InfiniteTableComputedValues<T>;
}
declare module "components/InfiniteTable/hooks/useInternalProps" {
    export const useInternalProps: () => {
        rootClassName: string;
    };
    export const getInternalProps: () => {
        rootClassName: string;
    };
}
declare module "components/InfiniteTable/components/InfiniteTableBody/InfiniteTableBody" {
    import * as React from 'react';
    export const InfiniteTableBody: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
}
declare module "components/InfiniteTable/components/InfiniteTableBody/index" {
    export * from "components/InfiniteTable/components/InfiniteTableBody/InfiniteTableBody";
}
declare module "utils/getGlobal" {
    export function getGlobal<T extends Window>(): T;
}
declare module "components/utils/getScrollbarWidth" {
    export function getScrollbarWidth(): number;
}
declare module "components/VirtualBrain/index" {
    import { Logger } from "utils/debug";
    import { Size } from "components/types/Size";
    import type { OnScrollFn, ScrollPosition } from "components/types/ScrollPosition";
    type MainAxisOptions = 'vertical' | 'horizontal';
    export type VirtualBrainOptions = {
        mainAxis: MainAxisOptions;
        itemSize: MainAxisSize;
        count: number;
        name?: string;
    };
    export type MainAxisSize = number | ((itemIndex: number) => number);
    type OnRenderCountChangeFn = (renderCount: number) => void;
    type OnSizeChangeFn = (size: number) => void;
    export type GetItemPositionFn = (itemIndex: number) => number;
    export type RenderRange = {
        renderStartIndex: number;
        renderEndIndex: number;
    };
    export type OnRenderRangeChangeFn = (renderRange: RenderRange) => void;
    export class VirtualBrain extends Logger {
        private scrollPosition;
        private scrollPositionOnMainAxis;
        private itemSizeCache;
        private itemOffsetCache;
        private options;
        private totalSize;
        private onScrollFns;
        private onTotalSizeChangeFns;
        private onRenderCountChangeFns;
        private onRenderRangeChangeFns;
        name: string | undefined;
        private renderCount;
        private renderRange;
        private availableSize;
        constructor(options: VirtualBrainOptions);
        setAvailableSize: (size: Size) => void;
        getOptions(): VirtualBrainOptions;
        private updateRenderCount;
        private computeRenderCount;
        private setRenderCount;
        private updateRenderRange;
        getRenderStartIndex(): number;
        getRenderCount: () => number;
        setScrollPosition: (scrollPosition: ScrollPosition) => void;
        private notifyScrollChange;
        private notifyTotalSizeChange;
        private notifyRenderCountChange;
        private notifyRenderRangeChange;
        getRenderRange: () => RenderRange;
        private setRenderRange;
        private computeRenderRange;
        getScrollPosition: () => ScrollPosition;
        onScroll: (fn: OnScrollFn) => () => void;
        onTotalSizeChange: (fn: OnSizeChangeFn) => () => void;
        onRenderCountChange: (fn: OnRenderCountChangeFn) => () => void;
        onRenderRangeChange: (fn: OnRenderRangeChangeFn) => () => void;
        update: (newCount: VirtualBrainOptions['count'], newItemSize: VirtualBrainOptions['itemSize']) => void;
        private reset;
        private computeCacheFor;
        private getItemSizeCacheFor;
        getItemSize: (itemIndex: number) => number;
        getTotalSize: () => number;
        getItemAt: (scrollPos: number) => number;
        getItemOffsetFor: (itemIndex: number) => number;
        destroy: () => void;
    }
}
declare module "components/InfiniteTable/components/ScrollbarPlaceholder" {
    import * as React from 'react';
    function HorizontalScrollbarPlaceholderFn(props: {
        style: React.CSSProperties;
    }): JSX.Element | null;
    export const HorizontalScrollbarPlaceholder: React.MemoExoticComponent<typeof HorizontalScrollbarPlaceholderFn>;
    function VerticalScrollbarPlaceholderFn(props: {
        style: React.CSSProperties;
    }): JSX.Element | null;
    export const VerticalScrollbarPlaceholder: React.MemoExoticComponent<typeof VerticalScrollbarPlaceholderFn>;
}
declare module "components/InfiniteTable/hooks/useInfiniteTableState" {
    import { InfiniteTableState } from "components/InfiniteTable/types/index";
    export const useInfiniteTableState: <T>() => InfiniteTableState<T>;
}
declare module "components/InfiniteTable/components/InfiniteTableRow/InfiniteTableCellTypes" {
    import { CSSProperties } from 'react';
    import { InfiniteTableComputedColumn } from "components/InfiniteTable/index";
    import { Renderable } from "components/types/Renderable";
    import { OnResizeFn } from "components/types/Size";
    import { InfiniteTableEnhancedData } from "components/InfiniteTable/types/index";
    import { InfiniteTableToggleGroupRowFn } from "components/InfiniteTable/types/InfiniteTableColumn";
    export interface InfiniteTableCellProps<T> {
        column: InfiniteTableComputedColumn<T>;
        cssEllipsis?: boolean;
        children: Renderable;
        virtualized?: boolean;
        skipColumnShifting?: boolean;
        beforeChildren?: Renderable;
        afterChildren?: Renderable;
        offset?: number;
        offsetProperty?: 'left' | 'right';
        cssPosition?: CSSProperties['position'];
        domRef?: React.RefCallback<HTMLElement>;
    }
    export interface InfiniteTableColumnCellProps<T> extends Omit<InfiniteTableCellProps<T>, 'children'> {
        virtualized: boolean;
        enhancedData: InfiniteTableEnhancedData<T>;
        toggleGroupRow: InfiniteTableToggleGroupRowFn;
        rowIndex: number;
    }
    export interface InfiniteTableHeaderCellProps<T> extends Omit<InfiniteTableCellProps<T>, 'children'> {
        columns: Map<string, InfiniteTableComputedColumn<T>>;
        headerHeight: number;
        onResize?: OnResizeFn;
    }
}
declare module "components/InfiniteTable/components/InfiniteTableRow/InfiniteTableCell" {
    import * as React from 'react';
    import { InfiniteTableCellProps } from "components/InfiniteTable/components/InfiniteTableRow/InfiniteTableCellTypes";
    export const InfiniteTableCellClassName: string;
    function InfiniteTableCellFn<T>(props: InfiniteTableCellProps<T> & React.HTMLAttributes<HTMLElement>): JSX.Element;
    export const InfiniteTableCell: typeof InfiniteTableCellFn;
}
declare module "components/InfiniteTable/utils/moveXatY" {
    export const moveXatY: <T>(arr: T[], dragIndex: number, dropIndex: number) => T[];
}
declare module "components/InfiniteTable/hooks/useColumnPointerEvents" {
    import * as React from 'react';
    import { MutableRefObject } from 'react';
    import type { InfiniteTableComputedColumn } from "components/InfiniteTable/types/index";
    type TopLeft = {
        left: number;
        top: number;
    };
    type TopLeftOrNull = TopLeft | null;
    export const useColumnPointerEvents: <T>({ columnId, domRef, columns, computedRemainingSpace, }: {
        computedRemainingSpace: number;
        columns: Map<string, InfiniteTableComputedColumn<T>>;
        columnId: string;
        domRef: React.MutableRefObject<HTMLElement | null>;
    }) => {
        onPointerUp: (e: any) => void;
        onPointerDown: (e: any) => void;
        dragging: boolean;
        proxyOffset: TopLeftOrNull;
        draggingDiff: TopLeft;
    };
}
declare module "components/InfiniteTable/hooks/useCellClassName" {
    import { InfiniteTableComputedColumn } from "components/InfiniteTable/types/index";
    export function useCellClassName<T>(column: InfiniteTableComputedColumn<T>, baseClasses: string[]): string;
}
declare module "components/InfiniteTable/components/icons/SortIcon" {
    import * as React from 'react';
    type SortIconProps = {
        direction: 1 | -1 | 0;
        size?: number;
        lineWidth?: number;
        lineStyle?: React.CSSProperties;
        style?: React.CSSProperties;
        className?: string;
        index?: number;
    };
    export function SortIcon(props: SortIconProps): JSX.Element | null;
}
declare module "components/InfiniteTable/components/InfiniteTableHeader/InfiniteTableHeaderCell" {
    import { InfiniteTableHeaderCellProps } from "components/InfiniteTable/components/InfiniteTableRow/InfiniteTableCellTypes";
    export function InfiniteTableHeaderCell<T>(props: InfiniteTableHeaderCellProps<T>): JSX.Element;
}
declare module "components/InfiniteTable/components/InfiniteTableHeader/InfiniteTableHeaderTypes" {
    import { InfiniteTableComputedColumn } from "components/InfiniteTable/index";
    import { Renderable } from "components/types/Renderable";
    import { VirtualBrain } from "components/VirtualBrain/index";
    import { InfiniteTableComputedColumnGroup } from "components/InfiniteTable/types/InfiniteTableProps";
    export type InfiniteTableHeaderProps<T> = {
        repaintId?: string | number;
        brain: VirtualBrain;
        columns: InfiniteTableComputedColumn<T>[];
        totalWidth: number;
    };
    export type InfiniteTableHeaderGroupProps<T> = {
        columns: InfiniteTableComputedColumn<T>[];
        columnGroup: InfiniteTableComputedColumnGroup;
        children: Renderable;
        height: number;
        headerHeight: number;
    };
    export type InfiniteTableHeaderUnvirtualizedProps<T> = Omit<InfiniteTableHeaderProps<T>, 'repaintId' | 'brain'> & {
        brain?: VirtualBrain;
        scrollable?: boolean;
    };
}
declare module "components/RawList/types" {
    import type { RefCallback } from 'react';
    import type { Renderable } from "components/types/Renderable";
    import type { VirtualBrain } from "components/VirtualBrain/index";
    export type RenderItemParam = {
        domRef: RefCallback<HTMLElement>;
        itemIndex: number;
        itemSize: number;
    };
    export type RenderItem = (renderProps: RenderItemParam) => Renderable;
    export type RawListProps = {
        debugChannel?: string;
        renderItem: RenderItem;
        brain: VirtualBrain;
        repaintId?: string | number;
    };
}
declare module "components/RawList/MappedItems" {
    import { Logger } from "utils/debug";
    import { Renderable } from "components/types/Renderable";
    export class MappedItems extends Logger {
        private elementIndexToItemIndex;
        private itemIndexToElementIndex;
        private renderedElements;
        constructor(axis: string);
        init(): void;
        destroy(): void;
        getUnrenderedItems: (startIndex: number, endIndex: number) => number[];
        getElementsOutsideItemRange: (startIndex: number, endIndex: number) => number[];
        getFirstUnrenderedElementIndex: (endIndex: number, startFrom?: number) => number;
        getElementIndexForItem: (itemIndex: number) => number | null;
        isRenderedItem: (itemIndex: number) => boolean;
        isElementRendered: (elementIndex: number) => boolean;
        getItemRenderedAtElementIndex: (elementIndex: number) => number | null;
        getRenderedElement: (elementIndex: number) => Renderable;
        getRenderedElementAtItemIndex: (itemIndex: number) => Renderable;
        renderItemAtElement(itemIndex: number, elementIndex: number, renderNode?: Renderable): void;
        discardItem: (itemIndex: number) => void;
        discardElement: (elementIndex: number) => boolean;
        discardElementsStartingWith: (elementIndex: number, callback?: ((index: number) => void) | undefined) => boolean;
    }
}
declare module "components/RawList/AvoidReactDiff" {
    import * as React from 'react';
    import { Renderable } from "components/types/Renderable";
    import { SubscriptionCallback } from "components/types/SubscriptionCallback";
    export type AvoidReactDiffProps = {
        name?: string;
        updater: SubscriptionCallback<Renderable>;
    };
    function AvoidReactDiffFn(props: AvoidReactDiffProps): JSX.Element;
    export const AvoidReactDiff: React.MemoExoticComponent<typeof AvoidReactDiffFn>;
}
declare module "components/RawList/ReactVirtualRenderer" {
    import type { Renderable } from "components/types/Renderable";
    import type { RenderItem } from "components/RawList/types";
    import type { RenderRange } from "components/VirtualBrain/index";
    import { Logger } from "utils/debug";
    import { VirtualBrain } from "components/VirtualBrain/index";
    export class ReactVirtualRenderer extends Logger {
        private mappedItems;
        private destroyed;
        private itemDOMElements;
        private itemDOMRefs;
        private updaters;
        private onRender;
        private brain;
        private items;
        prevLength: number;
        constructor(brain: VirtualBrain, { onRender, channel, }: {
            onRender?: ReactVirtualRenderer['onRender'];
            channel?: string;
        });
        renderRange: (range: RenderRange, { renderItem, force, onRender, }: {
            renderItem: RenderItem;
            force: boolean;
            onRender?: ((items: Renderable[]) => void) | undefined;
        }) => Renderable[];
        private renderElement;
        private renderItemAtElement;
        private updateElementPosition;
        destroy: () => void;
    }
}
declare module "components/RawList/index" {
    import * as React from 'react';
    import { RawListProps } from "components/RawList/types";
    export const RawList: React.FC<RawListProps>;
}
declare module "components/InfiniteTable/components/InfiniteTableHeader/InfiniteTableHeader" {
    import * as React from 'react';
    import type { InfiniteTableHeaderProps } from "components/InfiniteTable/components/InfiniteTableHeader/InfiniteTableHeaderTypes";
    export const TableHeaderClassName: string;
    function InfiniteTableHeaderFn<T>(props: InfiniteTableHeaderProps<T> & React.HTMLAttributes<HTMLDivElement>): JSX.Element;
    export const InfiniteTableHeader: typeof InfiniteTableHeaderFn;
}
declare module "components/InfiniteTable/components/InfiniteTableHeader/buildColumnAndGroupTree" {
    import { InfiniteTableColumnGroup, InfiniteTableComputedColumn } from "components/InfiniteTable/types/index";
    import { InfiniteTableComponentState } from "components/InfiniteTable/types/InfiniteTableState";
    export type ColGroupTreeBaseItem = {
        id: string;
        groupOffset: number;
        depth: number;
        computedWidth: number;
    };
    export type ColGroupTreeColumnItem<T> = ColGroupTreeBaseItem & {
        type: 'column';
        ref: InfiniteTableComputedColumn<T>;
    };
    export type ColGroupTreeGroupItem<T> = ColGroupTreeBaseItem & {
        type: 'group';
        ref: InfiniteTableColumnGroup;
        uniqueGroupId: string[];
        children: ColGroupTreeItem<T>[];
        columnItems: ColGroupTreeColumnItem<T>[];
    };
    export type ColGroupTreeItem<T> = ColGroupTreeColumnItem<T> | ColGroupTreeGroupItem<T>;
    export function buildColumnAndGroupTree<T>(columns: InfiniteTableComputedColumn<T>[], columnGroups: InfiniteTableComponentState<T>['columnGroups'], columnGroupsDepthsMap: InfiniteTableComponentState<T>['columnGroupsDepthsMap']): ColGroupTreeItem<T>[];
}
declare module "components/InfiniteTable/components/InfiniteTableHeader/InfiniteTableHeaderGroup" {
    import { InfiniteTableHeaderGroupProps } from "components/InfiniteTable/components/InfiniteTableHeader/InfiniteTableHeaderTypes";
    export const TableHeaderGroupClassName: string;
    export function InfiniteTableHeaderGroup<T>(props: InfiniteTableHeaderGroupProps<T>): JSX.Element;
}
declare module "components/InfiniteTable/components/InfiniteTableHeader/renderColumnHeaderGroups" {
    import { InfiniteTableComputedColumn } from "components/InfiniteTable/types/index";
    import { InfiniteTableComponentState } from "components/InfiniteTable/types/InfiniteTableState";
    type BuildColumnHeaderGroupsConfig<T> = {
        columnGroups: InfiniteTableComponentState<T>['columnGroups'];
        columnGroupsDepthsMap: InfiniteTableComponentState<T>['columnGroupsDepthsMap'];
        columnGroupsMaxDepth: number;
        columns: InfiniteTableComputedColumn<T>[];
        headerHeight: number;
        allVisibleColumns: Map<string, InfiniteTableComputedColumn<T>>;
    };
    export function renderColumnHeaderGroups<T>(config: BuildColumnHeaderGroupsConfig<T>): JSX.Element[];
}
declare module "components/InfiniteTable/components/InfiniteTableHeader/InfiniteTableHeaderUnvirtualized" {
    import * as React from 'react';
    import { InfiniteTableHeaderUnvirtualizedProps } from "components/InfiniteTable/components/InfiniteTableHeader/InfiniteTableHeaderTypes";
    export const TableHeaderClassName: string;
    function InfiniteTableHeaderUnvirtualizedFn<T>(props: InfiniteTableHeaderUnvirtualizedProps<T> & React.HTMLAttributes<HTMLDivElement>): JSX.Element;
    export const InfiniteTableHeaderUnvirtualized: typeof InfiniteTableHeaderUnvirtualizedFn;
}
declare module "components/InfiniteTable/components/InfiniteTableHeader/InfiniteTableHeaderWrapper" {
    import { VirtualBrain } from "components/VirtualBrain/index";
    export type TableHeaderWrapperProps = {
        brain: VirtualBrain;
        scrollbars: {
            vertical: boolean;
            horizontal: boolean;
        };
        repaintId?: number | string;
    };
    export function TableHeaderWrapper<T>(props: TableHeaderWrapperProps): JSX.Element;
}
declare module "components/hooks/useOnScroll" {
    import { RefObject } from 'react';
    type OnScroll = (scrollPosition: {
        scrollTop: number;
        scrollLeft: number;
    }) => void;
    export const useOnScroll: (domRef: RefObject<HTMLElement>, onScroll: OnScroll | undefined) => void;
}
declare module "components/VirtualScrollContainer/getScrollableClassName" {
    import { ICSS } from "style/utilities";
    export type Scrollable = boolean | keyof typeof ICSS['overflow'] | {
        vertical: boolean | keyof typeof ICSS['overflow'];
        horizontal: boolean | keyof typeof ICSS['overflow'];
    };
    export const getScrollableClassName: (scrollable: Scrollable) => string;
}
declare module "components/VirtualScrollContainer/index" {
    import * as React from 'react';
    import { CSSProperties } from 'react';
    import { Scrollable } from "components/VirtualScrollContainer/getScrollableClassName";
    import { Renderable } from "components/types/Renderable";
    export type { Scrollable };
    export interface VirtualScrollContainerProps {
        className?: string;
        style?: CSSProperties;
        children?: Renderable;
        scrollable?: Scrollable;
        onContainerScroll?: (scrollPos: {
            scrollTop: number;
            scrollLeft: number;
        }) => void;
    }
    export const VirtualScrollContainer: React.ForwardRefExoticComponent<VirtualScrollContainerProps & React.RefAttributes<HTMLDivElement>>;
}
declare module "components/VirtualList/SpacePlaceholder" {
    import * as React from 'react';
    interface SpacePlaceholderProps {
        width: number;
        height: number;
        count: number;
    }
    function SpacePlaceholderFn(props: SpacePlaceholderProps): JSX.Element;
    export const SpacePlaceholder: React.MemoExoticComponent<typeof SpacePlaceholderFn>;
}
declare module "components/VirtualList/types" {
    import type { MutableRefObject, RefCallback } from 'react';
    import type { Renderable } from "components/types/Renderable";
    import type { Scrollable } from "components/VirtualScrollContainer/index";
    import type { VirtualBrain } from "components/VirtualBrain/index";
    import type { RenderItem } from "components/RawList/types";
    export type OnContainerScrollFn = (scrollInfo: {
        scrollLeft: number;
        scrollTop: number;
    }) => void;
    interface BaseVirtualListProps {
        brain: VirtualBrain;
        count: number;
        sizeRef?: MutableRefObject<HTMLElement | null>;
        scrollable?: Scrollable;
        outerChildren?: Renderable;
        onContainerScroll?: OnContainerScrollFn;
        children?: Renderable;
        repaintId?: number | string;
    }
    export interface VirtualListProps extends BaseVirtualListProps {
        mainAxis: 'vertical' | 'horizontal';
        renderItem: RenderItem;
        itemMainAxisSize: number | ((itemIndex: number) => number);
        mainAxisSize?: number;
        itemCrossAxisSize?: number;
    }
    export type RowHeight = number | ((rowIndex: number) => number);
    export interface VirtualRowListProps extends BaseVirtualListProps {
        renderRow: RenderRow;
        rowHeight: RowHeight;
        rowWidth?: number;
    }
    export type RenderRowParam = {
        domRef: RefCallback<HTMLElement>;
        rowIndex: number;
        rowHeight: number;
    };
    export type RenderColumnParam = {
        domRef: RefCallback<HTMLElement>;
        columnIndex: number;
        columnWidth: number;
    };
    export type RenderRow = (renderProps: RenderRowParam) => Renderable;
    export type RenderColumn = (renderProps: RenderColumnParam) => Renderable;
}
declare module "components/VirtualList/VirtualList" {
    import { HTMLProps } from 'react';
    import type { VirtualListProps } from "components/VirtualList/types";
    export const VirtualList: (props: VirtualListProps & HTMLProps<HTMLDivElement>) => JSX.Element;
}
declare module "components/VirtualList/VirtualRowList" {
    import { HTMLProps } from 'react';
    import { VirtualRowListProps } from "components/VirtualList/types";
    export const VirtualRowList: (props: VirtualRowListProps & HTMLProps<HTMLDivElement>) => JSX.Element;
}
declare module "components/InfiniteTable/components/InfiniteTableRow/InfiniteTableRowTypes" {
    import type { VirtualBrain } from "components/VirtualBrain/index";
    import type { ScrollPosition } from "components/types/ScrollPosition";
    import type { InfiniteTableComputedColumn, InfiniteTableEnhancedData } from "components/InfiniteTable/types/index";
    import { InfiniteTableToggleGroupRowFn } from "components/InfiniteTable/types/InfiniteTableColumn";
    export interface InfiniteTableRowProps<T> {
        rowHeight: number;
        rowWidth: number;
        rowIndex: number;
        brain: VirtualBrain;
        domRef: React.RefCallback<HTMLElement>;
        enhancedData: InfiniteTableEnhancedData<T>;
        toggleGroupRow: InfiniteTableToggleGroupRowFn;
        repaintId?: number | string;
        virtualizeColumns: boolean;
        showZebraRows?: boolean;
        columns: InfiniteTableComputedColumn<T>[];
        domProps?: React.HTMLAttributes<HTMLDivElement>;
    }
    export type InfiniteTableRowApi = {
        setScrollPosition: (scrollPosition: ScrollPosition) => void;
    };
}
declare module "components/InfiniteTable/components/InfiniteTableRow/InfiniteTableColumnCell" {
    import { InfiniteTableColumnCellProps } from "components/InfiniteTable/components/InfiniteTableRow/InfiniteTableCellTypes";
    function InfiniteTableColumnCellFn<T>(props: InfiniteTableColumnCellProps<T>): JSX.Element;
    export const InfiniteTableColumnCell: typeof InfiniteTableColumnCellFn;
}
declare module "components/InfiniteTable/components/InfiniteTableRow/InfiniteTableRowClassName" {
    export const InfiniteTableRowClassName: string;
    export const InfiniteTableRowClassName__hover: string;
}
declare module "components/InfiniteTable/components/InfiniteTableRow/useRowDOMProps" {
    import { MutableRefObject, RefCallback } from 'react';
    import type { InfiniteTableRowProps } from "components/InfiniteTable/components/InfiniteTableRow/InfiniteTableRowTypes";
    import { InfiniteTableComponentState } from "components/InfiniteTable/types/InfiniteTableState";
    export type TableRowHTMLAttributes = React.HTMLAttributes<HTMLDivElement> & {
        'data-virtualize-columns': 'on' | 'off';
        'data-row-index': number;
        'data-row-id': string;
        ref: RefCallback<HTMLElement | null>;
    };
    export function useRowDOMProps<T>(props: InfiniteTableRowProps<T>, rowProps: InfiniteTableComponentState<T>['rowProps'], rowStyle: InfiniteTableComponentState<T>['rowStyle'], rowClassName: InfiniteTableComponentState<T>['rowClassName'], tableDOMRef: MutableRefObject<HTMLDivElement | null>): {
        domProps: TableRowHTMLAttributes;
        domRef: MutableRefObject<HTMLElement | null>;
    };
}
declare module "components/InfiniteTable/components/InfiniteTableRow/InfiniteTableRow" {
    import * as React from 'react';
    import { InfiniteTableRowClassName } from "components/InfiniteTable/components/InfiniteTableRow/InfiniteTableRowClassName";
    import type { InfiniteTableRowProps } from "components/InfiniteTable/components/InfiniteTableRow/InfiniteTableRowTypes";
    function InfiniteTableRowFn<T>(props: InfiniteTableRowProps<T> & React.HTMLAttributes<HTMLDivElement>): JSX.Element;
    export const InfiniteTableRow: typeof InfiniteTableRowFn;
    export { InfiniteTableRowClassName };
}
declare module "components/InfiniteTable/components/InfiniteTableRow/index" {
    export * from "components/InfiniteTable/components/InfiniteTableRow/InfiniteTableRow";
}
declare module "components/InfiniteTable/components/InfiniteTableRow/InfiniteTableRowUnvirtualized" {
    import type { InfiniteTableRowProps } from "components/InfiniteTable/components/InfiniteTableRow/InfiniteTableRowTypes";
    import { VirtualBrain } from "components/VirtualBrain/index";
    function TableRowUnvirtualizedFn<T>(props: InfiniteTableRowProps<T> & {
        brain: VirtualBrain | null | undefined;
    }): JSX.Element;
    export const TableRowUnvirtualized: typeof TableRowUnvirtualizedFn;
}
declare module "components/InfiniteTable/hooks/useUnpinnedRendering" {
    import type { VirtualBrain } from "components/VirtualBrain/index";
    import type { Size } from "components/types/Size";
    import type { InfiniteTableComputedColumn, InfiniteTableEnhancedData } from "components/InfiniteTable/types/index";
    import { InfiniteTableComponentState } from "components/InfiniteTable/types/InfiniteTableState";
    import { InfiniteTableToggleGroupRowFn } from "components/InfiniteTable/types/InfiniteTableColumn";
    type UnpinnedRenderingParams<T> = {
        columnShifts: number[] | null;
        bodySize: Size;
        getData: () => InfiniteTableEnhancedData<T>[];
        rowHeight: number;
        toggleGroupRow: InfiniteTableToggleGroupRowFn;
        repaintId: string | number;
        applyScrollHorizontal: ({ scrollLeft }: {
            scrollLeft: number;
        }) => void;
        verticalVirtualBrain: VirtualBrain;
        horizontalVirtualBrain: VirtualBrain;
        computedPinnedEndColumns: InfiniteTableComputedColumn<T>[];
        computedUnpinnedColumns: InfiniteTableComputedColumn<T>[];
        computedUnpinnedColumnsWidth: number;
        computedPinnedStartColumnsWidth: number;
        computedPinnedEndColumnsWidth: number;
        getState: () => InfiniteTableComponentState<T>;
    };
    export function useUnpinnedRendering<T>(params: UnpinnedRenderingParams<T>): JSX.Element | null;
}
declare module "components/InfiniteTable/hooks/useOnContainerScroll" {
    import { MutableRefObject } from 'react';
    import type { ScrollPosition } from "components/types/ScrollPosition";
    import { VirtualBrain } from "components/VirtualBrain/index";
    export const useOnContainerScroll: ({ verticalVirtualBrain, horizontalVirtualBrain, domRef, }: {
        verticalVirtualBrain: VirtualBrain;
        horizontalVirtualBrain: VirtualBrain;
        domRef: MutableRefObject<HTMLDivElement | null>;
    }) => {
        applyScrollHorizontal: ({ scrollLeft }: {
            scrollLeft: number;
        }) => void;
        applyScrollVertical: ({ scrollTop }: {
            scrollTop: number;
        }) => void;
        scrollPositionRef: MutableRefObject<ScrollPosition>;
    };
}
declare module "components/hooks/useOnMount" {
    import { RefObject } from 'react';
    export type OnMountProps = {
        onMount?: (node: HTMLElement) => void;
        onUnmount?: (node: HTMLElement) => void;
    };
    export function useOnMount(domRef: RefObject<HTMLElement>, props: OnMountProps): void;
}
declare module "components/VirtualList/RowListWithExternalScrolling" {
    import { CSSProperties } from 'react';
    import { VirtualBrain } from "components/VirtualBrain/index";
    import type { RenderRow } from "components/VirtualList/types";
    import type { ScrollPosition } from "components/types/ScrollPosition";
    import { OnMountProps } from "components/hooks/useOnMount";
    type RowListWithExternalScrollingListProps = {
        brain: VirtualBrain;
        renderRow: RenderRow;
        repaintId?: number | string;
        updateScroll?: (node: HTMLElement, scrollPosition: ScrollPosition) => void;
        style?: CSSProperties;
        className?: string;
    } & OnMountProps;
    export const RowListWithExternalScrolling: (props: RowListWithExternalScrollingListProps) => JSX.Element;
}
declare module "components/InfiniteTable/hooks/usePinnedRendering" {
    import { VirtualBrain } from "components/VirtualBrain/index";
    import { InfiniteTableComputedColumn, InfiniteTableEnhancedData } from "components/InfiniteTable/types/index";
    import type { Size } from "components/types/Size";
    import type { RenderRow } from "components/VirtualList/types";
    import { InfiniteTableComponentState } from "components/InfiniteTable/types/InfiniteTableState";
    import { InfiniteTableToggleGroupRowFn } from "components/InfiniteTable/types/InfiniteTableColumn";
    type UsePinnedParams<T> = {
        getState: () => InfiniteTableComponentState<T>;
        getData: () => InfiniteTableEnhancedData<T>[];
        bodySize: Size;
        repaintId: string | number;
        computedPinnedEndColumnsWidth: number;
        computedPinnedEndColumns: InfiniteTableComputedColumn<T>[];
        verticalVirtualBrain: VirtualBrain;
        scrollbars: {
            vertical: boolean;
            horizontal: boolean;
        };
        rowHeight: number;
        toggleGroupRow: InfiniteTableToggleGroupRowFn;
        computedPinnedStartColumnsWidth: number;
        computedPinnedStartColumns: InfiniteTableComputedColumn<T>[];
    };
    export function usePinnedEndRendering<T>(params: UsePinnedParams<T>): {
        renderRowPinnedEnd: RenderRow;
        pinnedEndList: JSX.Element | null;
        pinnedEndScrollbarPlaceholder: JSX.Element | null;
    };
    export function usePinnedStartRendering<T>(params: UsePinnedParams<T>): {
        renderRowPinnedStart: RenderRow;
        pinnedStartList: JSX.Element | null;
        pinnedStartScrollbarPlaceholder: JSX.Element | null;
    };
}
declare module "components/InfiniteTable/hooks/useColumnSizeFn" {
    import { InfiniteTableComputedColumn } from "components/InfiniteTable/types/index";
    /**
     * Returns a function that can be used to retrieve the width of an unpinned column, by the column index
     */
    export const useColumnSizeFn: (computedUnpinnedColumns: InfiniteTableComputedColumn<any>[]) => (index: number) => number;
}
declare module "components/InfiniteTable/hooks/useYourBrain" {
    import { Size } from "components/types/Size";
    import { VirtualBrain } from "components/VirtualBrain/index";
    import { InfiniteTableComputedColumn } from "components/InfiniteTable/types/index";
    type UseYourBrainParam = {
        computedUnpinnedColumns: InfiniteTableComputedColumn<any>[];
        computedPinnedStartColumnsWidth: number;
        computedPinnedEndColumnsWidth: number;
        dataArray: any[];
        rowHeight: number;
        bodySize: Size;
    };
    export const useYourBrain: (param: UseYourBrainParam) => {
        horizontalVirtualBrain: VirtualBrain;
        verticalVirtualBrain: VirtualBrain;
    };
}
declare module "utils/shallowEqualObjects" {
    export function shallowEqualObjects<T extends object | null>(objA: T, objB: T): boolean;
}
declare module "components/InfiniteTable/hooks/useListRendering" {
    import type { Ref } from 'react';
    import type { InfiniteTableComputedValues } from "components/InfiniteTable/types/index";
    import type { Size } from "components/types/Size";
    type ListRenderingParam<T> = {
        computed: InfiniteTableComputedValues<T>;
        domRef: Ref<HTMLElement>;
        bodySize: Size;
        columnShifts: number[] | null;
        getComputed: () => InfiniteTableComputedValues<T> | undefined;
    };
    import type { VirtualBrain } from "components/VirtualBrain/index";
    type ListRenderingResult = {
        scrollbars: {
            vertical: boolean;
            horizontal: boolean;
        };
        horizontalVirtualBrain: VirtualBrain;
        verticalVirtualBrain: VirtualBrain;
        applyScrollHorizontal: ({ scrollLeft }: {
            scrollLeft: number;
        }) => void;
        applyScrollVertical: ({ scrollTop }: {
            scrollTop: number;
        }) => void;
        pinnedStartList: JSX.Element | null;
        pinnedEndList: JSX.Element | null;
        pinnedStartScrollbarPlaceholder: JSX.Element | null;
        pinnedEndScrollbarPlaceholder: JSX.Element | null;
        centerList: JSX.Element | null;
        repaintId: number;
        reservedContentHeight: number;
    };
    export function useListRendering<T>(param: ListRenderingParam<T>): ListRenderingResult;
}
declare module "components/utils/decamelize" {
    export const decamelize: (input: string, options?: {
        separator: string;
    } | undefined) => string;
}
declare module "components/InfiniteTable/components/InfiniteTableLicenseFooter/index" {
    import * as React from 'react';
    export const InfiniteTableLicenseFooter: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
}
declare module "components/InfiniteTable/hooks/useLicense/crc32" {
    export function crc32_compute_string(str: string, reversedPolynomial?: number): string;
}
declare module "components/InfiniteTable/hooks/useLicense/LicenseDetails" {
    export type LicenseDetails = {
        start: Date;
        end: Date;
        owner: string;
        distribution: boolean;
        trial: boolean;
        skipAirtable?: boolean;
        count?: number;
        timestamp?: number;
        ref: string;
    };
}
declare module "components/InfiniteTable/hooks/useLicense/decode" {
    import { LicenseDetails } from "components/InfiniteTable/hooks/useLicense/LicenseDetails";
    export const fieldsToLicenseDetails: (fields: {
        name: string;
        value: string;
    }[]) => LicenseDetails;
    export const logLicenseError: (lines: string[], fn?: (...line: string[]) => void) => void;
    export const isValidLicense: (licenseKey: string | undefined, packageInfo: {
        publishedAt: number;
        version: string;
    }, fn?: ((...args: string[]) => void) | undefined) => boolean;
    export const decode: (licenseKey: string) => LicenseDetails;
}
declare module "components/InfiniteTable/hooks/useLicense/useLicense" {
    export const useLicense: (licenseKey: string) => boolean;
}
declare module "components/CSSVariableWatch" {
    import * as React from 'react';
    type CSSVariableWatcherProps = {
        varName: string;
        onChange: (value: number) => void;
    };
    export const useCSSVariableWatch: (params: CSSVariableWatcherProps & {
        ref: React.MutableRefObject<HTMLElement | null>;
    }) => void;
    export const CSSVariableWatch: (props: CSSVariableWatcherProps) => JSX.Element;
}
declare module "components/InfiniteTable/index" {
    import * as React from 'react';
    import type { InfiniteTableProps } from "components/InfiniteTable/types/index";
    export const InfiniteTableClassName: string;
    export const InfiniteTableComponent: React.MemoExoticComponent<(<T>() => JSX.Element)>;
    export function InfiniteTable<T>(props: InfiniteTableProps<T>): JSX.Element;
    export namespace InfiniteTable {
        var defaultProps: {
            rowHeight: number;
            headerHeight: string;
        };
    }
    export * from "components/InfiniteTable/types/index";
}
declare module "@infinite-table/infinite-react" {
    export * from "components/InfiniteTable/index";
    export * from "components/DataSource/index";
    export { group, flatten } from "utils/groupAndPivot/index";
}
`