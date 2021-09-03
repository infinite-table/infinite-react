import * as React from 'react';

import { RefObject } from 'react';

import type {
  InfiniteTableContextValue,
  InfiniteTableProps,
  InfiniteTableState,
} from './types';

import { join } from '../../utils/join';

import { internalProps } from './internalProps';

import { getInfiniteTableContext } from './InfiniteTableContext';

import { getInitialState, deriveReadOnlyState } from './state/getInitialState';

import { useResizeObserver } from '../ResizeObserver';
import { useInfiniteTable } from './hooks/useInfiniteTable';
import { useComputed } from './hooks/useComputed';
import { useLatest } from '../hooks/useLatest';

import { useDataSourceContextValue } from '../DataSource/publicHooks/useDataSource';

import { InfiniteTableBody } from './components/InfiniteTableBody';

import { TableHeaderWrapper } from './components/InfiniteTableHeader/InfiniteTableHeaderWrapper';
import { VirtualScrollContainer } from '../VirtualScrollContainer';
import { SpacePlaceholder } from '../VirtualList/SpacePlaceholder';

import { useListRendering } from './hooks/useListRendering';
import { ICSS } from '../../style/utilities';
import { InfiniteTableLicenseFooter } from './components/InfiniteTableLicenseFooter';
import { useLicense } from './hooks/useLicense/useLicense';
import { CSSVariableWatch } from '../CSSVariableWatch';
import {
  getComponentStateRoot,
  useComponentState,
} from '../hooks/useComponentState';
import { InfiniteTableReadOnlyState } from './types/InfiniteTableState';

export const InfiniteTableClassName = internalProps.rootClassName;

const ONLY_VERTICAL_SCROLLBAR = {
  horizontal: false,
  vertical: true,
};

const InfiniteTableRoot = getComponentStateRoot({
  //@ts-ignore
  getInitialState,
  // @ts-ignore
  deriveReadOnlyState,
});

// const InfiniteTableFactory = <T extends unknown>(
//   _cfg: InfiniteTableFactoryConfig = {},
// ) => {
export const InfiniteTableComponent = React.memo(
  function InfiniteTableComponent<T>() {
    const { componentState, getComputed, computed } = useInfiniteTable<T>();
    const {
      componentState: { dataArray },
    } = useDataSourceContextValue<T>();

    const {
      domRef,
      bodyDOMRef,
      portalDOMRef,
      domProps,
      licenseKey,

      header,
      onRowHeightChange,
      onHeaderHeightChange,
      rowHeightCSSVar,
      headerHeightCSSVar,
    } = componentState;

    const { columnShifts, bodySize } = componentState;

    const className = join(
      InfiniteTableClassName,
      columnShifts ? `${InfiniteTableClassName}--shifting` : '',
      domProps?.className,
    );

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

    return (
      <div ref={domRef} {...domProps} className={className}>
        {header ? (
          <TableHeaderWrapper
            brain={horizontalVirtualBrain}
            repaintId={repaintId}
            scrollbars={scrollbars}
          />
        ) : null}

        <InfiniteTableBody>
          <VirtualScrollContainer
            ref={bodyDOMRef as RefObject<HTMLDivElement>}
            onContainerScroll={applyScrollVertical}
            scrollable={ONLY_VERTICAL_SCROLLBAR}
          >
            <div className={ICSS.display.flex}>
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
        </InfiniteTableBody>

        {licenseValid ? null : <InfiniteTableLicenseFooter />}

        <div
          ref={portalDOMRef as RefObject<HTMLDivElement>}
          className="ITable-Portal"
        />
        {rowHeightCSSVar ? (
          <CSSVariableWatch
            varName={rowHeightCSSVar}
            onChange={onRowHeightChange}
          />
        ) : null}
        {headerHeightCSSVar ? (
          <CSSVariableWatch
            varName={headerHeightCSSVar}
            onChange={onHeaderHeightChange}
          />
        ) : null}
      </div>
    );
  },
);
function InfiniteTableContextProvider<T>() {
  const { componentActions, componentState } = useComponentState<
    InfiniteTableState<T>,
    InfiniteTableReadOnlyState<T>
  >();

  const { bodyDOMRef, bodySizeRef } = componentState;

  const computed = useComputed<T>();
  const getComputed = useLatest(computed);
  const getState = useLatest(componentState);

  (globalThis as any).getState = getState;

  const contextValue: InfiniteTableContextValue<T> = {
    componentActions,
    componentState,
    computed,
    getComputed,
    getState,
  };

  useResizeObserver(
    bodyDOMRef,
    (size) => {
      const bodySize = {
        // TODO this can be improved
        width: size.width, //- reservedScrollSpace,
        height: size.height,
      };
      bodySize.width = bodyDOMRef.current?.scrollWidth ?? bodySize.width;

      bodySizeRef.current = bodySize;

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
      componentState.onRowHeightChange.destroy();
      componentState.onHeaderHeightChange.destroy();
    };
  }, []);

  const TableContext = getInfiniteTableContext<T>();

  // const { componentState: dataSourceState } = useDataSourceContextValue<T>();

  // React.useEffect(() => {
  //   if (dataSourceState.pivotColumns) {
  //     componentActions.columns = dataSourceState.pivotColumns;
  //     componentActions.columnOrder = [...dataSourceState.pivotColumns.keys()];
  //   }
  //   if (dataSourceState.pivotColumnGroups) {
  //     componentActions.columnGroups = dataSourceState.pivotColumnGroups;
  //   }
  // }, [dataSourceState.pivotColumns, dataSourceState.pivotColumnGroups]);

  return (
    <TableContext.Provider value={contextValue}>
      <InfiniteTableComponent />
    </TableContext.Provider>
  );
}

export function InfiniteTable<T>(props: InfiniteTableProps<T>) {
  return (
    <React.StrictMode>
      <InfiniteTableRoot {...props}>
        <InfiniteTableContextProvider />
      </InfiniteTableRoot>
    </React.StrictMode>
  );
}
InfiniteTable.defaultProps = {
  rowHeight: 40,
  headerHeight: '--ITableHeader__height',
};

export * from './types';
