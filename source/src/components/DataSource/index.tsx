import * as React from 'react';

import {
  DataSourceProps,
  DataSourceContextValue,
  DataSourceComponentState,
  DataSourceState,
  DataSourceReadOnlyState,
} from './types';

import { getDataSourceContext } from './DataSourceContext';

import { useDataSource } from './publicHooks/useDataSource';

import { useLoadData } from './privateHooks/useLoadData';

import { deriveReadOnlyState, getInitialState } from './state/getInitialState';
import { concludeReducer } from './state/reducer';

import {
  getComponentStateRoot,
  useComponentState,
} from '../hooks/useComponentState';

import { GroupRowsState } from './GroupRowsState';
import { useLatest } from '../hooks/useLatest';

type DataSourceChildren<T> =
  | React.ReactNode
  | ((values: DataSourceComponentState<T>) => React.ReactNode);

function DataSourceWithContext<T>(props: { children: DataSourceChildren<T> }) {
  let { children } = props;

  const computedValues = useDataSource<T>();

  if (typeof children === 'function') {
    children = children(computedValues);
  }

  return <>{children}</>;
}

const DataSourceRoot = getComponentStateRoot({
  //@ts-ignore
  getInitialState,
  //@ts-ignore
  concludeReducer,
  //@ts-ignore
  deriveReadOnlyState,
});

function DataSourceCmp<T>({ children }: { children: DataSourceChildren<T> }) {
  const DataSourceContext = getDataSourceContext<T>();

  const { componentState, componentActions } = useComponentState<
    DataSourceState<T>,
    DataSourceReadOnlyState<T>
  >();

  const getState = useLatest(componentState);
  const contextValue: DataSourceContextValue<T> = {
    componentState,
    componentActions,
    getState,
  };

  if (__DEV__) {
    (globalThis as any).getDataSourceState = getState;
  }

  useLoadData();

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

export { useDataSource, DataSource, GroupRowsState };

export * from './types';
