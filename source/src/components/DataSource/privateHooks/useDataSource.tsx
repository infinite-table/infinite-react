import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import {
  DataSourceComponentActions,
  DataSourceContextValue,
  DataSourceProps,
  DataSourceState,
  useManagedDataSource,
} from '..';
import { ManagedComponentStateContextValue } from '../../hooks/useComponentState/types';
import { useLatest } from '../../hooks/useLatest';
import { DataSourceChildren } from '../DataSourceCmp';
import { getDataSourceContext } from '../DataSourceContext';
import { getDataSourceApi } from '../getDataSourceApi';
import { useLoadData } from './useLoadData';
import { useMasterDetailContext } from '../publicHooks/useDataSourceState';

export function useDataSourceInternal<T, PROPS_TYPE = DataSourceProps<T>>(
  props: Omit<PROPS_TYPE, 'children'>,
) {
  const masterContext = useMasterDetailContext();
  const getDataSourceMasterContext = useLatest(masterContext);

  const isDetail = !!masterContext;
  // when we are in a detail DataSource, we want to have a key
  // dependent on the master row info
  // since we dont want to recycle and reuse the DataSource of a detail row
  // for the DataSource of another detail row (for example, when you scroll the DataGrid
  // while having more details expanded)
  // so making sure the key is unique for each detail row is important
  // and mandatory to ensure correctness
  const key = isDetail ? masterContext.masterRowInfo.id : 'master';

  const { contextValue: managedContextValue, ContextComponent } =
    useManagedDataSource(props);

  const { componentActions, componentState, assignState } =
    managedContextValue as any as ManagedComponentStateContextValue<
      DataSourceState<T>,
      DataSourceComponentActions<T>
    >;

  componentState.getDataSourceMasterContextRef.current =
    getDataSourceMasterContext;

  const getState = useLatest(componentState);

  const [api] = useState(() =>
    getDataSourceApi({ getState, actions: componentActions }),
  );

  const contextValue: DataSourceContextValue<T> = {
    componentState,
    componentActions,
    getDataSourceMasterContext,
    getState,
    assignState,
    api,
  };

  const getLatestManagedContextValue = useLatest(managedContextValue);
  const getLatestContextValue = useLatest(contextValue);

  const DataSourceContext = getDataSourceContext<T>();

  const DataSource = useCallback(
    ({ children }: { children: DataSourceChildren<T>; nodesKey?: string }) => {
      if (typeof children === 'function') {
        children = children(getState());
      }
      return (
        <ContextComponent.Provider
          key={key}
          value={getLatestManagedContextValue()}
        >
          <DataSourceContext.Provider value={getLatestContextValue()}>
            {children}
          </DataSourceContext.Provider>
        </ContextComponent.Provider>
      );
    },
    [ContextComponent, isDetail, key],
  );

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
    componentState,
    componentActions,
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

  useEffect(() => {
    componentState.onReady?.(api);
  }, []);

  return {
    DataSource,
    state: contextValue.componentState,
  };
}
