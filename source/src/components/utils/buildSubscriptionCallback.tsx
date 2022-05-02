import {
  SubscriptionCallbackOnChangeFn,
  SubscriptionCallback,
} from '../types/SubscriptionCallback';

export function buildSubscriptionCallback<T>(
  withRaf = false,
): SubscriptionCallback<T> {
  let result: T | null = null;
  let fns: SubscriptionCallbackOnChangeFn<T>[] = [];

  let rafId: number | null = null;

  const updater = (items: T, callback?: () => void) => {
    if (withRaf) {
      if (rafId != null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      requestAnimationFrame(() => {
        result = items;
        rafId = null;

        // change happens here
        for (let i = 0, len = fns.length; i < len; i++) {
          fns[i](items);
        }
        callback?.();
      });
    } else {
      result = items;

      // change happens here
      for (let i = 0, len = fns.length; i < len; i++) {
        fns[i](items);
      }
      callback?.();
    }
  };

  updater.get = () => result;

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

  return updater;
}
