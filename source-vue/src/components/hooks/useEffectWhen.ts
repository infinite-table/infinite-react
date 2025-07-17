import { DependencyList, EffectCallback, useEffect, useRef } from 'react';

const isSameDeps = (
  deps: DependencyList,
  prevDeps: DependencyList,
  compare?: (a: any, b: any) => boolean,
) => {
  return deps.every((dep, index) => {
    if (compare) {
      return compare(dep, prevDeps[index]);
    }
    return dep === prevDeps[index];
  });
};

export const useEffectWhen = (
  callback: EffectCallback,
  options: {
    same: DependencyList;
    different: DependencyList;
    compare?: (a: any, b: any) => boolean;
  },
) => {
  const { same: depsForSame, different: depsForDifferent, compare } = options;

  const sameDepsRef = useRef(depsForSame);
  const differentDepsRef = useRef(depsForDifferent);

  const sameRespected = isSameDeps(depsForSame, sameDepsRef.current, compare);
  const differentRespected = !isSameDeps(
    depsForDifferent,
    differentDepsRef.current,
    compare,
  );

  const isInitialRef = useRef(true);

  sameDepsRef.current = depsForSame;
  differentDepsRef.current = depsForDifferent;

  const effectDepsRef = useRef<any[]>(['same']);
  const effectDeps =
    sameRespected && differentRespected ? [Date.now()] : effectDepsRef.current;
  effectDepsRef.current = effectDeps;

  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  if (sameRespected && differentRespected) {
    isInitialRef.current = false;
  }

  useEffect(() => {
    if (isInitialRef.current) {
      return;
    }
    return callbackRef.current();
  }, effectDeps);
};
