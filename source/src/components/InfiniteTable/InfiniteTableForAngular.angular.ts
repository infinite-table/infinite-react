import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  EnvironmentProviders,
  InjectionToken,
  Injector,
  OnInit,
  Signal,
  ViewEncapsulation,
  afterNextRender,
  computed,
  effect,
  inject,
  makeEnvironmentProviders,
  signal,
  untracked,
  viewChild,
} from '@angular/core';

import { join } from '../../utils/join';
import { styleWithUnits } from '../../utils/styleWithUnits';
import { selectParentUntil } from '../../utils/selectParent';
import { buildManagedAngularComponent } from '../hooks/useComponentState/useManagedComponent.angular';
import { computedWithDeps } from '../hooks/computedWithDeps.angular';
import { runControllerEffectsForAngular } from '../hooks/runControllerEffectsForAngular.angular';
import { setupResizeObserver } from '../ResizeObserver/setupResizeObserver';
import {
  INFINITE_DATA_SOURCE,
  type DataSourceContextValueForAngular,
} from '../DataSource/DataSourceForAngular.angular';
import { injectGetMasterDetailContext } from '../DataSource/DataSourceMasterDetailContextForAngular.angular';
import { renderPooled } from '../HeadlessTable/AngularPooledViews.angular';
import { HeadlessTable } from '../HeadlessTable/HeadlessTableForAngular.angular';
import { CSSNumericVariableWatch } from '../CSSNumericVariableWatch/CSSNumericVariableWatchForAngular.angular';
import {
  InfiniteRender,
  renderComponent,
} from '../RawList/InfiniteRenderForAngular.angular';
import type { Renderable } from '../types/FrameworkTypes.angular';
import type {
  TableRenderCellFn,
  TableRenderCellFnParam,
} from '../HeadlessTable/rendererTypes';

import {
  cleanupState,
  forwardProps,
  getCellSelector,
  getGroupByMap,
  getMappedCallbacks,
  initSetupState,
  mapPropsToState,
} from './state/getInitialState';
import {
  createRootEffects,
  getColumnSizeFn,
  getRowspanFn,
  updateBrain,
} from './controller/rootEffects';
import {
  getComputedColumnsDeps,
  getComputedColumnsFromState,
} from './controller/getComputedColumnsDeps';
import {
  createGetColumnCellProps,
  getRenderCellDeps,
} from './controller/renderCellParams';
import { getInfiniteCSSVars } from './utils/getInfiniteCSSVars';
import { getImperativeApi } from './api/getImperativeApi';
import { MultiRowSelector } from './utils/MultiRowSelector';
import { MultiCellSelector } from './utils/MultiCellSelector';
import { internalProps, rootClassName } from './internalProps';
import { ThemeVars } from './vars.css';
import { getLicenseStatus } from './hooks/useLicense/getLicenseStatus';
import { rafFn } from './utils/rafFn';
import {
  InfiniteCls,
  InfiniteClsHasPinnedEnd,
  InfiniteClsHasPinnedStart,
  InfiniteClsRecipe,
} from './InfiniteCls.css';
import { position, top, left, zIndex } from './utilities.css';
import { cloneRowSelection } from './api/getRowSelectionApi';
import { cloneTreeSelection } from '../DataSource/TreeApi';
import type { InfiniteTableEventHandlerContext } from './eventHandlers/eventHandlerTypes';
import { InfiniteBodyCls } from './components/InfiniteTableBody/body.css';
import { InfiniteTableBodyClassName } from './components/InfiniteTableBody/bodyClassName';
import {
  InfiniteColumnCellHost,
  InfiniteTableColumnCell,
  type InfiniteTableColumnCellProps,
} from './components/InfiniteTableRow/InfiniteTableColumnCellForAngular.angular';
import { computeRowHeightWithCache } from './hooks/computedRowHeightShared';
import { InfiniteTableColumnCellClassName } from './components/InfiniteTableRow/InfiniteTableColumnCellClassNames';
// slice B: editing, license footer
import { renderColumnEditor } from './components/InfiniteTableRow/InfiniteTableColumnEditorForAngular.angular';
import { InfiniteTableLicenseFooter } from './components/InfiniteTableLicenseFooter/InfiniteTableLicenseFooterForAngular.angular';
import { RowHoverCls } from './components/InfiniteTableRow/row.css';
import { LoadMask } from './components/LoadMaskForAngular.angular';
// master-detail: the detail rows
import {
  InfiniteTableDetailRow,
  InfiniteTableDetailRowPlaceholder,
  type InfiniteTableDetailRowProps,
} from './components/InfiniteTableRow/InfiniteTableDetailRowForAngular.angular';
import type {
  TableRenderDetailRowFn,
  TableRenderDetailRowFnParam,
} from '../HeadlessTable/rendererTypes';
import { TableHeaderWrapper } from './components/InfiniteTableHeader/TableHeaderWrapperForAngular.angular';
// menus
import {
  InfiniteOverlayPortal,
  type InfiniteOverlay,
} from '../hooks/useOverlay/OverlayForAngular.angular';
import {
  setupColumnMenu,
  type MenuHookParams,
} from './hooks/useColumnMenuForAngular.angular';
import {
  setupCellContextMenu,
  setupTableContextMenu,
} from './hooks/useContextMenuForAngular.angular';
import { setupColumnFilterOperatorMenu } from './hooks/useColumnFilterOperatorMenuForAngular.angular';
import {
  INFINITE_TABLE,
  type InfiniteTableContextValueForAngular,
} from './InfiniteTableContextForAngular.angular';
import {
  INFINITE_TABLE_PROPS_META,
  InfiniteTableInputs,
} from './InfiniteTableInputs.generated.angular';
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
 * Global configuration of the Angular InfiniteTable components.
 */
