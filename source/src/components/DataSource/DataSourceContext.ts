import * as React from 'react';
import { DataSourceApi, DataSourceState } from '.';

import { DataSourceComponentActions, DataSourceContextValue } from './types';
import type { DataSourceStore } from './DataSourceStore';

let DSContext: any;

export function getDataSourceContext<T>(): React.Context<
  DataSourceContextValue<T>
> {
  if (DSContext as React.Context<DataSourceContextValue<T>>) {
    return DSContext;
  }

  return (DSContext = React.createContext<DataSourceContextValue<T>>({
    dataSourceApi: null as any as DataSourceApi<T>,
    getDataSourceState: () => null as any as DataSourceState<T>,
    assignState: () => null as any as DataSourceState<T>,
    getDataSourceMasterContext: () => undefined,
    dataSourceState: null as any as DataSourceState<T>,
    dataSourceActions: null as any as DataSourceComponentActions<T>,
  }));
}

let DSStoreContext: any;

export function getDataSourceStoreContext<T>(): React.Context<
  DataSourceStore<T>
> {
  if (DSStoreContext as React.Context<DataSourceStore<T>>) {
    return DSStoreContext;
  }

  return (DSStoreContext = React.createContext<DataSourceStore<T>>(
    null as any as DataSourceStore<T>,
  ));
}
