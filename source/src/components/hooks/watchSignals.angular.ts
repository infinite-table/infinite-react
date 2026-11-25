import {
  DestroyRef,
  Injector,
  afterRenderEffect,
  effect,
  untracked,
} from '@angular/core';

/**
 * A precise watcher (like Vue's `watch([...getters], cb)` or a React effect
 * with a deps array): `callback` runs only when one of the deps changed
 * (Object.is), with the current and the previous deps. Everything in the
 * callback is untracked, so it can update the state it doesn't depend on
 * without looping (generated action setters dispatch even for equal values).
 *
 * - immediate: run synchronously now with the current deps (Vue's
 *   `immediate: true`); otherwise the first run only records them
 * - flush 'pre' (effect, before the views render) or 'post'
 *   (afterRenderEffect, after they rendered - for DOM work)
 */
export function watchSignals<D extends readonly unknown[]>(
  getDeps: () => D,
  callback: (current: D, previous: D | undefined) => void | VoidFunction,
  options: {
    injector: Injector;
    immediate?: boolean;
    flush?: 'pre' | 'post';
  },
): void {
  let previous: D | undefined;
  let cleanup: VoidFunction | void;

  const run = (current: D) => {
    const prev = previous;
    previous = current;
    if (typeof cleanup === 'function') {
      cleanup();
    }
    cleanup = callback(current, prev);
  };

  const initial = untracked(getDeps);
  if (options.immediate) {
    run(initial);
  } else {
    previous = initial;
  }

  const check = () => {
    const current = getDeps();
    const prev = previous;
    if (
      prev &&
      prev.length === current.length &&
      current.every((dep, index) => Object.is(dep, prev[index]))
    ) {
      return;
    }
    untracked(() => run(current));
  };

  if (options.flush === 'post') {
    afterRenderEffect(check, { injector: options.injector });
  } else {
    effect(check, { injector: options.injector });
  }

  options.injector.get(DestroyRef).onDestroy(() => {
    if (typeof cleanup === 'function') {
      cleanup();
    }
  });
}
