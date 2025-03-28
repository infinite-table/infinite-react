import * as React from 'react';
import { RefObject } from 'react';

import { join } from '../../utils/join';
import { CSSNumericVariableWatch } from '../CSSNumericVariableWatch';

import {
  useDataSourceState,
  useDataSourceContextValue,
  useMasterDetailContext,
} from '../DataSource/publicHooks/useDataSourceState';
import { HeadlessTable } from '../HeadlessTable';

import {
  buildManagedComponent,
  useManagedComponentState,
} from '../hooks/useComponentState';
import { useLatest } from '../hooks/useLatest';
import { useResizeObserver } from '../ResizeObserver';

import { debounce } from '../utils/debounce';

import { InfiniteTableFooter } from './components/InfiniteTableFooter';
import { useInfiniteHeaderCell } from './components/InfiniteTableHeader/InfiniteTableHeaderCell';
import { TableHeaderWrapper } from './components/InfiniteTableHeader/InfiniteTableHeaderWrapper';
import { InfiniteTableLicenseFooter } from './components/InfiniteTableLicenseFooter';
import {
  useInfiniteColumnCell,
  useInfiniteColumnEditor,
} from './components/InfiniteTableRow/InfiniteTableColumnCell';
import { RowHoverCls } from './components/InfiniteTableRow/row.css';
import { LoadMask } from './components/LoadMask';
import { getImperativeApi } from './api/getImperativeApi';
import { useAutoSizeColumns } from './hooks/useAutoSizeColumns';
import { useCellRendering } from './hooks/useCellRendering';
import { useComputed } from './hooks/useComputed';
import { useDOMProps } from './hooks/useDOMProps';
import { useInfiniteTable } from './hooks/useInfiniteTable';
import { useLicense } from './hooks/useLicense/useLicense';

import { useScrollToActiveCell } from './hooks/useScrollToActiveCell';
import { useScrollToActiveRow } from './hooks/useScrollToActiveRow';

import { getInfiniteTableContext } from './InfiniteTableContext';
import { internalProps, rootClassName } from './internalProps';

import {
  forwardProps,
  getMappedCallbacks,
  mapPropsToState,
  initSetupState,
  cleanupState,
  getCellSelector,
} from './state/getInitialState';
import { columnHeaderHeightName, ThemeVars } from './vars.css';

import type {
  InfiniteTableContextValue,
  InfiniteTableProps,
  InfiniteTableState,
} from './types';
import {
  position,
  zIndex,
  top,
  left,
  flex,
  transformTranslateZero,
} from './utilities.css';
import { toCSSVarName } from './utils/toCSSVarName';
import { useDOMEventHandlers } from './eventHandlers';
import { useColumnMenu } from './hooks/useColumnMenu';
import { FocusDetect } from './components/FocusDetect';
import { useEditingCallbackProps } from './hooks/useEditingCallbackProps';
import { useInfiniteColumnFilterEditor } from './components/InfiniteTableHeader/InfiniteTableColumnHeaderFilter';
import { useColumnFilterOperatorMenu } from './hooks/useColumnFilterOperatorMenu';
import {
  useCellContextMenu,
  useTableContextMenu,
} from './hooks/useContextMenu';
import { selectParentUntil } from '../../utils/selectParent';
import {
  CellContextMenuLocationWithEvent,
  ContextMenuLocationWithEvent,
} from './types/InfiniteTableState';
import { eventMatchesKeyboardShortcut } from '../utils/hotkey';
import { Renderable } from '../types/Renderable';
import { HScrollSyncContent } from './components/HScrollSyncContent';
import { useGridScroll } from './hooks/useGridScroll';
import { useVisibleColumnSizes } from './hooks/useVisibleColumnSizes';

import { DEBUG_NAME } from './InfiniteDebugName';
import { useToggleWrapRowsHorizontally } from './hooks/useToggleWrapRowsHorizontally';
import { useHorizontalLayout } from './hooks/useHorizontalLayout';
import { useDebugMode } from './hooks/useDebugMode';
import { useInfinitePortalContainer } from './hooks/useInfinitePortalContainer';

export const InfiniteTableClassName = internalProps.rootClassName;

const HOVERED_CLASS_NAMES = [RowHoverCls, 'InfiniteColumnCell--hovered'];

const { ManagedComponentContextProvider: InfiniteTableRoot } =
  buildManagedComponent({
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
    } as Record<keyof InfiniteTableProps<any>, true>,

    //@ts-ignore
    mappedCallbacks: getMappedCallbacks(),
    // @ts-ignore
    getParentState: () => useDataSourceState(),
    debugName: DEBUG_NAME,
  });

