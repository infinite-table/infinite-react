import {
  computed,
  defineComponent,
  h,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  shallowRef,
  watch,
  watchEffect,
} from 'vue';
import type { ShallowRef } from 'vue';

import { join } from '../../utils/join';
import { buildManagedVueComponent } from '../hooks/useComponentState/useManagedComponent.vue';
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
} from './state/getInitialState';
import { getComputedColumns } from './utils/getComputedColumns';
import { getColumnsWhenGrouping } from './utils/getColumnsWhenGrouping';
import { getInfiniteCSSVars } from './utils/getInfiniteCSSVars';
import { getImperativeApi } from './api/getImperativeApi';
import { MultiRowSelector } from './utils/MultiRowSelector';
import { MultiCellSelector } from './utils/MultiCellSelector';
import { internalProps, rootClassName } from './internalProps';
import { columnHeaderHeightName, ThemeVars } from './vars.css';
import { CSSNumericVariableWatch } from '../CSSNumericVariableWatchForVue.vue';
import { toCSSVarName } from './utils/toCSSVarName';
import { rafFn } from './utils/rafFn';
import {
  InfiniteCls,
  InfiniteClsHasPinnedEnd,
  InfiniteClsHasPinnedStart,
  InfiniteClsRecipe,
} from './InfiniteCls.css';

import { onCellClick } from './eventHandlers/onCellClick';
import { onCellMouseDown } from './eventHandlers/onCellMouseDown';
import { onKeyDown } from './eventHandlers/onKeyDown';
import { getCellContext } from './components/InfiniteTableRow/columnRendering';
import { getCellSelector } from './state/getInitialState';
import { selectParentUntil } from '../../utils/selectParent';
import { useColumnMenu } from './hooks/useColumnMenuForVue.vue';
import { useColumnFilterOperatorMenu } from './hooks/useColumnFilterOperatorMenuForVue.vue';
import {
  useCellContextMenu,
  useTableContextMenu,
} from './hooks/useContextMenuForVue.vue';
import { position, top, left, zIndex } from './utilities.css';
import { getColumnApiForColumn } from './api/getColumnApi';
import { cloneRowSelection } from './api/getRowSelectionApi';
import { cloneTreeSelection } from '../DataSource/TreeApi';
import type { InfiniteTableEventHandlerContext } from './eventHandlers/eventHandlerTypes';
import type { CellPositionByIndex } from '../types/CellPositionByIndex';

import { HeadlessTable } from '../HeadlessTable/HeadlessTableForVue.vue';
import { InfiniteBodyCls } from './components/InfiniteTableBody/body.css';
import { InfiniteTableBodyClassName } from './components/InfiniteTableBody/bodyClassName';
import { InfiniteTableColumnCell } from './components/InfiniteTableRow/InfiniteTableColumnCellForVue.vue';
import { InfiniteTableColumnCellClassName } from './components/InfiniteTableRow/InfiniteTableColumnCellClassNames';
import { RowHoverCls } from './components/InfiniteTableRow/row.css';
import { TableHeaderWrapper } from './components/InfiniteTableHeader/TableHeaderWrapperForVue.vue';
import { LoadMask } from './components/LoadMaskForVue.vue';
import { InfiniteTableInjectionKeyForVue } from './InfiniteTableContextForVue.vue';
import type { InfiniteTableContextValueForVue } from './InfiniteTableContextForVue.vue';

import type { MatrixBrainOptions } from '../VirtualBrain/MatrixBrain';
import type {
  TableRenderCellFn,
  TableRenderCellFnParam,
} from '../HeadlessTable/rendererTypes';
import type { Renderable } from '../types/Renderable';
import type {
  InfiniteTableComputedColumn,
  InfiniteTableComputedValues,
  InfiniteTableState,
  Scrollbars,
} from './types';
import type { InfiniteTableActions } from './types/InfiniteTableState';
import type { InfiniteTableColumnRenderingContext } from './components/InfiniteTableRow/columnRenderingContextType';

export const InfiniteTableClassName = internalProps.rootClassName;

const DEFAULT_ROW_HEIGHT = 40;
const DEFAULT_COLUMN_HEADER_HEIGHT = toCSSVarName(columnHeaderHeightName);

