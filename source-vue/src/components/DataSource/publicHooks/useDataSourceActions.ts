import * as React from 'react';

import { DataSourceComponentActions } from '../types';

import { getDataSourceContext } from '../DataSourceContext';

export default function useDataSourceActions<
  T,
>(): DataSourceComponentActions<T> {
  const DataSourceContext = getDataSourceContext<T>();
  const contextValue = React.useContext(DataSourceContext);

  return contextValue.componentActions;
}
