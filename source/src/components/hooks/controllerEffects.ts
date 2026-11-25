/**
 * A framework-neutral effect: the logic of a component effect (what to do
 * when some values change), without the scheduling. Each framework runs a
 * list of them with its own primitives (Vue: watch with flush 'post' +
 * onMounted; Angular: afterRenderEffect), so the logic exists once.
 *
 * `deps` reads the values the effect depends on - in a reactive context, so
 * reading framework state there (a Vue ref, an Angular signal) makes the
 * framework re-run the comparison when it changes. `run` gets the deps that
 * changed (compared one by one with ===).
 */
export type ControllerEffect<DEPS extends Record<string, unknown>> = {
  name: string;
  deps: () => DEPS;
  run: (info: {
    changes: Partial<DEPS>;
    previous: Partial<DEPS>;
    current: DEPS;
    /** the run on mount (see runOnMount) */
    first: boolean;
  }) => void;
  /**
   * Run once the component is mounted, with every dep reported as changed
   * (like React's useEffectWithChanges). Otherwise it only runs when a dep
   * changes after the effect started.
   */
  runOnMount?: boolean;
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
 */
export function createEffectRunner<DEPS extends Record<string, unknown>>(
  effect: ControllerEffect<DEPS>,
  initialDeps: DEPS | null,
) {
  let previous: Partial<DEPS> | null = initialDeps;
  let first = !!effect.runOnMount;

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
