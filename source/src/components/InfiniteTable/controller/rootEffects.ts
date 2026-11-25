/**
 * The InfiniteTable root's effects that don't depend on a UI framework: the
 * columns when grouping, the DataSource flags the table owns, auto sizing,
 * the columns hidden when grouping, the scrollbars, scrolling the active
 * row/cell into view, the editing callbacks, the horizontal layout, the
 * ready flag and the render range / scroll stop notifications - plus the
 * subscriptions that route the cells' events into the shared event handlers
 * and the CSS variable values into the state.
 *
 * The React root has them as hooks (useColumnsWhenGrouping, useAutoSizeColumns,
 * useCellRendering, ...); the Vue and Angular roots run these lists (see
 * hooks/controllerEffects.ts) with their own scheduling, so the logic is
 * written once for both.
 */
import { shallowEqualObjects } from '../../../utils/shallowEqualObjects';
import type {
  ControllerEffect,
  ReactiveCell,
} from '../../hooks/controllerEffects';
import type { DataSourceState } from '../../DataSource/types';
import type { CellPositionByIndex } from '../../types/CellPositionByIndex';
import type { MatrixBrainOptions } from '../../VirtualBrain/MatrixBrain';
import { getColumnApiForColumn } from '../api/getColumnApi';
import { onCellClick } from '../eventHandlers/onCellClick';
import { onCellMouseDown } from '../eventHandlers/onCellMouseDown';
import { onKeyDown } from '../eventHandlers/onKeyDown';
import type { InfiniteTableEventHandlerContext } from '../eventHandlers/eventHandlerTypes';
import { DEBUG_NAME } from '../InfiniteDebugName';
import {
  getColumnHeaderHeightFromCSSValue,
  getRowHeightFromCSSValue,
} from '../shared';
import {
  getColumnVisibilityForHideEmptyGroupColumns,
  getGroupColumnsForComputedColumns,
} from '../state/getColumnVisibilityForHideEmptyGroupColumns';
import { createBrains } from '../state/getInitialState';
import type {
  InfiniteTableComputedColumn,
  InfiniteTableState,
  Scrollbars,
} from '../types';
import type { GroupByMap } from '../types/InfiniteTableState';
import { getColumnContentMaxWidths } from '../utils/getColumnContentMaxWidths';
import { getColumnsWhenGrouping } from '../utils/getColumnsWhenGrouping';
import {
  getEditingCellContext,
  warnEditedRowGone,
} from '../utils/getEditingCellContext';

export type RootEffectsContext<T> = {
  /** reads the state in a reactive context: changes re-run the effects that read it */
  state: () => InfiniteTableState<T>;
  /** reads the DataSource state in a reactive context */
  dataSourceState: () => DataSourceState<T>;
  /**
   * the DataSource groupBy as a map, read in a reactive context - a
   * framework computed, so its identity only changes with the groupBy
   */
  groupByMap: () => GroupByMap<T>;
  /**
   * the context of the shared event handlers, which has the rest: getState
   * (untracked), actions, api, getComputed and the DataSource's
   * getDataSourceState (untracked), actions and api
   */
  eventHandlerContext: InfiniteTableEventHandlerContext<T>;
  /** whether the body has scrollbars (the root renders them as CSS vars) */
  scrollbars: ReactiveCell<Scrollbars>;
  /** bumped when the render range changes and the columns need auto sizing */
  autoSizeRefreshId: ReactiveCell<number>;
};

/**
 * Infers an effect's deps type from its `deps` getter.
 */
function defineEffect<DEPS extends Record<string, unknown>>(
  effect: ControllerEffect<DEPS>,
): ControllerEffect<DEPS> {
  return effect;
}

/**
 * The full previous deps: the values before the change for the deps that
 * changed, the current ones for the others (undefined on the first run).
 */
function previousDeps<DEPS extends Record<string, unknown>>(info: {
  current: DEPS;
  previous: Partial<DEPS>;
}): Partial<DEPS> {
  return { ...info.current, ...info.previous };
}

function getAutoSizeKey<T>(state: InfiniteTableState<T>) {
  const { autoSizeColumnsKey } = state;
  return typeof autoSizeColumnsKey === 'object'
    ? autoSizeColumnsKey.key
    : autoSizeColumnsKey;
}

const SCROLL_RETRIES = 10;
const SCROLL_BOTTOM_OFFSET = 1;

