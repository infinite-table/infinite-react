import * as React from 'react';
import { useEffect } from 'react';

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
} from './publicHooks/useDataSource';
import { RowSelectionState } from './RowSelectionState';
import {
  deriveStateFromProps,
  forwardProps,
  initSetupState,
  getInterceptActions,
  onPropChange,
  getMappedCallbacks,
} from './state/getInitialState';
import { concludeReducer } from './state/reducer';
import {
  DataSourceProps,
  DataSourceContextValue,
  DataSourceState,
} from './types';

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
  interceptActions: getInterceptActions(),
  //@ts-ignore
  mappedCallbacks: getMappedCallbacks(),
});

function DataSourceCmp<T>({ children }: { children: DataSourceChildren<T> }) {
  const DataSourceContext = getDataSourceContext<T>();

  const { componentState, componentActions } =
    useComponentState<DataSourceState<T>>();

  const getState = useLatest(componentState);

  const [api] = React.useState(() => {
    return getDataSourceApi({ getState, actions: componentActions });
  });
  const contextValue: DataSourceContextValue<T> = {
    componentState,
    componentActions,
    getState,
    api,
  };

  if (__DEV__) {
    (globalThis as any).getDataSourceState = getState;
    (globalThis as any).dataSourceActions = componentActions;
    (globalThis as any).dataSourceApi = api;
  }

  useLoadData();

  useEffect(() => {
    componentState.onDataArrayChange?.(
      componentState.originalDataArray,
      componentState.originalDataArrayChangedInfo,
    );

    if (
      componentState.onDataMutations &&
      componentState.originalDataArrayChangedInfo.mutations
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
  return (
    <DataSourceRoot {...props}>
      <DataSourceCmp children={props.children} />
    </DataSourceRoot>
  );
}

// TODO document this
function useRowInfoReducers() {
  const { rowInfoReducerResults } = useDataSource();

  return rowInfoReducerResults;
}

export {
  useDataSource,
  DataSource,
  GroupRowsState,
  RowSelectionState,
  multisort,
  defaultFilterTypes as filterTypes,
  useRowInfoReducers,
};

export * from './types';
