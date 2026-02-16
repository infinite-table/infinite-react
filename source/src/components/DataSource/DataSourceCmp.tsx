import * as React from 'react';
import { useEffect, useLayoutEffect } from 'react';

import { useManagedComponentState } from '../hooks/useComponentState';
import { useLatest } from '../hooks/useLatest';

import { getDataSourceStoreContext } from './DataSourceContext';
import { createDataSourceStore } from './DataSourceStore';

import { getDataSourceApi } from './getDataSourceApi';

import { useLoadData } from './privateHooks/useLoadData';
import { useGetMasterDetailContext } from './publicHooks/useDataSourceMasterDetailSelector';
import { DataSourceContextValue, DataSourceState } from './types';
import { useDataSourceSelector } from './publicHooks/useDataSourceSelector';

export type DataSourceChildren<T> =
  | React.ReactNode
  | ((values: DataSourceState<T>) => React.ReactNode);

function DataSourceWithContext<T>(props: { children: DataSourceChildren<T> }) {
  let { children } = props;

  const { dataSourceApi, dataSourceState, onReady } = useDataSourceSelector(
    (ctx) => {
      return {
        dataSourceApi: ctx.dataSourceApi,
        dataSourceState: ctx.dataSourceState,
        onReady: ctx.dataSourceState.onReady,
      };
    },
  );
  if (typeof children === 'function') {
    children = children(dataSourceState);
  }

  useEffect(() => {
    onReady?.(dataSourceApi);
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
  const DataSourceStoreContext = getDataSourceStoreContext<T>();

  const [store] = React.useState(() => createDataSourceStore<T>());

  const getDataSourceMasterContext = useGetMasterDetailContext();

  const { componentState, componentActions, assignState } =
    useManagedComponentState<DataSourceState<T>>();

  componentState.getDataSourceMasterContextRef.current =
    getDataSourceMasterContext;

  const getState = useLatest(componentState);

  const [api] = React.useState(() => {
    return getDataSourceApi({ getState, actions: componentActions });
  });
  const contextValue: DataSourceContextValue<T> = {
    dataSourceState: componentState,
    dataSourceActions: componentActions,
    getDataSourceMasterContext,
    getDataSourceState: getState,
    assignState,
    dataSourceApi: api,
  };

  useLayoutEffect(() => {
    const masterContext = getDataSourceMasterContext();
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

  useLoadData<T>({
    dataSourceActions: componentActions,
    dataSourceState: componentState,
    getDataSourceState: getState,
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

  store.setSnapshot(contextValue);

  React.useLayoutEffect(() => {
    store.notify();
  });

  return (
    <DataSourceStoreContext.Provider value={store}>
      <DataSourceWithContext children={children} />
    </DataSourceStoreContext.Provider>
  );
}
