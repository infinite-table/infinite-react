import { EffectCallback, useEffect, useLayoutEffect, useRef } from 'react';

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

  const changesRef = useRef<Record<keyof T, any>>({} as Record<keyof T, any>);
  const changes: Record<string, any> = changesRef.current;

  const useEffectDeps: any[] = [];

  for (const k in deps) {
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

    let result: void | (() => void) = undefined;
    if (Object.keys(changes).length !== 0) {
      result = fn(changes, oldValues);
    }

    changesRef.current = {} as Record<keyof T, any>;
    oldValuesRef.current = {};
    return result;
  }, useEffectDeps);
}

export function useLayoutEffectWithChanges<T>(
  fn: (
    changes: Record<keyof T, any>,
    prevValues: Record<string, any>,
  ) => void | (() => void),
  deps: Record<keyof T, any>,
) {
  const prevRef = useRef({});

  const oldValuesRef = useRef<Record<string, any>>({});
  const oldValues: Record<string, any> = oldValuesRef.current;

  const changesRef = useRef<Record<keyof T, any>>({} as Record<keyof T, any>);
  const changes: Record<string, any> = changesRef.current;

  const useEffectDeps: any[] = [];

  for (const k in deps) {
    if (deps.hasOwnProperty(k)) {
      if (deps[k] !== (prevRef.current as any)[k]) {
        changes[k] = deps[k];
        oldValues[k] = (prevRef.current as any)[k];
      }
      useEffectDeps.push(deps[k]);
    }
  }

  prevRef.current = deps;

  useLayoutEffect(() => {
    const changes = changesRef.current;

    let result: void | (() => void) = undefined;
    if (Object.keys(changes).length !== 0) {
      result = fn(changes, oldValues);
    }

    changesRef.current = {} as Record<keyof T, any>;
    oldValuesRef.current = {};
    return result;
  }, useEffectDeps);
}

export function useEffectWithObject(
  fn: EffectCallback,
  deps: Record<string, any>,
) {
  const useEffectDeps: any[] = [];

  for (const k in deps) {
    if (deps.hasOwnProperty(k)) {
      useEffectDeps.push(deps[k]);
    }
  }

  useEffect(fn, useEffectDeps);
}