export type InfiniteTableConfig = {
  /**
   * The license key, for every grid (a grid's `licenseKey` input wins).
   */
  licenseKey?: string;
};

export const INFINITE_TABLE_CONFIG = new InjectionToken<InfiniteTableConfig>(
  'INFINITE_TABLE_CONFIG',
  { providedIn: 'root', factory: () => ({}) },
);

/**
 * The global configuration of the Angular InfiniteTable, eg the license key:
 *
 * ```ts
 * bootstrapApplication(App, {
 *   providers: [provideInfiniteTable({ licenseKey: '...' })],
 * });
 * ```
 */
export function provideInfiniteTable(
  config: InfiniteTableConfig,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: INFINITE_TABLE_CONFIG, useValue: config },
  ]);
}

const injectManagedInfiniteTable = buildManagedAngularComponent({
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
  // @ts-ignore
  mappedCallbacks: getMappedCallbacks(),
  getParentState: () => {
    // the DataSource state is the parent state - same as React and Vue
    const dataSource = inject(INFINITE_DATA_SOURCE, { optional: true });
    return dataSource
      ? {
          state: dataSource.state as Signal<any>,
          getState: dataSource.getDataSourceState,
        }
      : null;
  },
  // same defaults the React wrapper passes as JSX props
  defaults: {
    rowHeight: DEFAULT_ROW_HEIGHT_CSS_VALUE,
    columnHeaderHeight: DEFAULT_COLUMN_HEADER_HEIGHT,
  } as any,
  debugName: 'InfiniteTable',
});

// same default hover class names as InfiniteTableBody.rowHoverClassName
const HOVERED_CLASS_NAMES = [
  RowHoverCls,
  `${InfiniteTableColumnCellClassName}--hovered`,
];

const BODY_CLASS_NAME = join(InfiniteBodyCls, InfiniteTableBodyClassName);
const PORTAL_CLASS_NAME = join(
  `${rootClassName}Portal`,
  zIndex[10_000_000],
  position.absolute,
  top[0],
  left[0],
);

/**
 * The DataGrid. Put it inside a DataSource:
 *
 * ```html
 * <infinite-data-source primaryKey="id" [data]="data">
 *   <infinite-table [columns]="columns" [(columnOrder)]="columnOrder" />
 * </infinite-data-source>
 * ```
 *
 * The host element is the grid's root element (`.Infinite`): `class`,
 * `style` and `aria-*` on it work as on any element. The imperative api is
 * `#grid="infiniteTable"` -> `grid.api()`, or the `(ready)` output.
 */
