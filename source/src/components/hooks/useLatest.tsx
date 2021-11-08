import { useCallback, useRef } from 'react';

export function useLatest<T>(value: T): () => T {
  const ref = useRef(value);
  ref.current = value;

  return useCallback(() => ref.current, []);
}
