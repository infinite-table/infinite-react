import * as React from 'react';

import { multisort, multisortNested } from '../../utils/multisort';
import { buildManagedComponent } from '../hooks/useComponentState';

import { defaultFilterTypes } from './defaultFilterTypes';

import { GroupRowsState } from './GroupRowsState';

import {
  useDataSourceState,
  useMasterDetailContext,
} from './publicHooks/useDataSourceState';
import { RowSelectionState } from './RowSelectionState';
import { CellSelectionState } from './CellSelectionState';
import {
  deriveStateFromProps,
  forwardProps,
  initSetupState,
  getInterceptActions,
  onPropChange,
  getMappedCallbacks,
  cleanupDataSource,
} from './state/getInitialState';
import { concludeReducer } from './state/reducer';

import { InfiniteTableRowInfo } from '../InfiniteTable';
// import { DataSourceCmp } from './DataSourceCmp';
import { useDataSourceInternal } from './privateHooks/useDataSource';
import { DataSourceProps } from './types';
import { RowDisabledState } from './RowDisabledState';

const {
  // ManagedComponentContextProvider: ManagedDataSourceContextProvider,
  useManagedComponent: useManagedDataSource,
} = buildManagedComponent({
  debugName: 'DataSource',
  //@ts-ignore
  initSetupState,
  //@ts-ignore
  forwardProps,
  //@ts-ignore
  concludeReducer,
  //@ts-ignore
  mapPropsToState: deriveStateFromProps,
  //@ts-ignore
  onPropChange,
  //@ts-ignore
  cleanup: cleanupDataSource,
  //@ts-ignore
  interceptActions: getInterceptActions(),
  //@ts-ignore
  mappedCallbacks: getMappedCallbacks(),
});

function DataSource<T>(props: DataSourceProps<T>) {
  const { DataSource: DataSourceComponent } = useDataSourceInternal<T>(props);

  return <DataSourceComponent>{props.children ?? null}</DataSourceComponent>;
}

// TODO document this
function useRowInfoReducers() {
  const { rowInfoReducerResults } = useDataSourceState();

  return rowInfoReducerResults;
}

function useMasterRowInfo<T = any>(): InfiniteTableRowInfo<T> | undefined {
  const context = useMasterDetailContext();

  if (!context) {
    return undefined;
  }

  return context.masterRowInfo as InfiniteTableRowInfo<T>;
}

export {
  useManagedDataSource,
  useDataSourceState,
  DataSource,
  GroupRowsState,
  RowSelectionState,
  CellSelectionState,
  RowDisabledState,
  multisort,
  multisortNested,
  defaultFilterTypes as filterTypes,
  useRowInfoReducers,
  useMasterRowInfo,
};

export * from './types';
