import * as React from 'react';
import { useEffect, useLayoutEffect } from 'react';

import { multisort } from '../../utils/multisort';
import {
  getComponentStateRoot,
  useComponentState,
} from '../hooks/useComponentState';
import { useLatest } from '../hooks/useLatest';

import { getDataSourceContext } from './DataSourceContext';
import { defaultFilterTypes } from './defaultFilterTypes';
import { getDataSourceApi } from './getDataSourceApi';
import { GroupRowsState } from './GroupRowsState';
import { useLoadData } from './privateHooks/useLoadData';
import {
  useDataSource,
  useDataSourceContextValue,
  useMasterDetailContext,
} from './publicHooks/useDataSource';
import { RowSelectionState } from './RowSelectionState';
import { CellSelectionState } from './CellSelectionState';
import {
  deriveStateFromProps,
  forwardProps,
  initSetupState,
  getInterceptActions,
  onPropChange,
  getMappedCallbacks,
  cleanupDataSource,
} from './state/getInitialState';
import { concludeReducer } from './state/reducer';
import {
  DataSourceProps,
  DataSourceContextValue,
  DataSourceState,
} from './types';
import { InfiniteTableRowInfo } from '../InfiniteTable';

type DataSourceChildren<T> =
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

const DataSourceRoot = getComponentStateRoot({
  //@ts-ignore
  initSetupState,
  //@ts-ignore
  forwardProps,
  //@ts-ignore
  concludeReducer,
  //@ts-ignore
  mapPropsToState: deriveStateFromProps,
  //@ts-ignore
  onPropChange,
  //@ts-ignore
  cleanup: cleanupDataSource,
  //@ts-ignore
  interceptActions: getInterceptActions(),
  //@ts-ignore
  mappedCallbacks: getMappedCallbacks(),
});

function DataSourceCmp<T>({
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
    useComponentState<DataSourceState<T>>();

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

  useLoadData();

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

function DataSource<T>(props: DataSourceProps<T>) {
  const masterContext = useMasterDetailContext();

  const isDetail = !!masterContext;
  // when we are in a detail DataSource, we want to have a key
  // dependent on the master row info
  // since we dont want to recycle and reuse the DataSource of a detail row
  // for the DataSource of another detail row (for example, when you scroll the DataGrid
  // while having more details expanded)
  // so making sure the key is unique for each detail row is important
  // and mandatory to ensure correctness
  const key = isDetail ? masterContext.masterRowInfo.id : 'master';

  return (
    <DataSourceRoot {...props} key={key}>
      <DataSourceCmp children={props.children} isDetail={isDetail} />
    </DataSourceRoot>
  );
}

// TODO document this
function useRowInfoReducers() {
  const { rowInfoReducerResults } = useDataSource();

  return rowInfoReducerResults;
}

function useMasterRowInfo<T = any>(): InfiniteTableRowInfo<T> | undefined {
  const context = useMasterDetailContext();

  if (!context) {
    return undefined;
  }

  return context.masterRowInfo as InfiniteTableRowInfo<T>;
}

export {
  useDataSource,
  DataSource,
  GroupRowsState,
  RowSelectionState,
  CellSelectionState,
  multisort,
  defaultFilterTypes as filterTypes,
  useRowInfoReducers,
  useMasterRowInfo,
};

export * from './types';
