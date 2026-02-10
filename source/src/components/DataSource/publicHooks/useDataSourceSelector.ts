import { useContext } from 'react';

import { getDataSourceStoreContext } from '../DataSourceContext';

import type {
  DataSourceContextValue,
  DataSourceStableContextValue,
} from '../types';
import type { DataSourceStore } from '../DataSourceStore';

import {
  useComponentStoreSelector,
  useComponentStoreSingleValue,
} from '../../../utils/ComponentStore';

/**
 * A selector hook that reads a single value from the DataSource store.
 * Uses Object.is for equality — ideal for primitives and stable references.
 *
 * Components using this hook only re-render when the selected value
 * actually changes, unlike useContext which re-renders on every context update.
 *
 * @param selector  Function that extracts a value from the DataSource context.
 *                  Does NOT need to be memoized by the caller.
 */
export function useDataSourceSingleValue<R>(
  selector: (ctx: DataSourceContextValue<any>) => R,
): R {
  const StoreContext = getDataSourceStoreContext<any>();
  const store = useContext(StoreContext) as DataSourceStore<any>;
  return useComponentStoreSingleValue(store, selector);
}

/**
 * A selector hook that reads an object from the DataSource store.
 * Uses shallow equality — re-renders only when a property of the
 * returned object actually changes (by reference).
 *
 * Use this when the selector returns a derived object (e.g. picking
 * multiple properties), so that a new object literal with the same
 * values does not trigger a re-render.
 *
 * @param selector  Function that extracts an object from the DataSource context.
 *                  Does NOT need to be memoized by the caller.
 */
export function useDataSourceSelector<R extends object>(
  selector: (ctx: DataSourceContextValue<any>) => R,
): R {
  const StoreContext = getDataSourceStoreContext<any>();
  const store = useContext(StoreContext) as DataSourceStore<any>;
  return useComponentStoreSelector(store, selector);
}

export function useDataSourceStableContext<T>() {
  return useDataSourceSelector((ctx) => {
    const stableContext: DataSourceStableContextValue<T> = {
      getDataSourceState: ctx.getDataSourceState,
      getDataSourceMasterContext: ctx.getDataSourceMasterContext,
      dataSourceActions: ctx.dataSourceActions,
      dataSourceApi: ctx.dataSourceApi,
      assignState: ctx.assignState,
    };

    return stableContext;
  });
}
