import { Signal, computed, untracked } from '@angular/core';

/**
 * Angular sibling of computedWithDeps.vue.ts (React's useMemo with a deps
 * list): the factory re-runs - and the value gets a new identity - only
 * when one of the deps changed (Object.is), not on every change of the
 * signals the deps read. The state signals change on EVERY state update, so
 * a plain computed() reading them would produce a new value every time; the
 * grid relies on stable identities (columns, renderCell) to skip work.
 *
 * Reactive reads belong in getDeps; the factory runs untracked.
 */
export function computedWithDeps<T>(
  getDeps: () => readonly unknown[],
  factory: () => T,
): Signal<T> {
  const deps = computed(getDeps, {
    equal: (a, b) =>
      a.length === b.length && a.every((dep, index) => Object.is(dep, b[index])),
  });
  return computed(() => {
    deps();
    return untracked(factory);
  });
}
