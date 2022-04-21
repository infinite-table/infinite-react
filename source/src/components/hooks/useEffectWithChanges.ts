import { EffectCallback, useEffect, useRef } from 'react';

export function useEffectWithChanges<T>(
  fn: (
    changes: Record<keyof T, any>,
    prevValues: Record<string, any>,
  ) => void | (() => void),
  deps: Record<keyof T, any>,
) {
  const prevRef = useRef({});

  const oldValuesRef = useRef<Record<string, any>>({});
  const oldValues: Record<string, any> = oldValuesRef.current;

  const changesRef = useRef<Record<string, any>>({});
  const changes: Record<string, any> = changesRef.current;

  const useEffectDeps: any[] = [];

  for (let k in deps) {
    if (deps.hasOwnProperty(k)) {
      if (deps[k] !== (prevRef.current as any)[k]) {
        changes[k] = deps[k];
        oldValues[k] = (prevRef.current as any)[k];
      }
      useEffectDeps.push(deps[k]);
    }
  }

  prevRef.current = deps;

  useEffect(() => {
    const changes = changesRef.current;

    const result = fn(changes, oldValues);

    changesRef.current = {};
    oldValuesRef.current = {};
    return result;
  }, useEffectDeps);
}

export function useEffectWithObject(
  fn: EffectCallback,
  deps: Record<string, any>,
) {
  const useEffectDeps: any[] = [];

  for (let k in deps) {
    if (deps.hasOwnProperty(k)) {
      useEffectDeps.push(deps[k]);
    }
  }

  useEffect(fn, useEffectDeps);
}
