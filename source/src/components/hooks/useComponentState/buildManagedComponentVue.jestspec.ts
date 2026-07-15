/**
 * @jest-environment jsdom
 *
 * Vue-adapter counterpart of buildManagedComponent.jestspec.tsx: the same
 * managed-state semantics, verified through the Vue composable
 * (useManagedComponent.vue.ts). Scenario-by-scenario mirror of the React
 * pinning suite, so the two adapters are kept contract-identical.
 */
import { createApp, defineComponent, h, nextTick, ref, shallowRef } from 'vue';
import type { App, Ref, ShallowRef } from 'vue';

import { buildManagedVueComponent } from './useManagedComponent.vue';

type Harness = {
  render: (props: any) => Promise<void>;
  unmount: () => void;
  getContextValue: () => any;
  getState: () => any;
  getActions: () => any;
  emitted: Record<string, any[][]>;
};

/**
 * Mounts a host component using the composable. Props are passed through a
 * reactive ref so `render(newProps)` mimics a parent re-rendering with new
 * props (Vue: parent re-render patches the child's props).
 */
function createHarness(config: any, initialProps: any = {}): Harness {
  const { useManagedComponent } = buildManagedVueComponent(config);

  let latestContextValue: any = null;
  const emitted: Record<string, any[][]> = {};

  const propsRef: Ref<any> = ref(initialProps);

  // list all prop keys the tests use, so Vue resolves them as props
  const PROP_KEYS = [
    'value',
    'defaultValue',
    'onValueChange',
    'onSelectionChange',
    'multiplier',
  ];

  const Host = defineComponent({
    name: 'Host',
    props: PROP_KEYS,
    emits: ['update:value'],
    setup(props) {
      const { contextValue } = useManagedComponent(props);
      latestContextValue = contextValue;
      return () => null;
    },
  });

  const Parent = defineComponent({
    name: 'Parent',
    setup() {
      return () =>
        h(Host, {
          ...propsRef.value,
          'onUpdate:value': (...args: any[]) => {
            (emitted['update:value'] ??= []).push(args);
          },
        });
    },
  });

  const container = document.createElement('div');
  document.body.appendChild(container);

  const app: App = createApp(Parent);
  app.config.warnHandler = () => {};
  app.mount(container);

  return {
    async render(props: any) {
      propsRef.value = props;
      await nextTick();
      // prop-diff watcher runs with flush: 'post'
      await nextTick();
    },
    unmount() {
      app.unmount();
      container.remove();
    },
    getContextValue: () => latestContextValue,
    getState: () => latestContextValue.componentState,
    getActions: () => latestContextValue.componentActions,
    emitted,
  };
}

async function flush() {
  await nextTick();
  await nextTick();
}

describe('buildManagedVueComponent - controlled/uncontrolled resolution', () => {
  test('uncontrolled prop reads default${Prop} at init', () => {
    const harness = createHarness(
      { forwardProps: () => ({ value: 1 }) },
      { defaultValue: 'initial' },
    );

    expect(harness.getState().value).toBe('initial');
    harness.unmount();
  });

  test('controlled prop reads the prop itself at init', () => {
    const harness = createHarness(
      { forwardProps: () => ({ value: 1 }) },
      { value: 'controlled', defaultValue: 'ignored' },
    );

    expect(harness.getState().value).toBe('controlled');
    harness.unmount();
  });

  test('setter on uncontrolled prop updates state AND fires on${Prop}Change with the raw value', async () => {
    const onValueChange = jest.fn();
    const harness = createHarness(
      { forwardProps: () => ({ value: 1 }) },
      { defaultValue: 'a', onValueChange },
    );

    harness.getActions().value = 'b';
    await flush();

    expect(harness.getState().value).toBe('b');
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith('b');
    harness.unmount();
  });

  test('setter on controlled prop skips the state write but STILL fires the callback', async () => {
    const onValueChange = jest.fn();
    const harness = createHarness(
      { forwardProps: () => ({ value: 1 }) },
      { value: 'a', onValueChange },
    );

    harness.getActions().value = 'b';
    await flush();

    expect(harness.getState().value).toBe('a'); // state untouched
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith('b');
    harness.unmount();
  });

  test('setter also emits update:${prop} — the v-model channel', async () => {
    const harness = createHarness(
      { forwardProps: () => ({ value: 1 }) },
      { value: 'a' },
    );

    harness.getActions().value = 'b';
    await flush();

    expect(harness.emitted['update:value']).toEqual([['b']]);
    harness.unmount();
  });

  test('allowedControlledPropOverrides allows the state write on a controlled prop', async () => {
    const onValueChange = jest.fn();
    const harness = createHarness(
      {
        forwardProps: () => ({ value: 1 }),
        allowedControlledPropOverrides: { value: true },
      },
      { value: 'a', onValueChange },
    );

    harness.getActions().value = 'b';
    await flush();

    expect(harness.getState().value).toBe('b');
    expect(onValueChange).toHaveBeenCalledWith('b');
    harness.unmount();
  });

  test('controlled prop change from the parent syncs into state', async () => {
    const harness = createHarness(
      { forwardProps: () => ({ value: 1 }) },
      { value: 'a' },
    );
    expect(harness.getState().value).toBe('a');

    await harness.render({ value: 'b' });
    expect(harness.getState().value).toBe('b');
    harness.unmount();
  });
});

