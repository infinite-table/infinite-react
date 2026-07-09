/**
 * @jest-environment jsdom
 *
 * Pinning tests for buildManagedComponent (useComponentState).
 *
 * This suite captures the EXACT current semantics of the managed component
 * state system (controlled/uncontrolled props, generated action setters,
 * auto-fired callbacks, prop-diff sync, parent-state propagation) so the
 * planned extraction of framework-neutral pure functions can be verified
 * to be a zero-behavior-change refactor. Later, the same suite (parameterized)
 * must pass against other framework adapters (Vue, etc.).
 */
import * as React from 'react';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';

import { buildManagedComponent } from './index';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

type Harness<T_PROPS extends object> = {
  render: (props: T_PROPS) => void;
  unmount: () => void;
  getContextValue: () => any;
  getState: () => any;
  getActions: () => any;
};

function createHarness<T_PROPS extends object>(config: any): Harness<T_PROPS> {
  const { useManagedComponent } = buildManagedComponent(config);

  let latestContextValue: any = null;

  function Host(props: T_PROPS) {
    const { contextValue } = useManagedComponent(props as any);
    latestContextValue = contextValue;
    return null;
  }

  const container = document.createElement('div');
  document.body.appendChild(container);
  const root: Root = createRoot(container);

  return {
    render(props: T_PROPS) {
      act(() => {
        root.render(<Host {...props} />);
      });
    },
    unmount() {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
    getContextValue: () => latestContextValue,
    getState: () => latestContextValue.componentState,
    getActions: () => latestContextValue.componentActions,
  };
}

type TestProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (...args: any[]) => void;
  onSelectionChange?: (...args: any[]) => void;
  multiplier?: number;
  children?: React.ReactNode;
};

describe('buildManagedComponent - controlled/uncontrolled resolution', () => {
  test('uncontrolled prop reads default${Prop} at init', () => {
    const harness = createHarness<TestProps>({
      forwardProps: () => ({ value: 1 }),
    });
    harness.render({ defaultValue: 'initial' });

    expect(harness.getState().value).toBe('initial');
    harness.unmount();
  });

  test('controlled prop reads the prop itself at init', () => {
    const harness = createHarness<TestProps>({
      forwardProps: () => ({ value: 1 }),
    });
    harness.render({ value: 'controlled', defaultValue: 'ignored' });

    expect(harness.getState().value).toBe('controlled');
    harness.unmount();
  });

  test('setter on uncontrolled prop updates state AND fires on${Prop}Change with the raw value', () => {
    const onValueChange = jest.fn();
    const harness = createHarness<TestProps>({
      forwardProps: () => ({ value: 1 }),
    });
    harness.render({ defaultValue: 'a', onValueChange });

    act(() => {
      harness.getActions().value = 'b';
    });

    expect(harness.getState().value).toBe('b');
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith('b');
    harness.unmount();
  });

  test('setter on controlled prop skips the state write but STILL fires the callback', () => {
    const onValueChange = jest.fn();
    const harness = createHarness<TestProps>({
      forwardProps: () => ({ value: 1 }),
    });
    harness.render({ value: 'a', onValueChange });

    act(() => {
      harness.getActions().value = 'b';
    });

    expect(harness.getState().value).toBe('a'); // state untouched
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith('b');
    harness.unmount();
  });

  test('allowedControlledPropOverrides allows the state write on a controlled prop', () => {
    const onValueChange = jest.fn();
    const harness = createHarness<TestProps>({
      forwardProps: () => ({ value: 1 }),
      allowedControlledPropOverrides: { value: true },
    });
    harness.render({ value: 'a', onValueChange });

    act(() => {
      harness.getActions().value = 'b';
    });

    expect(harness.getState().value).toBe('b');
    expect(onValueChange).toHaveBeenCalledWith('b');
    harness.unmount();
  });

  test('controlled prop change from the parent syncs into state', () => {
    const harness = createHarness<TestProps>({
      forwardProps: () => ({ value: 1 }),
    });
    harness.render({ value: 'a' });
    expect(harness.getState().value).toBe('a');

    harness.render({ value: 'b' });
    expect(harness.getState().value).toBe('b');
    harness.unmount();
  });
});

