import * as React from 'react';

import { RefObject } from 'react';

import type {
  InfiniteTableContextValue,
  InfiniteTableProps,
  InfiniteTableState,
} from './types';

import { internalProps, rootClassName } from './internalProps';

import { getInfiniteTableContext } from './InfiniteTableContext';

import {
  forwardProps,
  mapPropsToState,
  initSetupState,
} from './state/getInitialState';

import { useResizeObserver } from '../ResizeObserver';
import { useInfiniteTable } from './hooks/useInfiniteTable';
import { useComputed } from './hooks/useComputed';
import { useLatest } from '../hooks/useLatest';

import {
  useDataSource,
  useDataSourceContextValue,
} from '../DataSource/publicHooks/useDataSource';

import { InfiniteTableBody } from './components/InfiniteTableBody';

import { TableHeaderWrapper } from './components/InfiniteTableHeader/InfiniteTableHeaderWrapper';
import { VirtualScrollContainer } from '../VirtualScrollContainer';
import { SpacePlaceholder } from '../VirtualList/SpacePlaceholder';

import { useListRendering } from './hooks/useListRendering';
import { InfiniteTableLicenseFooter } from './components/InfiniteTableLicenseFooter';
import { useLicense } from './hooks/useLicense/useLicense';
import { CSSVariableWatch } from '../CSSVariableWatch';
import {
  getComponentStateRoot,
  useComponentState,
} from '../hooks/useComponentState';
import { useDOMProps } from './hooks/useDOMProps';
import { LoadMask } from './components/LoadMask';
import { display, position, zIndex, top, left } from './utilities.css';
import { join } from '../../utils/join';
import { ThemeVars } from './theme.css';

export const InfiniteTableClassName = internalProps.rootClassName;

const ONLY_VERTICAL_SCROLLBAR = {
  horizontal: false,
  vertical: true,
};

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
    headerHeight: true,
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
    const { componentState, getComputed, computed } = useInfiniteTable<T>();
    const {
      componentState: { dataArray, loading },
    } = useDataSourceContextValue<T>();

    const {
      domRef,
      scrollerDOMRef,
      portalDOMRef,

      licenseKey,
      loadingText,

      header,
      onRowHeightCSSVarChange,
      onHeaderHeightCSSVarChange,
      rowHeightCSSVar,
      headerHeightCSSVar,
      components,
    } = componentState;

    const { columnShifts, bodySize } = componentState;

    const {
      pinnedStartList,
      pinnedEndList,
      centerList,

      pinnedEndScrollbarPlaceholder,
      pinnedStartScrollbarPlaceholder,

      repaintId,
      scrollbars,
      applyScrollVertical,
      horizontalVirtualBrain,

      reservedContentHeight,
    } = useListRendering({
      getComputed,
      domRef: componentState.domRef,
      columnShifts,
      bodySize,
      computed,
    });

    const licenseValid = useLicense(licenseKey);

    const domProps = useDOMProps<T>(componentState.domProps);

    const LoadMaskCmp = components?.LoadMask ?? LoadMask;
    return (
      <div ref={domRef} {...domProps}>
        {header ? (
          <TableHeaderWrapper
            brain={horizontalVirtualBrain}
            repaintId={repaintId}
            scrollbars={scrollbars}
          />
        ) : null}

        <InfiniteTableBody>
          <VirtualScrollContainer
            ref={scrollerDOMRef as RefObject<HTMLDivElement>}
            onContainerScroll={applyScrollVertical}
            scrollable={ONLY_VERTICAL_SCROLLBAR}
          >
            <div className={display.flex}>
              {pinnedStartList}
              {centerList}
              {pinnedEndList}
            </div>

            <SpacePlaceholder
              count={dataArray.length}
              width={0}
              height={reservedContentHeight}
            />
          </VirtualScrollContainer>

          {pinnedStartScrollbarPlaceholder}
          {pinnedEndScrollbarPlaceholder}

          <LoadMaskCmp visible={loading}>{loadingText}</LoadMaskCmp>
        </InfiniteTableBody>

        {licenseValid ? null : <InfiniteTableLicenseFooter />}

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
        {headerHeightCSSVar ? (
          <CSSVariableWatch
            varName={headerHeightCSSVar}
            onChange={onHeaderHeightCSSVarChange}
          />
        ) : null}
      </div>
    );
  },
);
function InfiniteTableContextProvider<T>() {
  const { componentActions, componentState } =
    useComponentState<InfiniteTableState<T>>();

  const { scrollerDOMRef } = componentState;

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
      const state = getState();

      if (!state.virtualizeHeader) {
        componentActions.bodySize = bodySize;
        return;
      }

      componentActions.bodySize = bodySize;
    },
    { earlyAttach: true },
  );

  React.useEffect(() => {
    return () => {
      componentState.onRowHeightCSSVarChange.destroy();
      componentState.onHeaderHeightCSSVarChange.destroy();
    };
  }, []);

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
}
InfiniteTable.defaultProps = {
  rowHeight: 40,
  headerHeight: ThemeVars.components.Header.height,
};

export * from './types';
