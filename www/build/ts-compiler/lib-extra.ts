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
declare module "utils/proxyFnCall" {
    export function proxyFn<T_PARAM_TO_PROXY, T_FN_PARAMETERS, T_RESULT extends any>(fn: (...params: T_FN_PARAMETERS[]) => T_RESULT, config?: {
        getProxyTargetFromArgs: (...params: T_FN_PARAMETERS[]) => T_PARAM_TO_PROXY;
        putProxyToArgs: (proxy: T_PARAM_TO_PROXY, ...params: T_FN_PARAMETERS[]) => T_FN_PARAMETERS[];
    }): {
        fn: (...params: T_FN_PARAMETERS[]) => T_RESULT;
        propertyReads: Set<string>;
    };
}
declare module "utils/toUpperFirst" {
    export const toUpperFirst: (s: string) => string;
    export default toUpperFirst;
}
declare module "components/utils/isControlledValue" {
    export function isControlledValue(value: any): boolean;
}
declare module "components/utils/isControlled" {
    export function isControlled<V extends keyof T, T>(propName: V, props: T): boolean;
}
declare module "components/hooks/useLatest" {
    export function useLatest<T>(value: T): () => T;
}
declare module "components/hooks/usePrevious" {
    export const usePrevious: <T>(value: T, initialValue?: T | undefined) => T;
}
declare module "components/hooks/useComponentState" {
    import * as React from 'react';
    export const notifyChange: (props: any, propName: string, newValue: any) => void;
    export function getComponentStateContext<T>(): React.Context<T>;
    type ComponentStateContext<T_STATE, T_ACTIONS> = {
        getComponentState: () => T_STATE;
        componentState: T_STATE;
        componentActions: T_ACTIONS;
    };
    type ComponentStateGeneratedActions<T_STATE> = {
        [k in keyof T_STATE]: T_STATE[k] | React.SetStateAction<T_STATE[k]>;
    };
    export type ComponentStateActions<T_STATE> = ComponentStateGeneratedActions<T_STATE>;
    export type ForwardPropsToStateFnResult<TYPE_PROPS, TYPE_RESULT> = Partial<{
        [propName in keyof TYPE_PROPS & keyof TYPE_RESULT]: 1 | ((value: TYPE_PROPS[propName]) => TYPE_RESULT[propName]);
    }>;
    type ComponentStateRootConfig<T_PROPS, COMPONENT_MAPPED_STATE, COMPONENT_SETUP_STATE = {}, COMPONENT_DERIVED_STATE = {}, T_ACTIONS = {}, T_PARENT_STATE = {}> = {
        initSetupState?: () => COMPONENT_SETUP_STATE;
        forwardProps?: () => ForwardPropsToStateFnResult<T_PROPS, COMPONENT_MAPPED_STATE>;
        allowedControlledPropOverrides?: Record<keyof T_PROPS, true>;
        mapPropsToState?: (params: {
            props: T_PROPS;
            state: COMPONENT_MAPPED_STATE & COMPONENT_SETUP_STATE & Partial<COMPONENT_DERIVED_STATE>;
            oldState: null | (COMPONENT_MAPPED_STATE & COMPONENT_SETUP_STATE & Partial<COMPONENT_DERIVED_STATE>);
            parentState: T_PARENT_STATE | null;
        }) => COMPONENT_DERIVED_STATE;
        concludeReducer?: (params: {
            previousState: COMPONENT_MAPPED_STATE & COMPONENT_SETUP_STATE & COMPONENT_DERIVED_STATE;
            state: COMPONENT_MAPPED_STATE & COMPONENT_SETUP_STATE & COMPONENT_DERIVED_STATE;
            updatedProps: Partial<T_PROPS> | null;
            parentState: T_PARENT_STATE | null;
        }) => COMPONENT_MAPPED_STATE & COMPONENT_SETUP_STATE & COMPONENT_DERIVED_STATE;
        getReducerActions?: (dispatch: React.Dispatch<any>) => T_ACTIONS;
        getParentState?: () => T_PARENT_STATE;
        onControlledPropertyChange?: (name: string, newValue: any, oldValue: any) => void | ((value: any, oldValue: any) => any);
    };
    export function getComponentStateRoot<T_PROPS, COMPONENT_MAPPED_STATE extends object, COMPONENT_SETUP_STATE extends object = {}, COMPONENT_DERIVED_STATE extends object = {}, T_ACTIONS = {}, T_PARENT_STATE = {}>(config: ComponentStateRootConfig<T_PROPS, COMPONENT_MAPPED_STATE, COMPONENT_SETUP_STATE, COMPONENT_DERIVED_STATE, T_ACTIONS, T_PARENT_STATE>): React.NamedExoticComponent<T_PROPS & {
        children: React.ReactNode;
    }>;
    export function useComponentState<COMPONENT_STATE>(): ComponentStateContext<COMPONENT_STATE, ComponentStateGeneratedActions<COMPONENT_STATE>>;
}
declare module "components/types/NonUndefined" {
    export type NonUndefined<T> = T extends undefined ? never : T;
}
declare module "components/DataSource/types" {
    import * as React from 'react';
    import { MultisortInfo } from "utils/multisort/index";
    import { DeepMap } from "utils/DeepMap";
    import { AggregationReducer, DeepMapGroupValueType, GroupBy, GroupKeyType, PivotBy } from "utils/groupAndPivot/index";
    import { InfiniteTableColumn, InfiniteTableColumnGroup, InfiniteTableEnhancedData } from "components/InfiniteTable/index";
    import { ComponentStateActions } from "components/hooks/useComponentState";
    import { GroupRowsState } from "components/DataSource/GroupRowsState";
    import { InfiniteTablePropPivotTotalColumnPosition } from "components/InfiniteTable/types/InfiniteTableState";
    import { NonUndefined } from "components/types/NonUndefined";
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
    export type DataSourcePropGroupRowsBy<T> = DataSourceGroupRowsBy<T>[];
    export type DataSourcePropPivotBy<T> = DataSourcePivotBy<T>[];
    export interface DataSourceMappedState<T> {
        remoteCount: DataSourceProps<T>['remoteCount'];
        data: DataSourceProps<T>['data'];
        primaryKey: DataSourceProps<T>['primaryKey'];
        groupRowsBy: NonUndefined<DataSourceProps<T>['groupRowsBy']>;
        groupRowsState: NonUndefined<DataSourceProps<T>['groupRowsState']>;
        pivotBy: DataSourceProps<T>['pivotBy'];
        loading: NonUndefined<DataSourceProps<T>['loading']>;
        sortInfo: DataSourceSingleSortInfo<T>[] | null;
    }
    export interface DataSourceSetupState<T> {
        originalDataArray: T[];
        lastSortDataArray?: T[];
        lastGroupDataArray?: InfiniteTableEnhancedData<T>[];
        dataArray: InfiniteTableEnhancedData<T>[];
        groupDeepMap?: DeepMap<GroupKeyType, DeepMapGroupValueType<T, any>>;
        pivotTotalColumnPosition: InfiniteTablePropPivotTotalColumnPosition;
        updatedAt: number;
        reducedAt: number;
        groupedAt: number;
        sortedAt: number;
        generateGroupRows: boolean;
        aggregationReducers?: AggregationReducer<T, any>[];
        postSortDataArray?: T[];
        postGroupDataArray?: InfiniteTableEnhancedData<T>[];
        pivotColumns?: Map<string, InfiniteTableColumn<T>>;
        pivotColumnGroups?: Map<string, InfiniteTableColumnGroup>;
    }
    export interface DataSourceProps<T> {
        children: React.ReactNode | ((contextData: DataSourceState<T>) => React.ReactNode);
        primaryKey: keyof T;
        fields?: (keyof T)[];
        remoteCount?: number;
        data: DataSourceData<T>;
        loading?: boolean;
        defaultLoading?: boolean;
        onLoadingChange?: (loading: boolean) => void;
        pivotBy?: DataSourcePropPivotBy<T>;
        defaultPivotBy?: DataSourcePropPivotBy<T>;
        onPivotByChange?: (pivotBy: DataSourcePropPivotBy<T>) => void;
        groupRowsBy?: DataSourcePropGroupRowsBy<T>;
        defaultGroupRowsBy?: DataSourcePropGroupRowsBy<T>;
        onGroupRowsByChange?: (groupBy: DataSourcePropGroupRowsBy<T>) => void;
        groupRowsState?: GroupRowsState;
        defaultGroupRowsState?: GroupRowsState;
        onGroupRowsStateChange?: (groupRowsState: GroupRowsState) => void;
        sortInfo?: DataSourceSortInfo<T>;
        defaultSortInfo?: DataSourceSortInfo<T>;
        onSortInfoChange?: (sortInfo: DataSourceSortInfo<T>) => void;
    }
    export interface DataSourceState<T> extends DataSourceSetupState<T>, DataSourceDerivedState<T>, DataSourceMappedState<T> {
    }
    export interface DataSourceDerivedState<_T> {
        multiSort: boolean;
    }
    export type DataSourceComponentActions<T> = ComponentStateActions<DataSourceState<T>>;
    export interface DataSourceContextValue<T> {
        getState: () => DataSourceState<T>;
        componentState: DataSourceState<T>;
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
    import { DataSourceContextValue } from "components/DataSource/types";
    import { DataSourceState } from "components/DataSource/index";
    export function useDataSource<T>(): DataSourceState<T>;
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
    import { DataSourceMappedState, DataSourceProps, DataSourceDerivedState, DataSourceSetupState, DataSourceState } from "components/DataSource/types";
    import { GroupRowsState } from "components/DataSource/GroupRowsState";
    import { ForwardPropsToStateFnResult } from "components/hooks/useComponentState";
    export function initSetupState<T>(): DataSourceSetupState<T>;
    export const forwardProps: <T>() => Partial<{
        data: 1 | ((value: import("components/DataSource/types").DataSourceData<T>) => import("components/DataSource/types").DataSourceData<T>);
        loading: 1 | ((value: boolean | undefined) => boolean);
        remoteCount: 1 | ((value: number | undefined) => number | undefined);
        primaryKey: 1 | ((value: keyof T) => keyof T);
        groupRowsBy: 1 | ((value: import("components/DataSource/types").DataSourcePropGroupRowsBy<T> | undefined) => import("components/DataSource/types").DataSourcePropGroupRowsBy<T>);
        groupRowsState: 1 | ((value: GroupRowsState<any> | undefined) => GroupRowsState<any>);
        pivotBy: 1 | ((value: import("components/DataSource/types").DataSourcePropPivotBy<T> | undefined) => import("components/DataSource/types").DataSourcePropPivotBy<T> | undefined);
        sortInfo: 1 | ((value: import("components/DataSource/types").DataSourceSortInfo<T> | undefined) => import("components/DataSource/types").DataSourceSingleSortInfo<T>[] | null);
    }>;
    export function mapPropsToState<T extends any>(params: {
        props: DataSourceProps<T>;
        state: DataSourceState<T>;
    }): DataSourceDerivedState<T>;
}
declare module "components/DataSource/state/reducer" {
    import type { DataSourceState, DataSourceDerivedState } from "components/DataSource/types";
    export function concludeReducer<T>(params: {
        previousState: DataSourceState<T> & DataSourceDerivedState<T>;
        state: DataSourceState<T> & DataSourceDerivedState<T>;
    }): DataSourceState<T> & DataSourceDerivedState<T>;
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
    import type { DataSourcePivotBy, DataSourceSingleSortInfo, DataSourceState } from "components/DataSource/types";
    import type { DiscriminatedUnion, RequireAtLeastOne } from "components/InfiniteTable/types/Utility";
    import type { InfiniteTableEnhancedData } from "components/InfiniteTable/types/index";
    import { CSSProperties } from 'react';
    export type { DiscriminatedUnion, RequireAtLeastOne };
    export type InfiniteTableToggleGroupRowFn = (groupKeys: any[]) => void;
    export interface InfiniteTableColumnRenderParam<DATA_TYPE, COL_TYPE = InfiniteTableComputedColumn<DATA_TYPE>> {
        value: string | number | Renderable;
        data: DATA_TYPE | null;
        enhancedData: InfiniteTableEnhancedData<DATA_TYPE>;
        groupRowEnhancedData: InfiniteTableEnhancedData<DATA_TYPE> | null;
        rowIndex: number;
        column: COL_TYPE;
        toggleCurrentGroupRow: () => void;
        toggleGroupRow: InfiniteTableToggleGroupRowFn;
        groupRowsBy: DataSourceState<DATA_TYPE>['groupRowsBy'];
    }
    export type InfiniteTableColumnRowspanFnParams<DATA_TYPE, COL_TYPE = InfiniteTableComputedColumn<DATA_TYPE>> = {
        data: DATA_TYPE | null;
        enhancedData: InfiniteTableEnhancedData<DATA_TYPE>;
        groupRowEnhancedData: InfiniteTableEnhancedData<DATA_TYPE> | null;
        dataArray: InfiniteTableEnhancedData<DATA_TYPE>[];
        rowIndex: number;
        column: COL_TYPE;
    };
    export interface InfiniteTableColumnHeaderRenderParams<T> {
        column: InfiniteTableComputedColumn<T>;
        columnSortInfo: DataSourceSingleSortInfo<T> | null | undefined;
    }
    export type InfiniteTableColumnPinned = 'start' | 'end' | false;
    export type InfiniteTableColumnRenderFunction<DATA_TYPE, COL_TYPE = InfiniteTableComputedColumn<DATA_TYPE>> = ({ value, rowIndex, column, data, toggleGroupRow, toggleCurrentGroupRow, enhancedData, groupRowsBy, }: InfiniteTableColumnRenderParam<DATA_TYPE, COL_TYPE>) => Renderable | null;
    export type InfiniteTableColumnHeaderRenderFunction<T> = ({ columnSortInfo, column, }: InfiniteTableColumnHeaderRenderParams<T>) => Renderable;
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
    export type InfiniteTableColumnWithRenderOrRenderValueOrFieldOrValueGetter<T> = RequireAtLeastOne<{
        field?: keyof T;
        render?: InfiniteTableColumnRenderFunction<T>;
        renderValue?: InfiniteTableColumnRenderFunction<T>;
        valueGetter?: InfiniteTableColumnValueGetter<T>;
    }, 'render' | 'renderValue' | 'field' | 'valueGetter'>;
    export type InfiniteTableColumnStyleFnParams<T> = {
        data: T | null;
        value: Renderable;
        enhancedData: InfiniteTableEnhancedData<T>;
        column: InfiniteTableColumn<T>;
    };
    export type InfiniteTableColumnStyleFn<T> = (params: InfiniteTableColumnStyleFnParams<T>) => undefined | React.CSSProperties;
    export type InfiniteTableColumnClassNameFn<T> = (params: InfiniteTableColumnStyleFnParams<T>) => undefined | string;
    export type InfiniteTableColumnStyle<T> = CSSProperties | InfiniteTableColumnStyleFn<T>;
    export type InfiniteTableColumnClassName<T> = string | InfiniteTableColumnClassNameFn<T>;
    export type InfiniteTableColumnValueGetterParams<T> = {
        data: T | null;
        enhancedData: InfiniteTableEnhancedData<T>;
        groupRowEnhancedData: InfiniteTableEnhancedData<T> | null;
    };
    export type InfiniteTableColumnValueGetter<T, VALUE_GETTER_TYPE = Renderable> = (params: InfiniteTableColumnValueGetterParams<T>) => VALUE_GETTER_TYPE;
    export type InfiniteTableColumnRowspanFn<T> = (params: InfiniteTableColumnRowspanFnParams<T>) => number;
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
    };
    export type InfiniteTableColumn<T> = {} & InfiniteTableBaseColumn<T> & InfiniteTableColumnWithRenderOrRenderValueOrFieldOrValueGetter<T> & InfiniteTableColumnWithSize;
    export type InfiniteTableGeneratedGroupColumn<T> = InfiniteTableColumn<T> & {
        groupByField?: string | string[];
    };
    export type InfiniteTablePivotColumn<T> = InfiniteTableColumn<T> & {
        pivotBy?: DataSourcePivotBy<T>[];
        pivotColumn?: true;
        pivotTotalColumn?: true;
        pivotGroupKeys?: any[];
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
    export type InfiniteTableComputedColumn<T> = InfiniteTableColumn<T> & InfiniteTableComputedColumnBase<T> & InfiniteTablePivotColumn<T> & InfiniteTableGeneratedGroupColumn<T>;
}
declare module "utils/groupAndPivot/index" {
    import { DataSourcePivotBy } from "@infinite-table/infinite-react";
    import { GroupRowsState } from "components/DataSource/GroupRowsState";
    import { InfiniteTablePivotColumn } from "components/InfiniteTable/types/InfiniteTableColumn";
    import { InfiniteTableGroupColumnBase, InfiniteTablePropColumnGroups, InfiniteTablePropColumns } from "components/InfiniteTable/types/InfiniteTableProps";
    import { InfiniteTablePropPivotTotalColumnPosition } from "components/InfiniteTable/types/InfiniteTableState";
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
        collapsedChildrenCount?: number;
        collapsedGroupsCount?: number;
        groupNesting?: number;
        groupKeys?: any[];
        parents?: InfiniteTableEnhancedGroupData<T>[];
        indexInParentGroups?: number[];
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
        collapsedChildrenCount: number;
        collapsedGroupsCount: number;
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
    export type EnhancedFlattenParam<DataType, KeyType = any> = {
        groupResult: DataGroupResult<DataType, KeyType>;
        toPrimaryKey: (data: DataType) => any;
        groupRowsState?: GroupRowsState;
        generateGroupRows: boolean;
    };
    export function enhancedFlatten<DataType, KeyType = any>(param: EnhancedFlattenParam<DataType, KeyType>): {
        data: InfiniteTableEnhancedData<DataType>[];
    };
    export type ComputedColumnsAndGroups<DataType> = {
        columns: InfiniteTablePropColumns<DataType, InfiniteTablePivotColumn<DataType>>;
        columnGroups: InfiniteTablePropColumnGroups;
    };
    export function getPivotColumnsAndColumnGroups<DataType, KeyType = any>(deepMap: DeepMap<KeyType, boolean>, pivotBy: DataSourcePivotBy<DataType>[], pivotTotalColumnPosition: InfiniteTablePropPivotTotalColumnPosition): ComputedColumnsAndGroups<DataType>;
}
declare module "components/InfiniteTable/theme.css" {
    export const ThemeVars: import("@vanilla-extract/private").MapLeafNodes<{
        color: {
            accent: string;
            color: string;
        };
        spacing: {
            0: string;
            1: string;
            2: string;
            3: string;
            4: string;
            5: string;
            6: string;
            7: string;
            8: string;
            9: string;
            10: string;
        };
        fontSize: {
            0: string;
            1: string;
            2: string;
            3: string;
            4: string;
            5: string;
            6: string;
            7: string;
        };
        fontFamily: string;
        minHeight: string;
        borderRadius: string;
        components: {
            LoadMask: {
                padding: string;
                color: string;
                textBackground: string;
                overlayBackground: string;
                overlayOpacity: string;
                borderRadius: string;
            };
        };
    }, import("@vanilla-extract/private").CSSVarFunction>;
}
declare module "components/InfiniteTable/utilities.css" {
    export const boxSizingBorderBox: string;
    export const absoluteCover: string;
    export const displayFlex: string;
    export const position: Record<"fixed" | "absolute" | "relative" | "sticky", string>;
    export const transformTranslateZero: string;
    export const cursorPointer: string;
    export const userSelectNone: string;
    export const display: Record<"block" | "flex" | "inlineBlock", string>;
    export const userSelect: Record<"none", string>;
    export const height: Record<"0" | "100%", string>;
    export const width: Record<"0" | "100%", string>;
    export const top: Record<"0" | "100%", string>;
    export const left: Record<"0" | "100%", string>;
    export const bottom: Record<"0" | "100%", string>;
    export const right: Record<"0" | "100%", string>;
    export const flexFlow: Record<"column" | "row", string>;
    export const alignItems: Record<"center" | "stretch", string>;
    export const justifyContent: Record<"center" | "end" | "start", string>;
    export const overflow: Record<"auto" | "hidden" | "visible", string>;
    export const willChange: Record<"transform", string>;
    export const whiteSpace: Record<"nowrap", string>;
    export const textOverflow: Record<"ellipsis", string>;
    export const cssEllipsisClassName: string;
}
declare module "components/InfiniteTable/components/LoadMask.css" {
    export const LoadMaskCls: Record<"hidden" | "visible", string>;
    export const LoadMaskOverlayCls: string;
    export const LoadMaskTextCls: string;
}
declare module "components/InfiniteTable/internalProps" {
    export const rootClassName = "Infinite";
    export const internalProps: {
        rootClassName: string;
    };
}
declare module "components/InfiniteTable/components/LoadMask" {
    import { Renderable } from "components/types/Renderable";
    export type LoadMaskProps = {
        visible: boolean;
        children: Renderable;
    };
    function LoadMaskFn(props: LoadMaskProps): JSX.Element;
    export const LoadMask: typeof LoadMaskFn;
}
declare module "components/InfiniteTable/types/InfiniteTableProps" {
    import * as React from 'react';
    import { InfiniteTableState } from "components/InfiniteTable/types/index";
    import { AggregationReducer, InfiniteTableEnhancedData } from "utils/groupAndPivot/index";
    import { DataSourceGroupRowsBy, DataSourcePropGroupRowsBy, DataSourcePropPivotBy, DataSourceState } from "components/DataSource/index";
    import { Renderable } from "components/types/Renderable";
    import { LoadMaskProps } from "components/InfiniteTable/components/LoadMask";
    import type { InfiniteTableBaseColumn, InfiniteTableColumn, InfiniteTableColumnRenderFunction, InfiniteTableColumnWithSize, InfiniteTableComputedColumn, InfiniteTablePivotColumn } from "components/InfiniteTable/types/InfiniteTableColumn";
    import { InfiniteTablePropPivotTotalColumnPosition } from "components/InfiniteTable/types/InfiniteTableState";
    export type InfiniteTablePropColumnOrderNormalized = string[];
    export type InfiniteTablePropColumnOrder = InfiniteTablePropColumnOrderNormalized | true;
    export type InfiniteTablePropColumnVisibility = Map<string, false>;
    export type InfiniteTablePropColumnPinning = Map<string, true | 'start' | 'end'>;
    export type InfiniteTableRowStyleFnParams<T> = {
        data: T | null;
        enhancedData: InfiniteTableEnhancedData<T>;
        rowIndex: number;
        groupRowsBy?: (keyof T)[];
    };
    export type InfiniteTableRowStyleFn<T> = (params: InfiniteTableRowStyleFnParams<T>) => undefined | React.CSSProperties;
    export type InfiniteTableRowClassNameFn<T> = (params: InfiniteTableRowStyleFnParams<T>) => string | undefined;
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
        getState: () => InfiniteTableState<T>;
        getDataSourceState: () => DataSourceState<T>;
    };
    export type InfiniteTablePropVirtualizeColumns<T> = boolean | ((columns: InfiniteTableComputedColumn<T>[]) => boolean);
    export type InfiniteTableInternalProps<T> = {
        rowHeight: number;
        ___t?: T;
    };
    export type InfiniteTablePropColumns<T, ColumnType = InfiniteTableColumn<T>> = Map<string, ColumnType>;
    export type InfiniteTableColumns<T> = InfiniteTablePropColumns<T>;
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
    export type PivotColumnGetterOptions<T> = {
        column: InfiniteTablePivotColumn<T>;
        groupRowsBy: DataSourcePropGroupRowsBy<T>;
        pivotBy: DataSourcePropPivotBy<T>;
    };
    export type InfiniteTablePropGroupRenderStrategy = 'single-column' | 'multi-column' | 'inline';
    export type InfiniteTableGroupColumnBase<T> = InfiniteTableBaseColumn<T> & InfiniteTableColumnWithSize & {
        renderValue?: InfiniteTableColumnRenderFunction<T>;
    };
    export type InfiniteTablePivotColumnBase<T> = InfiniteTableColumn<T> & InfiniteTableColumnWithSize & {
        renderValue?: InfiniteTableColumnRenderFunction<T>;
    };
    export type InfiniteTablePropGroupColumn<T> = InfiniteTableGroupColumnBase<T> | ((options: GroupColumnGetterOptions<T>, toggleGroupRow: (groupKeys: any[]) => void) => InfiniteTableGroupColumnBase<T>);
    export type InfiniteTablePropPivotColumn<T> = InfiniteTablePivotColumnBase<T> | ((options: PivotColumnGetterOptions<T>) => InfiniteTablePivotColumnBase<T>);
    export type InfiniteTablePropPivotRowLabelsColumn<T> = InfiniteTablePropPivotColumn<T>;
    export type InfiniteTablePropComponents = {
        LoadMask?: React.FC<LoadMaskProps>;
    };
    export interface InfiniteTableProps<T> {
        columns: InfiniteTablePropColumns<T>;
        pivotColumns?: InfiniteTablePropColumns<T, InfiniteTablePivotColumn<T>>;
        loadingText?: Renderable;
        components?: InfiniteTablePropComponents;
        pivotColumn?: Partial<InfiniteTablePropPivotColumn<T>>;
        pivotRowLabelsColumn?: Partial<InfiniteTablePropPivotRowLabelsColumn<T>>;
        pivotTotalColumnPosition?: InfiniteTablePropPivotTotalColumnPosition;
        groupColumn?: Partial<InfiniteTablePropGroupColumn<T>>;
        groupRenderStrategy?: InfiniteTablePropGroupRenderStrategy;
        hideEmptyGroupColumns?: boolean;
        columnVisibility?: InfiniteTablePropColumnVisibility;
        defaultColumnVisibility?: InfiniteTablePropColumnVisibility;
        columnPinning?: InfiniteTablePropColumnPinning;
        pinnedStartMaxWidth?: number;
        pinnedEndMaxWidth?: number;
        defaultColumnPinning?: InfiniteTablePropColumnPinning;
        defaultColumnAggregations?: InfiniteTablePropColumnAggregations<T>;
        columnAggregations?: InfiniteTablePropColumnAggregations<T>;
        pivotColumnGroups?: InfiniteTablePropColumnGroups;
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
        showHoverRows?: boolean;
        sortable?: boolean;
        draggableColumns?: boolean;
        header?: boolean;
        focusedClassName?: string;
        focusedWithinClassName?: string;
        focusedStyle?: React.CSSProperties;
        focusedWithinStyle?: React.CSSProperties;
        columnDefaultWidth?: number;
        columnMinWidth?: number;
        columnMaxWidth?: number;
        virtualizeColumns?: InfiniteTablePropVirtualizeColumns<T>;
        virtualizeRows?: boolean;
        defaultActiveIndex?: number;
        activeIndex?: number;
        onSelfFocus?: (event: React.FocusEvent<HTMLDivElement>) => void;
        onSelfBlur?: (event: React.FocusEvent<HTMLDivElement>) => void;
        onFocusWithin?: (event: React.FocusEvent<HTMLDivElement>) => void;
        onBlurWithin?: (event: React.FocusEvent<HTMLDivElement>) => void;
        onScrollToTop?: () => void;
        onScrollToBottom?: () => void;
        scrollToBottomOffset?: number;
        defaultColumnOrder?: InfiniteTablePropColumnOrder;
        columnOrder?: InfiniteTablePropColumnOrder;
        onColumnOrderChange?: (columnOrder: InfiniteTablePropColumnOrder) => void;
        onRowHeightChange?: (rowHeight: number) => void;
        onReady?: (api: InfiniteTableImperativeApi<T>) => void;
        rowProps?: React.HTMLProps<HTMLDivElement> | ((rowArgs: InfiniteTableRowStyleFnParams<T>) => React.HTMLProps<HTMLDivElement>);
        licenseKey?: string;
    }
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
declare module "components/VirtualBrain/ScrollListener" {
    import { OnScrollFn, ScrollPosition } from "components/types/ScrollPosition";
    export class ScrollListener {
        private scrollPosition;
        private onScrollFns;
        getScrollPosition: () => ScrollPosition;
        onScroll: (fn: OnScrollFn) => () => void;
        setScrollPosition: (scrollPosition: ScrollPosition) => void;
        private notifyScrollChange;
        destroy: () => void;
    }
}
declare module "components/InfiniteTable/types/InfiniteTableState" {
    import type { ScrollPosition } from "components/types/ScrollPosition";
    import type { InfiniteTableColumnGroup, InfiniteTableColumns, InfiniteTablePropColumnGroups, InfiniteTableProps } from "components/InfiniteTable/types/InfiniteTableProps";
    import { Size } from "components/types/Size";
    import { MutableRefObject } from 'react';
    import { SubscriptionCallback } from "components/types/SubscriptionCallback";
    import { ScrollListener } from "components/VirtualBrain/ScrollListener";
    import { NonUndefined } from "components/types/NonUndefined";
    import { InfiniteTableColumn, InfiniteTablePivotColumn } from "components/InfiniteTable/types/InfiniteTableColumn";
    import { ComponentStateActions } from "components/hooks/useComponentState";
    import { DataSourceGroupRowsBy, DataSourceProps } from "components/DataSource/types";
    export type GroupRowsMap<T> = Map<keyof T, {
        groupBy: DataSourceGroupRowsBy<T>;
        groupIndex: number;
    }>;
    export interface InfiniteTableSetupState<T> {
        columnsWhenInlineGroupRenderStrategy?: Map<string, InfiniteTableColumn<T>>;
        domRef: MutableRefObject<HTMLDivElement | null>;
        scrollerDOMRef: MutableRefObject<HTMLDivElement | null>;
        portalDOMRef: MutableRefObject<HTMLDivElement | null>;
        onRowHeightCSSVarChange: SubscriptionCallback<number>;
        onHeaderHeightCSSVarChange: SubscriptionCallback<number>;
        columnsWhenGrouping?: InfiniteTableColumns<T>;
        bodySize: Size;
        focused: boolean;
        focusedWithin: boolean;
        scrollPosition: ScrollPosition;
        draggingColumnId: null | string;
        pinnedStartScrollListener: ScrollListener;
        pinnedEndScrollListener: ScrollListener;
        computedPivotColumns?: Map<string, InfiniteTablePivotColumn<T>>;
        columnShifts: number[] | null;
    }
    export type InfiniteTableComputedColumnGroup = InfiniteTableColumnGroup & {
        depth: number;
    };
    export type InfiniteTableColumnGroupsDepthsMap = Map<string, number>;
    export type InfiniteTablePropPivotTotalColumnPosition = false | 'start' | 'end';
    export interface InfiniteTableMappedState<T> {
        groupColumn: InfiniteTableProps<T>['groupColumn'];
        loadingText: InfiniteTableProps<T>['loadingText'];
        components: InfiniteTableProps<T>['components'];
        columns: InfiniteTableProps<T>['columns'];
        pivotColumns: InfiniteTableProps<T>['pivotColumns'];
        onReady: InfiniteTableProps<T>['onReady'];
        onSelfFocus: InfiniteTableProps<T>['onSelfFocus'];
        onSelfBlur: InfiniteTableProps<T>['onSelfBlur'];
        onFocusWithin: InfiniteTableProps<T>['onFocusWithin'];
        onBlurWithin: InfiniteTableProps<T>['onBlurWithin'];
        onScrollToTop: InfiniteTableProps<T>['onScrollToTop'];
        onScrollToBottom: InfiniteTableProps<T>['onScrollToBottom'];
        scrollToBottomOffset: InfiniteTableProps<T>['scrollToBottomOffset'];
        focusedClassName: InfiniteTableProps<T>['focusedClassName'];
        focusedWithinClassName: InfiniteTableProps<T>['focusedWithinClassName'];
        focusedStyle: InfiniteTableProps<T>['focusedStyle'];
        focusedWithinStyle: InfiniteTableProps<T>['focusedWithinStyle'];
        domProps: InfiniteTableProps<T>['domProps'];
        rowStyle: InfiniteTableProps<T>['rowStyle'];
        rowProps: InfiniteTableProps<T>['rowProps'];
        rowClassName: InfiniteTableProps<T>['rowClassName'];
        pinnedStartMaxWidth: InfiniteTableProps<T>['pinnedStartMaxWidth'];
        pinnedEndMaxWidth: InfiniteTableProps<T>['pinnedEndMaxWidth'];
        pivotColumn: InfiniteTableProps<T>['pivotColumn'];
        pivotRowLabelsColumn: InfiniteTableProps<T>['pivotRowLabelsColumn'];
        pivotColumnGroups: InfiniteTableProps<T>['pivotColumnGroups'];
        activeIndex: NonUndefined<InfiniteTableProps<T>['activeIndex']>;
        columnMinWidth: NonUndefined<InfiniteTableProps<T>['columnMinWidth']>;
        columnMaxWidth: NonUndefined<InfiniteTableProps<T>['columnMaxWidth']>;
        columnDefaultWidth: NonUndefined<InfiniteTableProps<T>['columnDefaultWidth']>;
        draggableColumns: NonUndefined<InfiniteTableProps<T>['draggableColumns']>;
        sortable: NonUndefined<InfiniteTableProps<T>['sortable']>;
        hideEmptyGroupColumns: NonUndefined<InfiniteTableProps<T>['hideEmptyGroupColumns']>;
        columnOrder: NonUndefined<InfiniteTableProps<T>['columnOrder']>;
        showZebraRows: NonUndefined<InfiniteTableProps<T>['showZebraRows']>;
        showHoverRows: NonUndefined<InfiniteTableProps<T>['showHoverRows']>;
        header: NonUndefined<InfiniteTableProps<T>['header']>;
        virtualizeColumns: NonUndefined<InfiniteTableProps<T>['virtualizeColumns']>;
        rowHeight: number;
        headerHeight: number;
        licenseKey: NonUndefined<InfiniteTableProps<T>['licenseKey']>;
        columnVisibility: NonUndefined<InfiniteTableProps<T>['columnVisibility']>;
        columnPinning: NonUndefined<InfiniteTableProps<T>['columnPinning']>;
        columnAggregations: NonUndefined<InfiniteTableProps<T>['columnAggregations']>;
        columnGroups: NonUndefined<InfiniteTableProps<T>['columnGroups']>;
        collapsedColumnGroups: NonUndefined<InfiniteTableProps<T>['collapsedColumnGroups']>;
        pivotTotalColumnPosition: NonUndefined<InfiniteTableProps<T>['pivotTotalColumnPosition']>;
    }
    export interface InfiniteTableDerivedState<T> {
        groupRowsBy: DataSourceProps<T>['groupRowsBy'];
        computedColumns: Map<string, InfiniteTableColumn<T>>;
        virtualizeHeader: boolean;
        groupRenderStrategy: NonUndefined<InfiniteTableProps<T>['groupRenderStrategy']>;
        columnGroupsDepthsMap: InfiniteTableColumnGroupsDepthsMap;
        columnGroupsMaxDepth: number;
        computedColumnGroups: InfiniteTablePropColumnGroups;
        rowHeightCSSVar: string;
        headerHeightCSSVar: string;
    }
    export type InfiniteTableActions<T> = ComponentStateActions<InfiniteTableState<T>>;
    export interface InfiniteTableState<T> extends InfiniteTableMappedState<T>, InfiniteTableDerivedState<T>, InfiniteTableSetupState<T> {
    }
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
        computedPinnedStartOverflow: boolean;
        computedPinnedEndOverflow: boolean;
        computedPinnedStartColumns: InfiniteTableComputedColumn<T>[];
        computedPinnedEndColumns: InfiniteTableComputedColumn<T>[];
        computedUnpinnedColumns: InfiniteTableComputedColumn<T>[];
        computedVisibleColumns: InfiniteTableComputedColumn<T>[];
        computedVisibleColumnsMap: Map<string, InfiniteTableComputedColumn<T>>;
        computedColumnVisibility: InfiniteTablePropColumnVisibility;
        computedColumnOrder: InfiniteTablePropColumnOrderNormalized;
        computedPinnedStartColumnsWidth: number;
        computedPinnedStartWidth: number;
        computedPinnedEndColumnsWidth: number;
        computedPinnedEndWidth: number;
        computedUnpinnedColumnsWidth: number;
        computedUnpinnedOffset: number;
        computedPinnedEndOffset: number;
        computedRemainingSpace: number;
        unpinnedColumnRenderCount: number;
        columnRenderStartIndex: number;
    }
}
declare module "components/InfiniteTable/types/InfiniteTableContextValue" {
    import { InfiniteTableActions, InfiniteTableState } from "components/InfiniteTable/types/InfiniteTableState";
    import { InfiniteTableComputedValues } from "components/InfiniteTable/types/InfiniteTableComputedValues";
    export interface InfiniteTableContextValue<T> {
        componentState: InfiniteTableState<T>;
        componentActions: InfiniteTableActions<T>;
        computed: InfiniteTableComputedValues<T>;
        getComputed: () => InfiniteTableComputedValues<T>;
        getState: () => InfiniteTableState<T>;
    }
}
declare module "components/InfiniteTable/types/index" {
    import type { InfiniteTableState } from "components/InfiniteTable/types/InfiniteTableState";
    import type { InfiniteTableAction } from "components/InfiniteTable/types/InfiniteTableAction";
    import type { InfiniteTableActionType } from "components/InfiniteTable/types/InfiniteTableActionType";
    import type { InfiniteTableProps, InfiniteTableImperativeApi, InfiniteTablePropColumnOrder, InfiniteTablePropColumnVisibility, InfiniteTablePropColumnPinning, InfiniteTableColumnAggregator, InfiniteTableColumnGroup, InfiniteTablePropGroupRenderStrategy, InfiniteTablePropColumnAggregations, InfiniteTablePropColumnGroups, InfiniteTablePropRowStyle, InfiniteTableRowStyleFn, InfiniteTableRowClassNameFn, InfiniteTablePropRowClassName, InfiniteTablePropColumns, InfiniteTablePropComponents } from "components/InfiniteTable/types/InfiniteTableProps";
    import type { InfiniteTableColumn, InfiniteTableComputedColumn, InfiniteTableColumnRenderParam } from "components/InfiniteTable/types/InfiniteTableColumn";
    import type { InfiniteTableComputedValues } from "components/InfiniteTable/types/InfiniteTableComputedValues";
    import type { InfiniteTableContextValue } from "components/InfiniteTable/types/InfiniteTableContextValue";
    import type { InfiniteTableEnhancedData } from "utils/groupAndPivot/index";
    export type { InfiniteTableColumnAggregator, InfiniteTableComputedValues, InfiniteTablePropColumns, InfiniteTableEnhancedData, InfiniteTablePropColumnOrder, InfiniteTablePropComponents, InfiniteTablePropColumnVisibility, InfiniteTablePropColumnPinning, InfiniteTableColumnGroup, InfiniteTableColumn, InfiniteTableComputedColumn, InfiniteTableColumnRenderParam, InfiniteTableContextValue, InfiniteTablePropGroupRenderStrategy, InfiniteTablePropColumnAggregations, InfiniteTablePropColumnGroups, InfiniteTableState, InfiniteTableAction, InfiniteTableProps, InfiniteTableImperativeApi, InfiniteTableActionType, InfiniteTablePropRowStyle, InfiniteTablePropRowClassName, InfiniteTableRowStyleFn, InfiniteTableRowClassNameFn, };
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
    import { DataSourceState } from "components/DataSource/index";
    import { ForwardPropsToStateFnResult } from "components/hooks/useComponentState";
    import { InfiniteTableProps, InfiniteTableState } from "components/InfiniteTable/types/index";
    import { InfiniteTablePropGroupColumn } from "components/InfiniteTable/types/InfiniteTableProps";
    import { InfiniteTableSetupState, InfiniteTableDerivedState, InfiniteTableMappedState } from "components/InfiniteTable/types/InfiniteTableState";
    /**
     * The computed state is independent from props and cannot
     * be affected by props
     */
    export function initSetupState<T>(): InfiniteTableSetupState<T>;
    export const forwardProps: <T>() => Partial<{
        columns: 1 | ((value: import("components/InfiniteTable/types").InfiniteTablePropColumns<T, import("components/InfiniteTable/types").InfiniteTableColumn<T>>) => import("components/InfiniteTable/types").InfiniteTablePropColumns<T, import("components/InfiniteTable/types").InfiniteTableColumn<T>>);
        header: 1 | ((value: boolean | undefined) => boolean);
        pivotTotalColumnPosition: 1 | ((value: import("components/InfiniteTable/types/InfiniteTableState").InfiniteTablePropPivotTotalColumnPosition | undefined) => import("components/InfiniteTable/types/InfiniteTableState").InfiniteTablePropPivotTotalColumnPosition);
        pivotColumns: 1 | ((value: import("components/InfiniteTable/types").InfiniteTablePropColumns<T, import("components/InfiniteTable/types/InfiniteTableColumn").InfiniteTablePivotColumn<T>> | undefined) => import("components/InfiniteTable/types").InfiniteTablePropColumns<T, import("components/InfiniteTable/types/InfiniteTableColumn").InfiniteTablePivotColumn<T>> | undefined);
        pivotColumnGroups: 1 | ((value: import("components/InfiniteTable/types").InfiniteTablePropColumnGroups | undefined) => import("components/InfiniteTable/types").InfiniteTablePropColumnGroups | undefined);
        sortable: 1 | ((value: boolean | undefined) => boolean);
        pivotColumn: 1 | ((value: Partial<import("components/InfiniteTable/types/InfiniteTableProps").InfiniteTablePropPivotColumn<T>> | undefined) => Partial<import("components/InfiniteTable/types/InfiniteTableProps").InfiniteTablePropPivotColumn<T>> | undefined);
        components: 1 | ((value: import("components/InfiniteTable/types").InfiniteTablePropComponents | undefined) => import("components/InfiniteTable/types").InfiniteTablePropComponents | undefined);
        groupColumn: 1 | ((value: Partial<InfiniteTablePropGroupColumn<T>> | undefined) => Partial<InfiniteTablePropGroupColumn<T>> | undefined);
        loadingText: 1 | ((value: import("components/types/Renderable").Renderable) => import("components/types/Renderable").Renderable);
        onReady: 1 | ((value: ((api: import("components/InfiniteTable/types").InfiniteTableImperativeApi<T>) => void) | undefined) => ((api: import("components/InfiniteTable/types").InfiniteTableImperativeApi<T>) => void) | undefined);
        onSelfFocus: 1 | ((value: ((event: import("react").FocusEvent<HTMLDivElement>) => void) | undefined) => ((event: import("react").FocusEvent<HTMLDivElement>) => void) | undefined);
        onSelfBlur: 1 | ((value: ((event: import("react").FocusEvent<HTMLDivElement>) => void) | undefined) => ((event: import("react").FocusEvent<HTMLDivElement>) => void) | undefined);
        onFocusWithin: 1 | ((value: ((event: import("react").FocusEvent<HTMLDivElement>) => void) | undefined) => ((event: import("react").FocusEvent<HTMLDivElement>) => void) | undefined);
        onBlurWithin: 1 | ((value: ((event: import("react").FocusEvent<HTMLDivElement>) => void) | undefined) => ((event: import("react").FocusEvent<HTMLDivElement>) => void) | undefined);
        onScrollToTop: 1 | ((value: (() => void) | undefined) => (() => void) | undefined);
        onScrollToBottom: 1 | ((value: (() => void) | undefined) => (() => void) | undefined);
        scrollToBottomOffset: 1 | ((value: number | undefined) => number | undefined);
        focusedClassName: 1 | ((value: string | undefined) => string | undefined);
        focusedWithinClassName: 1 | ((value: string | undefined) => string | undefined);
        focusedStyle: 1 | ((value: import("react").CSSProperties | undefined) => import("react").CSSProperties | undefined);
        focusedWithinStyle: 1 | ((value: import("react").CSSProperties | undefined) => import("react").CSSProperties | undefined);
        domProps: 1 | ((value: import("react").HTMLProps<HTMLDivElement> | undefined) => import("react").HTMLProps<HTMLDivElement> | undefined);
        rowStyle: 1 | ((value: import("components/InfiniteTable/types").InfiniteTablePropRowStyle<T> | undefined) => import("components/InfiniteTable/types").InfiniteTablePropRowStyle<T> | undefined);
        rowProps: 1 | ((value: import("react").HTMLProps<HTMLDivElement> | ((rowArgs: import("components/InfiniteTable/types/InfiniteTableProps").InfiniteTableRowStyleFnParams<T>) => import("react").HTMLProps<HTMLDivElement>) | undefined) => import("react").HTMLProps<HTMLDivElement> | ((rowArgs: import("components/InfiniteTable/types/InfiniteTableProps").InfiniteTableRowStyleFnParams<T>) => import("react").HTMLProps<HTMLDivElement>) | undefined);
        rowClassName: 1 | ((value: import("components/InfiniteTable/types").InfiniteTablePropRowClassName<T> | undefined) => import("components/InfiniteTable/types").InfiniteTablePropRowClassName<T> | undefined);
        pinnedStartMaxWidth: 1 | ((value: number | undefined) => number | undefined);
        pinnedEndMaxWidth: 1 | ((value: number | undefined) => number | undefined);
        pivotRowLabelsColumn: 1 | ((value: Partial<import("components/InfiniteTable/types/InfiniteTableProps").InfiniteTablePropPivotRowLabelsColumn<T>> | undefined) => Partial<import("components/InfiniteTable/types/InfiniteTableProps").InfiniteTablePropPivotRowLabelsColumn<T>> | undefined);
        activeIndex: 1 | ((value: number | undefined) => number);
        columnMinWidth: 1 | ((value: number | undefined) => number);
        columnMaxWidth: 1 | ((value: number | undefined) => number);
        columnDefaultWidth: 1 | ((value: number | undefined) => number);
        draggableColumns: 1 | ((value: boolean | undefined) => boolean);
        hideEmptyGroupColumns: 1 | ((value: boolean | undefined) => boolean);
        columnOrder: 1 | ((value: import("components/InfiniteTable/types").InfiniteTablePropColumnOrder | undefined) => import("components/InfiniteTable/types").InfiniteTablePropColumnOrder);
        showZebraRows: 1 | ((value: boolean | undefined) => boolean);
        showHoverRows: 1 | ((value: boolean | undefined) => boolean);
        virtualizeColumns: 1 | ((value: import("components/InfiniteTable/types/InfiniteTableProps").InfiniteTablePropVirtualizeColumns<T> | undefined) => import("components/InfiniteTable/types/InfiniteTableProps").InfiniteTablePropVirtualizeColumns<T>);
        licenseKey: 1 | ((value: string | undefined) => string);
        columnVisibility: 1 | ((value: import("components/InfiniteTable/types").InfiniteTablePropColumnVisibility | undefined) => import("components/InfiniteTable/types").InfiniteTablePropColumnVisibility);
        columnPinning: 1 | ((value: import("components/InfiniteTable/types").InfiniteTablePropColumnPinning | undefined) => import("components/InfiniteTable/types").InfiniteTablePropColumnPinning);
        columnAggregations: 1 | ((value: import("components/InfiniteTable/types").InfiniteTablePropColumnAggregations<T> | undefined) => import("components/InfiniteTable/types").InfiniteTablePropColumnAggregations<T>);
        columnGroups: 1 | ((value: import("components/InfiniteTable/types").InfiniteTablePropColumnGroups | undefined) => import("components/InfiniteTable/types").InfiniteTablePropColumnGroups);
        collapsedColumnGroups: 1 | ((value: import("components/InfiniteTable/types/InfiniteTableProps").InfiniteTablePropCollapsedColumnGroups | undefined) => import("components/InfiniteTable/types/InfiniteTableProps").InfiniteTablePropCollapsedColumnGroups);
        rowHeight: 1 | ((value: string | number) => number);
        headerHeight: 1 | ((value: string | number) => number);
    }>;
    export const mapPropsToState: <T>(params: {
        props: InfiniteTableProps<T>;
        state: InfiniteTableState<T>;
        oldState: InfiniteTableState<T> | null;
        parentState: DataSourceState<T>;
    }) => InfiniteTableDerivedState<T>;
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
    import type { InfiniteTablePropColumnOrder, InfiniteTablePropColumnOrderNormalized, InfiniteTablePropColumnPinning, InfiniteTablePropColumnVisibility } from "components/InfiniteTable/types/InfiniteTableProps";
    export type SortInfoMap<T> = {
        [key: string]: {
            sortInfo: DataSourceSingleSortInfo<T>;
            index: number;
        };
    };
    export const IS_GROUP_COLUMN_ID: (columnId: string) => boolean;
    export type GetComputedVisibleColumnsResult<T> = {
        computedRemainingSpace: number;
        computedPinnedStartColumnsWidth: number;
        computedPinnedStartWidth: number;
        computedPinnedEndColumnsWidth: number;
        computedPinnedEndWidth: number;
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
        bodySize: Size;
        columnMinWidth?: number;
        columnMaxWidth?: number;
        pinnedStartMaxWidth?: number;
        pinnedEndMaxWidth?: number;
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
    export const getComputedVisibleColumns: <T extends unknown>({ columns, bodySize, columnMinWidth, columnMaxWidth, columnDefaultWidth, pinnedStartMaxWidth, pinnedEndMaxWidth, sortable, sortInfo, setSortInfo, multiSort, draggableColumns, columnOrder, columnPinning, columnVisibility, columnVisibilityAssumeVisible, }: GetComputedVisibleColumnsParam<T>) => GetComputedVisibleColumnsResult<T>;
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
    export const rafFn: (fn: (...args: any[]) => void) => (...args: any[]) => void;
}
declare module "components/InfiniteTable/hooks/useRerenderOnKeyChange" {
    export const useRerenderOnKeyChange: <K extends unknown, V extends unknown>(map: Map<K, V>) => number;
}
declare module "components/InfiniteTable/hooks/useComputedVisibleColumns" {
    import type { DataSourceSingleSortInfo } from "components/DataSource/types";
    import type { InfiniteTableColumn } from "components/InfiniteTable/types/index";
    import type { InfiniteTablePropColumnOrder, InfiniteTablePropColumnPinning, InfiniteTablePropColumnVisibility } from "components/InfiniteTable/types/InfiniteTableProps";
    import type { Size } from "components/types/Size";
    import type { GetComputedVisibleColumnsResult } from "components/InfiniteTable/utils/getComputedVisibleColumns";
    type UseComputedVisibleColumnsParam<T> = {
        columns: Map<string, InfiniteTableColumn<T>>;
        bodySize: Size;
        columnMinWidth?: number;
        columnMaxWidth?: number;
        pinnedEndMaxWidth?: number;
        pinnedStartMaxWidth?: number;
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
        computedPinnedEndWidth: GetComputedVisibleColumnsResult<T>['computedPinnedEndWidth'];
        computedPinnedStartWidth: GetComputedVisibleColumnsResult<T>['computedPinnedStartWidth'];
        computedColumnOrder: GetComputedVisibleColumnsResult<T>['computedColumnOrder'];
    };
    export const useComputedVisibleColumns: <T extends unknown>({ columns, bodySize, columnMinWidth, columnMaxWidth, columnDefaultWidth, sortable, draggableColumns, sortInfo, multiSort, setSortInfo, columnOrder, columnPinning, pinnedEndMaxWidth, pinnedStartMaxWidth, columnVisibility, columnVisibilityAssumeVisible, }: UseComputedVisibleColumnsParam<T>) => UseComputedVisibleColumnsResult<T>;
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
declare module "utils/join" {
    const join: (...args: (string | number | void | null)[]) => string;
    export { join };
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
declare module "components/InfiniteTable/state/getComputedPivotColumnsFromDataSourcePivotColumns" {
    import { DataSourcePropGroupRowsBy, DataSourcePropPivotBy } from "components/DataSource/index";
    import { InfiniteTableProps } from "components/InfiniteTable/types/index";
    import { InfiniteTableState } from "components/InfiniteTable/types/InfiniteTableState";
    export function getComputedPivotColumnsFromDataSourcePivotColumns<T>(pivotColumns: InfiniteTableProps<T>['pivotColumns'], params: {
        toggleGroupRow: (groupKeys: any[]) => void;
        pivotColumn: InfiniteTableProps<T>['pivotColumn'];
        pivotRowLabelsColumn: InfiniteTableProps<T>['pivotRowLabelsColumn'];
        pivotTotalColumnPosition: InfiniteTableState<T>['pivotTotalColumnPosition'];
        pivotBy: DataSourcePropPivotBy<T>;
        groupRowsBy: DataSourcePropGroupRowsBy<T>;
    }): InfiniteTableProps<T>['pivotColumns'];
}
declare module "components/InfiniteTable/utils/getColumnForGroupBy" {
    import { InfiniteTableColumnRenderParam } from "components/InfiniteTable/index";
    import { DataSourceGroupRowsBy } from "components/DataSource/index";
    import { InfiniteTableGeneratedGroupColumn } from "components/InfiniteTable/types/InfiniteTableColumn";
    import { GroupColumnGetterOptions, InfiniteTablePropGroupColumn, InfiniteTablePropGroupRenderStrategy } from "components/InfiniteTable/types/InfiniteTableProps";
    export function getGroupColumnRender<T>({ groupIndex, groupRenderStrategy, toggleGroupRow, }: {
        toggleGroupRow: (groupRowKeys: any[]) => void;
        groupRenderStrategy: InfiniteTablePropGroupRenderStrategy;
        groupIndex: number;
    }): (renderOptions: InfiniteTableColumnRenderParam<T>) => import("components/types/Renderable").Renderable;
    export function getColumnForGroupBy<T>(options: GroupColumnGetterOptions<T> & {
        groupIndex: number;
        groupBy: DataSourceGroupRowsBy<T>;
        groupRenderStrategy: InfiniteTablePropGroupRenderStrategy;
    }, toggleGroupRow: (groupRowKeys: any[]) => void, groupColumnFromProps?: InfiniteTablePropGroupColumn<T>): InfiniteTableGeneratedGroupColumn<T>;
    export function getSingleGroupColumn<T>(options: GroupColumnGetterOptions<T>, toggleGroupRow: (groupRowKeys: any[]) => void, groupColumnFromProps?: InfiniteTablePropGroupColumn<T>): InfiniteTableGeneratedGroupColumn<T>;
}
declare module "components/InfiniteTable/hooks/useToggleGroupRow" {
    export type ToggleGrouRowFn = (groupKeys: any[]) => void;
    export function useToggleGroupRow<T>(): ToggleGrouRowFn;
}
declare module "components/InfiniteTable/hooks/useColumnsWhen" {
    import { InfiniteTableColumn } from "components/InfiniteTable/index";
    import { DataSourceGroupRowsBy } from "components/DataSource/index";
    import { InfiniteTablePropGroupRenderStrategy, InfiniteTableProps } from "components/InfiniteTable/types/InfiniteTableProps";
    export function useColumnsWhen<T>(): void;
    export function getColumnsWhenGrouping<T>(params: {
        columns: Map<string, InfiniteTableColumn<T>>;
        groupRowsBy: DataSourceGroupRowsBy<T>[];
        toggleGroupRow: (groupKeys: any[]) => void;
        groupColumn: InfiniteTableProps<T>['groupColumn'];
        groupRenderStrategy: InfiniteTablePropGroupRenderStrategy;
        pivotColumns: InfiniteTableProps<T>['pivotColumns'];
    }): Map<string, InfiniteTableColumn<T>> | undefined;
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
        itemSpan?: ({ itemIndex }: {
            itemIndex: number;
        }) => number;
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
        private itemSpanParent;
        private itemSpanValue;
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
        update: (newCount: VirtualBrainOptions['count'], newItemSize: VirtualBrainOptions['itemSize'], newItemSpan?: VirtualBrainOptions['itemSpan']) => void;
        private reset;
        private computeItemSpanUpTo;
        private computeCacheFor;
        private getItemSizeCacheFor;
        getItemSpan: (itemIndex: number) => number;
        getItemSpanParent: (itemIndex: number) => number;
        getItemSizeWithSpan: (itemIndex: number, itemSpan: number) => number;
        /**
         * For now, this doesn't take into account the itemspan, and it's okay not to
         * @param itemIndex
         * @returns the size of the specified item
         */
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
    import { InfiniteTableEnhancedData, InfiniteTablePropGroupRenderStrategy } from "components/InfiniteTable/types/index";
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
        hidden: boolean;
        enhancedData: InfiniteTableEnhancedData<T>;
        groupRenderStrategy: InfiniteTablePropGroupRenderStrategy;
        getData: () => InfiniteTableEnhancedData<T>[];
        toggleGroupRow: InfiniteTableToggleGroupRowFn;
        rowIndex: number;
        rowHeight: number;
    }
    export interface InfiniteTableHeaderCellProps<T> extends Omit<InfiniteTableCellProps<T>, 'children'> {
        columns: Map<string, InfiniteTableComputedColumn<T>>;
        headerHeight: number;
        onResize?: OnResizeFn;
    }
}
declare module "components/InfiniteTable/components/InfiniteTableRow/style.css" {
    export const cellStyle: string;
    export const columnAlignCellStyle: Record<"center" | "end" | "start", string>;
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
    import { ScrollListener } from "components/VirtualBrain/ScrollListener";
    import { InfiniteTableComputedColumnGroup } from "components/InfiniteTable/types/InfiniteTableProps";
    export type InfiniteTableHeaderProps<T> = {
        repaintId?: string | number;
        brain: VirtualBrain;
        columns: InfiniteTableComputedColumn<T>[];
        totalWidth: number;
        availableWidth: number;
    };
    export type InfiniteTableHeaderGroupProps<T> = {
        columns: InfiniteTableComputedColumn<T>[];
        columnGroup: InfiniteTableComputedColumnGroup;
        children: Renderable;
        height: number;
        headerHeight: number;
    };
    export type InfiniteTableHeaderUnvirtualizedProps<T> = Omit<InfiniteTableHeaderProps<T>, 'repaintId' | 'brain'> & {
        classNameModifiers?: string[];
        brain?: VirtualBrain;
        scrollListener?: ScrollListener;
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
        itemSizeWithSpan: number;
        itemSpan: number;
        spanParent: number;
        covered: boolean;
    };
    export type RenderItem = (renderProps: RenderItemParam) => Renderable;
    export type RawListItemSpan = (itemSpanProps: {
        itemIndex: number;
    }) => number;
    export type RawListProps = {
        debugChannel?: string;
        renderItem: RenderItem;
        itemSpan?: RawListItemSpan;
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
declare module "components/InfiniteTable/components/InfiniteTableHeader/style.css" {
    export const flexFlowRow: string;
}
declare module "components/InfiniteTable/components/InfiniteTableHeader/InfiniteTableHeader" {
    import * as React from 'react';
    import type { InfiniteTableHeaderProps } from "components/InfiniteTable/components/InfiniteTableHeader/InfiniteTableHeaderTypes";
    export const TableHeaderClassName: string;
    function InfiniteTableHeaderFn<T>(props: InfiniteTableHeaderProps<T> & React.HTMLAttributes<HTMLDivElement>): JSX.Element;
    export const InfiniteTableHeader: typeof InfiniteTableHeaderFn;
}
declare module "components/InfiniteTable/components/InfiniteTableHeader/buildColumnAndGroupTree" {
    import { InfiniteTableColumnGroup, InfiniteTableComputedColumn, InfiniteTableState } from "components/InfiniteTable/types/index";
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
    export function buildColumnAndGroupTree<T>(columns: InfiniteTableComputedColumn<T>[], columnGroups: InfiniteTableState<T>['columnGroups'], columnGroupsDepthsMap: InfiniteTableState<T>['columnGroupsDepthsMap']): ColGroupTreeItem<T>[];
}
declare module "components/InfiniteTable/components/InfiniteTableHeader/InfiniteTableHeaderGroup" {
    import { InfiniteTableHeaderGroupProps } from "components/InfiniteTable/components/InfiniteTableHeader/InfiniteTableHeaderTypes";
    export const TableHeaderGroupClassName: string;
    export function InfiniteTableHeaderGroup<T>(props: InfiniteTableHeaderGroupProps<T>): JSX.Element;
}
declare module "components/InfiniteTable/components/InfiniteTableHeader/renderColumnHeaderGroups" {
    import { InfiniteTableComputedColumn } from "components/InfiniteTable/types/index";
    import { InfiniteTableState } from "components/InfiniteTable/types/InfiniteTableState";
    type BuildColumnHeaderGroupsConfig<T> = {
        columnGroups: InfiniteTableState<T>['columnGroups'];
        columnGroupsDepthsMap: InfiniteTableState<T>['columnGroupsDepthsMap'];
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
declare module "components/VirtualScrollContainer/VirtualScrollContainer.css" {
    export const VirtualScrollContainerCls: string;
    export const ScrollableCls: {
        true: string;
        false: string;
        visible: string;
        auto: string;
        hidden: string;
    };
    export const ScrollableHorizontalCls: {
        true: string;
        false: string;
        visible: string;
        auto: string;
        hidden: string;
    };
    export const ScrollableVerticalCls: {
        true: string;
        false: string;
        visible: string;
        auto: string;
        hidden: string;
    };
}
declare module "components/VirtualScrollContainer/getScrollableClassName" {
    type ScrollType = 'hidden' | 'visible' | 'auto';
    export type Scrollable = boolean | ScrollType | {
        vertical: boolean | ScrollType;
        horizontal: boolean | ScrollType;
    };
    export const getScrollableClassName: (scrollable: Scrollable) => string;
}
declare module "components/VirtualScrollContainer/index" {
    import * as React from 'react';
    import { CSSProperties } from 'react';
    import { Scrollable } from "components/VirtualScrollContainer/getScrollableClassName";
    import type { Renderable } from "components/types/Renderable";
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
        count?: number;
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
declare module "components/VirtualList/VirtualList.css" {
    export const VirtualListCls: string;
    export const VirtualListClsOrientation: Record<"horizontal" | "vertical", string>;
    export const scrollTransformTargetCls: string;
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
        verticalBrain: VirtualBrain;
        domRef: React.RefCallback<HTMLElement>;
        enhancedData: InfiniteTableEnhancedData<T>;
        getData: () => InfiniteTableEnhancedData<T>[];
        toggleGroupRow: InfiniteTableToggleGroupRowFn;
        repaintId?: number | string;
        virtualizeColumns: boolean;
        showZebraRows?: boolean;
        showHoverRows?: boolean;
        columns: InfiniteTableComputedColumn<T>[];
        domProps?: React.HTMLAttributes<HTMLDivElement>;
    }
    export type InfiniteTableRowApi = {
        setScrollPosition: (scrollPosition: ScrollPosition) => void;
    };
}
declare module "components/InfiniteTable/components/InfiniteTableRow/InfiniteTableColumnCell" {
    import { InfiniteTableColumnCellProps } from "components/InfiniteTable/components/InfiniteTableRow/InfiniteTableCellTypes";
    function InfiniteTableColumnCellFn<T>(props: InfiniteTableColumnCellProps<T>): JSX.Element | null;
    export const InfiniteTableColumnCell: typeof InfiniteTableColumnCellFn;
}
declare module "components/InfiniteTable/components/InfiniteTableRow/InfiniteTableRowClassName" {
    export const InfiniteTableRowClassName: string;
    export const InfiniteTableElement__hover: string;
}
declare module "components/InfiniteTable/components/InfiniteTableRow/useRowDOMProps" {
    import { MutableRefObject, RefCallback } from 'react';
    import type { InfiniteTableRowProps } from "components/InfiniteTable/components/InfiniteTableRow/InfiniteTableRowTypes";
    import { InfiniteTableState } from "components/InfiniteTable/types/InfiniteTableState";
    export type TableRowHTMLAttributes = React.HTMLAttributes<HTMLDivElement> & {
        'data-virtualize-columns': 'on' | 'off';
        'data-hover-index': number;
        'data-row-index': number;
        'data-row-id': string;
        ref: RefCallback<HTMLElement | null>;
    } & any;
    export function useRowDOMProps<T>(props: InfiniteTableRowProps<T>, rowProps: InfiniteTableState<T>['rowProps'], rowStyle: InfiniteTableState<T>['rowStyle'], rowClassName: InfiniteTableState<T>['rowClassName'], groupRenderStrategy: InfiniteTableState<T>['groupRenderStrategy'], tableDOMRef: MutableRefObject<HTMLDivElement | null>): {
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
        verticalBrain: VirtualBrain;
    }): JSX.Element;
    export const TableRowUnvirtualized: typeof TableRowUnvirtualizedFn;
}
declare module "components/InfiniteTable/hooks/useUnpinnedRendering" {
    import type { VirtualBrain } from "components/VirtualBrain/index";
    import type { Size } from "components/types/Size";
    import type { InfiniteTableComputedColumn, InfiniteTableEnhancedData } from "components/InfiniteTable/types/index";
    import { InfiniteTableState } from "components/InfiniteTable/types/InfiniteTableState";
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
        computedPinnedStartWidth: number;
        computedPinnedEndWidth: number;
        getState: () => InfiniteTableState<T>;
    };
    export function useUnpinnedRendering<T>(params: UnpinnedRenderingParams<T>): JSX.Element | null;
}
declare module "components/InfiniteTable/hooks/useOnContainerScroll" {
    import { VirtualBrain } from "components/VirtualBrain/index";
    export const useOnContainerScroll: <T>({ verticalVirtualBrain, horizontalVirtualBrain, reservedContentHeight, }: {
        verticalVirtualBrain: VirtualBrain;
        horizontalVirtualBrain: VirtualBrain;
        reservedContentHeight: number;
    }) => {
        applyScrollHorizontal: ({ scrollLeft }: {
            scrollLeft: number;
        }) => void;
        applyScrollVertical: ({ scrollTop }: {
            scrollTop: number;
        }) => void;
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
declare module "components/VirtualList/InfiniteListRootClassName" {
    export const InfiniteListRootClassName = "InfiniteList";
}
declare module "components/VirtualList/RowListWithExternalScrolling" {
    import { CSSProperties } from 'react';
    import { VirtualBrain } from "components/VirtualBrain/index";
    import type { RenderRow } from "components/VirtualList/types";
    import type { ScrollPosition } from "components/types/ScrollPosition";
    import { OnMountProps } from "components/hooks/useOnMount";
    export type RowListWithExternalScrollingListProps = {
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
    import { InfiniteTableState } from "components/InfiniteTable/types/InfiniteTableState";
    import { InfiniteTableToggleGroupRowFn } from "components/InfiniteTable/types/InfiniteTableColumn";
    import { ScrollListener } from "components/VirtualBrain/ScrollListener";
    type UsePinnedParams<T> = {
        getState: () => InfiniteTableState<T>;
        getData: () => InfiniteTableEnhancedData<T>[];
        bodySize: Size;
        pinnedStartScrollListener: ScrollListener;
        pinnedEndScrollListener: ScrollListener;
        repaintId: string | number;
        computedPinnedStartWidth: number;
        computedPinnedEndWidth: number;
        computedPinnedStartOverflow: boolean;
        computedPinnedEndOverflow: boolean;
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
    export function usePinnedRenderingForSide<T>(side: 'start' | 'end', params: UsePinnedParams<T>): {
        renderRowPinned: RenderRow;
        pinnedList: JSX.Element | null;
        pinnedScrollbarPlaceholder: JSX.Element | null;
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
    export function useColumnSizeFn<T>(computedUnpinnedColumns: InfiniteTableComputedColumn<T>[]): (index: number) => number;
}
declare module "components/InfiniteTable/hooks/useYourBrain" {
    import { Size } from "components/types/Size";
    import { VirtualBrain, VirtualBrainOptions } from "components/VirtualBrain/index";
    import { InfiniteTableComputedColumn } from "components/InfiniteTable/types/index";
    type UseYourBrainParam<T = any> = {
        computedUnpinnedColumns: InfiniteTableComputedColumn<T>[];
        computedPinnedStartWidth: number;
        computedPinnedEndWidth: number;
        dataArray: any[];
        rowHeight: number;
        bodySize: Size;
        rowSpan?: VirtualBrainOptions['itemSpan'];
    };
    export function useYourBrain<T = any>(param: UseYourBrainParam<T>): {
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
declare module "components/InfiniteTable/InfiniteCls.css" {
    export const InfiniteCls: string;
    export const InfiniteClsShiftingColumns: string;
    export const FooterCls: string;
}
declare module "components/InfiniteTable/hooks/useDOMProps" {
    import { FocusEvent } from 'react';
    export function useDOMProps<T>(initialDOMProps?: React.HTMLProps<HTMLDivElement>): {
        onFocus: (event: FocusEvent<HTMLDivElement>) => void;
        onBlur: (event: FocusEvent<HTMLDivElement>) => void;
        accept?: string | undefined;
        acceptCharset?: string | undefined;
        action?: string | undefined;
        allowFullScreen?: boolean | undefined;
        allowTransparency?: boolean | undefined;
        alt?: string | undefined;
        as?: string | undefined;
        async?: boolean | undefined;
        autoComplete?: string | undefined;
        autoFocus?: boolean | undefined;
        autoPlay?: boolean | undefined;
        capture?: string | boolean | undefined;
        cellPadding?: string | number | undefined;
        cellSpacing?: string | number | undefined;
        charSet?: string | undefined;
        challenge?: string | undefined;
        checked?: boolean | undefined;
        cite?: string | undefined;
        classID?: string | undefined;
        cols?: number | undefined;
        colSpan?: number | undefined;
        content?: string | undefined;
        controls?: boolean | undefined;
        coords?: string | undefined;
        crossOrigin?: string | undefined;
        data?: string | undefined;
        dateTime?: string | undefined;
        default?: boolean | undefined;
        defer?: boolean | undefined;
        disabled?: boolean | undefined;
        download?: any;
        encType?: string | undefined;
        form?: string | undefined;
        formAction?: string | undefined;
        formEncType?: string | undefined;
        formMethod?: string | undefined;
        formNoValidate?: boolean | undefined;
        formTarget?: string | undefined;
        frameBorder?: string | number | undefined;
        headers?: string | undefined;
        height?: string | number | undefined;
        high?: number | undefined;
        href?: string | undefined;
        hrefLang?: string | undefined;
        htmlFor?: string | undefined;
        httpEquiv?: string | undefined;
        integrity?: string | undefined;
        keyParams?: string | undefined;
        keyType?: string | undefined;
        kind?: string | undefined;
        label?: string | undefined;
        list?: string | undefined;
        loop?: boolean | undefined;
        low?: number | undefined;
        manifest?: string | undefined;
        marginHeight?: number | undefined;
        marginWidth?: number | undefined;
        max?: string | number | undefined;
        maxLength?: number | undefined;
        media?: string | undefined;
        mediaGroup?: string | undefined;
        method?: string | undefined;
        min?: string | number | undefined;
        minLength?: number | undefined;
        multiple?: boolean | undefined;
        muted?: boolean | undefined;
        name?: string | undefined;
        nonce?: string | undefined;
        noValidate?: boolean | undefined;
        open?: boolean | undefined;
        optimum?: number | undefined;
        pattern?: string | undefined;
        placeholder?: string | undefined;
        playsInline?: boolean | undefined;
        poster?: string | undefined;
        preload?: string | undefined;
        readOnly?: boolean | undefined;
        rel?: string | undefined;
        required?: boolean | undefined;
        reversed?: boolean | undefined;
        rows?: number | undefined;
        rowSpan?: number | undefined;
        sandbox?: string | undefined;
        scope?: string | undefined;
        scoped?: boolean | undefined;
        scrolling?: string | undefined;
        seamless?: boolean | undefined;
        selected?: boolean | undefined;
        shape?: string | undefined;
        size?: number | undefined;
        sizes?: string | undefined;
        span?: number | undefined;
        src?: string | undefined;
        srcDoc?: string | undefined;
        srcLang?: string | undefined;
        srcSet?: string | undefined;
        start?: number | undefined;
        step?: string | number | undefined;
        summary?: string | undefined;
        target?: string | undefined;
        type?: string | undefined;
        useMap?: string | undefined;
        value?: string | number | readonly string[] | undefined;
        width?: string | number | undefined;
        wmode?: string | undefined;
        wrap?: string | undefined;
        defaultChecked?: boolean | undefined;
        defaultValue?: string | number | readonly string[] | undefined;
        suppressContentEditableWarning?: boolean | undefined;
        suppressHydrationWarning?: boolean | undefined;
        accessKey?: string | undefined;
        className?: string | undefined;
        contentEditable?: "inherit" | (boolean | "false" | "true") | undefined;
        contextMenu?: string | undefined;
        dir?: string | undefined;
        draggable?: (boolean | "false" | "true") | undefined;
        hidden?: boolean | undefined;
        id?: string | undefined;
        lang?: string | undefined;
        slot?: string | undefined;
        spellCheck?: (boolean | "false" | "true") | undefined;
        style?: import("react").CSSProperties | undefined;
        tabIndex: number;
        title?: string | undefined;
        translate?: "yes" | "no" | undefined;
        radioGroup?: string | undefined;
        role?: import("react").AriaRole | undefined;
        about?: string | undefined;
        datatype?: string | undefined;
        inlist?: any;
        prefix?: string | undefined;
        property?: string | undefined;
        resource?: string | undefined;
        typeof?: string | undefined;
        vocab?: string | undefined;
        autoCapitalize?: string | undefined;
        autoCorrect?: string | undefined;
        autoSave?: string | undefined;
        color?: string | undefined;
        itemProp?: string | undefined;
        itemScope?: boolean | undefined;
        itemType?: string | undefined;
        itemID?: string | undefined;
        itemRef?: string | undefined;
        results?: number | undefined;
        security?: string | undefined;
        unselectable?: "on" | "off" | undefined;
        inputMode?: "search" | "numeric" | "none" | "url" | "text" | "decimal" | "tel" | "email" | undefined;
        is?: string | undefined;
        'aria-activedescendant'?: string | undefined;
        'aria-atomic'?: boolean | "false" | "true" | undefined;
        'aria-autocomplete'?: "inline" | "both" | "none" | "list" | undefined;
        'aria-busy'?: boolean | "false" | "true" | undefined;
        'aria-checked'?: boolean | "mixed" | "false" | "true" | undefined;
        'aria-colcount'?: number | undefined;
        'aria-colindex'?: number | undefined;
        'aria-colspan'?: number | undefined;
        'aria-controls'?: string | undefined;
        'aria-current'?: boolean | "location" | "time" | "false" | "page" | "true" | "step" | "date" | undefined;
        'aria-describedby'?: string | undefined;
        'aria-details'?: string | undefined;
        'aria-disabled'?: boolean | "false" | "true" | undefined;
        'aria-dropeffect'?: "link" | "none" | "copy" | "move" | "execute" | "popup" | undefined;
        'aria-errormessage'?: string | undefined;
        'aria-expanded'?: boolean | "false" | "true" | undefined;
        'aria-flowto'?: string | undefined;
        'aria-grabbed'?: boolean | "false" | "true" | undefined;
        'aria-haspopup'?: boolean | "grid" | "dialog" | "menu" | "false" | "listbox" | "true" | "tree" | undefined;
        'aria-hidden'?: boolean | "false" | "true" | undefined;
        'aria-invalid'?: boolean | "false" | "true" | "grammar" | "spelling" | undefined;
        'aria-keyshortcuts'?: string | undefined;
        'aria-label'?: string | undefined;
        'aria-labelledby'?: string | undefined;
        'aria-level'?: number | undefined;
        'aria-live'?: "off" | "assertive" | "polite" | undefined;
        'aria-modal'?: boolean | "false" | "true" | undefined;
        'aria-multiline'?: boolean | "false" | "true" | undefined;
        'aria-multiselectable'?: boolean | "false" | "true" | undefined;
        'aria-orientation'?: "horizontal" | "vertical" | undefined;
        'aria-owns'?: string | undefined;
        'aria-placeholder'?: string | undefined;
        'aria-posinset'?: number | undefined;
        'aria-pressed'?: boolean | "mixed" | "false" | "true" | undefined;
        'aria-readonly'?: boolean | "false" | "true" | undefined;
        'aria-relevant'?: "all" | "text" | "additions" | "additions removals" | "additions text" | "removals" | "removals additions" | "removals text" | "text additions" | "text removals" | undefined;
        'aria-required'?: boolean | "false" | "true" | undefined;
        'aria-roledescription'?: string | undefined;
        'aria-rowcount'?: number | undefined;
        'aria-rowindex'?: number | undefined;
        'aria-rowspan'?: number | undefined;
        'aria-selected'?: boolean | "false" | "true" | undefined;
        'aria-setsize'?: number | undefined;
        'aria-sort'?: "none" | "other" | "ascending" | "descending" | undefined;
        'aria-valuemax'?: number | undefined;
        'aria-valuemin'?: number | undefined;
        'aria-valuenow'?: number | undefined;
        'aria-valuetext'?: string | undefined;
        children?: import("react").ReactNode;
        dangerouslySetInnerHTML?: {
            __html: string;
        } | undefined;
        onCopy?: import("react").ClipboardEventHandler<HTMLDivElement> | undefined;
        onCopyCapture?: import("react").ClipboardEventHandler<HTMLDivElement> | undefined;
        onCut?: import("react").ClipboardEventHandler<HTMLDivElement> | undefined;
        onCutCapture?: import("react").ClipboardEventHandler<HTMLDivElement> | undefined;
        onPaste?: import("react").ClipboardEventHandler<HTMLDivElement> | undefined;
        onPasteCapture?: import("react").ClipboardEventHandler<HTMLDivElement> | undefined;
        onCompositionEnd?: import("react").CompositionEventHandler<HTMLDivElement> | undefined;
        onCompositionEndCapture?: import("react").CompositionEventHandler<HTMLDivElement> | undefined;
        onCompositionStart?: import("react").CompositionEventHandler<HTMLDivElement> | undefined;
        onCompositionStartCapture?: import("react").CompositionEventHandler<HTMLDivElement> | undefined;
        onCompositionUpdate?: import("react").CompositionEventHandler<HTMLDivElement> | undefined;
        onCompositionUpdateCapture?: import("react").CompositionEventHandler<HTMLDivElement> | undefined;
        onFocusCapture?: import("react").FocusEventHandler<HTMLDivElement> | undefined;
        onBlurCapture?: import("react").FocusEventHandler<HTMLDivElement> | undefined;
        onChange?: import("react").FormEventHandler<HTMLDivElement> | undefined;
        onChangeCapture?: import("react").FormEventHandler<HTMLDivElement> | undefined;
        onBeforeInput?: import("react").FormEventHandler<HTMLDivElement> | undefined;
        onBeforeInputCapture?: import("react").FormEventHandler<HTMLDivElement> | undefined;
        onInput?: import("react").FormEventHandler<HTMLDivElement> | undefined;
        onInputCapture?: import("react").FormEventHandler<HTMLDivElement> | undefined;
        onReset?: import("react").FormEventHandler<HTMLDivElement> | undefined;
        onResetCapture?: import("react").FormEventHandler<HTMLDivElement> | undefined;
        onSubmit?: import("react").FormEventHandler<HTMLDivElement> | undefined;
        onSubmitCapture?: import("react").FormEventHandler<HTMLDivElement> | undefined;
        onInvalid?: import("react").FormEventHandler<HTMLDivElement> | undefined;
        onInvalidCapture?: import("react").FormEventHandler<HTMLDivElement> | undefined;
        onLoad?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onLoadCapture?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onError?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onErrorCapture?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onKeyDown?: import("react").KeyboardEventHandler<HTMLDivElement> | undefined;
        onKeyDownCapture?: import("react").KeyboardEventHandler<HTMLDivElement> | undefined;
        onKeyPress?: import("react").KeyboardEventHandler<HTMLDivElement> | undefined;
        onKeyPressCapture?: import("react").KeyboardEventHandler<HTMLDivElement> | undefined;
        onKeyUp?: import("react").KeyboardEventHandler<HTMLDivElement> | undefined;
        onKeyUpCapture?: import("react").KeyboardEventHandler<HTMLDivElement> | undefined;
        onAbort?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onAbortCapture?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onCanPlay?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onCanPlayCapture?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onCanPlayThrough?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onCanPlayThroughCapture?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onDurationChange?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onDurationChangeCapture?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onEmptied?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onEmptiedCapture?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onEncrypted?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onEncryptedCapture?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onEnded?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onEndedCapture?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onLoadedData?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onLoadedDataCapture?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onLoadedMetadata?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onLoadedMetadataCapture?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onLoadStart?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onLoadStartCapture?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onPause?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onPauseCapture?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onPlay?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onPlayCapture?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onPlaying?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onPlayingCapture?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onProgress?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onProgressCapture?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onRateChange?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onRateChangeCapture?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onSeeked?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onSeekedCapture?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onSeeking?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onSeekingCapture?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onStalled?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onStalledCapture?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onSuspend?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onSuspendCapture?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onTimeUpdate?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onTimeUpdateCapture?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onVolumeChange?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onVolumeChangeCapture?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onWaiting?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onWaitingCapture?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onAuxClick?: import("react").MouseEventHandler<HTMLDivElement> | undefined;
        onAuxClickCapture?: import("react").MouseEventHandler<HTMLDivElement> | undefined;
        onClick?: import("react").MouseEventHandler<HTMLDivElement> | undefined;
        onClickCapture?: import("react").MouseEventHandler<HTMLDivElement> | undefined;
        onContextMenu?: import("react").MouseEventHandler<HTMLDivElement> | undefined;
        onContextMenuCapture?: import("react").MouseEventHandler<HTMLDivElement> | undefined;
        onDoubleClick?: import("react").MouseEventHandler<HTMLDivElement> | undefined;
        onDoubleClickCapture?: import("react").MouseEventHandler<HTMLDivElement> | undefined;
        onDrag?: import("react").DragEventHandler<HTMLDivElement> | undefined;
        onDragCapture?: import("react").DragEventHandler<HTMLDivElement> | undefined;
        onDragEnd?: import("react").DragEventHandler<HTMLDivElement> | undefined;
        onDragEndCapture?: import("react").DragEventHandler<HTMLDivElement> | undefined;
        onDragEnter?: import("react").DragEventHandler<HTMLDivElement> | undefined;
        onDragEnterCapture?: import("react").DragEventHandler<HTMLDivElement> | undefined;
        onDragExit?: import("react").DragEventHandler<HTMLDivElement> | undefined;
        onDragExitCapture?: import("react").DragEventHandler<HTMLDivElement> | undefined;
        onDragLeave?: import("react").DragEventHandler<HTMLDivElement> | undefined;
        onDragLeaveCapture?: import("react").DragEventHandler<HTMLDivElement> | undefined;
        onDragOver?: import("react").DragEventHandler<HTMLDivElement> | undefined;
        onDragOverCapture?: import("react").DragEventHandler<HTMLDivElement> | undefined;
        onDragStart?: import("react").DragEventHandler<HTMLDivElement> | undefined;
        onDragStartCapture?: import("react").DragEventHandler<HTMLDivElement> | undefined;
        onDrop?: import("react").DragEventHandler<HTMLDivElement> | undefined;
        onDropCapture?: import("react").DragEventHandler<HTMLDivElement> | undefined;
        onMouseDown?: import("react").MouseEventHandler<HTMLDivElement> | undefined;
        onMouseDownCapture?: import("react").MouseEventHandler<HTMLDivElement> | undefined;
        onMouseEnter?: import("react").MouseEventHandler<HTMLDivElement> | undefined;
        onMouseLeave?: import("react").MouseEventHandler<HTMLDivElement> | undefined;
        onMouseMove?: import("react").MouseEventHandler<HTMLDivElement> | undefined;
        onMouseMoveCapture?: import("react").MouseEventHandler<HTMLDivElement> | undefined;
        onMouseOut?: import("react").MouseEventHandler<HTMLDivElement> | undefined;
        onMouseOutCapture?: import("react").MouseEventHandler<HTMLDivElement> | undefined;
        onMouseOver?: import("react").MouseEventHandler<HTMLDivElement> | undefined;
        onMouseOverCapture?: import("react").MouseEventHandler<HTMLDivElement> | undefined;
        onMouseUp?: import("react").MouseEventHandler<HTMLDivElement> | undefined;
        onMouseUpCapture?: import("react").MouseEventHandler<HTMLDivElement> | undefined;
        onSelect?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onSelectCapture?: import("react").ReactEventHandler<HTMLDivElement> | undefined;
        onTouchCancel?: import("react").TouchEventHandler<HTMLDivElement> | undefined;
        onTouchCancelCapture?: import("react").TouchEventHandler<HTMLDivElement> | undefined;
        onTouchEnd?: import("react").TouchEventHandler<HTMLDivElement> | undefined;
        onTouchEndCapture?: import("react").TouchEventHandler<HTMLDivElement> | undefined;
        onTouchMove?: import("react").TouchEventHandler<HTMLDivElement> | undefined;
        onTouchMoveCapture?: import("react").TouchEventHandler<HTMLDivElement> | undefined;
        onTouchStart?: import("react").TouchEventHandler<HTMLDivElement> | undefined;
        onTouchStartCapture?: import("react").TouchEventHandler<HTMLDivElement> | undefined;
        onPointerDown?: import("react").PointerEventHandler<HTMLDivElement> | undefined;
        onPointerDownCapture?: import("react").PointerEventHandler<HTMLDivElement> | undefined;
        onPointerMove?: import("react").PointerEventHandler<HTMLDivElement> | undefined;
        onPointerMoveCapture?: import("react").PointerEventHandler<HTMLDivElement> | undefined;
        onPointerUp?: import("react").PointerEventHandler<HTMLDivElement> | undefined;
        onPointerUpCapture?: import("react").PointerEventHandler<HTMLDivElement> | undefined;
        onPointerCancel?: import("react").PointerEventHandler<HTMLDivElement> | undefined;
        onPointerCancelCapture?: import("react").PointerEventHandler<HTMLDivElement> | undefined;
        onPointerEnter?: import("react").PointerEventHandler<HTMLDivElement> | undefined;
        onPointerEnterCapture?: import("react").PointerEventHandler<HTMLDivElement> | undefined;
        onPointerLeave?: import("react").PointerEventHandler<HTMLDivElement> | undefined;
        onPointerLeaveCapture?: import("react").PointerEventHandler<HTMLDivElement> | undefined;
        onPointerOver?: import("react").PointerEventHandler<HTMLDivElement> | undefined;
        onPointerOverCapture?: import("react").PointerEventHandler<HTMLDivElement> | undefined;
        onPointerOut?: import("react").PointerEventHandler<HTMLDivElement> | undefined;
        onPointerOutCapture?: import("react").PointerEventHandler<HTMLDivElement> | undefined;
        onGotPointerCapture?: import("react").PointerEventHandler<HTMLDivElement> | undefined;
        onGotPointerCaptureCapture?: import("react").PointerEventHandler<HTMLDivElement> | undefined;
        onLostPointerCapture?: import("react").PointerEventHandler<HTMLDivElement> | undefined;
        onLostPointerCaptureCapture?: import("react").PointerEventHandler<HTMLDivElement> | undefined;
        onScroll?: import("react").UIEventHandler<HTMLDivElement> | undefined;
        onScrollCapture?: import("react").UIEventHandler<HTMLDivElement> | undefined;
        onWheel?: import("react").WheelEventHandler<HTMLDivElement> | undefined;
        onWheelCapture?: import("react").WheelEventHandler<HTMLDivElement> | undefined;
        onAnimationStart?: import("react").AnimationEventHandler<HTMLDivElement> | undefined;
        onAnimationStartCapture?: import("react").AnimationEventHandler<HTMLDivElement> | undefined;
        onAnimationEnd?: import("react").AnimationEventHandler<HTMLDivElement> | undefined;
        onAnimationEndCapture?: import("react").AnimationEventHandler<HTMLDivElement> | undefined;
        onAnimationIteration?: import("react").AnimationEventHandler<HTMLDivElement> | undefined;
        onAnimationIterationCapture?: import("react").AnimationEventHandler<HTMLDivElement> | undefined;
        onTransitionEnd?: import("react").TransitionEventHandler<HTMLDivElement> | undefined;
        onTransitionEndCapture?: import("react").TransitionEventHandler<HTMLDivElement> | undefined;
        ref?: import("react").LegacyRef<HTMLDivElement> | undefined;
        key?: import("react").Key | null | undefined;
    };
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
    export { useComponentState, getComponentStateRoot, } from "components/hooks/useComponentState";
    export { interceptMap } from "components/hooks/useInterceptedMap";
}
`