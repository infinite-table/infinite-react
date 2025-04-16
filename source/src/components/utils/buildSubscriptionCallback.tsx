import type {
  SubscriptionCallbackOnChangeFn,
  SubscriptionCallback,
} from '../types/SubscriptionCallback';

export function buildSubscriptionCallback<T>(
  withRaf = false,
): SubscriptionCallback<T> {
  let lastCallValue: T | null = null;
  let fns: SubscriptionCallbackOnChangeFn<T>[] = [];

  let rafId: number | null = null;

  const updater = (items: T, callback?: (results: any[]) => void) => {
    const results: any[] = [];
    if (withRaf) {
      if (rafId != null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      requestAnimationFrame(() => {
        lastCallValue = items;
        rafId = null;

        // change happens here
        for (let i = 0, len = fns.length; i < len; i++) {
          results.push(fns[i](items));
        }
        callback?.(results);
      });
    } else {
      lastCallValue = items;

      // change happens here
      for (let i = 0, len = fns.length; i < len; i++) {
        results.push(fns[i](items));
      }
      callback?.(results);
    }
  };

  updater.get = () => lastCallValue;

  // this attaches a new listener to changes
  updater.onChange = (fn: SubscriptionCallbackOnChangeFn<T>) => {
    fns.push(fn);
    return () => {
      fns = fns.filter((f) => f !== fn);
    };
  };

  updater.destroy = () => {
    updater(null as any as T);
    fns.length = 0;
  };

  updater.getListenersCount = () => fns.length;

  return updater;
}
