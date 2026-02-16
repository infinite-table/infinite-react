import { useCallback, useContext } from 'react';

import type { DataSourceMasterDetailContextValue } from '../types';

import {
  useComponentStoreSelector,
  useComponentStoreSingleValue,
} from '../../../utils/ComponentStore';
import { getDataSourceMasterDetailStoreContext } from '../DataSourceMasterDetailContext';
import { DataSourceMasterDetailStore } from '../DataSourceMasterDetailStore';
import { InfiniteTableRowInfo } from '../../InfiniteTable';

/**
 * Returns the raw master-detail store (or undefined when outside a detail row).
 *
 * Use this when you need on-demand access to the master-detail context
 * (e.g. inside effects or callbacks) without subscribing the component
 * to re-renders.  Call `store.getSnapshot()` to read the current value.
 */
export function useMasterDetailStore<T = any>():
  | DataSourceMasterDetailStore<T>
  | undefined {
  const StoreContext = getDataSourceMasterDetailStoreContext<T>();
  const store = useContext(StoreContext) as DataSourceMasterDetailStore<T>;

  return store || undefined;
}

/**
 * Returns a stable getter `() => DataSourceMasterDetailContextValue | undefined`
 * that always returns the latest master-detail context snapshot.
 *
 * This is the store-based replacement for the old
 * `useLatest(useMasterDetailContext())` pattern: the component does NOT
 * re-render when the master-detail context changes, but calling the
 * returned function will always give you the most recent value.
 */
export function useGetMasterDetailContext<T = any>(): () =>
  | DataSourceMasterDetailContextValue<T>
  | undefined {
  const store = useMasterDetailStore<T>();

  return useCallback(() => store?.getSnapshot(), [store]);
}

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
export function useDataSourceMasterDetailSingleValue<R>(
  selector: (ctx: DataSourceMasterDetailContextValue<any>) => R,
): R {
  const StoreContext = getDataSourceMasterDetailStoreContext<any>();
  const store = useContext(StoreContext) as DataSourceMasterDetailStore<any>;
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
export function useDataSourceMasterDetailSelector<R extends object>(
  selector: (ctx: DataSourceMasterDetailContextValue<any>) => R,
): R | undefined {
  const StoreContext = getDataSourceMasterDetailStoreContext<any>();
  const store = useContext(StoreContext) as DataSourceMasterDetailStore<any>;

  if (!store) {
    return undefined;
  }
  return useComponentStoreSelector(store, selector) ?? undefined;
}

export function useMasterRowInfo<T = any>():
  | InfiniteTableRowInfo<T>
  | undefined {
  const StoreContext = getDataSourceMasterDetailStoreContext<any>();
  const store = useContext(StoreContext) as DataSourceMasterDetailStore<any>;

  if (!store) {
    return undefined;
  }
  return useComponentStoreSingleValue(
    store,
    (ctx) => ctx.masterRowInfo as InfiniteTableRowInfo<T>,
  );
}
