import { VoidFn } from './VoidFn';

export type SubscriptionCallbackOnChangeFn<T> = (node: T | null) => void;

export interface SubscriptionCallback<T> {
  (node: T, callback?: () => void): void;
  get: () => T | null;
  destroy: VoidFn;
  onChange: (fn: SubscriptionCallbackOnChangeFn<T>) => VoidFn;
  getListenersCount: () => number;
}
