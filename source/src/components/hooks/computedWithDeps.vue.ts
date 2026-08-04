import { computed } from 'vue';
import type { ComputedRef } from 'vue';

/**
 * Vue sibling of React's useMemo/useCallback with an explicit deps list.
 *
 * The managed state stores are shallowRefs whose .value is replaced on EVERY
 * state change, so a plain computed() reading state.value re-evaluates (and
 * produces a new identity) on every state swap. This helper re-evaluates the
 * getter on every tracked change too, but only re-runs the factory - and thus
 * only produces a new identity - when one of the deps actually changed. This
 * gives Vue the same identity-stability guarantees React gets from
 * useMemo/useCallback dep arrays (stable identities are what allow the
 * framework to skip re-rendering cells whose props did not change).
 *
 * IMPORTANT: all reactive reads must happen inside getDeps (reading the same
 * shallowRef store in the factory is fine, since the ref is already tracked
 * by getDeps). The factory must derive its result from the current state of
 * those same stores.
 */
export function computedWithDeps<T>(
  getDeps: () => readonly unknown[],
  factory: () => T,
  debugName?: string,
): ComputedRef<T> {
  let prevDeps: readonly unknown[] | null = null;
  let value: T;

  return computed(() => {
    const deps = getDeps();
    if (
      prevDeps === null ||
      deps.length !== prevDeps.length ||
      deps.some((dep, index) => !Object.is(dep, prevDeps![index]))
    ) {
      if (
        __DEV__ &&
        debugName &&
        (globalThis as any).__INFINITE_DEBUG_COMPUTED_DEPS__ &&
        prevDeps !== null
      ) {
        const changed = deps
          .map((dep, index) => (!Object.is(dep, prevDeps![index]) ? index : -1))
          .filter((index) => index !== -1);
        // eslint-disable-next-line no-console
        console.log(
          `[computedWithDeps] ${debugName} re-created. changed dep indexes:`,
          changed.join(','),
        );
      }
      value = factory();
    }
    prevDeps = deps;
    return value;
  });
}
