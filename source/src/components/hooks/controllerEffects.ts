/**
 * A framework-neutral effect: the logic of a component effect (what to do
 * when some values change), without the scheduling. Each framework runs a
 * list of them with its own primitives (Vue: watch + onMounted; Angular:
 * effect / afterRenderEffect + afterNextRender), so the logic exists once.
 *
 * `deps` reads the values the effect depends on - in a reactive context, so
 * reading framework state there (a Vue ref, an Angular signal) makes the
 * framework re-run the comparison when it changes. `run` gets the deps that
 * changed (compared one by one with ===). `run` itself is untracked.
 */
export type ControllerEffect<DEPS extends Record<string, unknown>> = {
  name: string;
  deps: () => DEPS;
  run: (info: {
    changes: Partial<DEPS>;
    /** the previous values of the deps in `changes` */
    previous: Partial<DEPS>;
    current: DEPS;
    /** the first run: on mount (see runOnMount) or the immediate one */
    first: boolean;
  }) => void;
  /**
   * When the effect re-runs after a change:
   * - 'dom' (the default): after the framework rendered (Vue: a watcher with
   *   flush 'post'; Angular: afterRenderEffect), like React's useEffect
   * - 'state': before the framework renders (Vue: a watcher with flush 'pre';
   *   Angular: effect)
   */
  timing?: 'state' | 'dom';
  /**
   * Run once the component is mounted, with every dep reported as changed
   * (like React's useEffectWithChanges). Otherwise it only runs when a dep
   * changes after the effect started.
   */
  runOnMount?: boolean;
  /**
   * Run right away - synchronously, when the effects start (in the
   * component's setup) - with every dep reported as changed (Vue's
   * `immediate: true`). Not to be combined with runOnMount.
   */
  immediate?: boolean;
};

/**
 * A piece of framework state that effects read and write (a Vue ref, an
 * Angular signal).
 */
export type ReactiveCell<T> = {
  /** reads the value in a reactive context (use it in `deps`) */
  get: () => T;
  /**
   * reads the value without tracking where the framework can (Angular);
   * Vue has no untracked read, so there it is the same as `get`
   */
  peek: () => T;
  /** makes the effects that read the value re-run */
  set: (value: T) => void;
};

/**
 * The changed deps, or null when none changed.
 */
export function diffEffectDeps<DEPS extends Record<string, unknown>>(
  current: DEPS,
  previous: Partial<DEPS> | null,
): { changes: Partial<DEPS>; previous: Partial<DEPS> } | null {
  const changes: Partial<DEPS> = {};
  const previousValues: Partial<DEPS> = {};
  let changed = false;
  for (const key in current) {
    if (current.hasOwnProperty(key)) {
      if (!previous || current[key] !== previous[key]) {
        changes[key] = current[key];
        previousValues[key] = previous ? previous[key] : undefined;
        changed = true;
      }
    }
  }
  return changed ? { changes, previous: previousValues } : null;
}

/**
 * Runs an effect's comparison: call it with the current deps whenever the
 * framework tells the effect to re-check.
 *
 * `initialDeps` is what the first call compares with - null reports every
 * dep as changed (the mount run, the immediate run).
 */
export function createEffectRunner<DEPS extends Record<string, unknown>>(
  effect: ControllerEffect<DEPS>,
  initialDeps: DEPS | null,
) {
  let previous: Partial<DEPS> | null = initialDeps;
  let first = !!(effect.runOnMount || effect.immediate);

  return (current: DEPS) => {
    const wasFirst = first;
    const diff = diffEffectDeps(current, wasFirst ? null : previous);
    previous = current;
    first = false;
    if (!diff) {
      return;
    }
    effect.run({
      changes: diff.changes,
      previous: diff.previous,
      current,
      first: wasFirst,
    });
  };
}
