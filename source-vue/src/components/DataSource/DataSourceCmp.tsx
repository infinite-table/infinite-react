import * as React from 'react';
import { useEffect, useLayoutEffect } from 'react';

import { useManagedComponentState } from '../hooks/useComponentState';
import { useLatest } from '../hooks/useLatest';

import { getDataSourceContext } from './DataSourceContext';

import { getDataSourceApi } from './getDataSourceApi';

import { useLoadData } from './privateHooks/useLoadData';
import {
  useDataSourceContextValue,
  useMasterDetailContext,
} from './publicHooks/useDataSourceState';
import { DataSourceContextValue, DataSourceState } from './types';

export type DataSourceChildren<T> =
  | React.ReactNode
  | ((values: DataSourceState<T>) => React.ReactNode);

function DataSourceWithContext<T>(props: { children: DataSourceChildren<T> }) {
  let { children } = props;

  const { api, componentState } = useDataSourceContextValue<T>();

  if (typeof children === 'function') {
    children = children(componentState);
  }

  useEffect(() => {
    componentState.onReady?.(api);
  }, []);

  return <>{children}</>;
}
export function DataSourceCmp<T>({
  children,
  isDetail,
}: {
  children: DataSourceChildren<T>;
  isDetail: boolean;
}) {
  const DataSourceContext = getDataSourceContext<T>();

  const masterContext = useMasterDetailContext();
  const getDataSourceMasterContext = useLatest(masterContext);

  const { componentState, componentActions, assignState } =
    useManagedComponentState<DataSourceState<T>>();

  componentState.getDataSourceMasterContextRef.current =
    getDataSourceMasterContext;

  const getState = useLatest(componentState);

  const [api] = React.useState(() => {
    return getDataSourceApi({ getState, actions: componentActions });
  });
  const contextValue: DataSourceContextValue<T> = {
    componentState,
    componentActions,
    getDataSourceMasterContext,
    getState,
    assignState,
    api,
  };

  useLayoutEffect(() => {
    if (masterContext) {
      masterContext.registerDetail(contextValue);
    }
  }, []);

  useLayoutEffect(() => {
    return () => {
      const state = getState();
      state.onCleanup(state);
    };
  }, []);

  if (__DEV__ && !isDetail) {
    (globalThis as any).getDataSourceState = getState;
    (globalThis as any).dataSourceActions = componentActions;
    (globalThis as any).dataSourceApi = api;
  }
  if (__DEV__ && componentState.debugId) {
    (globalThis as any).dataSources = (globalThis as any).dataSources || {};
    (globalThis as any)['dataSources'][componentState.debugId] = {
      getState,
      actions: componentActions,
      api,
    };
  }

  useLoadData({
    componentActions,
    componentState,
    getComponentState: getState,
  });

  useEffect(() => {
    componentState.onDataArrayChange?.(
      componentState.originalDataArray,
      componentState.originalDataArrayChangedInfo,
    );

    if (
      componentState.onDataMutations &&
      componentState.originalDataArrayChangedInfo.mutations &&
      componentState.originalDataArrayChangedInfo.mutations.size
    ) {
      componentState.onDataMutations({
        primaryKeyField:
          typeof componentState.primaryKey === 'string'
            ? componentState.primaryKey
            : undefined,
        dataArray: componentState.originalDataArray,
        mutations: componentState.originalDataArrayChangedInfo.mutations,
        timestamp: componentState.originalDataArrayChangedInfo.timestamp,
      });
    }
  }, [componentState.originalDataArrayChangedInfo]);

  return (
    <DataSourceContext.Provider value={contextValue}>
      <DataSourceWithContext children={children} />
    </DataSourceContext.Provider>
  );
}