@Component({
  // <infinite-tree-grid>: the TreeGrid is an InfiniteTable (the tree comes
  // from the TreeDataSource and the column's renderTreeIcon)
  selector: 'infinite-table, infinite-tree-grid',
  exportAs: 'infiniteTable',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    TableHeaderWrapper,
    HeadlessTable,
    InfiniteRender,
    CSSNumericVariableWatch,
    InfiniteTableLicenseFooter,
    InfiniteOverlayPortal,
  ],
  host: {
    ngSkipHydration: 'true',
    '[class]': 'rootClassName()',
    '[style]': 'rootStyle()',
    '[attr.data-debug-id]': 'debugIdAttr()',
  },
  providers: [
    {
      provide: INFINITE_TABLE,
      useFactory: () => inject(InfiniteTable).contextValue,
    },
  ],
  template: `
    @if (initialized) {
      @let s = state();
      <!-- React: InfiniteTableHeader renders the wrapper only when the header is enabled -->
      @if (s.header) {
        <div
          infiniteTableHeaderWrapper
          [headerBrain]="s.headerBrain"
          [bodyBrain]="s.brain"
          [wrapRowsHorizontally]="!!s.wrapRowsHorizontally"
        ></div>
      }
      <div #body [class]="bodyClassName">
        <div
          infiniteHeadlessTable
          [brain]="s.brain"
          [renderer]="$any(s.renderer)"
          [onRenderUpdater]="s.onRenderUpdater"
          [renderCell]="renderCell()"
          [renderDetailRow]="renderDetailRow()"
          [cellHoverClassNames]="hoverClassNames()"
          [scrollStopDelay]="s.scrollStopDelay"
          [forceRerenderTimestamp]="s.forceBodyRerenderTimestamp"
          [wrapRowsHorizontally]="!!s.wrapRowsHorizontally"
          [scrollerRef]="onScrollerElement"
          [tabIndex]="scrollerTabIndex()"
          [autoFocus]="scrollerAutoFocus()"
          [activeRowIndex]="activeIndicators().activeRowIndex"
          [activeCellIndex]="activeIndicators().activeCellIndex"
          [activeCellRowHeight]="activeIndicators().activeCellRowHeight"
        ></div>
        <ng-container [infiniteRender]="loadMask()" />
      </div>
      <div #portal [class]="portalClassName">
        @for (overlay of menuOverlays; track $index) {
          <ng-container [infiniteOverlayPortal]="overlay" />
        }
      </div>
      @if (s.rowHeightCSSVar) {
        <infinite-css-numeric-variable-watch
          [varName]="s.rowHeightCSSVar"
          [onChange]="s.onRowHeightCSSVarChange"
        />
      }
      <infinite-css-numeric-variable-watch
        [allowInts]="true"
        [varName]="flashingDurationVar"
        [onChange]="s.onFlashingDurationCSSVarChange"
      />
      @if (s.rowDetailHeightCSSVar) {
        <infinite-css-numeric-variable-watch
          [varName]="s.rowDetailHeightCSSVar"
          [onChange]="s.onRowDetailHeightCSSVarChange"
        />
      }
      @if (s.columnHeaderHeightCSSVar) {
        <infinite-css-numeric-variable-watch
          [varName]="s.columnHeaderHeightCSSVar"
          [onChange]="s.onColumnHeaderHeightCSSVarChange"
        />
      }
      @if (licenseStatus() !== 'valid') {
        <div
          infiniteLicenseFooter
          [invalid]="licenseStatus() === 'invalid'"
        ></div>
      }
    }
  `,
})
export class InfiniteTable<T = any>
  extends InfiniteTableInputs<T>
  implements OnInit
{
  /**
   * Set this once, before rendering any grid, to use the same license key
   * for all grids - same as `InfiniteTable.licenseKey` in React and Vue.
   * `provideInfiniteTable({ licenseKey })` is the Angular way.
   */
  static licenseKey: string | undefined = undefined;

  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly host =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly config = inject(INFINITE_TABLE_CONFIG);
  private readonly dataSource = inject(INFINITE_DATA_SOURCE, {
    optional: true,
  });
  private readonly getMasterDetailContext = injectGetMasterDetailContext();

  private readonly managed = injectManagedInfiniteTable(
    this,
    INFINITE_TABLE_PROPS_META,
    () => ({
      // same default as the React wrapper
      repeatWrappedGroupRows:
        this.repeatWrappedGroupRows() ?? !!this.wrapRowsHorizontally(),
    }),
  );

  protected initialized = false;

  protected readonly bodyClassName = BODY_CLASS_NAME;
  protected readonly portalClassName = PORTAL_CLASS_NAME;
  /** the column / cell / table / filter operator menus (in the portal element) */
  protected menuOverlays: InfiniteOverlay[] = [];
  protected readonly flashingDurationVar =
    ThemeVars.components.Cell.flashingDuration;

  private readonly bodyRef = viewChild<ElementRef<HTMLElement>>('body');
  private readonly portalRef = viewChild<ElementRef<HTMLElement>>('portal');

  /** the state (tracked) */
  protected readonly state = computed(
    () => this.managed.context.state() as InfiniteTableState<T>,
  );

  private readonly apiSignal = signal<any>(null);

  /**
   * The imperative api (null until the grid is initialized).
   */
  readonly api = this.apiSignal.asReadonly();

  /** set in ngOnInit */
  contextValue!: InfiniteTableContextValueForAngular<T>;

  protected renderCell!: Signal<TableRenderCellFn>;
  protected renderDetailRow!: Signal<TableRenderDetailRowFn | undefined>;
  protected hoverClassNames!: Signal<string[] | undefined>;
  protected loadMask!: Signal<Renderable>;
  // assigned in ngOnInit (host bindings first run after it)
  protected rootClassName!: Signal<string>;
  protected rootStyle!: Signal<Record<string, any>>;
  protected debugIdAttr = computed(() => this.debugId() ?? null);
  protected scrollerTabIndex!: Signal<number>;
  protected scrollerAutoFocus!: Signal<boolean>;
  protected onScrollerElement: (el: HTMLElement | null) => void = () => {};
  // slice B: the HeadlessTable active row/cell indicator inputs + the
  // license footer (assigned in setup)
  protected activeIndicators!: Signal<{
    activeRowIndex: number | null;
    activeCellIndex: [number, number] | null;
    activeCellRowHeight: number | ((rowIndex: number) => number);
  }>;
  protected licenseStatus!: Signal<ReturnType<typeof getLicenseStatus>>;

  ngOnInit() {
    if (!this.dataSource) {
      throw new Error(
        'InfiniteTable must be rendered inside a <infinite-data-source> (DataSource)',
      );
    }
    this.managed.init();
    this.setup(this.dataSource as DataSourceContextValueForAngular<T>);
    this.initialized = true;
  }

  private setup(dataSourceContext: DataSourceContextValueForAngular<T>) {
    const injector = this.injector;
    const managedContextValue = this.managed.context;

    const state = this.state;
    const actions =
      managedContextValue.componentActions as unknown as InfiniteTableActions<T>;
    // untracked: getState is the imperative accessor handed to
    // cells/api/event handlers. Reactive consumers read state() instead.
    const getState =
      managedContextValue.getComponentState as () => InfiniteTableState<T>;

    const dataSourceState = dataSourceContext.state;
    const getDSState = dataSourceContext.getDataSourceState;
    const { dataSourceApi } = dataSourceContext;

    const isDetail = !!this.getMasterDetailContext();

    getState().domRef.current = this.host as HTMLDivElement;

    // ---- computed columns (React: useComputedColumns), on the same deps,
    // so column identities survive unrelated state changes
    // (controller/getComputedColumnsDeps.ts)
    const computedColumnsResult = computedWithDeps(
      () => getComputedColumnsDeps(state(), dataSourceState()),
      () => getComputedColumnsFromState(getState(), getDSState()),
    );

    const getComputedVisibleColumns = () =>
      untracked(computedColumnsResult).computedVisibleColumns;

    // ---- computed values + imperative api (React: useComputed) ----
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

    // scrollbars tracking (React: useScrollbars)
    const scrollbars = signal<Scrollbars>({
      vertical: false,
      horizontal: false,
    });
    // React: useComputedRowHeight - memoized on the same inputs so the
    // RowSizeCache survives data changes
    let rowHeightMemo: {
      deps: readonly unknown[];
      value: ReturnType<typeof computeRowHeightWithCache>;
    } | null = null;

    const getComputedRowHeightResult = () => {
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
          } as any),
        };
      }
      return rowHeightMemo.value;
    };

    const getComputedRowHeight = () =>
      getComputedRowHeightResult().computedRowHeight;

    const getComputedValues = (
      cc: ReturnType<typeof computedColumnsResult>,
    ): InfiniteTableComputedValues<any> => {
      const computedPinnedStartWidth =
        cc.computedPinnedStartWidth ?? cc.computedPinnedStartColumnsWidth;
      const computedPinnedEndWidth =
        cc.computedPinnedEndWidth ?? cc.computedPinnedEndColumnsWidth;

      return {
        ...cc,
        scrollbars: untracked(scrollbars),
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
      } as any;
    };

    const getComputed = (): InfiniteTableComputedValues<any> =>
      getComputedValues(untracked(computedColumnsResult));

    const computedValues = computed(() =>
      getComputedValues(computedColumnsResult()),
    );

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
    } as any);
    this.apiSignal.set(api);

    // the rendering context every cell receives (stable identity)
    const renderingContext: InfiniteTableColumnRenderingContext<any> = {
      getState,
      getDataSourceState: getDSState,
      getDataSourceMasterContext,
      actions,
      dataSourceActions: dataSourceContext.dataSourceActions,
      api,
      dataSourceApi,
    } as any;

    // ---- shared DOM event handlers (React: useDOMEventHandlers) ----
    // cells/root publish raw events into the keyDown/cellClick/cellMouseDown
    // subscription callbacks; here they reach the shared handlers (keyboard
    // navigation, keyboard & click selection, editing triggers, shortcuts)
    const eventHandlerContext: InfiniteTableEventHandlerContext<any> = {
      getComputed,
      getDataSourceMasterContext,
      dataSourceApi,
      api,
      getState,
      actions,
      getDataSourceState: getDSState,
      dataSourceActions: dataSourceContext.dataSourceActions,
      cloneTreeSelection: (treeSelection: any) => {
        return cloneTreeSelection<any>(treeSelection, getDSState as any);
      },
      cloneRowSelection: (rowSelection: any) => {
        return cloneRowSelection<any>(rowSelection, getDSState as any);
      },
    } as any;

    const cleanups: VoidFunction[] = [];

    // ---- the effects shared with the Vue root (controller/rootEffects.ts):
    // columns when grouping, the DataSource flags, auto size, the hidden
    // columns, scrollbars, scrolling to the active row/cell, the editing
    // callbacks, the horizontal layout, ready, the render range and scroll
    // stop notifications + the event handler and CSS var subscriptions.
    // Three groups, each run where its watchers were created before (the
    // creation order decides which watcher runs first)
    const groupByMap = computed(() => getGroupByMap(dataSourceState().groupBy));
    const autoSizeRefreshId = signal(0);
    const rootEffects = createRootEffects<T>({
      state,
      dataSourceState,
      groupByMap,
      eventHandlerContext,
      scrollbars: {
        get: () => scrollbars(),
        peek: () => untracked(scrollbars),
        set: (value) => scrollbars.set(value),
      },
      autoSizeRefreshId: {
        get: () => autoSizeRefreshId(),
        peek: () => untracked(autoSizeRefreshId),
        set: (id) => autoSizeRefreshId.set(id),
      },
    });
    cleanups.push(rootEffects.destroy);
    runControllerEffectsForAngular(rootEffects.columnEffects, { injector });

    // ---- menus (React: useColumnMenu, useCellContextMenu,
    // useTableContextMenu, useColumnFilterOperatorMenu) - their overlays are
    // rendered in the portal element ----
    {
      const menuHookParams: MenuHookParams<any> = {
        context: eventHandlerContext,
        state,
        injector,
        getMasterPortalElement: () =>
          this.getMasterDetailContext()?.getMasterState().portalDOMRef?.current,
      };
      this.menuOverlays = [
        setupColumnMenu(menuHookParams),
        setupCellContextMenu(menuHookParams),
        setupTableContextMenu(menuHookParams),
        setupColumnFilterOperatorMenu(menuHookParams),
      ];
    }

    // ---- the body's context menu (React: onContextMenu in InfiniteTableBody):
    // publishes the browser event (+ the cell, when over one) into the shared
    // cellContextMenu/contextMenu subscription callbacks
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

    // ---- focus tracking (the focus part of React's useDOMProps) ----
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

    // the keydown of the root (+ the one passed in domProps)
    const onRootKeyDown = (event: KeyboardEvent) => {
      getState().keyDown(event as any);
      const domProps = (getState().domProps ?? {}) as Record<string, any>;
      const userOnKeyDown = domProps.onKeydown ?? domProps.onKeyDown;
      userOnKeyDown?.(event);
    };

    this.host.addEventListener('keydown', onRootKeyDown);
    this.host.addEventListener('focusin', onRootFocusIn);
    this.host.addEventListener('focusout', onRootFocusOut);
    cleanups.push(() => {
      this.host.removeEventListener('keydown', onRootKeyDown);
      this.host.removeEventListener('focusin', onRootFocusIn);
      this.host.removeEventListener('focusout', onRootFocusOut);
    });

    afterNextRender(
      () => {
        const body = this.bodyRef()?.nativeElement;
        if (body) {
          body.addEventListener('contextmenu', onBodyContextMenu);
          cleanups.push(() =>
            body.removeEventListener('contextmenu', onBodyContextMenu),
          );
        }
        getState().portalDOMRef.current =
          (this.portalRef()?.nativeElement as HTMLDivElement) ?? null;
      },
      { injector },
    );

    runControllerEffectsForAngular(rootEffects.interactionEffects, {
      injector,
    });

    // ---- brain wiring (React: useYourBrain / useMatrixBrain) ----
    effect(
      () => {
        const s = state();
        const ds = dataSourceState();
        const cc = computedColumnsResult();

        untracked(() =>
          updateBrain<T>({
            state: s,
            dataSourceState: ds,
            computedColumns: cc as any,
            getRowHeight: getComputedRowHeight,
            getDataSourceState: getDSState,
          }),
        );
      },
      { injector },
    );

    runControllerEffectsForAngular(rootEffects.layoutEffects, { injector });

    // the body size, from the scroller element
    let removeScrollerResizeObserver: VoidFunction | null = null;
    this.onScrollerElement = (el: HTMLElement | null) => {
      getState().scrollerDOMRef.current = el as HTMLDivElement | null;

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
    cleanups.push(() => removeScrollerResizeObserver?.());

    // ---- cells ----
    const getData = () => getDSState().dataArray;
    const getComputedColumnOrder = () =>
      untracked(computedColumnsResult).computedColumnOrder;

    // React: the hoverClassNames useMemo in InfiniteTableBody
    this.hoverClassNames = computedWithDeps<string[] | undefined>(
      () => {
        const s = state();
        return [s.showHoverRows, s.rowHoverClassName];
      },
      () => {
        const s = getState();
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
    );

    // React: the dataSourceStatePartialForCell useMemo - a cell prop, so
    // all cells re-render when one of these DataSource slices changes (the
    // cells read the values themselves)
    const dataSourceStatePartialForCell = computedWithDeps(
      () => {
        const ds = dataSourceState();
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
    );

    // on the same deps as React's useCellRendering renderCell useCallback
    // (controller/renderCellParams.ts)
    this.renderCell = computedWithDeps<TableRenderCellFn>(
      () =>
        getRenderCellDeps(
          state(),
          dataSourceState(),
          computedColumnsResult(),
          dataSourceStatePartialForCell(),
        ),
      () => {
        const getCellProps = createGetColumnCellProps<any>({
          computedColumns: untracked(computedColumnsResult) as any,
          state: getState(),
          rowInfoStore: getDSState().rowInfoStore,
          dataSourceStatePartial: untracked(dataSourceStatePartialForCell),
          getData: getData as () => any[],
          getComputedRowHeightResult,
          api: api as any,
          renderingContext,
          getComputedVisibleColumns: getComputedVisibleColumns as () => any[],
          getComputedColumnOrder,
        });

        return (params: TableRenderCellFnParam) => {
          const props = getCellProps(
            params,
          ) as InfiniteTableColumnCellProps | null;
          if (!props) {
            return null;
          }
          // slice B: column.components.Editor, or the default editor
          props.renderEditor = renderColumnEditor;

          const ColumnCell = (props.column as any).components?.ColumnCell;

          // the pooled cell keeps its component and DOM element while
          // scrolling and only gets new props
          return (ColumnCell
            ? renderPooled(ColumnCell, props, [InfiniteColumnCellHost])
            : renderPooled(
                InfiniteTableColumnCell,
                props,
              )) as unknown as Renderable;
        };
      },
    );

    // ---- master-detail: the detail rows ----
    // mirrors renderDetailRow from React's useCellRendering
    this.renderDetailRow = computedWithDeps<TableRenderDetailRowFn | undefined>(
      () => {
        const s = state();
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
          const { rowIndex } = params;

          const rowInfo = getData()[rowIndex];
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
            return renderPooled(
              InfiniteTableDetailRowPlaceholder,
              null,
            ) as unknown as Renderable;
          }

          const { rowDetailHeight, rowHeight } =
            computedRowSizeCacheForDetails.getSize(rowIndex);

          const props: InfiniteTableDetailRowProps<T> = {
            rowInfo,
            rowDetailsCache: rowDetailCache,
            rowIndex,
            detailOffset: rowHeight,
            rowDetailHeight,
            rowDetailRenderer: rowDetailRenderer as any,
          };

          return renderPooled(
            InfiniteTableDetailRow,
            props,
          ) as unknown as Renderable;
        };
      },
    );

    // the load mask (components.LoadMask overrides it, like in React)
    this.loadMask = computed(() => {
      const s = state();
      const loading = !!dataSourceState().loading;
      const LoadMaskCmp = (s.components as any)?.LoadMask ?? LoadMask;
      return renderComponent(LoadMaskCmp, {
        inputs: { visible: loading, loadingText: s.loadingText },
      });
    });

    // ---- the root element (React: useDOMProps) ----
    this.scrollerTabIndex = computed(() => {
      const domProps = (state().domProps ?? {}) as Record<string, any>;
      return domProps.tabIndex ?? 0;
    });
    this.scrollerAutoFocus = computed(() => {
      const domProps = (state().domProps ?? {}) as Record<string, any>;
      return !!domProps.autoFocus;
    });

    const licenseStatus = computed(() =>
      getLicenseStatus(
        this.licenseKey() ?? this.config.licenseKey ?? InfiniteTable.licenseKey,
        { isDetail },
      ),
    );
    // the license footer (React/Vue: <InfiniteTableLicenseFooter /> when not valid)
    this.licenseStatus = licenseStatus;

    // ---- slice B: the active row / cell indicators (same as the Vue root's
    // HeadlessTable props) ----
    this.activeIndicators = computed(() => {
      const s = state();
      return {
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
      };
    });

    const rootClass = computed(() => {
      const s = state();
      const cc = computedColumnsResult();
      const focused = s.focused;
      const focusedWithin = s.focusedWithin;
      const domProps = (s.domProps ?? {}) as Record<string, any>;

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

      // same className parts as the React root (useDOMProps)
      return join(
        domProps.className,
        domProps.class,
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
    });
    this.rootClassName = rootClass;

    this.rootStyle = computed(() => {
      const s = state();
      const cc = computedColumnsResult();
      const domProps = (s.domProps ?? {}) as Record<string, any>;

      // the CSS vars the React root defines via useDOMProps
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
        scrollbars: scrollbars(),
      } as any);

      const style: Record<string, any> = {
        ...styleWithUnits(domProps.style),
        ...(cssVars as Record<string, any>),
      };
      if (s.focused && s.focusedStyle) {
        Object.assign(style, styleWithUnits(s.focusedStyle as any));
      }
      if (s.focusedWithin && s.focusedWithinStyle) {
        Object.assign(style, styleWithUnits(s.focusedWithinStyle as any));
      }
      return style;
    });

    this.contextValue = {
      state,
      getState,
      actions,
      api,
      getComputed,
      computed: computedValues,
      getComputedVisibleColumns,
      scrollbars: scrollbars.asReadonly(),
      dataSourceContext,
    } as InfiniteTableContextValueForAngular<T>;

    if (__DEV__) {
      // the debug globals the React InfiniteTableContextProvider exposes
      (globalThis as any).getState = getState;
      (globalThis as any).componentActions = actions;
      (globalThis as any).masterBrain = getState().brain;
      (globalThis as any).infiniteApi = api;

      const { debugId } = getState();
      if (debugId) {
        (globalThis as any).INFINITE = (globalThis as any).INFINITE || {};
        (globalThis as any).INFINITE[debugId] = {
          ...((globalThis as any).INFINITE[debugId] || {}),
          getState,
          actions,
        };
      }
    }

    this.destroyRef.onDestroy(() => {
      cleanups.forEach((cleanup) => cleanup());
    });
  }
}
