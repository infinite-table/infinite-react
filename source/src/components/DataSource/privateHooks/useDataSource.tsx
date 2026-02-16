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
import {
  getDataSourceContext,
  getDataSourceStoreContext,
} from '../DataSourceContext';
import { createDataSourceStore } from '../DataSourceStore';
import { getDataSourceApi } from '../getDataSourceApi';
import { useLoadData } from './useLoadData';
import {
  useMasterRowInfo,
  useGetMasterDetailContext,
} from '../publicHooks/useDataSourceMasterDetailSelector';

export function useDataSourceInternal<T, PROPS_TYPE = DataSourceProps<T>>(
  props: Omit<PROPS_TYPE, 'children'>,
) {
  const masterRowInfo = useMasterRowInfo<T>();
  const getDataSourceMasterContext = useGetMasterDetailContext<T>();

  const isDetail = !!masterRowInfo;
  // when we are in a detail DataSource, we want to have a key
  // dependent on the master row info
  // since we dont want to recycle and reuse the DataSource of a detail row
  // for the DataSource of another detail row (for example, when you scroll the DataGrid
  // while having more details expanded)
  // so making sure the key is unique for each detail row is important
  // and mandatory to ensure correctness
  const key = isDetail ? masterRowInfo.id : 'master';

  const { contextValue: managedContextValue, ContextComponent } =
    useManagedDataSource(props);

  const {
    componentActions: dataSourceActions,
    componentState: dataSourceState,
    assignState,
  } = managedContextValue as any as ManagedComponentStateContextValue<
    DataSourceState<T>,
    DataSourceComponentActions<T>
  >;

  dataSourceState.getDataSourceMasterContextRef.current =
    getDataSourceMasterContext;

  const getDataSourceState = useLatest(dataSourceState);

  const [dataSourceApi] = useState(() =>
    getDataSourceApi({
      getState: getDataSourceState,
      actions: dataSourceActions,
    }),
  );

  const contextValue: DataSourceContextValue<T> = {
    dataSourceState,
    dataSourceActions,
    getDataSourceMasterContext,
    getDataSourceState,
    assignState,
    dataSourceApi,
  };

  const getLatestManagedContextValue = useLatest(managedContextValue);
  const getLatestContextValue = useLatest(contextValue);

  const DataSourceContext = getDataSourceContext<T>();

  const DataSource = useCallback(
    ({ children }: { children: DataSourceChildren<T>; nodesKey?: string }) => {
      const DataSourceStoreContext = getDataSourceStoreContext<T>();
      const [store] = useState(() => createDataSourceStore<T>());

      if (typeof children === 'function') {
        children = children(getDataSourceState());
      }

      const contextValue = getLatestContextValue();

      store.setSnapshot(contextValue);

      useLayoutEffect(() => {
        store.notify();
      });

      return (
        <ContextComponent.Provider
          key={key}
          value={getLatestManagedContextValue()}
        >
          <DataSourceContext.Provider value={contextValue}>
            <DataSourceStoreContext.Provider value={store}>
              {children}
            </DataSourceStoreContext.Provider>
          </DataSourceContext.Provider>
        </ContextComponent.Provider>
      );
    },
    [ContextComponent, isDetail, key],
  );

  useLayoutEffect(() => {
    const masterContext = getDataSourceMasterContext();
    if (masterContext) {
      masterContext.registerDetail(contextValue);
    }
  }, []);

  useLayoutEffect(() => {
    return () => {
      const state = getDataSourceState();
      state.onCleanup(state);
    };
  }, []);

  if (__DEV__ && !isDetail) {
    (globalThis as any).getDataSourceState = getDataSourceState;
    (globalThis as any).dataSourceActions = dataSourceActions;
    (globalThis as any).dataSourceApi = dataSourceApi;
  }
  if (__DEV__ && dataSourceState.debugId) {
    (globalThis as any).dataSources = (globalThis as any).dataSources || {};
    (globalThis as any)['dataSources'][dataSourceState.debugId] = {
      getState: getDataSourceState,
      actions: dataSourceActions,
      api: dataSourceApi,
    };
  }

  useLoadData({
    dataSourceState,
    dataSourceActions,
    getDataSourceState,
  });

  useEffect(() => {
    dataSourceState.onDataArrayChange?.(
      dataSourceState.originalDataArray,
      dataSourceState.originalDataArrayChangedInfo,
    );

    if (
      dataSourceState.onDataMutations &&
      dataSourceState.originalDataArrayChangedInfo.mutations &&
      dataSourceState.originalDataArrayChangedInfo.mutations.size
    ) {
      dataSourceState.onDataMutations({
        primaryKeyField:
          typeof dataSourceState.primaryKey === 'string'
            ? dataSourceState.primaryKey
            : undefined,
        dataArray: dataSourceState.originalDataArray,
        mutations: dataSourceState.originalDataArrayChangedInfo.mutations,
        timestamp: dataSourceState.originalDataArrayChangedInfo.timestamp,
      });
    }

    if (
      dataSourceState.onTreeDataMutations &&
      dataSourceState.originalDataArrayChangedInfo.treeMutations &&
      dataSourceState.originalDataArrayChangedInfo.treeMutations.size
    ) {
      dataSourceState.onTreeDataMutations({
        nodesKey: dataSourceState.nodesKey
          ? dataSourceState.nodesKey
          : undefined,
        dataArray: dataSourceState.originalDataArray,
        treeMutations:
          dataSourceState.originalDataArrayChangedInfo.treeMutations,
        timestamp: dataSourceState.originalDataArrayChangedInfo.timestamp,
      });
    }
  }, [dataSourceState.originalDataArrayChangedInfo]);

  useEffect(() => {
    dataSourceState.onReady?.(dataSourceApi);
  }, []);

  return {
    DataSource,
    state: contextValue.dataSourceState,
  };
}
