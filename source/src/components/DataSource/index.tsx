import * as React from 'react';
import { useReducer } from 'react';

import { DataSourceProps, DataSourceContextValue } from './types';

import { getDataSourceContext } from './DataSourceContext';
import useDataSource from './publicHooks/useDataSource';

import useLoadData from './privateHooks/useLoadData';

import getInitialState from './state/getInitialState';
import useLoadingProp from './props/useLoadingProp';
import getReducer from './state/reducer';

import useReducerActions from './privateHooks/useReducerActions';
import useSortInfoProp from './props/useSortInfoProp';
import useGroupByProp from './props/useGroupByProp';
import { useLatest } from '../hooks/useLatest';

function DataSourceWithContext<T>(props: DataSourceProps<T>) {
  let { children } = props;

  const computedValues = useDataSource<T>();

  if (typeof children === 'function') {
    children = children(computedValues);
  }

  return <>{props.children}</>;
}

function DataSource<T>(props: DataSourceProps<T>) {
  const DataSourceContext = getDataSourceContext<T>();

  const getProps = useLatest(props);
  const [state, dispatch] = useReducer(
    getReducer<T>(getProps),
    getInitialState<T>(props),
  );
  const reducerActions = useReducerActions<T>(dispatch);

  const [loading, setLoading] = useLoadingProp<T>({ props, state, dispatch });
  const [sortInfo, setSortInfo] = useSortInfoProp<T>({
    props,
    state,
    dispatch,
  });
  const [groupBy, setGroupBy] = useGroupByProp<T>({
    props,
    state,
    dispatch,
  });

  const actions = {
    ...reducerActions,
    setLoading,
    setSortInfo,
    setGroupBy,
  };

  const contextValue: DataSourceContextValue<T> = {
    state,
    props,
    computed: {
      primaryKey: props.primaryKey,
      // fields: props.fields,
      originalDataArray: state.originalDataArray,
      dataArray: state.dataArray,
      groupBy,
      loading,
      sortInfo,
    },
    actions,
    dispatch,
  };

  // loads data and sets it in the state
  useLoadData(contextValue);

  // console.table(state.dataArray);
  return (
    <DataSourceContext.Provider value={contextValue}>
      <DataSourceWithContext {...props} />
    </DataSourceContext.Provider>
  );
}

DataSource.defaultProps = {
  defaultLoading: false,
};

export { useDataSource, DataSource };
export default DataSource;
export * from './types';
