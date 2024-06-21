import { MutableRefObject, Ref, useCallback, useRef } from 'react';

export function useForwardedRefAsObject<T>(ref: Ref<T>) {
  const domRef = useRef<HTMLDivElement>(null);

  const refFn = useCallback((node: T) => {
    (domRef as MutableRefObject<T | null>).current = node;
    if (ref) {
      if (typeof ref === 'function') {
        ref(node);
      } else {
        (ref as React.MutableRefObject<T>).current = node;
      }
    }
  }, []);

  return {
    domRef,
    refFn,
  };
}
