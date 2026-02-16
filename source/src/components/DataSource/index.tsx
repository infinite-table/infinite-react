import * as React from 'react';

import { multisort, multisortNested } from '../../utils/multisort';
import { buildManagedComponent } from '../hooks/useComponentState';

import { defaultFilterTypes } from './defaultFilterTypes';

import { GroupRowsState } from './GroupRowsState';

import { useDataSourceState } from './publicHooks/useDataSourceState';
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
import { concludeReducer, filterDataArray } from './state/reducer';

// import { DataSourceCmp } from './DataSourceCmp';
import { useDataSourceInternal } from './privateHooks/useDataSource';
import { DataSourceProps } from './types';
import { RowDisabledState } from './RowDisabledState';
import { useDataSourceSelector } from './publicHooks/useDataSourceSelector';
import { useMasterRowInfo } from './publicHooks/useDataSourceMasterDetailSelector';

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
  const { rowInfoReducerResults } = useDataSourceSelector((ctx) => {
    return {
      rowInfoReducerResults: ctx.dataSourceState.rowInfoReducerResults,
    };
  });

  return rowInfoReducerResults;
}

export {
  useManagedDataSource,
  useDataSourceSelector,
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
  filterDataArray,
};

export * from './types';