function InfiniteTableHeader<T>() {
  const context = useInfiniteTable<T>();

  const { state: componentState, getComputed } = context;
  const { header, brain, headerBrain, wrapRowsHorizontally } = componentState;
  const { scrollbars } = getComputed();

  return header ? (
    <TableHeaderWrapper
      wrapRowsHorizontally={!!wrapRowsHorizontally}
      bodyBrain={brain}
      headerBrain={headerBrain}
      scrollbars={scrollbars}
    />
  ) : null;
}

const InfiniteTableBodyCls = join(
  `${rootClassName}Body`,
  position.relative,
  flex['1'],
  transformTranslateZero,
);

function InfiniteTableBodyContainer(
  props: React.HTMLAttributes<HTMLDivElement>,
) {
  return (
    <div
      {...props}
      className={
        props.className
          ? join(InfiniteTableBodyCls, props.className)
          : InfiniteTableBodyCls
      }
    />
  );
}
function InfiniteTableBody<T>() {
  const context = useInfiniteTable<T>();

  const masterContext = useMasterDetailContext();
  const { state: componentState, getComputed, api } = context;
  const {
    renderer,
    onRenderUpdater,
    debugId,
    keyboardNavigation,
    activeRowIndex,
    loadingText,
    scrollStopDelay,
    brain,
    scrollerDOMRef,
    components,
    bodySize,
    activeCellIndex,
    rowDetailRenderer,
    showHoverRows,
    wrapRowsHorizontally,
    domProps,
    domRef,
  } = componentState;

  const LoadMaskCmp = components?.LoadMask ?? LoadMask;

  const computed = getComputed();
  const { computedRowHeight, computedRowSizeCacheForDetails } = computed;

  const activeCellRowHeight =
    computedRowSizeCacheForDetails?.getRowHeight || computedRowHeight;

  const {
    componentState: { loading },
  } = useDataSourceContextValue<T>();

  const onContextMenu = React.useCallback((event: React.MouseEvent) => {
    const state = context.getState();
    const target = event.target as HTMLElement;

    if (!masterContext && (event as any)._from_row_detail) {
      // originating from detail grid.
      return;
    }

    if (masterContext) {
      (event as any)._from_row_detail = true;
    }

    const cell = selectParentUntil(
      target,
      getCellSelector(),
      state.domRef.current,
    );

    let columnId: string | undefined;
    let colIndex: number | undefined;
    let rowId: string | undefined;
    let rowIndex: number | undefined;

    if (cell) {
      colIndex = Number(cell.dataset.colIndex);
      rowIndex = Number(cell.dataset.rowIndex);

      columnId = context.getComputed().computedVisibleColumns[colIndex].id;
      rowId = context.dataSourceApi.getRowInfoArray()[rowIndex].id;
    }

    const param: ContextMenuLocationWithEvent = {
      columnId,
      colIndex,
      rowId,
      rowIndex,
      event,
      target: cell ?? (event.target as HTMLElement),
    };

    if (cell) {
      state.cellContextMenu(param as CellContextMenuLocationWithEvent);
    }
    state.contextMenu(param);
  }, []);

  const { renderCell, renderDetailRow } = useCellRendering({
    imperativeApi: api,
    getComputed,
    domRef,

    bodySize,
    computed,
  });

  const { autoFocus, tabIndex } = domProps ?? {};

  useToggleWrapRowsHorizontally();

  return (
    <InfiniteTableBodyContainer onContextMenu={onContextMenu}>
      <HeadlessTable
        forceRerenderTimestamp={componentState.forceBodyRerenderTimestamp}
        debugId={debugId}
        tabIndex={tabIndex ?? 0}
        autoFocus={autoFocus ?? undefined}
        activeRowIndex={
          componentState.ready && keyboardNavigation === 'row'
            ? activeRowIndex
            : null
        }
        activeCellIndex={
          componentState.ready &&
          keyboardNavigation === 'cell' &&
          // we want to hide the active cell indicator while column reodering is happening
          !componentState.columnReorderDragColumnId
            ? activeCellIndex
            : null
        }
        scrollStopDelay={scrollStopDelay}
        renderer={renderer}
        wrapRowsHorizontally={wrapRowsHorizontally}
        onRenderUpdater={onRenderUpdater}
        brain={brain}
        activeCellRowHeight={activeCellRowHeight}
        renderCell={renderCell}
        renderDetailRow={rowDetailRenderer ? renderDetailRow : undefined}
        cellHoverClassNames={showHoverRows ? HOVERED_CLASS_NAMES : undefined}
        scrollerDOMRef={scrollerDOMRef}
        scrollVarHostRef={domRef}
      ></HeadlessTable>

      <LoadMaskCmp visible={loading}>{loadingText}</LoadMaskCmp>
    </InfiniteTableBodyContainer>
  );
}

