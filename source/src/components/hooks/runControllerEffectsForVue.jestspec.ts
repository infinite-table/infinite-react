/**
 * @jest-environment jsdom
 *
 * runControllerEffectsForVue: when the framework-neutral effects run in a
 * Vue component - immediate runs in the setup, 'state' effects before the
 * render, 'dom' effects after it.
 */
import { createApp, defineComponent, h, nextTick, ref } from 'vue';
import type { App, Ref } from 'vue';

import type { ControllerEffect } from './controllerEffects';
import { runControllerEffectsForVue } from './runControllerEffectsForVue.vue';

type Run = {
  name: string;
  changes: Record<string, unknown>;
  previous: Record<string, unknown>;
  first: boolean;
};

function mount(
  createEffects: (
    source: Ref<number>,
    log: (entry: any) => void,
  ) => {
    effects: ControllerEffect<any>[];
  },
) {
  const source = ref(1);
  const entries: (Run | string)[] = [];
  const log = (entry: Run | string) => entries.push(entry);

  const Host = defineComponent({
    setup() {
      const { effects } = createEffects(source, log);
      runControllerEffectsForVue(effects);
      log('setup done');
      return () => {
        log(`render ${source.value}`);
        return h('div', String(source.value));
      };
    },
  });

  const el = document.createElement('div');
  document.body.appendChild(el);
  const app: App = createApp(Host);
  app.mount(el);

  return {
    source,
    entries,
    unmount: () => {
      app.unmount();
      el.remove();
    },
  };
}

function effect(
  name: string,
  source: Ref<number>,
  log: (entry: Run) => void,
  options: Partial<ControllerEffect<any>>,
): ControllerEffect<{ value: number }> {
  return {
    name,
    deps: () => ({ value: source.value }),
    run: ({ changes, previous, first }) => {
      log({ name, changes, previous, first });
    },
    ...options,
  };
}

describe('runControllerEffectsForVue', () => {
  it('an immediate effect runs in the setup, then on each change', async () => {
    const { source, entries, unmount } = mount((source, log) => ({
      effects: [
        effect('state', source, log, { timing: 'state', immediate: true }),
        effect('dom', source, log, { timing: 'dom', immediate: true }),
      ],
    }));

    expect(entries).toEqual([
      {
        name: 'state',
        changes: { value: 1 },
        previous: { value: undefined },
        first: true,
      },
      {
        name: 'dom',
        changes: { value: 1 },
        previous: { value: undefined },
        first: true,
      },
      'setup done',
      'render 1',
    ]);

    entries.length = 0;
    source.value = 2;
    await nextTick();

    expect(entries).toEqual([
      {
        name: 'state',
        changes: { value: 2 },
        previous: { value: 1 },
        first: false,
      },
      'render 2',
      {
        name: 'dom',
        changes: { value: 2 },
        previous: { value: 1 },
        first: false,
      },
    ]);
    unmount();
  });

  it('a plain effect only runs when a dep changes', async () => {
    const { source, entries, unmount } = mount((source, log) => ({
      effects: [effect('state', source, log, { timing: 'state' })],
    }));

    expect(entries).toEqual(['setup done', 'render 1']);

    entries.length = 0;
    source.value = 2;
    await nextTick();
    expect(entries).toEqual([
      {
        name: 'state',
        changes: { value: 2 },
        previous: { value: 1 },
        first: false,
      },
      'render 2',
    ]);
    unmount();
  });

  it('the dom timing is the default', async () => {
    const { source, entries, unmount } = mount((source, log) => ({
      effects: [effect('dom', source, log, {})],
    }));

    entries.length = 0;
    source.value = 2;
    await nextTick();
    expect(entries).toEqual([
      'render 2',
      {
        name: 'dom',
        changes: { value: 2 },
        previous: { value: 1 },
        first: false,
      },
    ]);
    unmount();
  });

  it('a change made by an immediate run makes it run again', async () => {
    const { entries, unmount } = mount((source, log) => ({
      effects: [
        {
          name: 'bump',
          timing: 'state',
          immediate: true,
          deps: () => ({ value: source.value }),
          run: ({ current }) => {
            log(`bump ${current.value}`);
            if (current.value < 3) {
              source.value = current.value + 1;
            }
          },
        },
      ],
    }));

    await nextTick();
    expect(entries).toEqual([
      'bump 1',
      'setup done',
      // the mount renders synchronously; the watcher already tracks the
      // value, so the change made in the setup re-runs it in the next flush
      // (what a Vue watcher with immediate: true does)
      'render 2',
      'bump 2',
      'bump 3',
      'render 3',
    ]);
    unmount();
  });
});