/**
 * Vue sibling of the InfiniteTable root (Phase 3 walking skeleton).
 *
 * What works: the shared managed-state machine (same
 * initSetupState/forwardProps/mapPropsToState/cleanup config as React), the
 * shared column-computation pipeline (getComputedColumns), brain wiring and
 * the fully virtualized body rendered through the Vue rendering bridge, fed
 * by the Vue DataSource (parent state propagation included).
 *
 * Not yet ported (upcoming Phase 3 slices): header, the full
 * InfiniteTableColumnCell tree (selection, editing, context menus, styling
 * fns), keyboard navigation, active row/cell indicators, load mask, menus
 * and portals, master-detail, horizontal layout.
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
  'rowDetailHeight',
  'columnHeaderHeight',
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
  'domProps',
  'licenseKey',
  'loadingText',
  'components',
  'keyboardNavigation',
  'keyboardSelection',
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

/**
 * mirrors useColumnSizeFn + useColumnRowspan (pure logic, no hooks)
 */
function getColumnSizeFn<T>(columns: InfiniteTableComputedColumn<T>[]) {
  return (index: number) => columns[index]?.computedWidth ?? 0;
}

function getRowspanFn<T>(
  computedVisibleColumns: InfiniteTableComputedColumn<T>[],
  getDataSourceState: () => { dataArray: any[] },
): MatrixBrainOptions['rowspan'] {
  const colsWithRowspan = computedVisibleColumns.filter(
    (col) => typeof col.rowspan === 'function',
  );

  return colsWithRowspan.length
    ? ({ rowIndex, colIndex }) => {
        const dataArray = getDataSourceState().dataArray;
        const rowInfo = dataArray[rowIndex];
        if (!rowInfo) {
          return 1;
        }
        const column = computedVisibleColumns[colIndex];
        if (!column || !column.rowspan) {
          return 1;
        }
        return column.rowspan({
          column,
          data: rowInfo.data,
          dataArray,
          rowInfo,
          rowIndex,
        });
      }
    : undefined;
}

