import {
  Injector,
  afterNextRender,
  afterRenderEffect,
  untracked,
} from '@angular/core';

import { ControllerEffect, createEffectRunner } from './controllerEffects';

/**
 * Runs framework-neutral effects (controllerEffects.ts) for an Angular
 * component: each one is an afterRenderEffect - like React's useEffect and
 * Vue's post-flush watchers, it runs after the views were rendered - and the
 * mount runs happen in afterNextRender.
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
  let mounted = false;

  const runners = effects.map((effect) => {
    const runner = createEffectRunner(
      effect,
      effect.runOnMount ? null : untracked(effect.deps),
    );
    return { effect, runner };
  });

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

  for (const { effect, runner } of runners) {
    afterRenderEffect(
      () => {
        const deps = effect.deps();
        if (!mounted && effect.runOnMount) {
          // the mount run above takes care of it
          return;
        }
        untracked(() => runner(deps));
      },
      { injector },
    );
  }
}
