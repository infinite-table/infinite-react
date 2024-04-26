import * as React from 'react';
import { RefObject } from 'react';

import { join } from '../../utils/join';
import { CSSNumericVariableWatch } from '../CSSNumericVariableWatch';

import {
  useDataSource,
  useDataSourceContextValue,
  useMasterDetailContext,
} from '../DataSource/publicHooks/useDataSource';
import { HeadlessTable } from '../HeadlessTable';

import {
  getComponentStateRoot,
  useComponentState,
} from '../hooks/useComponentState';
import { useLatest } from '../hooks/useLatest';
import { useResizeObserver } from '../ResizeObserver';

import { debounce } from '../utils/debounce';

import { InfiniteTableBody } from './components/InfiniteTableBody';
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
  mapPropsToState,
  initSetupState,
  cleanupState,
  getCellSelector,
} from './state/getInitialState';
import { columnHeaderHeightName } from './vars.css';

import type {
  InfiniteTableContextValue,
  InfiniteTableProps,
  InfiniteTableState,
} from './types';
import { position, zIndex, top, left } from './utilities.css';
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

export const InfiniteTableClassName = internalProps.rootClassName;

const HOVERED_CLASS_NAMES = [RowHoverCls, 'InfiniteColumnCell--hovered'];

const InfiniteTableRoot = getComponentStateRoot({
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
  // @ts-ignore
  getParentState: () => useDataSource(),
  debugName: 'InfiniteTable',
});

// const InfiniteTableFactory = <T extends unknown>(
//   _cfg: InfiniteTableFactoryConfig = {},
// ) => {
export const InfiniteTableComponent = React.memo(
  function InfiniteTableComponent<T>() {
    const context = useInfiniteTable<T>();

    const masterContext = useMasterDetailContext();
    const { state: componentState, getComputed, computed, api } = context;
    const {
      componentState: { loading, dataArray },
      getState: getDataSourceState,
      componentActions: dataSourceActions,
    } = useDataSourceContextValue<T>();

    const {
      domRef,
      scrollerDOMRef,
      portalDOMRef,

      licenseKey,
      loadingText,

      rowDetailRenderer,
      header,
      onRowHeightCSSVarChange,
      onRowDetailHeightCSSVarChange,
      onColumnHeaderHeightCSSVarChange,
      rowHeightCSSVar,
      rowDetailHeightCSSVar,
      columnHeaderHeightCSSVar,
      components,
      scrollStopDelay,
      brain,
      headerBrain,
      renderer,
      keyboardNavigation,
      activeRowIndex,
      activeCellIndex,
      onRenderUpdater,
      debugId,
    } = componentState;

    useScrollToActiveRow(activeRowIndex, dataArray.length, api);
    useScrollToActiveCell(activeCellIndex, dataArray.length, api);
    // useRowSelection();

    const { onKeyDown } = useDOMEventHandlers<T>();

    const { bodySize } = componentState;

    const { scrollbars, computedRowHeight, computedRowSizeCacheForDetails } =
      computed;

    const activeCellRowHeight =
      computedRowSizeCacheForDetails?.getRowHeight || computedRowHeight;

    const { renderCell, renderDetailRow } = useCellRendering({
      imperativeApi: api,
      getComputed,
      domRef: componentState.domRef,

      bodySize,
      computed,
    });

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

    const domProps = useDOMProps<T>(componentState.domProps);

    const LoadMaskCmp = components?.LoadMask ?? LoadMask;

    React.useEffect(() => {
      brain.setScrollStopDelay(scrollStopDelay);
      dataSourceActions.scrollStopDelayUpdatedByTable = scrollStopDelay;
    }, [scrollStopDelay]);

    useAutoSizeColumns();

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
    return (
      <div onKeyDown={onKeyDown} ref={domRef} {...domProps}>
        {header ? (
          <TableHeaderWrapper
            bodyBrain={brain}
            headerBrain={headerBrain}
            scrollbars={scrollbars}
          />
        ) : null}

        <InfiniteTableBody onContextMenu={onContextMenu}>
          <HeadlessTable
            debugId={debugId}
            tabIndex={0}
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
            onRenderUpdater={onRenderUpdater}
            brain={brain}
            activeCellRowHeight={activeCellRowHeight}
            renderCell={renderCell}
            renderDetailRow={rowDetailRenderer ? renderDetailRow : undefined}
            cellHoverClassNames={HOVERED_CLASS_NAMES}
            scrollerDOMRef={scrollerDOMRef}
          ></HeadlessTable>

          <LoadMaskCmp visible={loading}>{loadingText}</LoadMaskCmp>
        </InfiniteTableBody>

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
            varName={rowHeightCSSVar}
            onChange={onRowHeightCSSVarChange}
          />
        ) : null}
        {rowDetailHeightCSSVar ? (
          <CSSNumericVariableWatch
            varName={rowDetailHeightCSSVar}
            onChange={onRowDetailHeightCSSVarChange}
          />
        ) : null}
        {columnHeaderHeightCSSVar ? (
          <CSSNumericVariableWatch
            varName={columnHeaderHeightCSSVar}
            onChange={onColumnHeaderHeightCSSVarChange}
          />
        ) : null}
        <InfiniteTableFooter />
        {licenseValid ? null : <InfiniteTableLicenseFooter />}
        <FocusDetect<T> />
      </div>
    );
  },
);
function InfiniteTableContextProvider<T>() {
  const { componentActions, componentState } =
    useComponentState<InfiniteTableState<T>>();

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

export function InfiniteTable<T>(props: InfiniteTableProps<T>) {
  const table = (
    //@ts-ignore
    <InfiniteTableRoot {...props}>
      <InfiniteTableContextProvider />
    </InfiniteTableRoot>
  );
  if (__DEV__) {
    return <React.StrictMode>{table}</React.StrictMode>;
  }
  return table;
}
InfiniteTable.defaultProps = {
  rowHeight: 40,
  columnHeaderHeight: toCSSVarName(columnHeaderHeightName),
};

export * from './types';

export {
  useInfiniteColumnCell,
  useInfiniteHeaderCell,
  useInfiniteColumnEditor,
  useInfiniteColumnFilterEditor,
};