describe('buildManagedComponent - setter pipeline', () => {
  test('callback receives the RAW setter value; state receives the forwardFn-transformed value', () => {
    const onValueChange = jest.fn();
    const harness = createHarness<TestProps>({
      forwardProps: () => ({
        value: (v: string) => (v ? v.toUpperCase() : v),
      }),
    });
    harness.render({ defaultValue: 'abc', onValueChange });

    // init also goes through forwardFn
    expect(harness.getState().value).toBe('ABC');

    act(() => {
      harness.getActions().value = 'def';
    });

    expect(onValueChange).toHaveBeenCalledWith('def'); // raw
    expect(harness.getState().value).toBe('DEF'); // transformed
    harness.unmount();
  });

  test('mappedCallbacks remaps the callback name and params', () => {
    const onValueChange = jest.fn();
    const onSelectionChange = jest.fn();
    const harness = createHarness<TestProps>({
      forwardProps: () => ({ value: 1 }),
      mappedCallbacks: {
        value: (value: string) => ({
          callbackName: 'onSelectionChange',
          callbackParams: [value, 'extra'],
        }),
      },
    });
    harness.render({ defaultValue: 'a', onValueChange, onSelectionChange });

    act(() => {
      harness.getActions().value = 'b';
    });

    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange).toHaveBeenCalledWith('b', 'extra');
    expect(onValueChange).not.toHaveBeenCalled();
    harness.unmount();
  });

  test('interceptActions returning false suppresses the callback but the state still updates', () => {
    const onValueChange = jest.fn();
    const intercept = jest.fn().mockReturnValue(false);
    const harness = createHarness<TestProps>({
      forwardProps: () => ({ value: 1 }),
      interceptActions: { value: intercept },
    });
    harness.render({ defaultValue: 'a', onValueChange });

    act(() => {
      harness.getActions().value = 'b';
    });

    expect(intercept).toHaveBeenCalledTimes(1);
    expect(intercept.mock.calls[0][0]).toBe('b');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(harness.getState().value).toBe('b');
    harness.unmount();
  });

  test('same-value setter calls are NOT skipped (#samevaluecheckfailswhennotflushed)', () => {
    const onValueChange = jest.fn();
    const concludeReducer = jest.fn(({ state }: any) => state);
    const harness = createHarness<TestProps>({
      forwardProps: () => ({ value: 1 }),
      concludeReducer,
    });
    harness.render({ defaultValue: 'a', onValueChange });

    const callsBefore = concludeReducer.mock.calls.length;

    act(() => {
      harness.getActions().value = 'a'; // same as current state value
    });

    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith('a');
    // the dispatch still went through the reducer
    expect(concludeReducer.mock.calls.length).toBeGreaterThan(callsBefore);
    harness.unmount();
  });
});

