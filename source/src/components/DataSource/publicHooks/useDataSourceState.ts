import * as React from 'react';

import { DataSourceContextValue } from '../types';

import { getDataSourceContext } from '../DataSourceContext';
import { DataSourceState } from '..';

export function useDataSourceState<T>(): DataSourceState<T> {
  const DataSourceContext = getDataSourceContext<T>();
  const contextValue = React.useContext(DataSourceContext);

  return contextValue.dataSourceState;
}
export function useDataSourceContextValue<T>(): DataSourceContextValue<T> {
  const DataSourceContext = getDataSourceContext<T>();
  const contextValue = React.useContext(DataSourceContext);

  return contextValue;
}
