import {
  Injector,
  afterNextRender,
  afterRenderEffect,
  effect as angularEffect,
  untracked,
} from '@angular/core';

import { ControllerEffect, createEffectRunner } from './controllerEffects';

/**
 * Runs framework-neutral effects (controllerEffects.ts) for an Angular
 * component, in the order of the list: an afterRenderEffect each for the
 * 'dom' timing - like React's useEffect and Vue's post-flush watchers, it
 * runs after the views were rendered - and an effect for 'state' (before
 * the views render). Immediate runs happen right away, and the mount runs
 * in afterNextRender.
 *
 * Call it once the component's state exists (ngOnInit), with the
 * component's injector.
 */
export function runControllerEffectsForAngular(
  effects: ControllerEffect<any>[],
  options: {
    injector: Injector;
    /** after the first render, before the effects' mount runs */
    before?: () => void;
    /** after the first render, after the effects' mount runs */
    after?: () => void;
  },
) {
  const { injector } = options;
  const hasMountRuns = effects.some((effect) => effect.runOnMount);
  // without mount runs, nothing waits for the first render
  let mounted = !hasMountRuns && !options.before && !options.after;

  const runners = effects.map((effect) => {
    const runner = createEffectRunner(
      effect,
      effect.runOnMount || effect.immediate ? null : untracked(effect.deps),
    );
    if (effect.immediate) {
      untracked(() => runner(effect.deps()));
    }
    return { effect, runner };
  });

  if (!mounted) {
    afterNextRender(
      () => {
        options.before?.();
        for (const { effect, runner } of runners) {
          if (effect.runOnMount) {
            runner(untracked(effect.deps));
          }
        }
        mounted = true;
        options.after?.();
      },
      { injector },
    );
  }

  for (const { effect, runner } of runners) {
    const check = () => {
      const deps = effect.deps();
      if (!mounted && effect.runOnMount) {
        // the mount run above takes care of it
        return;
      }
      untracked(() => runner(deps));
    };
    if (effect.timing === 'state') {
      angularEffect(check, { injector });
    } else {
      afterRenderEffect(check, { injector });
    }
  }
}
