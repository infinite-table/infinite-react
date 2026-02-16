import * as React from 'react';

import { DataSourceMasterDetailStore } from './DataSourceMasterDetailStore';

let DSMasterDetailStoreContext: any;

export function getDataSourceMasterDetailStoreContext<T>(): React.Context<
  DataSourceMasterDetailStore<T>
> {
  if (
    DSMasterDetailStoreContext as React.Context<DataSourceMasterDetailStore<T>>
  ) {
    return DSMasterDetailStoreContext;
  }

  return (DSMasterDetailStoreContext = React.createContext<
    DataSourceMasterDetailStore<T>
  >(null as any as DataSourceMasterDetailStore<T>));
}
