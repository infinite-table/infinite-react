import * as React from 'react';

import { DataSourceMasterDetailContextValue } from './types';
import { DataSourceMasterDetailStore } from './DataSourceMasterDetailStore';

let DSMasterDetailContext: any;
let DSMasterDetailStoreContext: any;

export function getDataSourceMasterDetailContext(): React.Context<
  DataSourceMasterDetailContextValue | undefined
> {
  if (
    DSMasterDetailContext as React.Context<
      DataSourceMasterDetailContextValue | undefined
    >
  ) {
    return DSMasterDetailContext;
  }

  return (DSMasterDetailContext = React.createContext<
    DataSourceMasterDetailContextValue | undefined
  >(undefined));
}

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
