import { useCallback, useMemo, useRef } from 'react';

export type LazyLatest<T> = {
  (): T | undefined;
  current: T;
};

export const useLazyLatest = <T>(value?: T): LazyLatest<T> => {
  const ref = useRef(value);
  ref.current = value;

  const fn = useCallback(() => ref.current, []);

  return useMemo(() => {
    Object.defineProperty(fn, 'current', {
      set(value: T) {
        ref.current = value;
      },
    });

    return fn as LazyLatest<T>;
  }, [fn]);
};
