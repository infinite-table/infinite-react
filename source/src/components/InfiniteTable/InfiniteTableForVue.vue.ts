import {
  computed,
  defineComponent,
  h,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  shallowRef,
  watchEffect,
} from 'vue';
import type { ShallowRef } from 'vue';

import { join } from '../../utils/join';
import { buildManagedVueComponent } from '../hooks/useComponentState/useManagedComponent.vue';
import { computedWithDeps } from '../hooks/computedWithDeps.vue';
import { runControllerEffectsForVue } from '../hooks/runControllerEffectsForVue.vue';
import { setupResizeObserver } from '../ResizeObserver/setupResizeObserver';

import {
  DataSourceInjectionKeyForVue,
  useDataSourceContext,
} from '../DataSource/DataSourceForVue.vue';

import {
  forwardProps,
  getMappedCallbacks,
  mapPropsToState,
  initSetupState,
  cleanupState,
  getGroupByMap,
} from './state/getInitialState';
import {
  createRootEffects,
  getColumnSizeFn,
  getRowspanFn,
  updateBrain,
} from './controller/rootEffects';
import { getComputedColumns } from './utils/getComputedColumns';
import { getInfiniteCSSVars } from './utils/getInfiniteCSSVars';
import { getImperativeApi } from './api/getImperativeApi';
import { MultiRowSelector } from './utils/MultiRowSelector';
import { MultiCellSelector } from './utils/MultiCellSelector';
import { internalProps, rootClassName } from './internalProps';
import { ThemeVars } from './vars.css';
import { CSSNumericVariableWatch } from '../CSSNumericVariableWatch/CSSNumericVariableWatchForVue.vue';
import { useGetMasterDetailContextForVue } from '../DataSource/DataSourceMasterDetailContextForVue.vue';
import { InfiniteTableLicenseFooter } from './components/InfiniteTableLicenseFooter/InfiniteTableLicenseFooterForVue.vue';
import { getLicenseStatus } from './hooks/useLicense/getLicenseStatus';

import { rafFn } from './utils/rafFn';
import {
  InfiniteCls,
  InfiniteClsHasPinnedEnd,
  InfiniteClsHasPinnedStart,
  InfiniteClsRecipe,
} from './InfiniteCls.css';

import { getCellSelector } from './state/getInitialState';
import { selectParentUntil } from '../../utils/selectParent';
import { useColumnMenu } from './hooks/useColumnMenuForVue.vue';
import { useColumnFilterOperatorMenu } from './hooks/useColumnFilterOperatorMenuForVue.vue';
import {
  useCellContextMenu,
  useTableContextMenu,
} from './hooks/useContextMenuForVue.vue';
import { position, top, left, zIndex, visibility } from './utilities.css';
import { cloneRowSelection } from './api/getRowSelectionApi';
import { cloneTreeSelection } from '../DataSource/TreeApi';
import type { InfiniteTableEventHandlerContext } from './eventHandlers/eventHandlerTypes';

import { HeadlessTable } from '../HeadlessTable/HeadlessTableForVue.vue';
import { InfiniteBodyCls } from './components/InfiniteTableBody/body.css';
import { InfiniteTableBodyClassName } from './components/InfiniteTableBody/bodyClassName';
import { InfiniteTableColumnCell } from './components/InfiniteTableRow/InfiniteTableColumnCellForVue.vue';
import { InfiniteTableDetailRow } from './components/InfiniteTableRow/InfiniteTableDetailRowForVue.vue';
import { computeRowHeightWithCache } from './hooks/computedRowHeightShared';
import { InfiniteTableColumnCellClassName } from './components/InfiniteTableRow/InfiniteTableColumnCellClassNames';
import { RowHoverCls } from './components/InfiniteTableRow/row.css';
import { TableHeaderWrapper } from './components/InfiniteTableHeader/TableHeaderWrapperForVue.vue';
import { LoadMask } from './components/LoadMaskForVue.vue';
import { InfiniteTableInjectionKeyForVue } from './InfiniteTableContextForVue.vue';
import type { InfiniteTableContextValueForVue } from './InfiniteTableContextForVue.vue';

import type {
  TableRenderCellFn,
  TableRenderCellFnParam,
  TableRenderDetailRowFn,
  TableRenderDetailRowFnParam,
} from '../HeadlessTable/rendererTypes';
import type { Renderable } from '../types/Renderable';
import type {
  InfiniteTableComputedValues,
  InfiniteTableState,
  Scrollbars,
} from './types';
import type { InfiniteTableActions } from './types/InfiniteTableState';
import type { InfiniteTableColumnRenderingContext } from './components/InfiniteTableRow/columnRenderingContextType';
import {
  DEFAULT_COLUMN_HEADER_HEIGHT,
  DEFAULT_ROW_HEIGHT_CSS_VALUE,
} from './shared';

export const InfiniteTableClassName = internalProps.rootClassName;

/**
 * Vue sibling of the InfiniteTable root (Phase 3 walking skeleton).
 *
 * initSetupState/forwardProps/mapPropsToState/cleanup config as React), the
 * shared column-computation pipeline (getComputedColumns), brain wiring and
 * the fully virtualized body rendered through the Vue rendering bridge, fed
 * by the Vue DataSource (parent state propagation included).
 *
 */