describe('buildManagedVueComponent - setter pipeline', () => {
  test('callback receives the RAW setter value; state receives the forwardFn-transformed value', async () => {
    const onValueChange = jest.fn();
    const harness = createHarness(
      {
        forwardProps: () => ({
          value: (v: string) => (v ? v.toUpperCase() : v),
        }),
      },
      { defaultValue: 'abc', onValueChange },
    );

    // init also goes through forwardFn
    expect(harness.getState().value).toBe('ABC');

    harness.getActions().value = 'def';
    await flush();

    expect(onValueChange).toHaveBeenCalledWith('def'); // raw
    expect(harness.getState().value).toBe('DEF'); // transformed
    harness.unmount();
  });

  test('mappedCallbacks remaps the callback name and params', async () => {
    const onValueChange = jest.fn();
    const onSelectionChange = jest.fn();
    const harness = createHarness(
      {
        forwardProps: () => ({ value: 1 }),
        mappedCallbacks: {
          value: (value: string) => ({
            callbackName: 'onSelectionChange',
            callbackParams: [value, 'extra'],
          }),
        },
      },
      { defaultValue: 'a', onValueChange, onSelectionChange },
    );

    harness.getActions().value = 'b';
    await flush();

    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange).toHaveBeenCalledWith('b', 'extra');
    expect(onValueChange).not.toHaveBeenCalled();
    harness.unmount();
  });

  test('interceptActions returning false suppresses the callback but the state still updates', async () => {
    const onValueChange = jest.fn();
    const intercept = jest.fn().mockReturnValue(false);
    const harness = createHarness(
      {
        forwardProps: () => ({ value: 1 }),
        interceptActions: { value: intercept },
      },
      { defaultValue: 'a', onValueChange },
    );

    harness.getActions().value = 'b';
    await flush();

    expect(intercept).toHaveBeenCalledTimes(1);
    expect(intercept.mock.calls[0][0]).toBe('b');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(harness.getState().value).toBe('b');
    harness.unmount();
  });

  test('same-value setter calls are NOT skipped (#samevaluecheckfailswhennotflushed)', async () => {
    const onValueChange = jest.fn();
    const concludeReducer = jest.fn(({ state }: any) => state);
    const harness = createHarness(
      { forwardProps: () => ({ value: 1 }), concludeReducer },
      { defaultValue: 'a', onValueChange },
    );

    const callsBefore = concludeReducer.mock.calls.length;

    harness.getActions().value = 'a'; // same as current state value
    await flush();

    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith('a');
    // the dispatch still went through the reducer
    expect(concludeReducer.mock.calls.length).toBeGreaterThan(callsBefore);
    harness.unmount();
  });
});

