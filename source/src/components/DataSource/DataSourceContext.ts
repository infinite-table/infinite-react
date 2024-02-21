import * as React from 'react';
import { DataSourceApi, DataSourceState } from '.';

import { DataSourceComponentActions, DataSourceContextValue } from './types';

let DSContext: any;

export function getDataSourceContext<T>(): React.Context<
  DataSourceContextValue<T>
> {
  if (DSContext as React.Context<DataSourceContextValue<T>>) {
    return DSContext;
  }

  return (DSContext = React.createContext<DataSourceContextValue<T>>({
    api: null as any as DataSourceApi<T>,
    getState: () => null as any as DataSourceState<T>,
    assignState: () => null as any as DataSourceState<T>,
    getDataSourceMasterContext: () => undefined,
    componentState: null as any as DataSourceState<T>,
    componentActions: null as any as DataSourceComponentActions<T>,
  }));
}
