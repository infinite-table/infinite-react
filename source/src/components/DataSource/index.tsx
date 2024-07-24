import * as React from 'react';

import { multisort } from '../../utils/multisort';
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
// function DataSource<T>(props: DataSourceProps<T>) {
//   const masterContext = useMasterDetailContext();

//   const isDetail = !!masterContext;
//   // when we are in a detail DataSource, we want to have a key
//   // dependent on the master row info
//   // since we dont want to recycle and reuse the DataSource of a detail row
//   // for the DataSource of another detail row (for example, when you scroll the DataGrid
//   // while having more details expanded)
//   // so making sure the key is unique for each detail row is important
//   // and mandatory to ensure correctness
//   const key = isDetail ? masterContext.masterRowInfo.id : 'master';

//   return (
//     <ManagedDataSourceContextProvider {...props} key={key}>
//       <DataSourceCmp children={props.children} isDetail={isDetail} />
//     </ManagedDataSourceContextProvider>
//   );
// }
// console.log(_DataSource);

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
  multisort,
  defaultFilterTypes as filterTypes,
  useRowInfoReducers,
  useMasterRowInfo,
};

export * from './types';