describe('buildManagedVueComponent - mapPropsToState & prop-diff', () => {
  const makeConfig = (spies: {
    concludeReducer?: jest.Mock;
    onPropChange?: jest.Mock;
    onPropsChange?: jest.Mock;
  }) => ({
    forwardProps: () => ({ value: 1 }),
    mapPropsToState: ({ props, state }: any) => {
      // reads props.multiplier -> proxyFn should record this read
      const multiplier = props.multiplier ?? 1;
      return {
        computed: `${state.value}:${multiplier}`,
      };
    },
    concludeReducer: spies.concludeReducer ?? (({ state }: any) => state),
    onPropChange: spies.onPropChange,
    onPropsChange: spies.onPropsChange,
  });

  test('mapPropsToState derives state at init', () => {
    const harness = createHarness(makeConfig({}), {
      defaultValue: 'a',
      multiplier: 2,
    });

    expect(harness.getState().computed).toBe('a:2');
    harness.unmount();
  });

  test('changing a prop read inside mapPropsToState (not in forwardProps) triggers re-derivation', async () => {
    const harness = createHarness(makeConfig({}), {
      defaultValue: 'a',
      multiplier: 2,
    });
    expect(harness.getState().computed).toBe('a:2');

    await harness.render({ defaultValue: 'a', multiplier: 3 });
    expect(harness.getState().computed).toBe('a:3');
    harness.unmount();
  });

  test('defined -> undefined prop transitions are detected', async () => {
    const harness = createHarness(makeConfig({}), {
      defaultValue: 'a',
      multiplier: 5,
    });
    expect(harness.getState().computed).toBe('a:5');

    await harness.render({ defaultValue: 'a' }); // multiplier removed
    expect(harness.getState().computed).toBe('a:1');
    harness.unmount();
  });

  test('onPropChange fires per changed prop and onPropsChange once, with old/new values', async () => {
    const onPropChange = jest.fn();
    const onPropsChange = jest.fn();
    const harness = createHarness(makeConfig({ onPropChange, onPropsChange }), {
      value: 'a',
      multiplier: 2,
    });

    onPropChange.mockClear();
    onPropsChange.mockClear();

    await harness.render({ value: 'b', multiplier: 3 });

    const changedPropNames = onPropChange.mock.calls.map(
      (call: any[]) => call[0].name,
    );
    expect(changedPropNames).toEqual(
      expect.arrayContaining(['value', 'multiplier']),
    );

    expect(onPropsChange).toHaveBeenCalledTimes(1);
    const propsDiff = onPropsChange.mock.calls[0][0];
    expect(propsDiff.value).toEqual({ newValue: 'b', oldValue: 'a' });
    expect(propsDiff.multiplier).toEqual({ newValue: 3, oldValue: 2 });
    harness.unmount();
  });

  test('concludeReducer receives previousState, state, updatedProps and parentState', async () => {
    const concludeReducer = jest.fn(({ state }: any) => state);
    const harness = createHarness(makeConfig({ concludeReducer }), {
      value: 'a',
      multiplier: 2,
    });

    concludeReducer.mockClear();
    await harness.render({ value: 'a', multiplier: 7 });

    expect(concludeReducer).toHaveBeenCalled();
    const params = concludeReducer.mock.calls[0][0];
    expect(params.previousState).toBeDefined();
    expect(params.state).toBeDefined();
    expect(params.parentState).toBeNull();
    // multiplier is a mapPropsToState-read prop, so it arrives via updatedProps
    expect(params.updatedProps).toEqual({ multiplier: 7 });
    harness.unmount();
  });
});

describe('buildManagedVueComponent - initSetupState, assignState, replaceState', () => {
  test('initSetupState contributes to initial state', () => {
    const harness = createHarness(
      {
        initSetupState: () => ({ setupFlag: true, internal: 42 }),
        forwardProps: () => ({ value: 1 }),
      },
      { defaultValue: 'x' },
    );

    expect(harness.getState().setupFlag).toBe(true);
    expect(harness.getState().internal).toBe(42);
    expect(harness.getState().value).toBe('x');
    harness.unmount();
  });

  test('assignState merges partial state; payload applied AFTER mapPropsToState (same as React adapter)', async () => {
    const concludeReducer = jest.fn(({ state }: any) => state);
    const harness = createHarness(
      {
        forwardProps: () => ({ value: 1 }),
        mapPropsToState: ({ state }: any) => ({
          computed: `derived:${state.value}`,
        }),
        concludeReducer,
      },
      { defaultValue: 'a' },
    );
    concludeReducer.mockClear();

    harness.getContextValue().assignState({ value: 'z' });
    await flush();

    expect(harness.getState().value).toBe('z');
    // same pinned ordering as React: ASSIGN_STATE's Object.assign happens
    // after mapPropsToState ran against the pre-assign state
    expect(harness.getState().computed).toBe('derived:a');
    expect(concludeReducer).toHaveBeenCalled();
    harness.unmount();
  });

  test('replaceState swaps the whole state without running mapPropsToState/concludeReducer', async () => {
    const concludeReducer = jest.fn(({ state }: any) => state);
    const harness = createHarness(
      { forwardProps: () => ({ value: 1 }), concludeReducer },
      { defaultValue: 'a' },
    );
    concludeReducer.mockClear();

    const replacement = { value: 'replaced', other: 1 };
    harness.getContextValue().replaceState(replacement);
    await flush();

    expect(harness.getState()).toBe(replacement);
    expect(concludeReducer).not.toHaveBeenCalled();
    harness.unmount();
  });
});

