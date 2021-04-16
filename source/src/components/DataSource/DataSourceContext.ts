import * as React from 'react';

import {
  DataSourceState,
  DataSourceComputedValues,
  DataSourceActions,
  DataSourceContextValue,
  DataSourceProps,
  DataSourceAction,
} from './types';

let DSContext: any;

export function getDataSourceContext<T>(): React.Context<
  DataSourceContextValue<T>
> {
  if (DSContext as React.Context<DataSourceContextValue<T>>) {
    return DSContext;
  }

  return (DSContext = React.createContext<DataSourceContextValue<T>>({
    state: (null as any) as DataSourceState<T>,
    props: (null as any) as DataSourceProps<T>,
    computed: (null as any) as DataSourceComputedValues<T>,
    actions: (null as any) as DataSourceActions<T>,
    dispatch: (null as any) as React.Dispatch<DataSourceAction<any>>,
  }));
}
