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
import { shallowEqualObjects } from '../../utils/shallowEqualObjects';
import { styleWithUnits } from '../../utils/styleWithUnits';
import { selectParentUntil } from '../../utils/selectParent';
import { buildManagedAngularComponent } from '../hooks/useComponentState/useManagedComponent.angular';
import { computedWithDeps } from '../hooks/computedWithDeps.angular';
import { watchSignals } from '../hooks/watchSignals.angular';
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
import type { CellPositionByIndex } from '../types/CellPositionByIndex';
import type { MatrixBrainOptions } from '../VirtualBrain/MatrixBrain';
import type {
  TableRenderCellFn,
  TableRenderCellFnParam,
} from '../HeadlessTable/rendererTypes';

import {
  cleanupState,
  createBrains,
  forwardProps,
  getCellSelector,
  getGroupByMap,
  getMappedCallbacks,
  initSetupState,
  mapPropsToState,
} from './state/getInitialState';
import {
  getColumnVisibilityForHideEmptyGroupColumns,
  getGroupColumnsForComputedColumns,
} from './state/getColumnVisibilityForHideEmptyGroupColumns';
import { getColumnContentMaxWidths } from './utils/getColumnContentMaxWidths';
import { DEBUG_NAME } from './InfiniteDebugName';
import { getComputedColumns } from './utils/getComputedColumns';
import { getColumnsWhenGrouping } from './utils/getColumnsWhenGrouping';
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
import { onCellClick } from './eventHandlers/onCellClick';
import { onCellMouseDown } from './eventHandlers/onCellMouseDown';
import { onKeyDown } from './eventHandlers/onKeyDown';
import {
  getEditingCellContext,
  warnEditedRowGone,
} from './utils/getEditingCellContext';
import { position, top, left, zIndex } from './utilities.css';
import { getColumnApiForColumn } from './api/getColumnApi';
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
import {
  INFINITE_TABLE,
  type InfiniteTableContextValueForAngular,
} from './InfiniteTableContextForAngular.angular';
import {
  INFINITE_TABLE_PROPS_META,
  InfiniteTableInputs,
} from './InfiniteTableInputs.generated.angular';
import type {
  InfiniteTableComputedColumn,
  InfiniteTableComputedValues,
  InfiniteTableState,
  Scrollbars,
} from './types';
import type { InfiniteTableActions } from './types/InfiniteTableState';
import type { InfiniteTableColumnRenderingContext } from './components/InfiniteTableRow/columnRenderingContextType';
import {
  DEFAULT_COLUMN_HEADER_HEIGHT,
  DEFAULT_ROW_HEIGHT_CSS_VALUE,
  getColumnHeaderHeightFromCSSValue,
  getRowHeightFromCSSValue,
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
  selector: 'infinite-table',
  exportAs: 'infiniteTable',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    HeadlessTable,
    InfiniteRender,
    CSSNumericVariableWatch,
    InfiniteTableLicenseFooter,
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
      <div #body [class]="bodyClassName">
        <div
          infiniteHeadlessTable
          [brain]="s.brain"
          [renderer]="$any(s.renderer)"
          [onRenderUpdater]="s.onRenderUpdater"
          [renderCell]="renderCell()"
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
      <div #portal [class]="portalClassName"></div>
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
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef)
    .nativeElement;
  private readonly config = inject(INFINITE_TABLE_CONFIG);
  private readonly dataSource = inject(INFINITE_DATA_SOURCE, { optional: true });
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

    const watch = <D extends readonly unknown[]>(
      getDeps: () => D,
      callback: (current: D, previous: D | undefined) => void | VoidFunction,
      options?: { immediate?: boolean; flush?: 'pre' | 'post' },
    ) => watchSignals(getDeps, callback, { injector, ...options });

    getState().domRef.current = this.host as HTMLDivElement;

    // ---- columns when grouping (React: useColumnsWhenGrouping) ----
    const toggleGroupRowFromState = (groupKeys: any[]) => {
      api.toggleGroupRow(groupKeys);
    };
    watch(
      () => {
        const s = state();
        const ds = dataSourceState();
        return [
          s.columns,
          ds.groupBy,
          ds.pivotBy,
          ds.selectionMode,
          s.hideColumnWhenGrouped,
          s.groupColumn,
          s.groupRenderStrategy,
          s.pivotColumns,
          s.pivotTotalColumnPosition,
          s.pivotColumn,
        ] as const;
      },
      () => {
        const s = getState();
        const ds = getDSState();

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
          } as any);

        actions.columnsWhenGrouping = columnsWhenGrouping as any;

        let currentColumnOrder = getState().columnOrder;
        if (groupColumnIds.length && Array.isArray(currentColumnOrder)) {
          const colOrder = new Set(currentColumnOrder);
          let shouldUpdate = false;
          groupColumnIds.forEach((groupColId: string) => {
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

    // the DataSource generates group rows unless the render strategy is inline
    watch(
      () => [state().groupRenderStrategy] as const,
      ([groupRenderStrategy]) => {
        dataSourceContext.dataSourceActions.generateGroupRows =
          groupRenderStrategy !== 'inline';
      },
      { immediate: true },
    );
    // the DataSource pivot pipeline needs this flag to decide whether
    // single-aggregation pivots get their own column group
    watch(
      () => [state().showSeparatePivotColumnForSingleAggregation] as const,
      ([showSeparatePivotColumnForSingleAggregation]) => {
        dataSourceContext.dataSourceActions.showSeparatePivotColumnForSingleAggregation =
          showSeparatePivotColumnForSingleAggregation as any;
      },
      { immediate: true },
    );
    // the totals column positions go into the DataSource, which generates
    // the pivot total/grand-total columns
    watch(
      () => [state().pivotTotalColumnPosition] as const,
      ([pivotTotalColumnPosition]) => {
        dataSourceContext.dataSourceActions.pivotTotalColumnPosition =
          pivotTotalColumnPosition as any;
      },
      { immediate: true },
    );
    watch(
      () => [state().pivotGrandTotalColumnPosition] as const,
      ([pivotGrandTotalColumnPosition]) => {
        if (pivotGrandTotalColumnPosition != undefined) {
          dataSourceContext.dataSourceActions.pivotGrandTotalColumnPosition =
            pivotGrandTotalColumnPosition as any;
        }
      },
      { immediate: true },
    );

    // ---- auto size columns (React: useAutoSizeColumns) ----
    const autoSizeRefreshId = signal(0);
    let lastExecutedAutoSizeKey: string | number | null = null;

    const getAutoSizeKey = (s: InfiniteTableState<T>) => {
      const { autoSizeColumnsKey } = s;
      return typeof autoSizeColumnsKey === 'object'
        ? autoSizeColumnsKey.key
        : autoSizeColumnsKey;
    };

    watch(
      () => [state().brain] as const,
      ([brain]) => {
        return brain.onRenderRangeChange(() => {
          const key = getAutoSizeKey(getState());
          if (key == null) {
            return;
          }
          // compare the key, not the prop: for an object prop the prop
          // never equals the last executed key
          if (key !== lastExecutedAutoSizeKey) {
            autoSizeRefreshId.update((id) => id + 1);
          }
        });
      },
      { immediate: true },
    );

    watch(
      () => [getAutoSizeKey(state()), state().ready, autoSizeRefreshId()] as const,
      () => {
        const s = getState();
        const theKey = getAutoSizeKey(s);
        if (theKey == null) {
          return;
        }

        const { autoSizeColumnsKey, domRef } = s;

        let columnsToResize: Set<string> | undefined;
        let columnsToSkip: Set<string> | undefined;
        let includeHeader = true;

        if (typeof autoSizeColumnsKey === 'object') {
          if (autoSizeColumnsKey.columnsToResize) {
            columnsToResize = new Set(autoSizeColumnsKey.columnsToResize);
          }
          if (autoSizeColumnsKey.columnsToSkip) {
            columnsToSkip = new Set(autoSizeColumnsKey.columnsToSkip);
          }
          includeHeader = autoSizeColumnsKey.includeHeader ?? includeHeader;
        }

        lastExecutedAutoSizeKey = theKey;

        const measuredMaxWidths = getColumnContentMaxWidths(domRef, {
          includeHeader,
          columnsToResize,
          columnsToSkip,
        });

        const colIds = Object.keys(measuredMaxWidths);
        if (!colIds.length) {
          return;
        }

        const columnSizing = s.columnSizing;
        const newColumnSizing: Record<string, { width: number }> = {
          ...columnSizing,
        } as any;

        let changed = false;
        colIds.forEach((colId) => {
          newColumnSizing[colId] = { width: measuredMaxWidths[colId] };
          changed =
            changed ||
            newColumnSizing[colId].width !==
              (columnSizing as any)[colId]?.width;
        });

        if (changed) {
          actions.columnSizing = newColumnSizing;
        }
      },
      { immediate: true, flush: 'post' },
    );

    // ---- hide columns (React: useHideColumns in useColumnsWhen.ts) ----
    const groupByMap = computed(() => getGroupByMap(dataSourceState().groupBy));

    // hideEmptyGroupColumns
    watch(
      () => {
        const s = state();
        const ds = dataSourceState();
        return [
          s.groupRenderStrategy,
          ds.originalLazyGroupDataChangeDetect,
          ds.groupBy,
          groupByMap(),
          s.computedColumns,
          s.hideEmptyGroupColumns ? ds.dataArray : null,
          s.hideEmptyGroupColumns ? ds.groupRowsState : null,
          s.hideEmptyGroupColumns ? ds.groupRowsIndexesInDataArray : null,
          s.hideEmptyGroupColumns,
        ] as const;
      },
      () => {
        const s = getState();
        const ds = getDSState();
        if (s.groupRenderStrategy !== 'multi-column') {
          return;
        }
        const map = untracked(groupByMap);

        const computedGroupColumns = getGroupColumnsForComputedColumns(
          s.computedColumns,
          map,
        );

        const newColumnVisibility =
          getColumnVisibilityForHideEmptyGroupColumns<any>({
            computedGroupColumns,
            columnVisibility: s.columnVisibility,
            hideEmptyGroupColumns: s.hideEmptyGroupColumns,
            groupRowsIndexesInDataArray: ds.groupRowsIndexesInDataArray,
            dataArray: ds.dataArray,
            groupBy: ds.groupBy,
            groupByMap: map,
          } as any);

        if (!shallowEqualObjects(s.columnVisibility, newColumnVisibility)) {
          actions.columnVisibility = newColumnVisibility;
        }
      },
      { immediate: true },
    );

    // column.defaultHiddenWhenGroupedBy and hideColumnWhenGrouped
    watch(
      () => {
        const s = state();
        return [
          s.computedColumns,
          s.columnTypes,
          dataSourceState().groupBy,
          groupByMap(),
          s.hideColumnWhenGrouped,
        ] as const;
      },
      () => {
        const s = getState();
        const map = untracked(groupByMap);
        const isGrouped = getDSState().groupBy.length > 0;

        const {
          columnVisibility,
          columnVisibilityForGrouping,
          hideColumnWhenGrouped,
          computedColumns,
        } = s;

        const newColumnVisibility = { ...columnVisibility };
        const newColumnVisibilityForGrouping = {
          ...columnVisibilityForGrouping,
        } as Record<string, any>;

        let updatedVisibilityWhenGrouping = false;

        const newlyHiddenColumns = new Set<string>();
        const newlyDisplayedColumns = new Set<string>();

        Object.keys(computedColumns).forEach((id) => {
          const col = (computedColumns as any)[id];
          if (col.defaultHiddenWhenGroupedBy || hideColumnWhenGrouped != null) {
            const hideWhenGrouped =
              (col.defaultHiddenWhenGroupedBy === '*' && isGrouped) ||
              ((col.defaultHiddenWhenGroupedBy === true ||
                hideColumnWhenGrouped) &&
                col.field &&
                map.get(col.field)) ||
              (typeof col.defaultHiddenWhenGroupedBy === 'string' &&
                map.get(col.defaultHiddenWhenGroupedBy as any)) ||
              (typeof col.defaultHiddenWhenGroupedBy === 'object' &&
                Object.keys(col.defaultHiddenWhenGroupedBy).reduce(
                  (acc: boolean, field) => acc || map.has(field as any),
                  false,
                ));

            if (hideWhenGrouped) {
              if (newColumnVisibilityForGrouping[id] !== false) {
                if ((columnVisibility as any)[id] === false) {
                  // already specified as invisible: not in the list of
                  // columns made invisible by the grouping rules
                  return;
                }
                newColumnVisibilityForGrouping[id] = false;
                updatedVisibilityWhenGrouping = true;
                newlyHiddenColumns.add(id);
              }
            } else {
              if (newColumnVisibilityForGrouping[id] === false) {
                delete newColumnVisibilityForGrouping[id];
                updatedVisibilityWhenGrouping = true;
                newlyDisplayedColumns.add(id);
              }
            }
          }
        });

        if (updatedVisibilityWhenGrouping) {
          actions.columnVisibilityForGrouping =
            newColumnVisibilityForGrouping as any;

          newlyDisplayedColumns.forEach((colId) => {
            delete (newColumnVisibility as any)[colId];
          });
          newlyHiddenColumns.forEach((colId) => {
            (newColumnVisibility as any)[colId] = false;
          });

          actions.columnVisibility = newColumnVisibility;
        }
      },
      { immediate: true },
    );

    // ---- computed columns (React: useComputedColumns), on the same deps,
    // so column identities survive unrelated state changes
    const computedColumnsResult = computedWithDeps(
      () => {
        const s = state();
        const ds = dataSourceState();
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
        const s = getState();
        const ds = getDSState();

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
        } as any);
      },
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
    const scrollbars = signal<Scrollbars>({ vertical: false, horizontal: false });
    watch(
      () => [state().brain] as const,
      ([brain]) =>
        brain.onRenderCountChange(() => {
          const { scrollTopMax, scrollLeftMax } = brain;
          const vertical = scrollTopMax > 0;
          const horizontal = scrollLeftMax > 0;
          const prev = untracked(scrollbars);
          if (prev.vertical !== vertical || prev.horizontal !== horizontal) {
            scrollbars.set({ vertical, horizontal });
          }
        }),
      { immediate: true },
    );
    watch(
      () => [scrollbars()] as const,
      ([currentScrollbars]) => {
        const ds = getDSState();
        const { onScrollbarsChange } = getState();
        if (onScrollbarsChange && ds.updatedAt && ds.dataArray.length) {
          onScrollbarsChange(currentScrollbars);
        }
        ds.notifyScrollbarsChange(currentScrollbars);
      },
    );

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

    cleanups.push(
      getState().keyDown.onChange((event) => {
        onKeyDown(eventHandlerContext, event!);
      }),
    );

    cleanups.push(
      getState().cellClick.onChange(
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
          // prototype), so the shared handler gets the `key` expando
          (event as any).key = '';

          onCellClick(
            { ...eventHandlerContext, rowIndex, colIndex, column, columnApi },
            event,
          );
        },
      ),
    );

    cleanups.push(
      getState().cellMouseDown.onChange(
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
      ),
    );

    // the CSS var subscriptions (React: useComputed)
    getState().onRowHeightCSSVarChange.onChange((value) => {
      const rowHeight = getRowHeightFromCSSValue(value as any, getState());
      if (rowHeight != null) {
        actions.rowHeight = rowHeight;
      }
    });
    getState().onFlashingDurationCSSVarChange.onChange((flashingDuration) => {
      const num = flashingDuration ? (flashingDuration as number) * 1 : null;
      if (num != null && !isNaN(num)) {
        actions.flashingDurationCSSVarValue = num;
      }
    });
    getState().onRowDetailHeightCSSVarChange.onChange((rowDetailHeight) => {
      if (rowDetailHeight) {
        actions.rowDetailHeight = rowDetailHeight as any;
      }
    });
    getState().onColumnHeaderHeightCSSVarChange.onChange((value) => {
      const columnHeaderHeight = getColumnHeaderHeightFromCSSValue(
        value as any,
        getState(),
      );
      if (columnHeaderHeight != null) {
        actions.columnHeaderHeight = columnHeaderHeight;
      }
    });

    // ---- the body's context menu (React: onContextMenu in InfiniteTableBody):
    // publishes the browser event (+ the cell, when over one) into the shared
    // cellContextMenu/contextMenu subscription callbacks
    const onBodyContextMenu = (event: MouseEvent) => {
      const s = getState();
      const target = event.target as HTMLElement;

      const cell = selectParentUntil(target, getCellSelector(), s.domRef.current);

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
      const contained = s.domRef.current?.contains((event as any).relatedTarget);

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

    // ---- scroll the active row/cell into view (useScrollToActiveRow/Cell) ----
    const SCROLL_RETRIES = 10;
    const setupScrollToActive = (
      getActive: () => number | [number, number] | null | undefined,
      scroll: (active: any) => boolean,
    ) => {
      let didScroll = false;
      let rafId: number | null = null;

      watch(
        () => [getActive(), dataSourceState().dataArray.length] as const,
        ([active], previous) => {
          const prevActive = previous?.[0];
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

      cleanups.push(() => {
        if (rafId != null) {
          cancelAnimationFrame(rafId);
        }
      });
    };

    setupScrollToActive(
      () => state().activeRowIndex,
      (activeRowIndex: number) =>
        api.scrollRowIntoView(activeRowIndex, { offset: 0 }),
    );
    setupScrollToActive(
      () => state().activeCellIndex,
      (activeCellIndex: [number, number]) =>
        api.scrollCellIntoView(activeCellIndex[0], activeCellIndex[1], {
          offset: 30,
        }),
    );

    // ---- editing callbacks (React: useEditingCallbackProps) ----
    // the edited row is resolved by primary key: the edit may have moved or
    // removed it by the time a callback runs. `null` = the row is gone.
    const editingCellContext = () =>
      getEditingCellContext<any>(
        {
          getComputed,
          getState,
          getDataSourceState: getDSState,
          getDataSourceMasterContext,
          actions,
          dataSourceActions: dataSourceContext.dataSourceActions,
          api,
          dataSourceApi,
        } as any,
        getState().editingCell!,
      );

    watch(
      () => {
        const ec = state().editingCell;
        return [
          ec && !ec.active ? ec.cancelled : undefined,
          ec && !ec.active && ec.accepted instanceof Error
            ? ec.accepted
            : undefined,
          !!(ec && !ec.active && !ec.cancelled && ec.accepted === true),
          ec?.persisted,
          ec?.active,
        ] as const;
      },
      ([cancelled, rejected, accepted, persisted, active], previous) => {
        const [prevCancelled, prevRejected, prevAccepted, prevPersisted, prevActive] =
          previous ?? ([] as any[]);
        // each branch fires only on its own transition - the semantics of
        // the separate dependency-keyed effects in React
        if (cancelled && cancelled !== prevCancelled) {
          const editingCell = getState().editingCell!;
          const { onEditCancelled } = getState();
          if (onEditCancelled) {
            const cellContext = editingCellContext();
            if (cellContext) {
              onEditCancelled({
                ...cellContext,
                initialValue: editingCell.initialValue,
              } as any);
            } else {
              warnEditedRowGone('onEditCancelled', editingCell);
            }
          }
        }

        if (rejected && rejected !== prevRejected) {
          const editingCell = getState().editingCell!;
          const { onEditRejected } = getState();
          if (onEditRejected) {
            const cellContext = editingCellContext();
            if (cellContext) {
              onEditRejected({
                ...cellContext,
                value: editingCell.value,
                error: rejected as Error,
                initialValue: editingCell.initialValue,
              } as any);
            } else {
              warnEditedRowGone('onEditRejected', editingCell);
            }
          }
        }

        if (accepted && accepted !== prevAccepted) {
          const editingCell = getState().editingCell!;
          const { value, initialValue } = editingCell;
          const { onEditAccepted } = getState();
          if (onEditAccepted) {
            const cellContext = editingCellContext();
            if (cellContext) {
              onEditAccepted({ ...cellContext, value, initialValue } as any);
            } else {
              warnEditedRowGone('onEditAccepted', editingCell);
            }
          }

          api.persistEdit({ value });
        }

        if (persisted && persisted !== prevPersisted) {
          const editingCell = getState().editingCell;
          if (editingCell) {
            const callbackName =
              persisted instanceof Error
                ? 'onEditPersistError'
                : 'onEditPersistSuccess';
            if ((getState() as any)[callbackName]) {
              const cellContext = editingCellContext();
              if (!cellContext) {
                warnEditedRowGone(callbackName, editingCell);
              } else {
                const params = {
                  ...cellContext,
                  value: editingCell.value,
                  initialValue: editingCell.initialValue,
                };
                if (persisted instanceof Error) {
                  getState().onEditPersistError?.({
                    ...params,
                    error: persisted,
                  } as any);
                } else {
                  getState().onEditPersistSuccess?.(params as any);
                }
              }
            }
          }
        }

        // focus the table again when editing stops (useFocusOnEditStop)
        if (!active && prevActive) {
          api.focus();
        }
      },
    );

    // ---- brain wiring (React: useYourBrain / useMatrixBrain) ----
    effect(
      () => {
        const s = state();
        const ds = dataSourceState();
        const {
          computedVisibleColumns,
          computedPinnedStartColumns,
          computedPinnedEndColumns,
        } = computedColumnsResult();

        untracked(() => {
          const brain = s.brain;

          brain.updateFixedCells({
            fixedColsStart: computedPinnedStartColumns.length,
            fixedColsEnd: computedPinnedEndColumns.length,
          });

          // rowHeight given as fn(rowInfo) is adapted to fn(index); with row
          // details, the height includes the expanded detail height
          const rowHeight = getComputedRowHeight();

          brain.update({
            colWidth: getColumnSizeFn(computedVisibleColumns),
            rowHeight,
            rows: ds.dataArray.length,
            cols: computedVisibleColumns.length,
            rowspan: getRowspanFn(computedVisibleColumns, getDSState),
          } as any);
        });
      },
      { injector },
    );

    // ---- toggling the horizontal layout needs new brains + renderers
    // (React: useToggleWrapRowsHorizontally)
    watch(
      () => [state().wrapRowsHorizontally] as const,
      ([wrapRowsHorizontally], previous) => {
        if (!previous || previous[0] === wrapRowsHorizontally) {
          return;
        }
        const { brain, headerBrain, renderer, onRenderUpdater } = getState();

        brain.destroy();
        headerBrain.destroy();
        renderer.destroy();
        onRenderUpdater.destroy();

        const newBrains = createBrains(DEBUG_NAME, !!wrapRowsHorizontally);

        actions.brain = newBrains.brain;
        actions.headerBrain = newBrains.headerBrain;
        actions.renderer = newBrains.renderer;
        actions.onRenderUpdater = newBrains.onRenderUpdater;
        actions.headerRenderer = newBrains.headerRenderer;
        actions.headerOnRenderUpdater = newBrains.headerOnRenderUpdater;
      },
      { flush: 'post' },
    );

    // ---- keeps the DataSource rowsPerPage + repeatWrappedGroupRows in sync
    // with the brain when rows wrap horizontally (React: useHorizontalLayout)
    watch(
      () => {
        const s = state();
        const ds = dataSourceState();
        return [
          s.brain,
          s.wrapRowsHorizontally,
          ds.groupBy,
          ds.isTree,
          s.wrapRowsHorizontally ? s.repeatWrappedGroupRows : false,
        ] as const;
      },
      ([brain, wrapRowsHorizontally, groupBy, isTree, repeatWrappedGroupRows]) => {
        const dsActions = dataSourceContext.dataSourceActions;

        if (!wrapRowsHorizontally) {
          if (getDSState().repeatWrappedGroupRows) {
            dsActions.repeatWrappedGroupRows = false;
          }
          return;
        }

        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        const onVerticalRenderRangeChange = () => {
          const {
            rowsPerPage: currentRowsPerPage,
            repeatWrappedGroupRows: currentRepeatWrappedGroupRows,
          } = getDSState();

          let changes = false;

          const rowsPerPage = (brain as any).rowsPerPage;
          const newRowsPerPage =
            ((groupBy && groupBy.length > 0) || isTree) && rowsPerPage > 0
              ? rowsPerPage
              : null;

          if (currentRowsPerPage != newRowsPerPage) {
            dsActions.rowsPerPage = newRowsPerPage;
            changes = true;
          }

          if (currentRepeatWrappedGroupRows != repeatWrappedGroupRows) {
            dsActions.repeatWrappedGroupRows = !!repeatWrappedGroupRows;
            changes = true;
          }

          return changes;
        };

        onVerticalRenderRangeChange();

        const removeSub = brain.onVerticalRenderRangeChange(() => {
          if (onVerticalRenderRangeChange()) {
            timeoutId = setTimeout(() => {
              // by the time the render range changes, the DataSource has not
              // finished recomputing the artificial group rows, so the body
              // has to be re-rendered
              actions.forceBodyRerenderTimestamp = Date.now();
            });
          }
        });

        return () => {
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          removeSub();
        };
      },
      { immediate: true, flush: 'post' },
    );

    // the scroll stop delay goes to the brain and to the DataSource
    watch(
      () => [state().scrollStopDelay] as const,
      ([scrollStopDelay]) => {
        getState().brain.setScrollStopDelay(scrollStopDelay);
        dataSourceContext.dataSourceActions.scrollStopDelayUpdatedByTable =
          scrollStopDelay;
      },
      { immediate: true },
    );

    // the readiness hook of the tests/tooling (same contract as React's
    // index.tsx effect - the Playwright fixtures rely on it) + onReady, on
    // every `ready` transition, the initial one included
    watch(
      () => [state().ready] as const,
      ([ready]) => {
        if (
          typeof (globalThis as any)
            .__DO_NOT_USE_UNLESS_YOU_KNOW_WHAT_YOURE_DOING_IS_READY ===
          'function'
        ) {
          (globalThis as any).__DO_NOT_USE_UNLESS_YOU_KNOW_WHAT_YOURE_DOING_IS_READY(
            getState().id,
            ready,
            api,
            { dataSourceApi },
          );
        }
        const { onReady } = getState();
        if (onReady) {
          onReady({ api: api as any, dataSourceApi });
        }
      },
      { immediate: true, flush: 'post' },
    );

    watch(
      () => [!!state().bodySize.height] as const,
      ([hasHeight]) => {
        if (hasHeight) {
          actions.ready = true;
        }
      },
      { immediate: true },
    );

    // the render range goes to the DataSource (lazy loading) and to the
    // onRenderRangeChange callback (React: useCellRendering)
    watch(
      () => [state().brain] as const,
      ([brain]) => {
        const removeRenderRangeChange = brain.onVerticalRenderRangeChange(
          (renderRange: [number, number]) => {
            getDSState().notifyRenderRangeChange({
              renderStartIndex: renderRange[0],
              renderEndIndex: renderRange[1],
            });
          },
        );
        const removeRenderRangeChangeCallback = brain.onRenderRangeChange(
          (range) => {
            getState().onRenderRangeChange?.(range);
          },
        );
        return () => {
          removeRenderRangeChange();
          removeRenderRangeChangeCallback();
        };
      },
      { immediate: true },
    );

    // scroll stop -> onScrollToTop/onScrollToBottom/onScrollStop + the
    // livePagination cursor (React: useCellRendering)
    const SCROLL_BOTTOM_OFFSET = 1;
    watch(
      () => [state().brain] as const,
      ([brain]) => {
        let scrollTopMax = 0;
        const removeRenderCount = brain.onRenderCountChange(() => {
          scrollTopMax = brain.scrollTopMax;
        });

        const removeScrollStop = brain.onScrollStop((scrollPosition) => {
          const { scrollTop, scrollLeft } = scrollPosition;
          const { onScrollToTop, onScrollToBottom, onScrollStop } = getState();

          if (scrollTop === 0) {
            onScrollToTop?.();
          }

          const offset = getState().scrollToBottomOffset ?? SCROLL_BOTTOM_OFFSET;
          const isScrollBottom = scrollTop + offset >= scrollTopMax;

          if (isScrollBottom) {
            onScrollToBottom?.();

            const { livePagination, livePaginationCursor, dataArray } =
              getDSState();
            if (livePagination) {
              dataSourceContext.dataSourceActions.cursorId =
                livePaginationCursor !== undefined
                  ? // with a `livePaginationCursor`, a new cursorId makes the
                    // DataSource fetch more data
                    Date.now()
                  : // otherwise dataArray.length is the cursorId - see
                    // #useDataArrayLengthAsCursor
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
            } as any);
          }
        });

        return () => {
          removeRenderCount();
          removeScrollStop();
        };
      },
      { immediate: true },
    );

    // the body size, from the scroller element
    let scrollerElement: HTMLElement | null = null;
    let removeScrollerResizeObserver: VoidFunction | null = null;
    this.onScrollerElement = (el: HTMLElement | null) => {
      scrollerElement = el;
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

    // a new scrollTopKey scrolls the grid back to the top
    watch(
      () => [state().scrollTopKey] as const,
      () => {
        if (scrollerElement) {
          scrollerElement.scrollTop = 0;
        }
      },
    );

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

    // on the same deps as React's useCellRendering renderCell useCallback:
    // NOT on dataArray (read lazily via getData), so a data update doesn't
    // force-rerender every cell - per-row updates reach the cells through
    // their rowInfoStore subscriptions
    this.renderCell = computedWithDeps<TableRenderCellFn>(
      () => {
        const s = state();
        const ds = dataSourceState();
        return [
          computedColumnsResult(),
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
          dataSourceStatePartialForCell(),
        ];
      },
      () => {
        const { computedVisibleColumns, computedColumnsMap, fieldsToColumn } =
          untracked(computedColumnsResult) as any;
        const s = getState();
        const showZebraRows = s.showZebraRows;
        const rowInfoStore = getDSState().rowInfoStore;
        const dataSourceStatePartial = untracked(dataSourceStatePartialForCell);

        return (params: TableRenderCellFnParam) => {
          const {
            rowIndex,
            colIndex,
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

          // when rows have details, the brain sizes the row as row + detail,
          // so the cell takes its own height from the row size cache
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

          // whether THIS cell is in edit mode - a prop (like React), so an
          // editing start/stop re-renders exactly the affected cell
          const inEditMode = api.isEditorVisibleForCell({
            rowIndex,
            columnId: column.id,
          });

          const props: InfiniteTableColumnCellProps = {
            rowIndex,
            rowHeight,
            width,
            hidden,
            column,
            columnsMap: computedColumnsMap,
            fieldsToColumn,
            showZebraRows,
            rowDetailState,
            inEditMode,
            rowIndexInHorizontalLayoutPage: s.wrapRowsHorizontally
              ? (s.brain as any).getRowIndexInPage(rowIndex)
              : null,
            horizontalLayoutPageIndex: s.wrapRowsHorizontally
              ? (s.brain as any).getPageIndexForRow(rowIndex)
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
            getData: getData as () => any[],
            rowInfoStore,
            renderingContext,
            getComputedVisibleColumns: getComputedVisibleColumns as () => any[],
            getComputedColumnOrder,
            dataSourceStatePartial,
            // slice B: column.components.Editor, or the default editor
            renderEditor: renderColumnEditor,
            onMouseEnter,
            onMouseLeave,
          };

          const ColumnCell = (column as any).components?.ColumnCell;

          // the pooled cell keeps its component and DOM element while
          // scrolling and only gets new props
          return (
            ColumnCell
              ? renderPooled(ColumnCell, props, [InfiniteColumnCellHost])
              : renderPooled(InfiniteTableColumnCell, props)
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
        pinnedStartOverflow ? `${rootClassName}--has-pinned-start-overflow` : null,
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