describe('buildManagedVueComponent - lifecycle', () => {
  test('cleanup IS invoked on unmount with the latest state (intentional divergence from the React adapter quirk)', async () => {
    // The React adapter never calls config.cleanup due to a bug in
    // useEffectOnceWithProperUnmount (pinned as KNOWN QUIRK in the React
    // suite). The Vue adapter implements the documented contract instead:
    // cleanup(state) runs on unmount with the latest state.
    const cleanup = jest.fn();
    const harness = createHarness(
      { forwardProps: () => ({ value: 1 }), cleanup },
      { defaultValue: 'a' },
    );

    harness.getActions().value = 'latest';
    await flush();

    harness.unmount();

    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(cleanup.mock.calls[0][0].value).toBe('latest');
  });
});

describe('buildManagedVueComponent - parent state propagation', () => {
  // NOTE: parent state must live in a shallowRef — a deep ref would wrap the
  // parent state in a reactive Proxy and break the reference-equality
  // contract of the shared core (parentState identity is load-bearing).
  function createParentHarness(config: any, parentRef: ShallowRef<any>) {
    return createHarnessWithParent(config, parentRef);
  }

  function createHarnessWithParent(config: any, parentRef: ShallowRef<any>) {
    const { useManagedComponent } = buildManagedVueComponent({
      ...config,
      getParentState: () => parentRef,
    });

    let latestContextValue: any = null;
    const propsRef: Ref<any> = ref({});

    const Host = defineComponent({
      name: 'Host',
      props: ['value', 'defaultValue'],
      setup(props) {
        const { contextValue } = useManagedComponent(props);
        latestContextValue = contextValue;
        return () => null;
      },
    });

    const Parent = defineComponent({
      setup() {
        return () => h(Host, { ...propsRef.value });
      },
    });

    const container = document.createElement('div');
    document.body.appendChild(container);
    const app = createApp(Parent);
    app.config.warnHandler = () => {};
    app.mount(container);

    return {
      async render(parentState: any, props: any) {
        parentRef.value = parentState;
        propsRef.value = props;
        await flush();
      },
      unmount() {
        app.unmount();
        container.remove();
      },
      getState: () => latestContextValue.componentState,
    };
  }

  test('parent state change triggers a reducer run with the new parentState', async () => {
    const parentRef: ShallowRef<any> = shallowRef({ tick: 1 });
    const concludeReducer = jest.fn(({ state, parentState }: any) => ({
      ...state,
      seenParent: parentState,
    }));
    const harness = createParentHarness(
      { forwardProps: () => ({ value: 1 }), concludeReducer },
      parentRef,
    );

    await harness.render({ tick: 1 }, { defaultValue: 'a' });

    const parentB = { tick: 2 };
    concludeReducer.mockClear();
    await harness.render(parentB, { defaultValue: 'a' });

    expect(concludeReducer).toHaveBeenCalled();
    expect(harness.getState().seenParent).toBe(parentB);
    harness.unmount();
  });

  test('skipTriggerParentStateChange guard: simultaneous prop + parent change dispatches only once', async () => {
    const parentRef: ShallowRef<any> = shallowRef({ tick: 1 });
    const concludeReducer = jest.fn(({ state }: any) => state);
    const harness = createParentHarness(
      { forwardProps: () => ({ value: 1 }), concludeReducer },
      parentRef,
    );

    await harness.render({ tick: 1 }, { value: 'a' });
    concludeReducer.mockClear();

    // both the controlled prop and the parent state change in the same flush
    await harness.render({ tick: 2 }, { value: 'b' });

    expect(harness.getState().value).toBe('b');
    expect(concludeReducer).toHaveBeenCalledTimes(1);
    harness.unmount();
  });
});
