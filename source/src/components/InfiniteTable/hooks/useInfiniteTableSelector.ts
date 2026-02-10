import { useContext } from 'react';

import { getInfiniteTableStoreContext } from '../InfiniteTableContext';
import type {
  InfiniteTableContextValue,
  InfiniteTableStableContextValue,
} from '../types/InfiniteTableContextValue';

import type { InfiniteTableStore } from '../InfiniteTableStore';
import {
  useComponentStoreSelector,
  useComponentStoreSingleValue,
} from '../../../utils/ComponentStore';

/**
 * A selector hook that reads a single value from the InfiniteTable store.
 * Uses Object.is for equality — ideal for primitives and stable references.
 *
 * Components using this hook only re-render when the selected value
 * actually changes, unlike useContext which re-renders on every context update.
 *
 * @param selector  Function that extracts a value from the context.
 *                  Does NOT need to be memoized by the caller.
 */
export function useInfiniteTableSingleValue<R>(
  selector: (ctx: InfiniteTableContextValue<any>) => R,
): R {
  const StoreContext = getInfiniteTableStoreContext<any>();
  const store = useContext(StoreContext) as InfiniteTableStore<any>;
  return useComponentStoreSingleValue(store, selector);
}

/**
 * A selector hook that reads an object from the InfiniteTable store.
 * Uses shallow equality — re-renders only when a property of the
 * returned object actually changes (by reference).
 *
 * Use this when the selector returns a derived object (e.g. picking
 * multiple properties), so that a new object literal with the same
 * values does not trigger a re-render.
 *
 * @param selector  Function that extracts an object from the context.
 *                  Does NOT need to be memoized by the caller.
 */
export function useInfiniteTableSelector<R extends object>(
  selector: (ctx: InfiniteTableContextValue<any>) => R,
): R {
  const StoreContext = getInfiniteTableStoreContext<any>();
  const store = useContext(StoreContext) as InfiniteTableStore<any>;
  return useComponentStoreSelector(store, selector);
}

export function useInfiniteTableStableContext<T>() {
  return useInfiniteTableSelector((ctx) => {
    const stableContext: InfiniteTableStableContextValue<T> = {
      getState: ctx.getState,
      actions: ctx.actions,
      getComputed: ctx.getComputed,
      getDataSourceState: ctx.getDataSourceState,
      dataSourceApi: ctx.dataSourceApi,
      dataSourceActions: ctx.dataSourceActions,
      api: ctx.api,

      getDataSourceMasterContext: ctx.getDataSourceMasterContext,
    };

    return stableContext;
  });
}