export const DATA_GRID_PROP_NAMES = [
  'debugId',
  'id',
  'children',
  'columns',
  'columnDefaultWidth',
  'columnDefaultFlex',
  'columnMinWidth',
  'columnMaxWidth',
  'columnCssEllipsis',
  'columnHeaderCssEllipsis',
  'columnDefaultSortable',
  'columnDefaultDraggable',
  'columnDefaultEditable',
  'columnDefaultFilterable',
  'columnDefaultGroupable',
  'columnOrder',
  'defaultColumnOrder',
  'onColumnOrderChange',
  'columnVisibility',
  'defaultColumnVisibility',
  'onColumnVisibilityChange',
  'columnPinning',
  'defaultColumnPinning',
  'onColumnPinningChange',
  'columnSizing',
  'defaultColumnSizing',
  'onColumnSizingChange',
  'columnTypes',
  'columnGroups',
  'defaultColumnGroups',
  'columnGroupVisibility',
  'collapsedColumnGroups',
  'pinnedStartMaxWidth',
  'pinnedEndMaxWidth',
  'viewportReservedWidth',
  'onViewportReservedWidthChange',
  'resizableColumns',
  'draggableColumns',
  'draggableColumnsRestrictTo',
  'sortable',
  'multiSortBehavior',
  'editable',
  'rowHeight',
  'onRowHeightChange',
  'rowDetailHeight',
  'columnHeaderHeight',
  'onColumnGroupVisibilityChange',
  'header',
  'headerOptions',
  'showColumnFilters',
  'showZebraRows',
  'showHoverRows',
  'rowHoverClassName',
  'rowClassName',
  'rowStyle',
  'rowProps',
  'cellClassName',
  'cellStyle',
  'repaintCellsKey',
  'domProps',
  'licenseKey',
  'loadingText',
  'components',
  'keyboardNavigation',
  'keyboardSelection',
  'multiRowSelectionWith',
  'keyboardShortcuts',
  'activeRowIndex',
  'defaultActiveRowIndex',
  'onActiveRowIndexChange',
  'activeCellIndex',
  'defaultActiveCellIndex',
  'onActiveCellIndexChange',
  'onKeyDown',
  'onCellClick',
  'onCellDoubleClick',
  'onCellContextMenu',
  'onContextMenu',
  'onScrollToTop',
  'onScrollToBottom',
  'onScrollStop',
  'scrollToBottomOffset',
  'scrollStopDelay',
  'scrollTopKey',
  'onReady',
  'onRenderRangeChange',
  'onRowMouseEnter',
  'onRowMouseLeave',
  'onSelfFocus',
  'onSelfBlur',
  'onFocusWithin',
  'onBlurWithin',
  'focusedClassName',
  'focusedWithinClassName',
  'focusedStyle',
  'focusedWithinStyle',
  'groupColumn',
  'groupRenderStrategy',
  'hideColumnWhenGrouped',
  'hideEmptyGroupColumns',
  'pivotColumn',
  'pivotColumns',
  'pivotColumnGroups',
  'pivotTotalColumnPosition',
  'pivotGrandTotalColumnPosition',
  'showSeparatePivotColumnForSingleAggregation',
  'wrapRowsHorizontally',
  'repeatWrappedGroupRows',
  'onScrollbarsChange',
  'autoSizeColumnsKey',
  'columnMenuRealignDelay',
  'getColumnMenuItems',
  'getCellContextMenuItems',
  'getContextMenuItems',
  'getFilterOperatorMenuItems',
  'menuPortalContainer',
  'menuConstrainTo',
  'onEditCancelled',
  'onEditRejected',
  'onEditAccepted',
  'persistEdit',
  'shouldAcceptEdit',
  'onEditPersistError',
  'onEditPersistSuccess',
  'rowDetailCache',
  'rowDetailRenderer',
  'isRowDetailExpanded',
  'isRowDetailEnabled',
  'rowDetailState',
  'defaultRowDetailState',
  'onRowDetailStateChange',
] as const;

const {
  useManagedComponent: useManagedInfiniteTable,
  injectionKey: managedInfiniteTableKey,
} = buildManagedVueComponent({
  // @ts-ignore
  initSetupState,
  // @ts-ignore
  forwardProps,
  // @ts-ignore
  mapPropsToState,
  // @ts-ignore
  cleanup: cleanupState,
  // @ts-ignore
  allowedControlledPropOverrides: {
    rowHeight: true,
    columnHeaderHeight: true,
  } as Record<string, true>,
  //@ts-ignore
  mappedCallbacks: getMappedCallbacks(),
  getParentState: () => {
    // the DataSource state is the parent state - same as React, where
    // getParentState reads the DataSource context
    const dataSourceContext = inject(DataSourceInjectionKeyForVue, null);
    return dataSourceContext ? dataSourceContext.state : null;
  },
  debugName: 'InfiniteTable',
});

export {
  InfiniteTableInjectionKeyForVue,
  useInfiniteTableContext,
} from './InfiniteTableContextForVue.vue';
export type { InfiniteTableContextValueForVue } from './InfiniteTableContextForVue.vue';

// explicitly typed, so reading InfiniteTable.licenseKey from inside the
// component definition does not create a circular type reference
function getGlobalLicenseKey(): string | undefined {
  return InfiniteTable.licenseKey;
}