describe('buildManagedComponent - mapPropsToState & prop-diff', () => {
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
    const harness = createHarness<TestProps>(makeConfig({}));
    harness.render({ defaultValue: 'a', multiplier: 2 });

    expect(harness.getState().computed).toBe('a:2');
    harness.unmount();
  });

  test('changing a prop read inside mapPropsToState (not in forwardProps) triggers re-derivation', () => {
    const harness = createHarness<TestProps>(makeConfig({}));
    harness.render({ defaultValue: 'a', multiplier: 2 });
    expect(harness.getState().computed).toBe('a:2');

    harness.render({ defaultValue: 'a', multiplier: 3 });
    expect(harness.getState().computed).toBe('a:3');
    harness.unmount();
  });

  test('defined -> undefined prop transitions are detected', () => {
    const harness = createHarness<TestProps>(makeConfig({}));
    harness.render({ defaultValue: 'a', multiplier: 5 });
    expect(harness.getState().computed).toBe('a:5');

    harness.render({ defaultValue: 'a' }); // multiplier removed
    expect(harness.getState().computed).toBe('a:1');
    harness.unmount();
  });

  test('onPropChange fires per changed prop and onPropsChange once, with old/new values', () => {
    const onPropChange = jest.fn();
    const onPropsChange = jest.fn();
    const harness = createHarness<TestProps>(
      makeConfig({ onPropChange, onPropsChange }),
    );
    harness.render({ value: 'a', multiplier: 2 });

    onPropChange.mockClear();
    onPropsChange.mockClear();

    harness.render({ value: 'b', multiplier: 3 });

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

  test('children changes are ignored by the prop-diff', () => {
    const concludeReducer = jest.fn(({ state }: any) => state);
    const onPropsChange = jest.fn();
    const harness = createHarness<TestProps>(
      makeConfig({ concludeReducer, onPropsChange }),
    );
    harness.render({ value: 'a', children: <span>one</span> });

    const callsBefore = concludeReducer.mock.calls.length;
    onPropsChange.mockClear();

    harness.render({ value: 'a', children: <span>two</span> });

    expect(concludeReducer.mock.calls.length).toBe(callsBefore);
    expect(onPropsChange).not.toHaveBeenCalled();
    harness.unmount();
  });

  test('concludeReducer receives previousState, state, updatedProps and parentState', () => {
    const concludeReducer = jest.fn(({ state }: any) => state);
    const harness = createHarness<TestProps>(makeConfig({ concludeReducer }));
    harness.render({ value: 'a', multiplier: 2 });

    concludeReducer.mockClear();
    harness.render({ value: 'a', multiplier: 7 });

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

describe('buildManagedComponent - initSetupState, assignState, replaceState', () => {
  test('initSetupState contributes to initial state', () => {
    const harness = createHarness<TestProps>({
      initSetupState: () => ({ setupFlag: true, internal: 42 }),
      forwardProps: () => ({ value: 1 }),
    });
    harness.render({ defaultValue: 'x' });

    expect(harness.getState().setupFlag).toBe(true);
    expect(harness.getState().internal).toBe(42);
    expect(harness.getState().value).toBe('x');
    harness.unmount();
  });

  test('assignState merges partial state; NOTE: the payload is applied AFTER mapPropsToState, so derived state lags until the next dispatch', () => {
    const concludeReducer = jest.fn(({ state }: any) => state);
    const harness = createHarness<TestProps>({
      forwardProps: () => ({ value: 1 }),
      mapPropsToState: ({ state }: any) => ({
        computed: `derived:${state.value}`,
      }),
      concludeReducer,
    });
    harness.render({ defaultValue: 'a' });
    concludeReducer.mockClear();

    act(() => {
      harness.getContextValue().assignState({ value: 'z' });
    });

    expect(harness.getState().value).toBe('z');
    // pinning current behavior: ASSIGN_STATE's Object.assign happens after
    // mapPropsToState ran against the pre-assign state, so `computed` still
    // reflects the old `value` - it only catches up on the next dispatch
    expect(harness.getState().computed).toBe('derived:a');
    expect(concludeReducer).toHaveBeenCalled();
    harness.unmount();
  });

  test('replaceState swaps the whole state without running mapPropsToState/concludeReducer', () => {
    const concludeReducer = jest.fn(({ state }: any) => state);
    const harness = createHarness<TestProps>({
      forwardProps: () => ({ value: 1 }),
      concludeReducer,
    });
    harness.render({ defaultValue: 'a' });
    concludeReducer.mockClear();

    const replacement = { value: 'replaced', other: 1 };
    act(() => {
      harness.getContextValue().replaceState(replacement);
    });

    expect(harness.getState()).toBe(replacement);
    expect(concludeReducer).not.toHaveBeenCalled();
    harness.unmount();
  });
});

describe('buildManagedComponent - lifecycle', () => {
  test('KNOWN QUIRK: config.cleanup is currently never invoked on unmount', () => {
    // useEffectOnce (useEffectOnceWithProperUnmount.ts) stores the effect
    // callback and invokes IT at unmount - but the destructor the callback
    // returns (the function that would call config.cleanup) is discarded and
    // never executed. So config.cleanup never fires. This is pinned here as
    // current behavior; if this gets fixed intentionally, update this test to
    // assert cleanup IS called with the latest state.
    const cleanup = jest.fn();
    const harness = createHarness<TestProps>({
      forwardProps: () => ({ value: 1 }),
      cleanup,
    });
    harness.render({ defaultValue: 'a' });

    act(() => {
      harness.getActions().value = 'latest';
    });

    harness.unmount();

    expect(cleanup).not.toHaveBeenCalled();
  });
});

describe('buildManagedComponent - parent state propagation', () => {
  const ParentCtx = React.createContext<any>(null);

  function createParentHarness(config: any) {
    const { useManagedComponent } = buildManagedComponent({
      ...config,
      getParentState: () => React.useContext(ParentCtx),
    });

    let latestContextValue: any = null;

    function Host(props: any) {
      const { contextValue } = useManagedComponent(props);
      latestContextValue = contextValue;
      return null;
    }

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    return {
      render(parentState: any, props: any) {
        act(() => {
          root.render(
            <ParentCtx.Provider value={parentState}>
              <Host {...props} />
            </ParentCtx.Provider>,
          );
        });
      },
      unmount() {
        act(() => root.unmount());
        container.remove();
      },
      getState: () => latestContextValue.componentState,
    };
  }

  test('parent state change triggers a reducer run with the new parentState', () => {
    const concludeReducer = jest.fn(({ state, parentState }: any) => ({
      ...state,
      seenParent: parentState,
    }));
    const harness = createParentHarness({
      forwardProps: () => ({ value: 1 }),
      concludeReducer,
    });

    const parentA = { tick: 1 };
    harness.render(parentA, { defaultValue: 'a' });

    const parentB = { tick: 2 };
    concludeReducer.mockClear();
    harness.render(parentB, { defaultValue: 'a' });

    expect(concludeReducer).toHaveBeenCalled();
    expect(harness.getState().seenParent).toBe(parentB);
    harness.unmount();
  });

  test('skipTriggerParentStateChange guard: simultaneous prop + parent change dispatches only once', () => {
    const concludeReducer = jest.fn(({ state }: any) => state);
    const harness = createParentHarness({
      forwardProps: () => ({ value: 1 }),
      concludeReducer,
    });

    harness.render({ tick: 1 }, { value: 'a' });
    concludeReducer.mockClear();

    // both the controlled prop and the parent state change in the same render
    harness.render({ tick: 2 }, { value: 'b' });

    expect(harness.getState().value).toBe('b');
    expect(concludeReducer).toHaveBeenCalledTimes(1);
    harness.unmount();
  });
});
