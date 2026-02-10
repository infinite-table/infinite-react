import { useContext } from 'react';

import type { DataSourceMasterDetailContextValue } from '../types';

import {
  useComponentStoreSelector,
  useComponentStoreSingleValue,
} from '../../../utils/ComponentStore';
import { getDataSourceMasterDetailStoreContext } from '../DataSourceMasterDetailContext';
import { DataSourceMasterDetailStore } from '../DataSourceMasterDetailStore';
import { InfiniteTableRowInfo } from '../../InfiniteTable';

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

export function useDataSourceMasterRowInfo<T = any>():
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
