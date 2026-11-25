import { onMounted, watch } from 'vue';

import { ControllerEffect, createEffectRunner } from './controllerEffects';

/**
 * Runs framework-neutral effects (controllerEffects.ts) in a Vue component's
 * setup: a post-flush watcher each, and the mount runs in onMounted.
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
    // a plain watcher compares with the values at setup time
    const runner = createEffectRunner(
      effect,
      effect.runOnMount ? null : effect.deps(),
    );
    // the getter returns a new object every time: the watcher fires on every
    // change of what it reads, and the runner compares the deps one by one
    watch(effect.deps, runner, { flush: 'post' });
    return { effect, runner };
  });

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
