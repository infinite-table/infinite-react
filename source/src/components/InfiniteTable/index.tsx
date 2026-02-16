import * as React from 'react';
import { RefObject } from 'react';

import { join } from '../../utils/join';
import { CSSNumericVariableWatch } from '../CSSNumericVariableWatch';

import { useDataSourceState } from '../DataSource/publicHooks/useDataSourceState';
import { useMasterDetailStore } from '../DataSource/publicHooks/useDataSourceMasterDetailSelector';

import {
  buildManagedComponent,
  useManagedComponentState,
} from '../hooks/useComponentState';

import { useLatest } from '../hooks/useLatest';
import { useResizeObserver } from '../ResizeObserver';

import { debounce } from '../utils/debounce';

import { InfiniteTableFooter } from './components/InfiniteTableFooter';
import { useInfiniteHeaderCell } from './components/InfiniteTableHeader/InfiniteTableHeaderCell';
import { InfiniteTableLicenseFooter } from './components/InfiniteTableLicenseFooter';
import {
  useInfiniteColumnCell,
  useInfiniteColumnEditor,
} from './components/InfiniteTableRow/InfiniteTableColumnCell';
import { getImperativeApi } from './api/getImperativeApi';
import { useAutoSizeColumns } from './hooks/useAutoSizeColumns';
import { useComputed } from './hooks/useComputed';
import { useDOMProps } from './hooks/useDOMProps';
import { useLicense } from './hooks/useLicense/useLicense';

import { useScrollToActiveCell } from './hooks/useScrollToActiveCell';
import { useScrollToActiveRow } from './hooks/useScrollToActiveRow';

import { getInfiniteTableStoreContext } from './InfiniteTableContext';
import {
  createInfiniteTableStore,
  InfiniteTableStore,
} from './InfiniteTableStore';
import { internalProps, rootClassName } from './internalProps';

import {
  forwardProps,
  getMappedCallbacks,
  mapPropsToState,
  initSetupState,
  cleanupState,
} from './state/getInitialState';
import { columnHeaderHeightName, ThemeVars } from './vars.css';

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
import { eventMatchesKeyboardShortcut } from '../utils/hotkey';
import { Renderable } from '../types/Renderable';
import { HScrollSyncContent } from './components/HScrollSyncContent';
import { useGridScroll } from './hooks/useGridScroll';
import { useVisibleColumnSizes } from './hooks/useVisibleColumnSizes';

import { DEBUG_NAME } from './InfiniteDebugName';
import { useHorizontalLayout } from './hooks/useHorizontalLayout';
import { useDebugMode } from './hooks/useDebugMode';
import { useInfinitePortalContainer } from './hooks/useInfinitePortalContainer';
import { getDebugChannel } from '../../utils/debugChannel';
import { GroupingToolbar } from './components/GroupingToolbar';
import { DragDropProvider } from './components/draggable';
import { InfiniteTableHeader } from './components/InfiniteTablePublicHeader';
import { InfiniteTableHeaderProps } from './components/InfiniteTablePublicHeader/types';
import { InfiniteTableBody } from './components/InfiniteTableBody';
import { useInfiniteTableSelector } from './hooks/useInfiniteTableSelector';
import {
  useDataSourceSelector,
  useDataSourceStableContext,
} from '../DataSource/publicHooks/useDataSourceSelector';

export const InfiniteTableClassName = internalProps.rootClassName;

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

    getParentState: () => {
      const contextValue = useDataSourceState();

      return contextValue;
    },
    debugName: (props: { debugId?: string }) => {
      return getDebugChannel(props.debugId, DEBUG_NAME);
    },
  });

