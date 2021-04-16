import * as React from 'react';

import { DataSourceActions } from '../types';

import { getDataSourceContext } from '../DataSourceContext';

export default function useDataSourceActions<T>(): DataSourceActions<T> {
  const DataSourceContext = getDataSourceContext<T>();
  const contextValue = React.useContext(DataSourceContext);

  return contextValue.actions;
}