/**
 * Creates the effects of one InfiniteTable root. Call `destroy()` when the
 * root is destroyed, after the managed state cleanup.
 *
 * The effects come in three groups, which the roots run at three points of
 * their setup: when one state change triggers several watchers, the order
 * they were created in decides which runs first, so each group keeps its
 * place relative to the watchers the roots keep (the menus, the brain
 * wiring).
 */
export function createRootEffects<T>(ctx: RootEffectsContext<T>): {
  /**
   * columns when grouping, the DataSource flags, auto size, the columns
   * hidden when grouping, the scrollbars - run them first
   */
  columnEffects: ControllerEffect<any>[];
  /**
   * scrolling the active row/cell into view, the editing callbacks - run
   * them after the menus
   */
  interactionEffects: ControllerEffect<any>[];
  /**
   * toggling the horizontal layout, the horizontal layout's page size, the
   * scroll stop delay, ready, the render range, the scroll stop callbacks,
   * scrollTopKey - run them after the brain wiring (updateBrain)
   */
  layoutEffects: ControllerEffect<any>[];
  destroy: () => void;
} {
  const { state, dataSourceState, eventHandlerContext } = ctx;
  const {
    getState,
    actions,
    api,
    getComputed,
    getDataSourceState,
    getDataSourceMasterContext,
    dataSourceActions,
    dataSourceApi,
  } = eventHandlerContext;

  const cleanups: VoidFunction[] = [];

  // ---- the cells publish raw events into the keyDown/cellClick/cellMouseDown
  // subscription callbacks; they go to the shared handlers (keyboard
  // navigation, keyboard & click selection, editing triggers, keyboard
  // shortcuts) - React: useDOMEventHandlers
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

  // ---- the CSS variable values (React: the subscriptions in useComputed)
  cleanups.push(
    getState().onRowHeightCSSVarChange.onChange((value) => {
      const rowHeight = getRowHeightFromCSSValue(value as any, getState());
      if (rowHeight != null) {
        actions.rowHeight = rowHeight;
      }
    }),
  );
  cleanups.push(
    getState().onFlashingDurationCSSVarChange.onChange((flashingDuration) => {
      const num = flashingDuration ? (flashingDuration as number) * 1 : null;
      if (num != null && !isNaN(num)) {
        actions.flashingDurationCSSVarValue = num;
      }
    }),
  );
  cleanups.push(
    getState().onRowDetailHeightCSSVarChange.onChange((rowDetailHeight) => {
      if (rowDetailHeight) {
        actions.rowDetailHeight = rowDetailHeight as any;
      }
    }),
  );
  cleanups.push(
    getState().onColumnHeaderHeightCSSVarChange.onChange((value) => {
      const columnHeaderHeight = getColumnHeaderHeightFromCSSValue(
        value as any,
        getState(),
      );
      if (columnHeaderHeight != null) {
        actions.columnHeaderHeight = columnHeaderHeight;
      }
    }),
  );

  const columnEffects: ControllerEffect<any>[] = [];
  const interactionEffects: ControllerEffect<any>[] = [];
  const layoutEffects: ControllerEffect<any>[] = [];

  // ---- columns when grouping (React: useColumnsWhenGrouping): generates the
  // group columns and puts them first in the column order
  const toggleGroupRow = (groupKeys: any[]) => {
    api.toggleGroupRow(groupKeys);
  };
  columnEffects.push(
    defineEffect({
      name: 'columnsWhenGrouping',
      timing: 'state',
      immediate: true,
      deps: () => {
        const s = state();
        const ds = dataSourceState();
        return {
          columns: s.columns,
          groupBy: ds.groupBy,
          pivotBy: ds.pivotBy,
          selectionMode: ds.selectionMode,
          hideColumnWhenGrouped: s.hideColumnWhenGrouped,
          groupColumn: s.groupColumn,
          groupRenderStrategy: s.groupRenderStrategy,
          pivotColumns: s.pivotColumns,
          pivotTotalColumnPosition: s.pivotTotalColumnPosition,
          pivotColumn: s.pivotColumn,
        };
      },
      run: () => {
        const s = getState();
        const ds = getDataSourceState();

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
            toggleGroupRow,
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
    }),
  );

  // ---- the DataSource flags the table owns (React: useColumnsWhen, useComputed)

  // the DataSource generates group rows unless the render strategy is inline
  columnEffects.push(
    defineEffect({
      name: 'generateGroupRows',
      timing: 'state',
      immediate: true,
      deps: () => ({ groupRenderStrategy: state().groupRenderStrategy }),
      run: ({ current: { groupRenderStrategy } }) => {
        dataSourceActions.generateGroupRows = groupRenderStrategy !== 'inline';
      },
    }),
  );
  // the DataSource pivot pipeline needs this flag to decide whether
  // single-aggregation pivots get their own column group
  columnEffects.push(
    defineEffect({
      name: 'showSeparatePivotColumnForSingleAggregation',
      timing: 'state',
      immediate: true,
      deps: () => ({
        showSeparatePivotColumnForSingleAggregation:
          state().showSeparatePivotColumnForSingleAggregation,
      }),
      run: ({ current: { showSeparatePivotColumnForSingleAggregation } }) => {
        dataSourceActions.showSeparatePivotColumnForSingleAggregation =
          showSeparatePivotColumnForSingleAggregation as any;
      },
    }),
  );
  // the totals column positions go into the DataSource, which generates the
  // pivot total/grand-total columns
  columnEffects.push(
    defineEffect({
      name: 'pivotTotalColumnPosition',
      timing: 'state',
      immediate: true,
      deps: () => ({
        pivotTotalColumnPosition: state().pivotTotalColumnPosition,
      }),
      run: ({ current: { pivotTotalColumnPosition } }) => {
        dataSourceActions.pivotTotalColumnPosition =
          pivotTotalColumnPosition as any;
      },
    }),
  );
  columnEffects.push(
    defineEffect({
      name: 'pivotGrandTotalColumnPosition',
      timing: 'state',
      immediate: true,
      deps: () => ({
        pivotGrandTotalColumnPosition: state().pivotGrandTotalColumnPosition,
      }),
      run: ({ current: { pivotGrandTotalColumnPosition } }) => {
        if (pivotGrandTotalColumnPosition != undefined) {
          dataSourceActions.pivotGrandTotalColumnPosition =
            pivotGrandTotalColumnPosition as any;
        }
      },
    }),
  );

  // ---- auto size columns (React: useAutoSizeColumns)
  let lastExecutedAutoSizeKey: string | number | null = null;
  let removeAutoSizeRangeListener: VoidFunction | null = null;
  cleanups.push(() => removeAutoSizeRangeListener?.());

  columnEffects.push(
    defineEffect({
      name: 'autoSizeColumnsOnRenderRangeChange',
      timing: 'state',
      immediate: true,
      deps: () => ({ brain: state().brain }),
      run: ({ current: { brain } }) => {
        removeAutoSizeRangeListener?.();
        removeAutoSizeRangeListener = brain.onRenderRangeChange(() => {
          const key = getAutoSizeKey(getState());
          if (key == null) {
            return;
          }
          // compare the key, not the prop: for an object prop
          // ({ key, columnsToResize, ... }) the prop never equals the last
          // executed key, which re-sized the columns on every range change
          if (key !== lastExecutedAutoSizeKey) {
            ctx.autoSizeRefreshId.set(ctx.autoSizeRefreshId.peek() + 1);
          }
        });
      },
    }),
  );

  columnEffects.push(
    defineEffect({
      name: 'autoSizeColumns',
      timing: 'dom',
      immediate: true,
      deps: () => ({
        key: getAutoSizeKey(state()),
        ready: state().ready,
        refreshId: ctx.autoSizeRefreshId.get(),
      }),
      run: () => {
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
    }),
  );

  // ---- hidden columns (React: useHideColumns in useColumnsWhen.ts)

  // hideEmptyGroupColumns (React: a useLayoutEffect)
  columnEffects.push(
    defineEffect({
      name: 'hideEmptyGroupColumns',
      timing: 'state',
      immediate: true,
      deps: () => {
        const s = state();
        const ds = dataSourceState();
        return {
          groupRenderStrategy: s.groupRenderStrategy,
          originalLazyGroupDataChangeDetect:
            ds.originalLazyGroupDataChangeDetect,
          groupBy: ds.groupBy,
          groupByMap: ctx.groupByMap(),
          computedColumns: s.computedColumns,
          dataArray: s.hideEmptyGroupColumns ? ds.dataArray : null,
          groupRowsState: s.hideEmptyGroupColumns ? ds.groupRowsState : null,
          groupRowsIndexesInDataArray: s.hideEmptyGroupColumns
            ? ds.groupRowsIndexesInDataArray
            : null,
          hideEmptyGroupColumns: s.hideEmptyGroupColumns,
        };
      },
      run: () => {
        const s = getState();
        const ds = getDataSourceState();
        if (s.groupRenderStrategy !== 'multi-column') {
          return;
        }
        const groupByMap = ctx.groupByMap();

        const computedGroupColumns = getGroupColumnsForComputedColumns(
          s.computedColumns,
          groupByMap,
        );

        const newColumnVisibility =
          getColumnVisibilityForHideEmptyGroupColumns<any>({
            computedGroupColumns,
            columnVisibility: s.columnVisibility,
            hideEmptyGroupColumns: s.hideEmptyGroupColumns,
            groupRowsIndexesInDataArray: ds.groupRowsIndexesInDataArray,
            dataArray: ds.dataArray,
            groupBy: ds.groupBy,
            groupByMap,
          } as any);

        if (!shallowEqualObjects(s.columnVisibility, newColumnVisibility)) {
          actions.columnVisibility = newColumnVisibility;
        }
      },
    }),
  );

  // column.defaultHiddenWhenGroupedBy and hideColumnWhenGrouped
  columnEffects.push(
    defineEffect({
      name: 'hideColumnsWhenGrouped',
      timing: 'state',
      immediate: true,
      deps: () => {
        const s = state();
        return {
          computedColumns: s.computedColumns,
          columnTypes: s.columnTypes,
          groupBy: dataSourceState().groupBy,
          groupByMap: ctx.groupByMap(),
          hideColumnWhenGrouped: s.hideColumnWhenGrouped,
        };
      },
      run: () => {
        const s = getState();
        const groupByMap = ctx.groupByMap();
        const isGrouped = getDataSourceState().groupBy.length > 0;

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
                groupByMap.get(col.field)) ||
              (typeof col.defaultHiddenWhenGroupedBy === 'string' &&
                groupByMap.get(col.defaultHiddenWhenGroupedBy as any)) ||
              (typeof col.defaultHiddenWhenGroupedBy === 'object' &&
                Object.keys(col.defaultHiddenWhenGroupedBy).reduce(
                  (acc: boolean, field) => acc || groupByMap.has(field as any),
                  false,
                ));

            if (hideWhenGrouped) {
              if (newColumnVisibilityForGrouping[id] !== false) {
                if ((columnVisibility as any)[id] === false) {
                  // already specified as invisible: not in the list of
                  // columns made invisible by the grouping rules
                  return;
                }
                // should be hidden and was not already
                newColumnVisibilityForGrouping[id] = false;
                updatedVisibilityWhenGrouping = true;
                newlyHiddenColumns.add(id);
              }
            } else {
              if (newColumnVisibilityForGrouping[id] === false) {
                // should be visible and was not already
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
    }),
  );

  // ---- scrollbars (React: useScrollbars)
  let removeScrollbarsRenderCountChange: VoidFunction | null = null;
  cleanups.push(() => removeScrollbarsRenderCountChange?.());

  columnEffects.push(
    defineEffect({
      name: 'scrollbarsFromBrain',
      timing: 'state',
      immediate: true,
      deps: () => ({ brain: state().brain }),
      run: ({ current: { brain } }) => {
        removeScrollbarsRenderCountChange?.();
        removeScrollbarsRenderCountChange = brain.onRenderCountChange(() => {
          const { scrollTopMax, scrollLeftMax } = brain;
          const vertical = scrollTopMax > 0;
          const horizontal = scrollLeftMax > 0;
          const prev = ctx.scrollbars.peek();
          if (prev.vertical !== vertical || prev.horizontal !== horizontal) {
            ctx.scrollbars.set({ vertical, horizontal });
          }
        });
      },
    }),
  );

  columnEffects.push(
    defineEffect({
      name: 'scrollbarsChange',
      timing: 'state',
      deps: () => ({ scrollbars: ctx.scrollbars.get() }),
      run: ({ current: { scrollbars } }) => {
        const ds = getDataSourceState();
        const { onScrollbarsChange } = getState();
        if (onScrollbarsChange && ds.updatedAt && ds.dataArray.length) {
          onScrollbarsChange(scrollbars);
        }
        ds.notifyScrollbarsChange(scrollbars);
      },
    }),
  );

  // ---- scroll the active row/cell into view (React: useScrollToActiveRow,
  // useScrollToActiveCell)
  const scrollToActiveEffect = <ACTIVE>(
    name: string,
    getActive: () => ACTIVE | null | undefined,
    scroll: (active: ACTIVE) => boolean,
  ) => {
    let didScroll = false;
    let rafId: number | null = null;

    cleanups.push(() => {
      if (rafId != null) {
        cancelAnimationFrame(rafId);
      }
    });

    return defineEffect({
      name,
      timing: 'state',
      immediate: true,
      deps: () => ({
        active: getActive(),
        dataArrayLength: dataSourceState().dataArray.length,
      }),
      run: (info) => {
        const { active } = info.current;
        const prevActive = previousDeps(info).active;
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
    });
  };

  interactionEffects.push(
    scrollToActiveEffect(
      'scrollToActiveRow',
      () => state().activeRowIndex,
      (activeRowIndex: number) =>
        api.scrollRowIntoView(activeRowIndex, { offset: 0 }),
    ),
  );
  interactionEffects.push(
    scrollToActiveEffect(
      'scrollToActiveCell',
      () => state().activeCellIndex,
      (activeCellIndex: [number, number]) =>
        api.scrollCellIntoView(activeCellIndex[0], activeCellIndex[1], {
          offset: 30,
        }),
    ),
  );

  // ---- editing callbacks (React: useEditingCallbackProps): the
  // onEditCancelled/onEditRejected/onEditAccepted/onEditPersist* callbacks;
  // the accepted branch also calls api.persistEdit - which is what writes
  // the value into the DataSource.
  // The edited row is resolved by primary key: the edit may have moved or
  // removed it by the time a callback runs. `null` = the row is gone.
  const editingCellContext = () =>
    getEditingCellContext<T>(
      {
        getComputed,
        getState,
        getDataSourceState,
        getDataSourceMasterContext,
        actions,
        dataSourceActions,
        api,
        dataSourceApi,
      },
      getState().editingCell!,
    );

  interactionEffects.push(
    defineEffect({
      name: 'editingCallbacks',
      timing: 'state',
      deps: () => {
        const ec = state().editingCell;
        return {
          cancelled: ec && !ec.active ? ec.cancelled : undefined,
          rejected:
            ec && !ec.active && ec.accepted instanceof Error
              ? ec.accepted
              : undefined,
          accepted: !!(
            ec &&
            !ec.active &&
            !ec.cancelled &&
            ec.accepted === true
          ),
          persisted: ec?.persisted,
          active: ec?.active,
        };
      },
      run: (info) => {
        const { cancelled, rejected, accepted, persisted, active } =
          info.current;
        const prev = previousDeps(info);
        // each branch fires only on its own transition - the semantics of
        // the separate dependency-keyed effects in React
        if (cancelled && cancelled !== prev.cancelled) {
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

        if (rejected && rejected !== prev.rejected) {
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

        if (accepted && accepted !== prev.accepted) {
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

        if (persisted && persisted !== prev.persisted) {
          const editingCell = getState().editingCell;
          if (editingCell) {
            const callbackName =
              persisted instanceof Error
                ? 'onEditPersistError'
                : 'onEditPersistSuccess';
            if (getState()[callbackName]) {
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
        if (!active && prev.active) {
          api.focus();
        }
      },
    }),
  );

  // ---- toggling the horizontal layout needs new brains + renderers (the
  // brain type differs) - React: useToggleWrapRowsHorizontally
  layoutEffects.push(
    defineEffect({
      name: 'toggleWrapRowsHorizontally',
      timing: 'dom',
      deps: () => ({ wrapRowsHorizontally: state().wrapRowsHorizontally }),
      run: ({ current: { wrapRowsHorizontally } }) => {
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
    }),
  );

  // ---- keeps the DataSource rowsPerPage + repeatWrappedGroupRows in sync
  // with the brain when rows wrap horizontally (React: useHorizontalLayout)
  let horizontalLayoutTimeoutId: ReturnType<typeof setTimeout> | null = null;
  let removeVerticalRenderRangeSub: VoidFunction | null = null;

  const cleanupHorizontalLayout = () => {
    if (horizontalLayoutTimeoutId) {
      clearTimeout(horizontalLayoutTimeoutId);
      horizontalLayoutTimeoutId = null;
    }
    removeVerticalRenderRangeSub?.();
    removeVerticalRenderRangeSub = null;
  };
  cleanups.push(cleanupHorizontalLayout);

  layoutEffects.push(
    defineEffect({
      name: 'horizontalLayout',
      timing: 'dom',
      immediate: true,
      deps: () => {
        const s = state();
        const ds = dataSourceState();
        return {
          brain: s.brain,
          wrapRowsHorizontally: s.wrapRowsHorizontally,
          groupBy: ds.groupBy,
          isTree: ds.isTree,
          repeatWrappedGroupRows: s.wrapRowsHorizontally
            ? s.repeatWrappedGroupRows
            : false,
        };
      },
      run: ({
        current: {
          brain,
          wrapRowsHorizontally,
          groupBy,
          isTree,
          repeatWrappedGroupRows,
        },
      }) => {
        cleanupHorizontalLayout();

        if (!wrapRowsHorizontally) {
          if (getDataSourceState().repeatWrappedGroupRows) {
            dataSourceActions.repeatWrappedGroupRows = false;
          }
          return;
        }

        const onVerticalRenderRangeChange = () => {
          const {
            rowsPerPage: currentRowsPerPage,
            repeatWrappedGroupRows: currentRepeatWrappedGroupRows,
          } = getDataSourceState();

          let changes = false;

          const rowsPerPage = brain.rowsPerPage;
          const newRowsPerPage =
            ((groupBy && groupBy.length > 0) || isTree) && rowsPerPage > 0
              ? rowsPerPage
              : null;

          if (currentRowsPerPage != newRowsPerPage) {
            dataSourceActions.rowsPerPage = newRowsPerPage;
            changes = true;
          }

          if (currentRepeatWrappedGroupRows != repeatWrappedGroupRows) {
            dataSourceActions.repeatWrappedGroupRows =
              repeatWrappedGroupRows ?? false;
            changes = true;
          }

          return changes;
        };

        onVerticalRenderRangeChange();

        removeVerticalRenderRangeSub = brain.onVerticalRenderRangeChange(() => {
          if (onVerticalRenderRangeChange()) {
            horizontalLayoutTimeoutId = setTimeout(() => {
              // by the time the render range changes, the DataSource has not
              // finished recomputing the artificial group rows, so the body
              // has to be re-rendered
              actions.forceBodyRerenderTimestamp = Date.now();
            });
          }
        });
      },
    }),
  );

  // ---- the scroll stop delay goes to the brain and to the DataSource
  layoutEffects.push(
    defineEffect({
      name: 'scrollStopDelay',
      timing: 'state',
      immediate: true,
      deps: () => ({ scrollStopDelay: state().scrollStopDelay }),
      run: ({ current: { scrollStopDelay } }) => {
        getState().brain.setScrollStopDelay(scrollStopDelay);
        dataSourceActions.scrollStopDelayUpdatedByTable = scrollStopDelay;
      },
    }),
  );

  // ---- the readiness hook of the tests/tooling (same contract as React's
  // index.tsx effect - the Playwright fixtures rely on it) + the onReady
  // callback, on every `ready` transition, the initial one included (React:
  // useCellRendering)
  layoutEffects.push(
    defineEffect({
      name: 'ready',
      timing: 'dom',
      immediate: true,
      deps: () => ({ ready: state().ready }),
      run: ({ current: { ready } }) => {
        if (
          typeof (globalThis as any)
            .__DO_NOT_USE_UNLESS_YOU_KNOW_WHAT_YOURE_DOING_IS_READY ===
          'function'
        ) {
          (
            globalThis as any
          ).__DO_NOT_USE_UNLESS_YOU_KNOW_WHAT_YOURE_DOING_IS_READY(
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
    }),
  );

  // these write back into the managed state, so they are precise watchers
  // (generated-action setters dispatch even for equal values)
  layoutEffects.push(
    defineEffect({
      name: 'readyWhenSized',
      timing: 'state',
      immediate: true,
      deps: () => ({ hasHeight: !!state().bodySize.height }),
      run: ({ current: { hasHeight } }) => {
        if (hasHeight) {
          actions.ready = true;
        }
      },
    }),
  );

  // ---- the render range goes to the DataSource (lazy loading) and to the
  // onRenderRangeChange callback (React: useCellRendering)
  let removeRenderRangeChange: VoidFunction | null = null;
  let removeRenderRangeChangeCallback: VoidFunction | null = null;
  cleanups.push(() => {
    removeRenderRangeChange?.();
    removeRenderRangeChangeCallback?.();
  });

  layoutEffects.push(
    defineEffect({
      name: 'renderRange',
      timing: 'state',
      immediate: true,
      deps: () => ({ brain: state().brain }),
      run: ({ current: { brain } }) => {
        removeRenderRangeChange?.();
        removeRenderRangeChange = brain.onVerticalRenderRangeChange(
          (renderRange: [number, number]) => {
            getDataSourceState().notifyRenderRangeChange({
              renderStartIndex: renderRange[0],
              renderEndIndex: renderRange[1],
            });
          },
        );

        removeRenderRangeChangeCallback?.();
        removeRenderRangeChangeCallback = brain.onRenderRangeChange((range) => {
          getState().onRenderRangeChange?.(range);
        });
      },
    }),
  );

  // ---- scroll stop -> onScrollToTop/onScrollToBottom/onScrollStop + the
  // livePagination cursor (React: useCellRendering)
  let scrollTopMax = 0;
  let removeScrollStopRenderCount: VoidFunction | null = null;
  let removeScrollStop: VoidFunction | null = null;
  cleanups.push(() => {
    removeScrollStopRenderCount?.();
    removeScrollStop?.();
  });

  layoutEffects.push(
    defineEffect({
      name: 'scrollStop',
      timing: 'state',
      immediate: true,
      deps: () => ({ brain: state().brain }),
      run: ({ current: { brain } }) => {
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
              dataSourceActions.cursorId =
                livePaginationCursor !== undefined
                  ? // with a `livePaginationCursor`, a new cursorId makes
                    // the DataSource fetch more data
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
      },
    }),
  );

  // ---- a new scrollTopKey scrolls the grid back to the top
  layoutEffects.push(
    defineEffect({
      name: 'scrollTopKey',
      timing: 'state',
      deps: () => ({ scrollTopKey: state().scrollTopKey }),
      run: () => {
        const scroller = getState().scrollerDOMRef.current;
        if (scroller) {
          scroller.scrollTop = 0;
        }
      },
    }),
  );

  return {
    columnEffects,
    interactionEffects,
    layoutEffects,
    destroy: () => {
      cleanups.forEach((cleanup) => cleanup());
    },
  };
}

/**
 * The column widths for the brain (React: useColumnSizeFn)
 */
export function getColumnSizeFn<T>(columns: InfiniteTableComputedColumn<T>[]) {
  return (index: number) => columns[index]?.computedWidth ?? 0;
}

/**
 * The rowspan for the brain, when a visible column has one (React:
 * useColumnRowspan)
 */
export function getRowspanFn<T>(
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

/**
 * The brain wiring (React: useYourBrain / useMatrixBrain): the pinned
 * columns, the column widths, the row height and the row/column counts.
 *
 * Not a ControllerEffect: the roots run it on every change of what it
 * reads - Vue with a watchEffect (its first run is in the setup), Angular
 * with an effect (its first run is in the first change detection).
 */
export function updateBrain<T>(params: {
  state: InfiniteTableState<T>;
  dataSourceState: DataSourceState<T>;
  computedColumns: {
    computedVisibleColumns: InfiniteTableComputedColumn<any>[];
    computedPinnedStartColumns: InfiniteTableComputedColumn<any>[];
    computedPinnedEndColumns: InfiniteTableComputedColumn<any>[];
  };
  /**
   * the computed row height: a rowHeight given as fn(rowInfo) is adapted to
   * fn(index); with row details, the height includes the expanded detail
   * height
   */
  getRowHeight: () => MatrixBrainOptions['rowHeight'];
  getDataSourceState: () => { dataArray: any[] };
}) {
  const {
    computedVisibleColumns,
    computedPinnedStartColumns,
    computedPinnedEndColumns,
  } = params.computedColumns;

  const brain = params.state.brain;

  brain.updateFixedCells({
    fixedColsStart: computedPinnedStartColumns.length,
    fixedColsEnd: computedPinnedEndColumns.length,
  });

  const rowHeight = params.getRowHeight();

  brain.update({
    colWidth: getColumnSizeFn(computedVisibleColumns),
    rowHeight,
    rows: params.dataSourceState.dataArray.length,
    cols: computedVisibleColumns.length,
    rowspan: getRowspanFn(computedVisibleColumns, params.getDataSourceState),
  } as any);
}
