import { DependencyList, EffectCallback, useEffect, useRef } from 'react';

const isSameDeps = (deps: DependencyList, prevDeps: DependencyList) => {
  return deps.every((dep, index) => dep === prevDeps[index]);
};

export const useEffectWhenSameDeps = (
  callback: EffectCallback,
  deps: DependencyList,
) => {
  const depsRef = useRef(deps);
  const sameDeps = isSameDeps(deps, depsRef.current);

  const isInitialRef = useRef(true);

  depsRef.current = deps;

  const effectDepsRef = useRef<any[]>(['same']);
  const effectDeps = sameDeps ? [Date.now()] : effectDepsRef.current;
  effectDepsRef.current = effectDeps;

  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (isInitialRef.current) {
      isInitialRef.current = false;
      return;
    }
    return callbackRef.current();
  }, effectDeps);
};
