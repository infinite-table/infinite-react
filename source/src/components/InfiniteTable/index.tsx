import * as React from 'react';
import { RefObject, useCallback, useEffect, useState } from 'react';

import { join } from '../../utils/join';
import { CSSVariableWatch } from '../CSSVariableWatch';

import {
  useDataSource,
  useDataSourceContextValue,
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
import { useInfiniteColumnCell } from './components/InfiniteTableRow/InfiniteTableColumnCell';
import { RowHoverCls } from './components/InfiniteTableRow/row.css';
import { LoadMask } from './components/LoadMask';
import { getImperativeApi } from './getImperativeApi';
import { useAutoSizeColumns } from './hooks/useAutoSizeColumns';
import { useCellRendering } from './hooks/useCellRendering';
import { useComputed } from './hooks/useComputed';
import { useDOMProps } from './hooks/useDOMProps';
import { useInfiniteTable } from './hooks/useInfiniteTable';
import { useLicense } from './hooks/useLicense/useLicense';
import { getInfiniteTableContext } from './InfiniteTableContext';
import { internalProps, rootClassName } from './internalProps';
import { handleKeyboardNavigation } from './keyboardNavigationAndSelection';
import {
  forwardProps,
  mapPropsToState,
  initSetupState,
} from './state/getInitialState';
import { ThemeVars } from './theme.css';
import type {
  InfiniteTableContextValue,
  InfiniteTableProps,
  InfiniteTableState,
} from './types';
import { position, zIndex, top, left } from './utilities.css';

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
    const {
      componentState,
      getComputed,
      computed,
      componentActions: actions,
      getState,
    } = useInfiniteTable<T>();
    const {
      componentState: { loading },
      getState: getDataSourceState,
      componentActions: dataSourceActions,
    } = useDataSourceContextValue<T>();

    const [imperativeApi] = useState(() => {
      return getImperativeApi(
        getState,
        getComputed,
        getDataSourceState,
        actions,
      );
    });

    const {
      domRef,
      scrollerDOMRef,
      portalDOMRef,

      licenseKey,
      loadingText,

      header,
      onRowHeightCSSVarChange,
      onColumnHeaderHeightCSSVarChange,
      rowHeightCSSVar,
      columnHeaderHeightCSSVar,
      components,
      scrollStopDelay,
      brain,
      headerBrain,
      renderer,
      activeRowIndex,
      activeCellIndex,
      onRenderUpdater,
    } = componentState;

    useEffect(() => {
      if (activeRowIndex != null) {
        imperativeApi.scrollRowIntoView(activeRowIndex, {
          offset: 30,
        });
      }
    }, [activeRowIndex]);

    useEffect(() => {
      if (activeCellIndex != null) {
        imperativeApi.scrollCellIntoView(
          activeCellIndex[0],
          activeCellIndex[1],
          {
            offset: 30,
          },
        );
      }
    }, [activeCellIndex]);

    const { columnShifts, bodySize } = componentState;

    const { scrollbars } = computed;

    const { renderCell } = useCellRendering({
      imperativeApi,
      getComputed,
      domRef: componentState.domRef,
      columnShifts,
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

    const onKeyDown = useCallback((event) => {
      if (
        handleKeyboardNavigation({
          getState,
          actions,
          getDataSourceState,
          getComputed,
          key: event.key,
          shiftKey: !!event.shiftKey,
        })
      ) {
        event.preventDefault();
      }
    }, []);

    return (
      <div onKeyDown={onKeyDown} ref={domRef} {...domProps}>
        {header ? (
          <TableHeaderWrapper brain={headerBrain} scrollbars={scrollbars} />
        ) : null}

        <InfiniteTableBody>
          <HeadlessTable
            tabIndex={0}
            activeRowIndex={componentState.ready ? activeRowIndex : null}
            activeCellIndex={componentState.ready ? activeCellIndex : null}
            scrollStopDelay={scrollStopDelay}
            renderer={renderer}
            onRenderUpdater={onRenderUpdater}
            brain={brain}
            renderCell={renderCell}
            cellHoverClassNames={HOVERED_CLASS_NAMES}
            scrollerDOMRef={scrollerDOMRef}
          ></HeadlessTable>

          <LoadMaskCmp visible={loading}>{loadingText}</LoadMaskCmp>
        </InfiniteTableBody>

        <div
          ref={portalDOMRef as RefObject<HTMLDivElement>}
          className={join(
            `${rootClassName}Portal`,
            zIndex[1000],
            position.absolute,
            top[0],
            left[0],
          )}
        />
        {rowHeightCSSVar ? (
          <CSSVariableWatch
            varName={rowHeightCSSVar}
            onChange={onRowHeightCSSVarChange}
          />
        ) : null}
        {columnHeaderHeightCSSVar ? (
          <CSSVariableWatch
            varName={columnHeaderHeightCSSVar}
            onChange={onColumnHeaderHeightCSSVarChange}
          />
        ) : null}
        <InfiniteTableFooter />
        {licenseValid ? null : <InfiniteTableLicenseFooter />}
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

  if (__DEV__) {
    (globalThis as any).getState = getState;
    (globalThis as any).getComputed = getComputed;
  }

  const contextValue: InfiniteTableContextValue<T> = {
    componentActions,
    componentState,
    computed,
    getComputed,
    getState,
  };

  useResizeObserver(
    scrollerDOMRef,
    (size) => {
      const bodySize = {
        // TODO this can be improved
        width: size.width, //- reservedScrollSpace,
        height: size.height,
      };
      bodySize.width = scrollerDOMRef.current?.scrollWidth ?? bodySize.width;

      componentActions.bodySize = bodySize;
    },
    { earlyAttach: true },
  );

  React.useEffect(() => {
    return () => {
      componentState.onRowHeightCSSVarChange.destroy();
      componentState.onColumnHeaderHeightCSSVarChange.destroy();
    };
  }, []);

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
  return <React.StrictMode>{table}</React.StrictMode>;
  // return table;
}
InfiniteTable.defaultProps = {
  rowHeight: 40,
  columnHeaderHeight: ThemeVars.components.Header.columnHeaderHeight,
};

export * from './types';

export { useInfiniteColumnCell, useInfiniteHeaderCell };