// const InfiniteTableFactory = <T extends unknown>(
//   _cfg: InfiniteTableFactoryConfig = {},
// ) => {
export const InfiniteTableComponent = React.memo(
  function InfiniteTableComponent<T>() {
    const masterDetailStore = useMasterDetailStore();
    const { componentState, api, initialChildren } = useInfiniteTableSelector(
      (ctx) => {
        return {
          componentState: ctx.state,
          api: ctx.api,
          initialChildren: ctx.children,
        };
      },
    );
    const {
      dataArrayLength,
      getDataSourceState,
      dataSourceActions,
      dataSourceApi,
    } = useDataSourceSelector((ctx) => {
      return {
        dataArrayLength: ctx.dataSourceState.dataArray.length,
        getDataSourceState: ctx.getDataSourceState,
        dataSourceActions: ctx.dataSourceActions,
        dataSourceApi: ctx.dataSourceApi,
      };
    });

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

    useScrollToActiveRow(activeRowIndex, dataArrayLength, api);
    useScrollToActiveCell(activeCellIndex, dataArrayLength, api);
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
          api,
          { dataSourceApi },
        );
      }

      if (__DEV__) {
        (globalThis as any).infiniteApi = api;
      }
    }, [componentState.ready, api, dataSourceApi]);

    const debugId = useDebugMode();

    React.useEffect(() => {
      // we can make this more elegant
      // the main idea:
      // if we are a detail grid, we want to use the master grid's portal
      // so menus are rendered in the container of the top-most (master) grid - since we can
      // have multiple levels of nesting
      if (masterDetailStore) {
        const masterContext = masterDetailStore.getSnapshot();
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
  store,
}: {
  children?: Renderable;
  store: InfiniteTableStore<T>;
}) {
  const { componentActions, componentState } =
    useManagedComponentState<InfiniteTableState<T>>();

  const { scrollerDOMRef, scrollTopKey } = componentState;

  const getState = useLatest(componentState);
  const computed = useComputed<T>({
    state: componentState,
    actions: componentActions,
    getState,
  });
  const getComputed = useLatest(computed);

  const masterDetailStore = useMasterDetailStore();
  if (__DEV__ && !masterDetailStore) {
    (globalThis as any).getState = getState;
    (globalThis as any).getComputed = getComputed;
    (globalThis as any).componentActions = componentActions;
    (globalThis as any).masterBrain = componentState.brain;

    (globalThis as any).INFINITE = (globalThis as any).INFINITE || {};

    if (getState().debugId) {
      const debugId = getState().debugId;
      // @ts-ignore
      (globalThis as any).INFINITE[debugId] = {
        // @ts-ignore
        ...((globalThis as any).INFINITE[debugId] || {}),
        getState,
        actions: componentActions,
      };
    }
  }

  const {
    getDataSourceState,
    dataSourceActions,
    getDataSourceMasterContext,
    dataSourceApi,
  } = useDataSourceStableContext<T>();

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

  store.setSnapshot(contextValue);

  // Notify subscribers before the browser paints so that
  // selector-based components re-render in the same frame,
  // avoiding visual tearing.
  React.useLayoutEffect(() => {
    store.notify();
  });
  // queueMicrotask(() => {
  //   store.notify();
  // });

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

  return <InfiniteTableComponent />;
}

const DEFAULT_ROW_HEIGHT = 40;
const DEFAULT_COLUMN_HEADER_HEIGHT = toCSSVarName(columnHeaderHeightName);

type InfiniteTableComponent = {
  <T>(props: InfiniteTableProps<T>): React.JSX.Element;
  licenseKey?: string;
  Header: <T = any>(
    props: InfiniteTableHeaderProps<T>,
  ) => React.JSX.Element | null;
  Body: typeof InfiniteTableBody;
  Footer: () => React.JSX.Element | null;
  HScrollSyncContent: typeof HScrollSyncContent;
  GroupingToolbar: typeof GroupingToolbar;
};
const InfiniteTable: InfiniteTableComponent = function <T>(
  props: InfiniteTableProps<T>,
) {
  // Store for useSyncExternalStore-based selectors.
  // The store reference is stable (created once), only the snapshot updates.
  const [store] = React.useState(() => createInfiniteTableStore<T>());
  const TableStoreContext = getInfiniteTableStoreContext<T>();
  const table = (
    //@ts-ignore
    <InfiniteTableRoot
      repeatWrappedGroupRows={!!props.wrapRowsHorizontally}
      rowHeight={DEFAULT_ROW_HEIGHT}
      columnHeaderHeight={DEFAULT_COLUMN_HEADER_HEIGHT}
      {...props}
    >
      <DragDropProvider>
        <TableStoreContext.Provider value={store}>
          <InfiniteTableContextProvider
            children={props.children}
            store={store}
          />
        </TableStoreContext.Provider>
      </DragDropProvider>
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
InfiniteTable.GroupingToolbar = GroupingToolbar;

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
