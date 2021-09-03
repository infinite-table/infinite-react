import * as React from 'react';

import {
  DataSourceComponentState,
  DataSourceComponentActions,
  DataSourceContextValue,
} from './types';

let DSContext: any;

export function getDataSourceContext<T>(): React.Context<
  DataSourceContextValue<T>
> {
  if (DSContext as React.Context<DataSourceContextValue<T>>) {
    return DSContext;
  }

  return (DSContext = React.createContext<DataSourceContextValue<T>>({
    getState: () => null as any as DataSourceComponentState<T>,
    componentState: null as any as DataSourceComponentState<T>,
    componentActions: null as any as DataSourceComponentActions<T>,
  }));
}