// const InfiniteTableFactory = <T extends unknown>(
//   _cfg: InfiniteTableFactoryConfig = {},
// ) => {
export const InfiniteTableComponent = React.memo(
  function InfiniteTableComponent<T>() {
    const context = useInfiniteTable<T>();

    const masterContext = useMasterDetailContext();
    const { state: componentState, api, children: initialChildren } = context;
    const {
      componentState: { dataArray },
      getState: getDataSourceState,
      componentActions: dataSourceActions,
    } = useDataSourceContextValue<T>();

    const {
      domRef,
      portalDOMRef,

      onRowHeightCSSVarChange,
      onFlashingDurationCSSVarChange,
      onRowDetailHeightCSSVarChange,
      onColumnHeaderHeightCSSVarChange,
      rowHeightCSSVar,
      rowDetailHeightCSSVar,
      columnHeaderHeightCSSVar,

      scrollStopDelay,
      brain,
      activeRowIndex,
      activeCellIndex,
    } = componentState;
    let { licenseKey } = componentState;
    if (!licenseKey && InfiniteTable.licenseKey) {
      licenseKey = InfiniteTable.licenseKey;
    }

    useScrollToActiveRow(activeRowIndex, dataArray.length, api);
    useScrollToActiveCell(activeCellIndex, dataArray.length, api);
    // useRowSelection();

    const { onKeyDown } = useDOMEventHandlers<T>();

    React.useEffect(() => {
      const dataSourceState = getDataSourceState();
      const onChange = debounce(
        (renderRange: [number, number]) => {
          dataSourceState.notifyRenderRangeChange({
            renderStartIndex: renderRange[0],
            renderEndIndex: renderRange[1],
          });
        },
        { wait: scrollStopDelay },
      );

      return brain.onVerticalRenderRangeChange(onChange);
    }, [brain, scrollStopDelay]);

    const licenseValid = useLicense(licenseKey);

    const {
      // remove autoFocus and tabIndex from the domProps
      // that will be spread on the root DOM element
      // as they are meant for the scroller element
      autoFocus: _,
      tabIndex: __,
      ...initialDOMProps
    } = componentState.domProps ?? {};

    const domProps = useDOMProps<T>(initialDOMProps);

    React.useEffect(() => {
      brain.setScrollStopDelay(scrollStopDelay);
      dataSourceActions.scrollStopDelayUpdatedByTable = scrollStopDelay;
    }, [scrollStopDelay]);

    useAutoSizeColumns();

    useHorizontalLayout();

    useEditingCallbackProps<T>();

    const { menuPortal } = useColumnMenu();
    const { menuPortal: cellContextMenuPortal } = useCellContextMenu();
    const { menuPortal: tableContextMenuPortal } = useTableContextMenu();
    const { menuPortal: filterOperatorMenuPortal } =
      useColumnFilterOperatorMenu();

    React.useEffect(() => {
      if (
        typeof (globalThis as any)
          .__DO_NOT_USE_UNLESS_YOU_KNOW_WHAT_YOURE_DOING_IS_READY === 'function'
      ) {
        (
          globalThis as any
        ).__DO_NOT_USE_UNLESS_YOU_KNOW_WHAT_YOURE_DOING_IS_READY(
          componentState.id,
          componentState.ready,
          context.api,
          context,
        );
      }

      if (__DEV__) {
        (globalThis as any).infiniteApi = context.api;
      }
    }, [componentState.ready]);

    const debugId = useDebugMode();

    React.useEffect(() => {
      // we can make this more elegant
      // the main idea:
      // if we are a detail grid, we want to use the master grid's portal
      // so menus are rendered in the container of the top-most (master) grid - since we can
      // have multiple levels of nesting
      if (masterContext) {
        portalDOMRef.current =
          masterContext.getMasterState().portalDOMRef.current;
      }
    }, []);

    const children = initialChildren ?? (
      <>
        <InfiniteTableHeader />
        <InfiniteTableBody />
      </>
    );

    return (
      <div
        data-debug-id={debugId}
        onKeyDown={onKeyDown}
        ref={domRef}
        {...domProps}
      >
        {children}
        <div
          ref={portalDOMRef as RefObject<HTMLDivElement>}
          className={join(
            `${rootClassName}Portal`,
            zIndex[10_000_000],
            position.absolute,
            top[0],
            left[0],
          )}
        >
          {menuPortal}
          {cellContextMenuPortal}
          {tableContextMenuPortal}
          {filterOperatorMenuPortal}
        </div>
        {rowHeightCSSVar ? (
          <CSSNumericVariableWatch
            key={'row-height'}
            varName={rowHeightCSSVar}
            onChange={onRowHeightCSSVarChange}
          />
        ) : null}

        <CSSNumericVariableWatch
          key={'flashing-duration'}
          allowInts
          varName={ThemeVars.components.Cell.flashingDuration}
          onChange={onFlashingDurationCSSVarChange}
        />

        {rowDetailHeightCSSVar ? (
          <CSSNumericVariableWatch
            key={'row-detail-height'}
            varName={rowDetailHeightCSSVar}
            onChange={onRowDetailHeightCSSVarChange}
          />
        ) : null}
        {columnHeaderHeightCSSVar ? (
          <CSSNumericVariableWatch
            key={'column-header-height'}
            varName={columnHeaderHeightCSSVar}
            onChange={onColumnHeaderHeightCSSVarChange}
          />
        ) : null}
        {licenseValid ? null : <InfiniteTableLicenseFooter />}
        <FocusDetect<T> />
      </div>
    );
  },
);
function InfiniteTableContextProvider<T>({
  children,
}: {
  children?: Renderable;
}) {
  const { componentActions, componentState } =
    useManagedComponentState<InfiniteTableState<T>>();

  const { scrollerDOMRef, scrollTopKey } = componentState;

  const computed = useComputed<T>();
  const getComputed = useLatest(computed);
  const getState = useLatest(componentState);

  const masterContext = useMasterDetailContext();
  if (__DEV__ && !masterContext) {
    (globalThis as any).getState = getState;
    (globalThis as any).getComputed = getComputed;
    (globalThis as any).componentActions = componentActions;
    (globalThis as any).masterBrain = componentState.brain;
  }

  const {
    getState: getDataSourceState,
    componentActions: dataSourceActions,
    getDataSourceMasterContext,
    api: dataSourceApi,
  } = useDataSourceContextValue<T>();

  const [imperativeApi] = React.useState(() => {
    return getImperativeApi({
      getComputed,
      getState,
      getDataSourceState,
      getDataSourceMasterContext,
      dataSourceApi,
      actions: componentActions,
      dataSourceActions,
    });
  });

  const contextValue: InfiniteTableContextValue<T> = {
    actions: componentActions,
    state: componentState,
    computed,
    dataSourceActions,
    getDataSourceMasterContext,
    getDataSourceState,
    getComputed,
    getState,
    api: imperativeApi,
    dataSourceApi,
    children,
  };

  useResizeObserver(
    scrollerDOMRef,
    (size) => {
      const bodySize = {
        width: size.width, //- reservedScrollSpace,
        height: size.height,
      };

      // TODO this was here before, but cant remember why
      // bodySize.width = scrollerDOMRef.current?.scrollWidth ?? bodySize.width;

      componentActions.bodySize = bodySize;
    },
    { earlyAttach: true, debounce: 50 },
  );

  React.useEffect(() => {
    if (scrollerDOMRef.current) {
      scrollerDOMRef.current.scrollTop = 0;
    }
  }, [scrollTopKey, scrollerDOMRef]);

  const TableContext = getInfiniteTableContext<T>();

  return (
    <TableContext.Provider value={contextValue}>
      <InfiniteTableComponent />
    </TableContext.Provider>
  );
}

