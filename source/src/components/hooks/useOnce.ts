import { useMemo } from 'react';

export function once<ReturnType>(fn: () => ReturnType): () => ReturnType {
  let called = false;
  let result: ReturnType | null = null;

  const onceFn = () => {
    if (called) {
      return result!;
    }
    called = true;
    result = fn();

    return result;
  };

  return onceFn;
}
export function useOnce<ReturnType>(fn: () => ReturnType): ReturnType {
  const onceFn = useMemo<() => ReturnType>(() => {
    return once(fn);
  }, []);

  return onceFn();
}
