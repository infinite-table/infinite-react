/**
 * Framework-neutral component store: an externally-subscribable snapshot
 * holder. The framework-specific selector hooks (React: useSyncExternalStore)
 * live in ./ComponentStoreHooks.ts — this file must stay free of framework
 * imports so it can be shared across all framework builds.
 */
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