const DEFAULT_ROW_HEIGHT = 40;
const DEFAULT_COLUMN_HEADER_HEIGHT = toCSSVarName(columnHeaderHeightName);

type InfiniteTableComponent = {
  <T>(props: InfiniteTableProps<T>): React.JSX.Element;
  licenseKey?: string;
  Header: () => React.JSX.Element | null;
  Body: () => React.JSX.Element | null;
  Footer: () => React.JSX.Element | null;
  HScrollSyncContent: typeof HScrollSyncContent;
};
const InfiniteTable: InfiniteTableComponent = function <T>(
  props: InfiniteTableProps<T>,
) {
  const table = (
    //@ts-ignore
    <InfiniteTableRoot
      repeatWrappedGroupRows={!!props.wrapRowsHorizontally}
      rowHeight={DEFAULT_ROW_HEIGHT}
      columnHeaderHeight={DEFAULT_COLUMN_HEADER_HEIGHT}
      {...props}
    >
      <InfiniteTableContextProvider children={props.children} />
    </InfiniteTableRoot>
  );
  if (__DEV__) {
    return <React.StrictMode>{table}</React.StrictMode>;
  }
  return table;
};

InfiniteTable.Header = InfiniteTableHeader;
InfiniteTable.Body = InfiniteTableBody;
InfiniteTable.HScrollSyncContent = HScrollSyncContent;
InfiniteTable.Footer = () => <InfiniteTableFooter />;

export { InfiniteTable };

export * from './types';

export {
  useInfiniteColumnCell,
  useInfiniteHeaderCell,
  useInfiniteColumnEditor,
  useInfiniteColumnFilterEditor,
  useInfinitePortalContainer,
  eventMatchesKeyboardShortcut,
  useGridScroll,
  useVisibleColumnSizes,
};