export const InfiniteTable = defineComponent({
  name: 'InfiniteTable',
  props: [...DATA_GRID_PROP_NAMES],
  setup(props, { attrs }) {
    const dataSourceContext = useDataSourceContext();

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
          return value ?? DEFAULT_ROW_HEIGHT;
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
    const getState = () => state.value;

    const { state: dataSourceState, getDataSourceState } = dataSourceContext;

    // ports useColumnsWhenGrouping: generates group columns (the shared
    // getColumnsWhenGrouping calls the framework-resolved getColumnForGroupBy
    // which renders Vue group icons) and prepends them to the column order.
    // multi-source array (array OF getters): fires only when one of the
    // deps changes identity - like a React dependency array. NOTE: a single
    // getter returning an array literal would be compared by identity and
    // re-fire on every state swap, looping (the callback dispatches).
    const toggleGroupRowFromState = (groupKeys: any[]) => {
      api.toggleGroupRow(groupKeys);
    };
    watch(
      [
        () => state.value.columns,
        () => dataSourceState.value.groupBy,
        () => dataSourceState.value.pivotBy,
        () => dataSourceState.value.selectionMode,
        () => state.value.hideColumnWhenGrouped,
        () => state.value.groupColumn,
        () => state.value.groupRenderStrategy,
        () => state.value.pivotColumns,
        () => state.value.pivotTotalColumnPosition,
        () => state.value.pivotColumn,
      ],
      () => {
        const s = state.value;
        const ds = dataSourceState.value;

        const { columns: columnsWhenGrouping, groupColumnIds } =
          getColumnsWhenGrouping({
            columns: s.columns,
            groupColumn: s.groupColumn,
            pivotColumn: s.pivotColumn,
            pivotTotalColumnPosition: s.pivotTotalColumnPosition,
            pivotGrandTotalColumnPosition: s.pivotGrandTotalColumnPosition,
            groupRenderStrategy:
              s.groupRenderStrategy === 'inline'
                ? 'single-column'
                : s.groupRenderStrategy,
            groupBy: ds.groupBy,
            pivotBy: ds.pivotBy,
            pivotColumns: s.pivotColumns,
            toggleGroupRow: toggleGroupRowFromState,
            selectionMode: ds.selectionMode,
          });

        actions.columnsWhenGrouping = columnsWhenGrouping;

        let currentColumnOrder = state.value.columnOrder;
        if (groupColumnIds.length && Array.isArray(currentColumnOrder)) {
          const colOrder = new Set(currentColumnOrder);
          let shouldUpdate = false;
          groupColumnIds.forEach((groupColId) => {
            if (!colOrder.has(groupColId)) {
              shouldUpdate = true;
              currentColumnOrder = [
                groupColId,
                ...(currentColumnOrder as string[]),
              ];
            }
          });
          if (shouldUpdate) {
            actions.columnOrder = currentColumnOrder;
          }
        }
      },
      { immediate: true },
    );

    // mirrors useColumnsWhen: the DataSource generates group rows unless the
    // render strategy is inline
    watch(
      () => state.value.groupRenderStrategy,
      (groupRenderStrategy) => {
        dataSourceContext.dataSourceActions.generateGroupRows =
          groupRenderStrategy !== 'inline';
      },
      { immediate: true },
    );

    // shared column-computation pipeline (what useComputedColumns memoizes)
    const computedColumnsResult = computed(() => {
      const s = state.value;
      const ds = dataSourceState.value;

      return getComputedColumns({
        columns: s.computedColumns,
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
    });

    const getComputedVisibleColumns = () =>
      computedColumnsResult.value.computedVisibleColumns;

    // ---- full computed values + imperative api (mirrors useComputed) ----
    const { getDataSourceState: getDSState, dataSourceApi } = dataSourceContext;

    const multiRowSelector = new MultiRowSelector({
      isRowDisabledAt: (index: number) => {
        const dataItem = getDSState().dataArray[index];
        return dataItem?.rowDisabled ?? false;
      },
      getIdForIndex: (index: number) => {
        const dataItem = getDSState().dataArray[index];
        return dataItem?.id ?? -1;
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
    let removeRenderCountChange: VoidFunction | null = null;
    watch(
      () => state.value.brain,
      (brain) => {
        removeRenderCountChange?.();
        removeRenderCountChange = brain.onRenderCountChange(() => {
          const { scrollTopMax, scrollLeftMax } = brain;
          const vertical = scrollTopMax > 0;
          const horizontal = scrollLeftMax > 0;
          const prev = scrollbarsRef.value;
          if (prev.vertical !== vertical || prev.horizontal !== horizontal) {
            scrollbarsRef.value = { vertical, horizontal };
          }
        });
      },
      { immediate: true },
    );

    watch(scrollbarsRef, (scrollbars) => {
      const ds = getDSState();
      const { onScrollbarsChange } = getState();
      if (onScrollbarsChange && ds.updatedAt && ds.dataArray.length) {
        onScrollbarsChange(scrollbars);
      }
      ds.notifyScrollbarsChange(scrollbars);
    });

    const getComputedRowHeight = () => {
      const s = state.value;
      return typeof s.rowHeight === 'function'
        ? (index: number) => {
            const item = getDSState().dataArray[index];
            return item ? (s.rowHeight as any)(item) : 0;
          }
        : s.rowHeight;
    };

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
        computedRowSizeCacheForDetails: undefined,
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

    const removeOnKeyDown = getState().keyDown.onChange((event) => {
      onKeyDown(eventHandlerContext, event!);
    });

    const removeOnCellClick = getState().cellClick.onChange(
      (cellClickParam: (CellPositionByIndex & { event: any }) | null) => {
        if (!cellClickParam) {
          return;
        }
        const { event, rowIndex, colIndex } = cellClickParam;

        const column = getComputed().computedVisibleColumns[colIndex];
        const columnApi = getColumnApiForColumn(
          column.id,
          eventHandlerContext,
        )!;

        // React spreads its synthetic event ({ ...event, key: '' }) - that
        // doesn't work with native DOM events (their props live on the
        // prototype), so we add the `key` expando the shared handler expects
        (event as any).key = '';

        onCellClick(
          { ...eventHandlerContext, rowIndex, colIndex, column, columnApi },
          event,
        );
      },
    );

    const removeOnCellMouseDown = getState().cellMouseDown.onChange(
      (param: (CellPositionByIndex & { event: any }) | null) => {
        if (!param) {
          return;
        }
        const { event, rowIndex, colIndex } = param;

        const column = getComputed().computedVisibleColumns[colIndex];
        const columnApi = getColumnApiForColumn(
          column.id,
          eventHandlerContext,
        )!;

        onCellMouseDown(
          { ...eventHandlerContext, rowIndex, colIndex, column, columnApi },
          event,
        );
      },
    );

    const onRootKeyDown = (event: KeyboardEvent) => {
      getState().keyDown(event as any);
    };

    // mirrors the CSS var subscriptions in React's useComputed
    getState().onRowHeightCSSVarChange.onChange((rowHeight) => {
      if (rowHeight) {
        actions.rowHeight = rowHeight;
      }
    });
    getState().onFlashingDurationCSSVarChange.onChange((flashingDuration) => {
      const num = flashingDuration ? flashingDuration * 1 : null;
      if (num != null && !isNaN(num)) {
        actions.flashingDurationCSSVarValue = num;
      }
    });
    getState().onRowDetailHeightCSSVarChange.onChange((rowDetailHeight) => {
      if (rowDetailHeight) {
        actions.rowDetailHeight = rowDetailHeight;
      }
    });
    getState().onColumnHeaderHeightCSSVarChange.onChange(
      (columnHeaderHeight) => {
        if (columnHeaderHeight) {
          actions.columnHeaderHeight = columnHeaderHeight;
        }
      },
    );

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

    // ---- scroll active row/cell into view (useScrollToActiveRow/Cell) ----
    const SCROLL_RETRIES = 10;
    const setupScrollToActive = (
      getActive: () => number | [number, number] | null | undefined,
      scroll: (active: any) => boolean,
    ) => {
      let didScroll = false;
      let rafId: number | null = null;

      watch(
        [getActive, () => dataSourceState.value.dataArray.length],
        ([active], [prevActive] = [undefined, undefined] as any) => {
          if (active != null && active !== prevActive) {
            didScroll = false;
            if (rafId != null) {
              cancelAnimationFrame(rafId);
            }
          }
          if (active == null || didScroll) {
            return;
          }
          const tryScroll = (times = 0) => {
            times++;
            if (rafId != null) {
              cancelAnimationFrame(rafId);
            }
            rafId = requestAnimationFrame(() => {
              didScroll = scroll(active);
              if (!didScroll && times < SCROLL_RETRIES) {
                tryScroll(times);
              }
            });
          };

          tryScroll();
        },
        { immediate: true },
      );

      return () => {
        if (rafId != null) {
          cancelAnimationFrame(rafId);
        }
      };
    };

    const cancelScrollToActiveRow = setupScrollToActive(
      () => state.value.activeRowIndex,
      (activeRowIndex: number) =>
        api.scrollRowIntoView(activeRowIndex, { offset: 0 }),
    );
    const cancelScrollToActiveCell = setupScrollToActive(
      () => state.value.activeCellIndex,
      (activeCellIndex: [number, number]) =>
        api.scrollCellIntoView(activeCellIndex[0], activeCellIndex[1], {
          offset: 30,
        }),
    );

    // ---- editing lifecycle callbacks (mirrors useEditingCallbackProps) ----
    // watches derived values off state.editingCell and dispatches the
    // onEditCancelled/onEditRejected/onEditAccepted/onEditPersist* callbacks;
    // the accepted branch also triggers api.persistEdit - which is what
    // actually writes the value into the DataSource
    const getEditingCellContext = () => {
      const { rowIndex, columnId } = getState().editingCell!;
      return getCellContext<any>({
        rowIndex,
        columnId,
        getComputed,
        getState,
        getDataSourceState: getDSState,
        getDataSourceMasterContext,
        actions,
        dataSourceActions: dataSourceContext.dataSourceActions,
        api,
        dataSourceApi,
      });
    };

    watch(
      [
        () => {
          const ec = state.value.editingCell;
          return ec && !ec.active ? ec.cancelled : undefined;
        },
        () => {
          const ec = state.value.editingCell;
          return ec && !ec.active && ec.accepted instanceof Error
            ? ec.accepted
            : undefined;
        },
        () => {
          const ec = state.value.editingCell;
          return !!(ec && !ec.active && !ec.cancelled && ec.accepted === true);
        },
        () => state.value.editingCell?.persisted,
        () => state.value.editingCell?.active,
      ],
      (
        [cancelled, rejected, accepted, persisted, active],
        [prevCancelled, prevRejected, prevAccepted, prevPersisted, prevActive],
      ) => {
        // each branch fires only on its own transition - the same semantics
        // as the separate dependency-keyed effects in React
        if (cancelled && cancelled !== prevCancelled) {
          const { initialValue } = getState().editingCell!;
          getState().onEditCancelled?.({
            ...getEditingCellContext(),
            initialValue,
          });
        }

        if (rejected && rejected !== prevRejected) {
          const { value, initialValue } = getState().editingCell!;
          getState().onEditRejected?.({
            ...getEditingCellContext(),
            value,
            error: rejected as Error,
            initialValue,
          });
        }

        if (accepted && accepted !== prevAccepted) {
          const { value, initialValue } = getState().editingCell!;
          const editParams = {
            ...getEditingCellContext(),
            value,
            initialValue,
          };
          getState().onEditAccepted?.(editParams);

          api.persistEdit({ value });
        }

        if (persisted && persisted !== prevPersisted) {
          const editingCell = getState().editingCell;
          if (editingCell) {
            const { value, initialValue } = editingCell;
            const params = {
              ...getEditingCellContext(),
              value,
              initialValue,
            };
            if (persisted instanceof Error) {
              getState().onEditPersistError?.({
                ...params,
                error: persisted,
              });
            } else {
              getState().onEditPersistSuccess?.(params);
            }
          }
        }

        // focus the table again when editing stops (useFocusOnEditStop)
        if (!active && prevActive) {
          api.focus();
        }
      },
    );

    // brain wiring - what useYourBrain/useMatrixBrain do on each render
    watchEffect(() => {
      const s = state.value;
      const ds = dataSourceState.value;
      const {
        computedVisibleColumns,
        computedPinnedStartColumns,
        computedPinnedEndColumns,
      } = computedColumnsResult.value;

      const brain = s.brain;

      brain.updateFixedCells({
        fixedColsStart: computedPinnedStartColumns.length,
        fixedColsEnd: computedPinnedEndColumns.length,
      });

      // rowHeight given as fn(rowInfo) is adapted to fn(index) - the
      // simplified version of useComputedRowHeight (row details come later)
      const rowHeight =
        typeof s.rowHeight === 'function'
          ? (index: number) => {
              const item = getDataSourceState().dataArray[index];
              return item ? (s.rowHeight as any)(item) : 0;
            }
          : s.rowHeight;

      brain.update({
        colWidth: getColumnSizeFn(computedVisibleColumns),
        rowHeight,
        rows: ds.dataArray.length,
        cols: computedVisibleColumns.length,
        rowspan: getRowspanFn(computedVisibleColumns, getDataSourceState),
      });
    });

    // ready flag + scroll stop delay wiring (React does this in effects).
    // These write back into managed state, so they must be precise watchers
    // (generated-action setters dispatch even for equal values - a broad
    // watchEffect would loop: write -> state swap -> re-run -> write ...)
    watch(
      () => state.value.scrollStopDelay,
      (scrollStopDelay) => {
        state.value.brain.setScrollStopDelay(scrollStopDelay);
        dataSourceContext.dataSourceActions.scrollStopDelayUpdatedByTable =
          scrollStopDelay;
      },
      { immediate: true },
    );

    watch(
      () => !!state.value.bodySize.height,
      (hasHeight) => {
        if (hasHeight) {
          actions.ready = true;
        }
      },
      { immediate: true },
    );

    // notifyRenderRangeChange -> DataSource (lazy loading contract)
    let removeRenderRangeChange: VoidFunction | null = null;
    watch(
      () => state.value.brain,
      (brain) => {
        removeRenderRangeChange?.();
        removeRenderRangeChange = brain.onVerticalRenderRangeChange(
          (renderRange: [number, number]) => {
            getDataSourceState().notifyRenderRangeChange({
              renderStartIndex: renderRange[0],
              renderEndIndex: renderRange[1],
            });
          },
        );
      },
      { immediate: true },
    );

    // scroll stop -> onScrollToTop/onScrollToBottom/onScrollStop callbacks +
    // livePagination cursor advancement (mirrors useCellRendering in React)
    const SCROLL_BOTTOM_OFFSET = 1;
    let scrollTopMax = 0;
    let removeScrollStopRenderCount: VoidFunction | null = null;
    let removeScrollStop: VoidFunction | null = null;
    watch(
      () => state.value.brain,
      (brain) => {
        removeScrollStopRenderCount?.();
        removeScrollStop?.();

        removeScrollStopRenderCount = brain.onRenderCountChange(() => {
          scrollTopMax = brain.scrollTopMax;
        });

        removeScrollStop = brain.onScrollStop((scrollPosition) => {
          const { scrollTop, scrollLeft } = scrollPosition;
          const { onScrollToTop, onScrollToBottom, onScrollStop } = getState();

          if (scrollTop === 0) {
            onScrollToTop?.();
          }

          const offset =
            getState().scrollToBottomOffset ?? SCROLL_BOTTOM_OFFSET;
          const isScrollBottom = scrollTop + offset >= scrollTopMax;

          if (isScrollBottom) {
            onScrollToBottom?.();

            const { livePagination, livePaginationCursor, dataArray } =
              getDataSourceState();
            if (livePagination) {
              dataSourceContext.dataSourceActions.cursorId =
                livePaginationCursor !== undefined
                  ? // when there is a `livePaginationCursor` defined we set
                    // the cursorId to Date.now() as that will trigger the
                    // dataSource to fetch more data
                    Date.now()
                  : // otherwise we use dataArray.length as the cursorId -
                    // see #useDataArrayLengthAsCursor ref
                    dataArray.length;
            }
          }

          if (onScrollStop) {
            const range = brain.getRenderRange();
            onScrollStop({
              scrollTop,
              scrollLeft,
              renderRange: range,
              viewportSize: getState().bodySize,
              firstVisibleRowIndex: range.start[0],
              lastVisibleRowIndex: range.end[0],
              firstVisibleColIndex: range.start[1],
              lastVisibleColIndex: range.end[1],
            });
          }
        });
      },
      { immediate: true },
    );

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
      removeRenderRangeChange?.();
      removeOnKeyDown();
      removeOnCellClick();
      removeOnCellMouseDown();
      cancelScrollToActiveRow();
      cancelScrollToActiveCell();
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
    const hoverClassNames = computed<string[] | undefined>(() => {
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
    });

    const renderCellComputed = computed<TableRenderCellFn>(() => {
      const dataArray = dataSourceState.value.dataArray;
      const { computedVisibleColumns, computedColumnsMap, fieldsToColumn } =
        computedColumnsResult.value;
      const s = state.value;
      const showZebraRows = s.showZebraRows;
      const rowInfoStore = dataSourceState.value.rowInfoStore;

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

        const rowInfo = dataArray[rowIndex];
        const column = computedVisibleColumns[colIndex];

        if (!rowInfo || !column) {
          return null;
        }

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

        return h(InfiniteTableColumnCell, {
          key: `${rowIndex}:${column.id}`,
          rowIndex,
          rowHeight: heightWithRowspan,
          width,
          hidden,
          domRef: domRef as any,
          column,
          columnsMap: computedColumnsMap,
          fieldsToColumn,
          showZebraRows,
          rowDetailState,
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
          getData,
          rowInfoStore,
          renderingContext,
          getComputedVisibleColumns,
          getComputedColumnOrder,
          onMouseEnter,
          onMouseLeave,
        }) as unknown as Renderable;
      };
    });

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
                activeCellRowHeight: getComputedRowHeight(),
              }),
              h(LoadMask, { visible: !!loading }, () => s.loadingText),
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
        ],
      );
    };
  },
});
