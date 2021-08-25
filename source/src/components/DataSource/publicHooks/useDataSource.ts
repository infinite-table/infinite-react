import * as React from 'react';

import { DataSourceComponentState, DataSourceContextValue } from '../types';

import { getDataSourceContext } from '../DataSourceContext';

export function useDataSource<T>(): DataSourceComponentState<T> {
  const DataSourceContext = getDataSourceContext<T>();
  const contextValue = React.useContext(DataSourceContext);

  return contextValue.componentState;
}
export function useDataSourceContextValue<T>(): DataSourceContextValue<T> {
  const DataSourceContext = getDataSourceContext<T>();
  const contextValue = React.useContext(DataSourceContext);

  return contextValue;
}
