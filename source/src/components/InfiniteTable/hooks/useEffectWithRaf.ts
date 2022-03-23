import {
  type DependencyList,
  type EffectCallback,
  useEffect,
  useRef,
} from 'react';

export function useEffectWithRaf(fn: EffectCallback, deps: DependencyList) {
  const rafId = useRef<number>(0);
  const removeFnRaf = useRef<Function | void>();

  useEffect(() => {
    rafId.current = requestAnimationFrame(() => {
      removeFnRaf.current = fn();
    });

    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
      if (typeof removeFnRaf.current === 'function') {
        removeFnRaf.current();
        removeFnRaf.current = undefined;
      }
    };
  }, deps);
}
