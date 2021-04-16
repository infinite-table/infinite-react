import * as React from 'react';

import { DataSourceComputedValues, DataSourceContextValue } from '../types';

import { getDataSourceContext } from '../DataSourceContext';

export default function useDataSource<T>(): DataSourceComputedValues<T> {
  const DataSourceContext = getDataSourceContext<T>();
  const contextValue = React.useContext(DataSourceContext);

  return contextValue.computed;
}
export function useDataSourceContextValue<T>(): DataSourceContextValue<T> {
  const DataSourceContext = getDataSourceContext<T>();
  const contextValue = React.useContext(DataSourceContext);

  return contextValue;
}
