import { onMounted, watch } from 'vue';

import { ControllerEffect, createEffectRunner } from './controllerEffects';

/**
 * Runs framework-neutral effects (controllerEffects.ts) in a Vue component's
 * setup: a watcher each (flush 'post' for the 'dom' timing, 'pre' for
 * 'state'), created in the order of the list, and the mount runs happen in
 * onMounted.
 */
export function runControllerEffectsForVue(
  effects: ControllerEffect<any>[],
  mount?: {
    /** in onMounted, before the effects' mount runs */
    before?: () => void;
    /** in onMounted, after the effects' mount runs */
    after?: () => void;
  },
) {
  const runners = effects.map((effect) => {
    const flush = effect.timing === 'state' ? 'pre' : 'post';
    // the getter returns a new object every time: the watcher fires on every
    // change of what it reads, and the runner compares the deps one by one
    if (effect.immediate) {
      // Vue runs an immediate watcher's callback right away, with the deps
      // it just started tracking
      const runner = createEffectRunner(effect, null);
      watch(effect.deps, runner, { flush, immediate: true });
      return { effect, runner };
    }
    // a plain watcher compares with the values at setup time
    const runner = createEffectRunner(
      effect,
      effect.runOnMount ? null : effect.deps(),
    );
    watch(effect.deps, runner, { flush });
    return { effect, runner };
  });

  if (!mount && !effects.some((effect) => effect.runOnMount)) {
    return;
  }

  onMounted(() => {
    mount?.before?.();
    for (const { effect, runner } of runners) {
      if (effect.runOnMount) {
        runner(effect.deps());
      }
    }
    mount?.after?.();
  });
}
