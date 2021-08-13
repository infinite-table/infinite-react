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

import { getInitialState } from './state/getInitialState';
import { reducer } from './state/reducer';
import { deriveReadOnlyState } from './state/deriveReadOnlyState';

import {
  getComponentStateRoot,
  useComponentState,
} from '../hooks/useComponentState';

type DataSourceChildren<T> =
  | React.ReactNode
  | ((values: DataSourceComponentState<T>) => React.ReactNode);
function DataSourceWithContext<T>(props: { children: DataSourceChildren<T> }) {
  let { children } = props;

  const computedValues = useDataSource<T>();

  if (typeof children === 'function') {
    children = children(computedValues);
  }

  return <>{props.children}</>;
}

const DataSourceRoot = getComponentStateRoot({
  //@ts-ignore
  getInitialState: getInitialState,
  //@ts-ignore
  reducer,
  //@ts-ignore
  deriveReadOnlyState,
});

function DataSourceCmp<T>({ children }: { children: DataSourceChildren<T> }) {
  const DataSourceContext = getDataSourceContext<T>();

  const { componentState, componentActions } = useComponentState<
    DataSourceState<T>,
    DataSourceReadOnlyState<T>
  >();
  const contextValue: DataSourceContextValue<T> = {
    componentState,
    componentActions,
  };

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

export { useDataSource, DataSource };

export * from './types';
