import { EffectCallback, useCallback, useEffect, useRef } from 'react';
import { useRerender } from './useRerender';

export const useEffectOnce = (effectCallback: EffectCallback) => {
  const effectFunction = useCallback<EffectCallback>(effectCallback, []);
  const effectCalled = useRef(false);
  const componentRendered = useRef(false);
  const destroyFn = useRef<void | VoidFunction>();
  const [_, rerender] = useRerender();

  if (effectCalled.current) {
    componentRendered.current = true;
  }

  useEffect(() => {
    if (!effectCalled.current) {
      destroyFn.current = effectFunction;
      effectCalled.current = true;
    }

    rerender();

    return () => {
      if (!componentRendered.current) {
        return;
      }

      if (destroyFn.current) {
        destroyFn.current();
      }
    };
  }, []);
};
