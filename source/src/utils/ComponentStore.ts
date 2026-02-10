import { useCallback, useRef, useSyncExternalStore } from 'react';
import { shallowEqualObjects } from './shallowEqualObjects';

export interface ComponentStore<T> {
  /**
   * Returns the current context value snapshot.
   */
  getSnapshot(): T;

  /**
   * Updates the stored snapshot (called during provider render).
   * Does NOT notify subscribers — call notify() separately after render.
   */
  setSnapshot(value: T): void;

  /**
   * Registers a listener that will be called on notify().
   * Returns an unsubscribe function.
   */
  subscribe(listener: () => void): () => void;

  /**
   * Notifies all subscribers that the snapshot may have changed.
   * Should be called from useEffect (after commit) to avoid
   * "Cannot update a component while rendering a different component" warnings.
   */
  notify(): void;
}

export function createComponentStore<T>(): ComponentStore<T> {
  let snapshot: T = null as any;
  const listeners = new Set<() => void>();

  return {
    getSnapshot() {
      return snapshot;
    },

    setSnapshot(value: T) {
      snapshot = value;
    },

    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    notify() {
      for (const listener of listeners) {
        listener();
      }
    },
  };
}

function useComponentStoreSelectorImpl<CTX, R>(
  store: ComponentStore<CTX>,
  selector: (ctx: CTX) => R,
  isEqual: (a: R, b: R) => boolean,
): R {
  // Use refs so callers don't need to memoize selector/isEqual
  const selectorRef = useRef(selector);
  selectorRef.current = selector;

  const isEqualRef = useRef(isEqual);
  isEqualRef.current = isEqual;

  // Cache the previous result for referential stability
  const resultRef = useRef<R>(undefined as any);
  const initializedRef = useRef(false);

  const getSnapshot = useCallback(() => {
    const snapshot = store.getSnapshot();
    const nextResult = selectorRef.current(snapshot);

    if (
      initializedRef.current &&
      isEqualRef.current(resultRef.current as R, nextResult)
    ) {
      return resultRef.current as R;
    }

    resultRef.current = nextResult;
    initializedRef.current = true;
    return nextResult;
  }, [store]);

  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}

/**
 * A selector hook that reads a single value from the component store.
 * Uses Object.is for equality — ideal for primitives and stable references.
 *
 * Components using this hook only re-render when the selected value
 * actually changes, unlike useContext which re-renders on every context update.
 *
 * @param selector  Function that extracts a value from the context.
 *                  Does NOT need to be memoized by the caller.
 */
export function useComponentStoreSingleValue<CTX, R>(
  componentStore: ComponentStore<CTX>,
  selector: (ctx: CTX) => R,
): R {
  return useComponentStoreSelectorImpl(componentStore, selector, Object.is);
}

/**
 * A selector hook that reads an object from the component store.
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
export function useComponentStoreSelector<CTX, R extends object>(
  componentStore: ComponentStore<CTX>,
  selector: (ctx: CTX) => R,
): R {
  return useComponentStoreSelectorImpl(
    componentStore,
    selector,
    shallowEqualObjects as (a: R, b: R) => boolean,
  );
}
