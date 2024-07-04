import * as React from 'react';

import { DataSourceContextValue } from '../types';

import { getDataSourceContext } from '../DataSourceContext';
import { DataSourceMasterDetailContextValue, DataSourceState } from '..';
import { getDataSourceMasterDetailContext } from '../DataSourceMasterDetailContext';

export function useDataSourceState<T>(): DataSourceState<T> {
  const DataSourceContext = getDataSourceContext<T>();
  const contextValue = React.useContext(DataSourceContext);

  return contextValue.componentState;
}
export function useDataSourceContextValue<T>(): DataSourceContextValue<T> {
  const DataSourceContext = getDataSourceContext<T>();
  const contextValue = React.useContext(DataSourceContext);

  return contextValue;
}

export function useMasterDetailContext():
  | DataSourceMasterDetailContextValue
  | undefined {
  const masterDetailContext = getDataSourceMasterDetailContext();
  const contextValue = React.useContext(masterDetailContext);

  return contextValue;
}
