import { useMemo } from 'react';
import { once } from '../../utils/DeepMap/once';

export function useOnce<ReturnType>(fn: () => ReturnType): ReturnType {
  const onceFn = useMemo<() => ReturnType>(() => {
    return once(fn);
  }, []);

  return onceFn();
}
