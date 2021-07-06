import {
  SubscriptionCallbackOnChangeFn,
  SubscriptionCallback,
} from '../types/SubscriptionCallback';

export function buildSubscriptionCallback<T>(): SubscriptionCallback<T> {
  let result: T | null = null;
  let fns: SubscriptionCallbackOnChangeFn<T>[] = [];

  const updater = (items: T) => {
    result = items;

    // change happens here
    for (let i = 0, len = fns.length; i < len; i++) {
      fns[i](items);
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
