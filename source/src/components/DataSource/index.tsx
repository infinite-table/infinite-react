import * as React from 'react';

import { multisort } from '../../utils/multisort';
import {
  getComponentStateRoot,
  useComponentState,
} from '../hooks/useComponentState';
import { useLatest } from '../hooks/useLatest';

import { getDataSourceContext } from './DataSourceContext';
import { defaultFilterTypes } from './defaultFilterTypes';
import { GroupRowsState } from './GroupRowsState';
import { useLoadData } from './privateHooks/useLoadData';
import { useDataSource } from './publicHooks/useDataSource';
import { RowSelectionState } from './RowSelectionState';
import {
  deriveStateFromProps,
  forwardProps,
  initSetupState,
  getInterceptActions,
  onPropChange,
  getMappedCallbacks,
} from './state/getInitialState';
import { concludeReducer } from './state/reducer';
import {
  DataSourceProps,
  DataSourceContextValue,
  DataSourceState,
} from './types';

type DataSourceChildren<T> =
  | React.ReactNode
  | ((values: DataSourceState<T>) => React.ReactNode);

function DataSourceWithContext<T>(props: { children: DataSourceChildren<T> }) {
  let { children } = props;

  const computedValues = useDataSource<T>();

  if (typeof children === 'function') {
    children = children(computedValues);
  }

  return <>{children}</>;
}

const DataSourceRoot = getComponentStateRoot({
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
  interceptActions: getInterceptActions(),
  //@ts-ignore
  mappedCallbacks: getMappedCallbacks(),
});

function DataSourceCmp<T>({ children }: { children: DataSourceChildren<T> }) {
  const DataSourceContext = getDataSourceContext<T>();

  const { componentState, componentActions } =
    useComponentState<DataSourceState<T>>();

  const getState = useLatest(componentState);
  const contextValue: DataSourceContextValue<T> = {
    componentState,
    componentActions,
    getState,
  };

  if (__DEV__) {
    (globalThis as any).getDataSourceState = getState;
    (globalThis as any).dataSourceActions = componentActions;
  }

  useLoadData();

  return (
    <DataSourceContext.Provider value={contextValue}>
      <DataSourceWithContext children={children} />
    </DataSourceContext.Provider>
  );
}

function DataSource<T>(props: DataSourceProps<T>) {
  return (
    <DataSourceRoot {...props}>
      <DataSourceCmp children={props.children} />
    </DataSourceRoot>
  );
}

export {
  useDataSource,
  DataSource,
  GroupRowsState,
  RowSelectionState,
  multisort,
  defaultFilterTypes as filterTypes,
};

export * from './types';
