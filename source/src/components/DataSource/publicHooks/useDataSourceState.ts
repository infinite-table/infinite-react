import * as React from 'react';

import { DataSourceContextValue } from '../types';

import { getDataSourceContext } from '../DataSourceContext';
import { DataSourceState, useDataSourceSelector } from '..';

export function useDataSourceState<T extends unknown>(
  selector: (ctx: DataSourceState<any>) => T,
): T {
  return useDataSourceSelector<T>((ctx) => {
    return selector(ctx.dataSourceState);
  });
}
export function useDataSourceContextValue<T>(): DataSourceContextValue<T> {
  const DataSourceContext = getDataSourceContext<T>();
  const contextValue = React.useContext(DataSourceContext);

  return contextValue;
}
