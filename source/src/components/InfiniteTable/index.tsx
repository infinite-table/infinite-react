import * as React from 'react';

import {
  useReducer,
  useMemo,
  Ref,
  RefObject,
  useRef,
  useCallback,
} from 'react';

import type {
  InfiniteTableFactoryConfig,
  InfiniteTableContextValue,
  InfiniteTableProps,
  InfiniteTableOwnProps,
  InfiniteTableState,
  InfiniteTableAction,
  InfiniteTableComputedValues,
} from './types';

import { join } from '../../utils/join';

import { internalProps } from './internalProps';
import { getDefaultProps } from './getDefaultProps';

import {
  getInfiniteTableContext,
  getInternalInfiniteTableContext,
} from './InfiniteTableContext';

import { reducer } from './state/reducer';
import { getInitialState } from './state/initialState';
import {
  getReducerActions,
  InfiniteTableInternalActions,
} from './state/getReducerActions';

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
import { Size } from '../types/Size';
import { ICSS } from '../../style/utilities';
import { InfiniteTableLicenseFooter } from './components/InfiniteTableLicenseFooter';
import { useLicense } from './hooks/useLicense/useLicense';
import { CSSVariableWatch } from '../CSSVariableWatch';
import { buildSubscriptionCallback } from '../utils/buildSubscriptionCallback';
import { InternalInfiniteTableContextValue } from './types/InfiniteTableContextValue';
import { useInternalInfiniteTable } from './hooks/useInternalInfiniteTable';
import { useLazyLatest } from '../hooks/useLazyLatest';

export const InfiniteTableClassName = internalProps.rootClassName;

const ONLY_VERTICAL_SCROLLBAR = {
  horizontal: false,
  vertical: true,
};

const InfiniteTableFactory = <T extends unknown>(
  _cfg: InfiniteTableFactoryConfig = {},
) => {
  const Table = React.forwardRef(function InfiniteTable(
    props: InfiniteTableOwnProps<T>,
    domRef: Ref<HTMLDivElement>,
  ) {
    const { domProps, header, onHeaderResize } = props;

    const {
      componentState: { dataArray },
    } = useDataSourceContextValue<T>();

    const {
      computed,
      actions,
      internalActions,
      state,
      bodyDOMRef,
      portalDOMRef,
      getComputed,
    } = useInfiniteTable<T>();

    const getProps = useLatest(props);
    const getActions = useLatest(actions);

    const { columnShifts, bodySize } = state;

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
      domRef,
      columnShifts,
      bodySize,
      computed,
      getActions,
      getProps,
    });

    const licenseValid = useLicense(
      props.licenseKey || (globalThis as any).InfiniteTableLicenseKey || '',
    );

    return (
      <div ref={domRef} {...domProps} className={className}>
        {header ? (
          <TableHeaderWrapper
            brain={horizontalVirtualBrain}
            repaintId={repaintId}
            scrollbars={scrollbars}
            onResize={onHeaderResize}
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
        {props.rowHeightCSSVar ? (
          <CSSVariableWatch
            varName={props.rowHeightCSSVar}
            onChange={internalActions.onRowHeightChange}
          />
        ) : null}
      </div>
    );
  });

  function InfiniteTableWrap(props: InfiniteTableProps<T>) {
    const [state, dispatch] = useReducer<
      React.Reducer<InfiniteTableState<T>, InfiniteTableAction>,
      InfiniteTableProps<T>
    >(reducer, props, getInitialState);

    const InternalTableContext = getInternalInfiniteTableContext<T>();
    const actions = useMemo(() => getReducerActions<T>(dispatch), [dispatch]);

    const domRef = React.useRef<HTMLDivElement | null>(null);
    const bodyDOMRef = React.useRef<HTMLDivElement | null>(null);
    const portalDOMRef = React.useRef<HTMLDivElement | null>(null);
    const bodySizeRef = useRef<Size | null>(null);
    const headerHeightRef = useRef<number>(0);

    const onRowHeightChange = useMemo(() => {
      return buildSubscriptionCallback<number>();
    }, []);

    const internalActions: InfiniteTableInternalActions<T> = useMemo(
      () => ({
        onRowHeightChange,
      }),
      [],
    );

    const getProps = useLatest(props);

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
        const props = getProps();
        if (!props.header) {
          actions.setBodySize(bodySize);
          return;
        }
        if (headerHeightRef.current) {
          actions.setBodySize(bodySize);
        } else {
          actions.setBodySize({ ...bodySize, height: 0 });
        }
      },
      { earlyAttach: true },
    );

    const internalContextValue: InternalInfiniteTableContextValue<T> = {
      state,
      dispatch,
      actions,
      props,
      internalActions,
      domRef,
      bodyDOMRef,
      portalDOMRef,
      headerHeightRef,
      getComputed: useLazyLatest<InfiniteTableComputedValues<T>>(),
    };

    React.useEffect(() => {
      return () => {
        onRowHeightChange.destroy();
      };
    }, []);

    return (
      <React.StrictMode>
        <InternalTableContext.Provider value={internalContextValue}>
          <InfiniteTableContextProvider />
        </InternalTableContext.Provider>
      </React.StrictMode>
    );
  }

  function InfiniteTableContextProvider() {
    const {
      props,
      state,
      actions,
      internalActions,
      dispatch,
      domRef,
      bodyDOMRef,
      portalDOMRef,
      headerHeightRef,
      getComputed,
    } = useInternalInfiniteTable<T>();

    const onHeaderResize = useCallback((headerHeight: number) => {
      headerHeightRef.current = headerHeight;
    }, []);

    const computed = useComputed<T>(
      props,
      state,
      useDataSourceContextValue<T>(),
      actions,
      internalActions,
    );

    getComputed.current = computed;

    const ownProps = {
      ...props,
      ref: domRef,
      onHeaderResize,
      rowHeight: computed.rowHeight,
      rowHeightCSSVar:
        typeof props.rowHeight === 'string' ? props.rowHeight : '',
    };

    const contextValue: InfiniteTableContextValue<T> = {
      state,
      dispatch,
      actions,
      props,
      computed,
      internalActions,
      domRef,
      bodyDOMRef,
      portalDOMRef,
      headerHeightRef,
      getComputed,
    };

    const TableContext = getInfiniteTableContext<T>();

    return (
      <TableContext.Provider value={contextValue}>
        <Table {...ownProps} />
      </TableContext.Provider>
    );
  }

  InfiniteTableWrap.defaultProps = getDefaultProps<T>();

  return InfiniteTableWrap;
};

export { InfiniteTableFactory };

export * from './types';