const InfiniteTableComponent = defineComponent({
  name: 'InfiniteTable',
  props: [...DATA_GRID_PROP_NAMES],
  setup(props, { attrs }) {
    const dataSourceContext = useDataSourceContext();

    // detail grids are covered by the license of the master grid
    const isDetail = !!useGetMasterDetailContextForVue()();
    // the license key can also be set globally - InfiniteTable.licenseKey = '...'
    // (same as in React)
    const licenseStatus = computed(() =>
      getLicenseStatus(
        (props as Record<string, any>).licenseKey ?? getGlobalLicenseKey(),
        { isDetail },
      ),
    );

    if (!dataSourceContext) {
      throw new Error(
        'InfiniteTable must be rendered inside a <DataSource> component',
      );
    }

    // same defaults the React wrapper passes as JSX props
    const effectiveProps = new Proxy(props as Record<string, any>, {
      get(target, key, receiver) {
        const value = Reflect.get(target, key, receiver);
        if (key === 'rowHeight') {
          return value ?? DEFAULT_ROW_HEIGHT_CSS_VALUE;
        }
        if (key === 'columnHeaderHeight') {
          return value ?? DEFAULT_COLUMN_HEADER_HEIGHT;
        }
        if (key === 'repeatWrappedGroupRows') {
          return value ?? !!Reflect.get(target, 'wrapRowsHorizontally');
        }
        return value;
      },
    });

    const { contextValue: managedContextValue } = useManagedInfiniteTable(
      effectiveProps as any,
    );
    provide(managedInfiniteTableKey, managedContextValue);

    const state = managedContextValue.state as unknown as ShallowRef<
      InfiniteTableState<any>
    >;
    const actions =
      managedContextValue.componentActions as unknown as InfiniteTableActions<any>;
    // non-tracking getter (NOT `() => state.value`): getState is the
    // imperative accessor handed to cells/api/event handlers - reading the
    // reactive ref here would subscribe every calling component to ALL state
    // changes. Reactive consumers read `state.value` directly instead.
    const getState =
      managedContextValue.getComponentState as () => InfiniteTableState<any>;

    const { state: dataSourceState, getDataSourceState } = dataSourceContext;

    // shared column-computation pipeline (what useComputedColumns memoizes).
    // Memoized on the same deps as React's useComputedColumns so column
    // identities survive unrelated state changes (eg data updates) - cells
    // and header cells rely on stable `column` prop identities to skip
    // re-rendering.
    const computedColumnsResult = computedWithDeps(
      () => {
        const s = state.value;
        const ds = dataSourceState.value;
        return [
          s.computedColumns,
          s.bodySize.width,
          s.columnMinWidth,
          s.columnMaxWidth,
          s.columnDefaultWidth,
          s.columnDefaultFlex,
          s.columnCssEllipsis,
          s.columnHeaderCssEllipsis,
          s.viewportReservedWidth,
          s.resizableColumns,
          ds.filterValue,
          ds.filterTypes,
          s.sortable,
          ds.sortInfo,
          ds.multiSort,
          s.pinnedEndMaxWidth,
          s.pinnedStartMaxWidth,
          s.draggableColumns,
          s.columnDefaultDraggable,
          s.columnOrder,
          s.columnPinning,
          s.columnDefaultEditable,
          s.columnDefaultFilterable,
          s.columnDefaultGroupable,
          s.columnDefaultSortable,
          s.editable,
          s.columnSizing,
          s.columnTypes,
          s.columnVisibility,
          s.initialColumns,
          ds.groupBy,
        ];
      },
      () => {
        const s = state.value;
        const ds = dataSourceState.value;

        return getComputedColumns({
          columns: s.computedColumns,
          userColumns: s.initialColumns,
          scrollbarWidth: undefined,
          bodySize: s.bodySize,
          columnMinWidth: s.columnMinWidth,
          columnMaxWidth: s.columnMaxWidth,
          columnDefaultWidth: s.columnDefaultWidth,
          columnDefaultFlex: s.columnDefaultFlex,
          columnCssEllipsis: s.columnCssEllipsis,
          columnHeaderCssEllipsis: s.columnHeaderCssEllipsis,
          viewportReservedWidth: s.viewportReservedWidth,
          resizableColumns: s.resizableColumns,
          filterValue: ds.filterValue,
          filterTypes: ds.filterTypes,
          sortable: s.sortable,
          sortInfo: ds.sortInfo ?? undefined,
          multiSort: ds.multiSort,
          pinnedEndMaxWidth: s.pinnedEndMaxWidth,
          pinnedStartMaxWidth: s.pinnedStartMaxWidth,
          draggableColumns: s.draggableColumns,
          columnDefaultDraggable: s.columnDefaultDraggable,
          columnOrder: s.columnOrder,
          columnPinning: s.columnPinning,
          columnDefaultEditable: s.columnDefaultEditable,
          columnDefaultFilterable: s.columnDefaultFilterable,
          columnDefaultGroupable: s.columnDefaultGroupable,
          columnDefaultSortable: s.columnDefaultSortable,
          editable: s.editable,
          columnSizing: s.columnSizing,
          columnTypes: s.columnTypes,
          columnVisibility: s.columnVisibility,
          columnVisibilityAssumeVisible: true,
          groupBy: ds.groupBy,
        });
      },
      'computedColumnsResult',
    );

    const getComputedVisibleColumns = () =>
      computedColumnsResult.value.computedVisibleColumns;

    // ---- full computed values + imperative api (mirrors useComputed) ----
    const { getDataSourceState: getDSState, dataSourceApi } = dataSourceContext;

    const multiRowSelector = new MultiRowSelector({
      getRowAt: (index: number) => getDSState().dataArray[index],
      isNodeSelectable: (row) => {
        const { isNodeSelectable } = getDSState();
        return isNodeSelectable ? isNodeSelectable(row as any) : true;
      },
    });

    const multiCellSelector = new MultiCellSelector({
      getPrimaryKeyByIndex: dataSourceApi.getPrimaryKeyByIndex,
      getColumnIdByIndex: (colIndex: number) => {
        return getComputedVisibleColumns()[colIndex]?.id || '';
      },
    });

    // scrollbars tracking - what useScrollbars does in React
    const scrollbarsRef = shallowRef<Scrollbars>({
      vertical: false,
      horizontal: false,
    });
    // mirrors React's useComputedRowHeight: memoized on the same inputs so
    // the RowSizeCache instance survives data changes (the brain populates it
    // when measuring rows, renderDetailRow reads it back)
    let rowHeightMemo: {
      deps: readonly unknown[];
      value: ReturnType<typeof computeRowHeightWithCache>;
    } | null = null;

    const getComputedRowHeightResult = () => {
      // non-tracking read: getComputed() is called from cell/header render
      // functions - a reactive `state.value` read here would subscribe them
      // to every state change
      const s = getState();
      const deps = [
        s.rowHeight,
        s.rowDetailHeight,
        s.isRowDetailExpanded,
        s.isRowDetailEnabled,
      ] as const;

      if (
        !rowHeightMemo ||
        rowHeightMemo.deps.some((dep, index) => dep !== deps[index])
      ) {
        rowHeightMemo = {
          deps,
          value: computeRowHeightWithCache({
            rowHeight: s.rowHeight,
            rowDetailHeight: s.rowDetailHeight,
            isRowDetailsExpanded: s.isRowDetailExpanded,
            isRowDetailsEnabled: s.isRowDetailEnabled,
            getDataSourceState: getDSState,
          }),
        };
      }
      return rowHeightMemo.value;
    };

    const getComputedRowHeight = () =>
      getComputedRowHeightResult().computedRowHeight;

    const getComputed = (): InfiniteTableComputedValues<any> => {
      const cc = computedColumnsResult.value;

      const computedPinnedStartWidth =
        cc.computedPinnedStartWidth ?? cc.computedPinnedStartColumnsWidth;
      const computedPinnedEndWidth =
        cc.computedPinnedEndWidth ?? cc.computedPinnedEndColumnsWidth;

      return {
        ...cc,
        scrollbars: scrollbarsRef.value,
        multiRowSelector,
        multiCellSelector,
        computedRowHeight: getComputedRowHeight(),
        computedRowSizeCacheForDetails:
          getComputedRowHeightResult().computedRowSizeCacheForDetails,
        rowspan: getRowspanFn(cc.computedVisibleColumns, getDSState),
        computedPinnedStartOverflow: computedPinnedStartWidth
          ? cc.computedPinnedStartColumnsWidth > computedPinnedStartWidth
          : false,
        computedPinnedEndOverflow: computedPinnedEndWidth
          ? cc.computedPinnedEndColumnsWidth > computedPinnedEndWidth
          : false,
        toggleGroupRow: (groupKeys: any[]) => api.toggleGroupRow(groupKeys),
        columnSize: (colIndex: number) =>
          getColumnSizeFn(cc.computedVisibleColumns)(colIndex),
      };
    };

    const getDataSourceMasterContext = () =>
      getDSState().getDataSourceMasterContextRef?.current?.() ?? undefined;

    const api = getImperativeApi({
      getComputed,
      getState,
      getDataSourceState: getDSState,
      getDataSourceMasterContext,
      actions,
      dataSourceActions: dataSourceContext.dataSourceActions,
      dataSourceApi,
    });

    // the rendering context every cell receives (stable identity)
    const renderingContext: InfiniteTableColumnRenderingContext<any> = {
      getState,
      getDataSourceState: getDSState,
      getDataSourceMasterContext,
      actions,
      dataSourceActions: dataSourceContext.dataSourceActions,
      api,
      dataSourceApi,
    };

    // ---- shared DOM event handlers (mirrors useDOMEventHandlers) ----
    // cells/root publish raw events into the keyDown/cellClick/cellMouseDown
    // subscription callbacks; here we route them into the shared,
    // framework-neutral handlers (keyboard navigation, keyboard & click
    // selection, editing triggers, keyboard shortcuts)
    const eventHandlerContext: InfiniteTableEventHandlerContext<any> = {
      getComputed,
      getDataSourceMasterContext,
      dataSourceApi,
      api,
      getState,
      actions,
      getDataSourceState: getDSState,
      dataSourceActions: dataSourceContext.dataSourceActions,
      cloneTreeSelection: (treeSelection) => {
        return cloneTreeSelection<any>(treeSelection, getDSState);
      },
      cloneRowSelection: (rowSelection) => {
        return cloneRowSelection<any>(rowSelection, getDSState);
      },
    };

    // ---- the effects shared with the Angular root (controller/rootEffects.ts):
    // columns when grouping, the DataSource flags, auto size, the hidden
    // columns, scrollbars, scrolling to the active row/cell, the editing
    // callbacks, the horizontal layout, ready, the render range and scroll
    // stop notifications + the event handler and CSS var subscriptions.
    // Three groups, each run where its watchers were created before (the
    // creation order decides which watcher runs first)
    const groupByMapRef = computed(() =>
      getGroupByMap(dataSourceState.value.groupBy),
    );
    const autoSizeRefreshId = ref(0);
    const rootEffects = createRootEffects<any>({
      state: () => state.value,
      dataSourceState: () => dataSourceState.value,
      groupByMap: () => groupByMapRef.value,
      eventHandlerContext,
      scrollbars: {
        get: () => scrollbarsRef.value,
        peek: () => scrollbarsRef.value,
        set: (scrollbars) => {
          scrollbarsRef.value = scrollbars;
        },
      },
      autoSizeRefreshId: {
        get: () => autoSizeRefreshId.value,
        peek: () => autoSizeRefreshId.value,
        set: (id) => {
          autoSizeRefreshId.value = id;
        },
      },
    });
    runControllerEffectsForVue(rootEffects.columnEffects);

    const onRootKeyDown = (event: KeyboardEvent) => {
      getState().keyDown(event as any);
    };

    // ---- menus (mirrors useColumnMenu/useCellContextMenu/useTableContextMenu) ----
    const { MenuPortal: ColumnMenuPortal } = useColumnMenu({
      context: eventHandlerContext,
      state,
    });
    const { MenuPortal: CellContextMenuPortal } = useCellContextMenu({
      context: eventHandlerContext,
      state,
    });
    const { MenuPortal: TableContextMenuPortal } = useTableContextMenu({
      context: eventHandlerContext,
      state,
    });
    const { MenuPortal: FilterOperatorMenuPortal } =
      useColumnFilterOperatorMenu({
        context: eventHandlerContext,
        state,
      });

    // mirrors the onContextMenu handler in InfiniteTableBody/index.tsx:
    // publishes the raw browser event (+ cell location when over a cell)
    // into the shared cellContextMenu/contextMenu subscription callbacks
    const onBodyContextMenu = (event: MouseEvent) => {
      const s = getState();
      const target = event.target as HTMLElement;

      const cell = selectParentUntil(
        target,
        getCellSelector(),
        s.domRef.current,
      );

      let columnId: string | undefined;
      let colIndex: number | undefined;
      let rowId: string | undefined;
      let rowIndex: number | undefined;

      if (cell) {
        colIndex = Number(cell.dataset.colIndex);
        rowIndex = Number(cell.dataset.rowIndex);

        columnId = getComputed().computedVisibleColumns[colIndex].id;
        rowId = dataSourceApi.getRowInfoArray()[rowIndex].id;
      }

      const param = {
        columnId,
        colIndex,
        rowId,
        rowIndex,
        event: event as any,
        target: cell ?? (event.target as HTMLElement),
      };

      if (cell) {
        s.cellContextMenu(param as any);
      }
      s.contextMenu(param as any);
    };

    // ---- focus/blur tracking (mirrors the focus part of useDOMProps) ----
    // Vue needs focusin/focusout - React's onFocus/onBlur are delegated and
    // already behave like the bubbling focusin/focusout events
    const setFocused = rafFn((focused: boolean) => {
      actions.focused = focused;
    });
    const setFocusedWithin = rafFn((focused: boolean) => {
      actions.focusedWithin = focused;
    });

    const onRootFocusIn = (event: FocusEvent) => {
      const s = getState();
      if (
        event.target === s.domRef.current ||
        event.target === s.scrollerDOMRef.current
      ) {
        if (s.focused) {
          return;
        }
        setFocused(true);
        s.onSelfFocus?.(event as any);

        if (s.focusedWithin) {
          setFocusedWithin(false);
          s.onBlurWithin?.(event as any);
        }
        return;
      }
      if (!s.focusedWithin) {
        setFocusedWithin(true);
        s.onFocusWithin?.(event as any);
      }
    };

    const onRootFocusOut = (event: FocusEvent) => {
      const s = getState();
      if (
        event.target === s.domRef.current ||
        event.target === s.scrollerDOMRef.current
      ) {
        if (!s.focused) {
          return;
        }
        setFocused(false);
        s.onSelfBlur?.(event as any);

        if (s.focusedWithin) {
          setFocusedWithin(false);
          s.onBlurWithin?.(event as any);
        }
        return;
      }
      const contained = s.domRef.current?.contains(
        (event as any).relatedTarget,
      );

      if (!contained) {
        setFocusedWithin(false);
        s.onBlurWithin?.(event as any);
      }
    };

    runControllerEffectsForVue(rootEffects.interactionEffects);

    // brain wiring - what useYourBrain/useMatrixBrain do on each render
    // (state.value is a shallowRef, so any state commit re-runs this)
    watchEffect(() => {
      updateBrain({
        state: state.value,
        dataSourceState: dataSourceState.value,
        computedColumns: computedColumnsResult.value,
        getRowHeight: getComputedRowHeight,
        getDataSourceState,
      });
    });

    runControllerEffectsForVue(rootEffects.layoutEffects);

    // bodySize tracking on the scroller element
    let scrollerElement: HTMLElement | null = null;
    let removeScrollerResizeObserver: VoidFunction | null = null;
    const onScrollerElement = (el: HTMLElement | null) => {
      scrollerElement = el;
      state.value.scrollerDOMRef.current = el as HTMLDivElement | null;

      removeScrollerResizeObserver?.();
      removeScrollerResizeObserver = null;

      if (el) {
        actions.bodySize = {
          width: el.clientWidth,
          height: el.clientHeight,
        };
        removeScrollerResizeObserver = setupResizeObserver(
          el,
          (size) => {
            actions.bodySize = {
              width: Math.round(size.width),
              height: Math.round(size.height),
            };
          },
          { debounce: 50 },
        );
      }
    };

    onMounted(() => {
      if (scrollerElement) {
        actions.bodySize = {
          width: scrollerElement.clientWidth,
          height: scrollerElement.clientHeight,
        };
      }
    });

    onBeforeUnmount(() => {
      removeScrollerResizeObserver?.();
      rootEffects.destroy();
    });

    // the real cell tree: InfiniteTableColumnCellForVue mirrors the React
    // InfiniteTableColumnCell (render bag, styling fns, classnames, events).
    // It's a computed so a data/columns change produces a NEW function
    // identity, which makes RawTable re-wire and force-rerender all cells -
    // the same mechanism React uses (useCallback with data/columns deps).
    const getData = () => getDSState().dataArray;
    const getComputedColumnOrder = () =>
      computedColumnsResult.value.computedColumnOrder;

    // same default hover classnames as InfiniteTableBody.rowHoverClassName
    const HOVERED_CLASS_NAMES = [
      RowHoverCls,
      `${InfiniteTableColumnCellClassName}--hovered`,
    ];

    // mirrors the hoverClassNames useMemo in the React InfiniteTableBody
    const hoverClassNames = computedWithDeps<string[] | undefined>(
      () => {
        const s = state.value;
        return [s.showHoverRows, s.rowHoverClassName];
      },
      () => {
        const s = state.value;
        if (!s.showHoverRows) {
          return undefined;
        }

        let result: string[] = [];

        if (s.rowHoverClassName) {
          result = result.concat(s.rowHoverClassName);
        }

        result = result.concat(HOVERED_CLASS_NAMES);

        return result
          .join(' ')
          .split(' ')
          .map((str) => str.trim())
          .filter(Boolean);
      },
      'hoverClassNames',
    );

    // mirrors React's dataSourceStatePartialForCell useMemo: passed as a cell
    // prop purely so the prop diff re-renders all cells when one of these
    // DataSource state slices changes (the cell reads the live values
    // imperatively via getDataSourceState during render)
    const dataSourceStatePartialForCell = computedWithDeps(
      () => {
        const ds = dataSourceState.value;
        return [ds.isNodeReadOnly, ds.selectionMode, ds.cellSelection];
      },
      () => {
        const ds = getDSState();
        return {
          isNodeReadOnly: ds.isNodeReadOnly,
          selectionMode: ds.selectionMode,
          cellSelection: ds.cellSelection,
        };
      },
      'dataSourceStatePartialForCell',
    );

    // memoized on the same deps as React's useCellRendering renderCell
    // useCallback: NOT on dataArray (read lazily via getData, like React's
    // useLatest getter) - so a data update does not produce a new renderCell
    // identity and does not force-rerender every cell. Per-row updates reach
    // the cells through their rowInfoStore subscriptions instead.
    const renderCellComputed = computedWithDeps<TableRenderCellFn>(
      () => {
        const s = state.value;
        const ds = dataSourceState.value;
        return [
          computedColumnsResult.value,
          s.rowHeight,
          s.rowDetailHeight,
          s.onRowMouseEnter,
          s.onRowMouseLeave,
          s.isRowDetailExpanded,
          s.isRowDetailEnabled,
          s.groupRenderStrategy,
          s.wrapRowsHorizontally,
          s.showZebraRows,
          s.brain,
          s.rowStyle,
          s.rowClassName,
          s.cellStyle,
          s.cellClassName,
          s.repaintCellsKey,
          s.editingCell,
          s.updatedAt,
          ds.rowInfoStore,
          dataSourceStatePartialForCell.value,
        ];
      },
      () => {
        const { computedVisibleColumns, computedColumnsMap, fieldsToColumn } =
          computedColumnsResult.value;
        const s = getState();
        const showZebraRows = s.showZebraRows;
        const rowInfoStore = getDSState().rowInfoStore;
        const dataSourceStatePartial = dataSourceStatePartialForCell.value;

        return (params: TableRenderCellFnParam) => {
          const {
            rowIndex,
            colIndex,
            domRef,
            hidden,
            width,
            heightWithRowspan,
            onMouseEnter,
            onMouseLeave,
          } = params;

          const rowInfo = getData()[rowIndex];
          const column = computedVisibleColumns[colIndex];

          if (!rowInfo || !column) {
            return null;
          }

          // like React's useCellRendering: when rows have details, the brain
          // sizes the row as row + detail, so the cell takes its own height
          // from the row size cache - otherwise it would cover the detail
          const computedRowSizeCacheForDetails =
            getComputedRowHeightResult().computedRowSizeCacheForDetails;
          const rowHeight = computedRowSizeCacheForDetails
            ? computedRowSizeCacheForDetails.getRowHeight(rowIndex)
            : heightWithRowspan;

          let rowDetailState: false | 'collapsed' | 'expanded' = false;
          const isRowDetailsEnabled = s.isRowDetailEnabled;
          const isRowDetailsExpanded = s.isRowDetailExpanded;
          if (
            !isRowDetailsEnabled ||
            (typeof isRowDetailsEnabled === 'function' &&
              !isRowDetailsEnabled(rowInfo))
          ) {
            rowDetailState = false;
          } else if (isRowDetailsExpanded) {
            rowDetailState = isRowDetailsExpanded(rowInfo)
              ? 'expanded'
              : 'collapsed';
          }

          // whether THIS cell is in edit mode - passed as a prop (like React)
          // so an editing start/stop re-renders exactly the affected cell
          const inEditMode = api.isEditorVisibleForCell({
            rowIndex,
            columnId: column.id,
          });

          // no `key`: the pooled cell (a RenderSlot) keeps its
          // InfiniteTableColumnCell instance and its DOM element while
          // scrolling, and only gets new props - as in React. A key made of
          // the row index would unmount and mount a cell (component and
          // DOM) for every cell that scrolls into view
          return h(InfiniteTableColumnCell, {
            rowIndex,
            rowHeight,
            width,
            hidden,
            domRef: domRef as any,
            column,
            columnsMap: computedColumnsMap,
            fieldsToColumn,
            showZebraRows,
            rowDetailState,
            inEditMode,
            rowIndexInHorizontalLayoutPage: s.wrapRowsHorizontally
              ? s.brain.getRowIndexInPage(rowIndex)
              : null,
            horizontalLayoutPageIndex: s.wrapRowsHorizontally
              ? s.brain.getPageIndexForRow(rowIndex)
              : null,
            rowStyle: s.rowStyle as any,
            rowClassName: s.rowClassName as any,
            cellStyle: s.cellStyle as any,
            cellClassName: s.cellClassName as any,
            // the column-level key wins over the table-level one
            repaintCellsKey:
              column.repaintCellsKey !== undefined
                ? column.repaintCellsKey
                : s.repaintCellsKey,
            getData,
            rowInfoStore,
            renderingContext,
            getComputedVisibleColumns,
            getComputedColumnOrder,
            dataSourceStatePartial,
            onMouseEnter,
            onMouseLeave,
          }) as unknown as Renderable;
        };
      },
      'body.renderCell',
    );

    // mirrors renderDetailRow from React's useCellRendering
    const renderDetailRowComputed = computedWithDeps<
      TableRenderDetailRowFn | undefined
    >(
      () => {
        const s = state.value;
        return [s.isRowDetailExpanded, s.rowDetailRenderer, s.rowDetailCache];
      },
      () => {
        const s = getState();
        const isRowDetailsExpanded = s.isRowDetailExpanded;
        const rowDetailRenderer = s.rowDetailRenderer;

        if (!isRowDetailsExpanded || !rowDetailRenderer) {
          return undefined;
        }

        const rowDetailCache = s.rowDetailCache;

        return (params: TableRenderDetailRowFnParam) => {
          const { rowIndex, domRef } = params;

          const dataArray = getData();
          const rowInfo = dataArray[rowIndex];
          const computedRowSizeCacheForDetails =
            getComputedRowHeightResult().computedRowSizeCacheForDetails;

          if (
            !rowInfo ||
            !isRowDetailsExpanded(rowInfo) ||
            !computedRowSizeCacheForDetails
          ) {
            // normally we would have returned `null`
            // but if we return null, the headless renderer will lose track
            // of the HTMLElement, and then when we scroll down and want
            // to reuse the HTMLElement, it will be gone, and the rendering
            // will break
            return h('div', {
              ref: domRef as any,
              class: visibility.hidden,
            }) as unknown as Renderable;
          }

          const { rowDetailHeight, rowHeight } =
            computedRowSizeCacheForDetails.getSize(rowIndex);

          return h(InfiniteTableDetailRow, {
            rowInfo,
            rowDetailsCache: rowDetailCache,
            rowIndex,
            domRef: domRef as any,
            detailOffset: rowHeight,
            rowDetailHeight,
            rowDetailRenderer: rowDetailRenderer as any,
          }) as unknown as Renderable;
        };
      },
    );

    const contextValue: InfiniteTableContextValueForVue = {
      state,
      getState,
      actions,
      api,
      getComputed,
      getComputedVisibleColumns,
      dataSourceContext,
    };
    provide(InfiniteTableInjectionKeyForVue, contextValue);

    if (__DEV__) {
      // same debug globals the React InfiniteTableContextProvider exposes
      (globalThis as any).getState = getState;
      (globalThis as any).componentActions = actions;
      (globalThis as any).masterBrain = state.value.brain;
      (globalThis as any).infiniteApi = api;

      if (state.value.debugId) {
        (globalThis as any).INFINITE = (globalThis as any).INFINITE || {};
        (globalThis as any).INFINITE[state.value.debugId!] = {
          ...((globalThis as any).INFINITE[state.value.debugId!] || {}),
          getState,
          actions,
        };
      }
    }

    return () => {
      const s = state.value;
      const cc = computedColumnsResult.value;

      // same CSS vars the React root defines via useDOMProps
      const cssVars = getInfiniteCSSVars({
        computedVisibleColumns: cc.computedVisibleColumns,
        computedPinnedStartColumns: cc.computedPinnedStartColumns,
        computedPinnedEndColumns: cc.computedPinnedEndColumns,
        computedPinnedStartColumnsWidth: cc.computedPinnedStartColumnsWidth,
        computedPinnedEndColumnsWidth: cc.computedPinnedEndColumnsWidth,
        computedUnpinnedColumnsWidth: cc.computedUnpinnedColumnsWidth,
        bodySize: s.bodySize,
        activeCellIndex: s.activeCellIndex,
        brain: s.brain,
        scrollbars: scrollbarsRef.value,
      });

      const focused = s.focused;
      const focusedWithin = s.focusedWithin;

      const computedPinnedStartWidth =
        cc.computedPinnedStartWidth ?? cc.computedPinnedStartColumnsWidth;
      const computedPinnedEndWidth =
        cc.computedPinnedEndWidth ?? cc.computedPinnedEndColumnsWidth;
      const pinnedStartOverflow = computedPinnedStartWidth
        ? cc.computedPinnedStartColumnsWidth > computedPinnedStartWidth
        : false;
      const pinnedEndOverflow = computedPinnedEndWidth
        ? cc.computedPinnedEndColumnsWidth > computedPinnedEndWidth
        : false;

      // mirrors useDOMProps: state.domProps is merged onto the root element
      // (className/style merged, other props/handlers spread through).
      // autoFocus/tabIndex are forwarded to the scroller, like in React.
      const {
        autoFocus,
        tabIndex,
        className: domPropsClassName,
        class: domPropsClass,
        style: domPropsStyle,
        onKeyDown: domPropsOnKeyDown,
        onKeydown: domPropsOnKeydown,
        ...restDomProps
      } = (s.domProps ?? {}) as Record<string, any>;

      // same className parts as the React root (useDOMProps)
      const rootClass = join(
        attrs.class as string | undefined,
        domPropsClassName as string | undefined,
        domPropsClass as string | undefined,
        rootClassName,
        InfiniteCls,
        s.wrapRowsHorizontally ? `${rootClassName}--horizontal-layout` : null,
        cc.computedPinnedStartColumnsWidth
          ? `${rootClassName}--has-pinned-start ${InfiniteClsHasPinnedStart}`
          : null,
        cc.computedPinnedEndColumnsWidth
          ? `${rootClassName}--has-pinned-end  ${InfiniteClsHasPinnedEnd}`
          : null,
        focused ? `${rootClassName}--focused` : null,
        focusedWithin ? `${rootClassName}--focused-within` : null,
        focused && s.focusedClassName ? s.focusedClassName : null,
        focusedWithin && s.focusedWithinClassName
          ? s.focusedWithinClassName
          : null,
        pinnedStartOverflow
          ? `${rootClassName}--has-pinned-start-overflow`
          : null,
        pinnedEndOverflow ? `${rootClassName}--has-pinned-end-overflow` : null,
        InfiniteClsRecipe({
          horizontalLayout: !!s.wrapRowsHorizontally,
          hasPinnedStart: !!cc.computedPinnedStartColumnsWidth,
          hasPinnedEnd: !!cc.computedPinnedEndColumnsWidth,
          focused,
          focusedWithin,
        }),
      );

      const rootStyle: Record<string, any> = {
        ...(attrs.style as Record<string, any> | undefined),
        ...(domPropsStyle as Record<string, any> | undefined),
        ...(cssVars as Record<string, any>),
      };
      if (focused && s.focusedStyle) {
        Object.assign(rootStyle, s.focusedStyle);
      }
      if (focusedWithin && s.focusedWithinStyle) {
        Object.assign(rootStyle, s.focusedWithinStyle);
      }

      const userOnKeyDown = domPropsOnKeydown ?? domPropsOnKeyDown;
      const rootKeyDown = userOnKeyDown
        ? (event: KeyboardEvent) => {
            onRootKeyDown(event);
            userOnKeyDown(event);
          }
        : onRootKeyDown;

      const loading = dataSourceState.value.loading;

      return h(
        'div',
        {
          ...attrs,
          ...restDomProps,
          ref: (el: any) => {
            s.domRef.current = el ?? null;
          },
          'data-debug-id': s.debugId,
          class: rootClass,
          style: rootStyle,
          onKeydown: rootKeyDown,
          onFocusin: onRootFocusIn,
          onFocusout: onRootFocusOut,
        },
        [
          // mirrors <InfiniteTableHeader /> which renders the wrapper only
          // when the header is enabled
          s.header
            ? h(TableHeaderWrapper, {
                wrapRowsHorizontally: !!s.wrapRowsHorizontally,
                bodyBrain: s.brain,
                headerBrain: s.headerBrain,
              })
            : null,
          h(
            'div',
            {
              class: join(InfiniteBodyCls, InfiniteTableBodyClassName),
              onContextmenu: onBodyContextMenu,
            },
            [
              h(HeadlessTable, {
                brain: s.brain,
                renderer: s.renderer as any,
                onRenderUpdater: s.onRenderUpdater,
                renderCell: renderCellComputed.value,
                renderDetailRow: renderDetailRowComputed.value,
                cellHoverClassNames: hoverClassNames.value,
                scrollStopDelay: s.scrollStopDelay,
                forceRerenderTimestamp: s.forceBodyRerenderTimestamp,
                scrollerRef: onScrollerElement,
                tabIndex: tabIndex ?? 0,
                autoFocus: !!autoFocus,
                activeRowIndex:
                  s.ready && s.keyboardNavigation === 'row'
                    ? s.activeRowIndex ?? null
                    : null,
                activeCellIndex:
                  s.ready &&
                  s.keyboardNavigation === 'cell' &&
                  // hide the active cell indicator while column reordering
                  !s.columnReorderDragColumnId
                    ? s.activeCellIndex ?? null
                    : null,
                activeCellRowHeight:
                  getComputedRowHeightResult().computedRowSizeCacheForDetails
                    ?.getRowHeight || getComputedRowHeight(),
              }),
              h(
                // same override point as the React body: components.LoadMask
                (s.components?.LoadMask as any) ?? LoadMask,
                { visible: !!loading },
                () => s.loadingText,
              ),
            ],
          ),
          // the portal container for menus/overlays - same classnames and
          // stacking context as the React root's portal div
          h(
            'div',
            {
              ref: (el: any) => {
                s.portalDOMRef.current = (el as HTMLDivElement) ?? null;
              },
              class: join(
                `${rootClassName}Portal`,
                zIndex[10_000_000],
                position.absolute,
                top[0],
                left[0],
              ),
            },
            [
              h(ColumnMenuPortal),
              h(CellContextMenuPortal),
              h(TableContextMenuPortal),
              h(FilterOperatorMenuPortal),
            ],
          ),
          // CSS variable watchers - mirror the React root
          s.rowHeightCSSVar
            ? h(CSSNumericVariableWatch, {
                key: 'row-height',
                varName: s.rowHeightCSSVar,
                onChange: s.onRowHeightCSSVarChange,
              })
            : null,
          h(CSSNumericVariableWatch, {
            key: 'flashing-duration',
            allowInts: true,
            varName: ThemeVars.components.Cell.flashingDuration,
            onChange: s.onFlashingDurationCSSVarChange,
          }),
          s.rowDetailHeightCSSVar
            ? h(CSSNumericVariableWatch, {
                key: 'row-detail-height',
                varName: s.rowDetailHeightCSSVar,
                onChange: s.onRowDetailHeightCSSVarChange,
              })
            : null,
          s.columnHeaderHeightCSSVar
            ? h(CSSNumericVariableWatch, {
                key: 'column-header-height',
                varName: s.columnHeaderHeightCSSVar,
                onChange: s.onColumnHeaderHeightCSSVarChange,
              })
            : null,
          licenseStatus.value === 'valid'
            ? null
            : h(InfiniteTableLicenseFooter, {
                invalid: licenseStatus.value === 'invalid',
              }),
        ],
      );
    };
  },
});

export const InfiniteTable = Object.assign(InfiniteTableComponent, {
  /**
   * Set this once, before rendering any grid, to use the same
   * license key for all grids - same as `InfiniteTable.licenseKey` in React.
   */
  licenseKey: undefined as string | undefined,
});
