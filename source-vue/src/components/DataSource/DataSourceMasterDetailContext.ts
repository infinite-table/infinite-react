import * as React from 'react';

import { DataSourceMasterDetailContextValue } from './types';

let DSMasterDetailContext: any;

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
