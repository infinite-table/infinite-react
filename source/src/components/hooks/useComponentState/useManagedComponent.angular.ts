/**
 * Angular adapter for the managed component state system.
 *
 * All framework-free logic (controlled/uncontrolled resolution, reducer
 * body, generated action setters, prop-diff) lives in
 * ./managedComponentState.ts - the same functions the React and Vue adapters
 * delegate to. This file owns the Angular side: signal inputs and models as
 * the props, a signal holding the state, one effect for the prop diff, and
 * outputs for the callbacks.
 *
 * Two phases, because inputs are not set yet in the constructor:
 * - `injectManagedComponent(...)` in the constructor: injects the parent
 *   (DataSource) context and creates the prop-diff effect
 * - `managed.init()` in ngOnInit: computes the initial state from the props
 *
 * The props the shared code sees ("the props snapshot") are built from the
 * generated metadata (*Inputs.generated.angular.ts): every input and model
 * by its name, plus one stable function per callback (`onSortInfoChange`,
 * `onCellClick`, ...) that writes the model / emits the output.
 *
 * Models (`[(sortInfo)]`) and controlled/uncontrolled props:
 * - the grid writes a model when its value changes (`sortInfo.set(v)`), which
 *   emits `sortInfoChange` - with an unbound model the value stays local, as
 *   with an uncontrolled prop in React
 * - shared code decides "controlled" by `props.x !== undefined`, so the
 *   snapshot only shows a model's value while the parent drives it: the
 *   value was bound at init, or the parent pushed one the grid didn't write
 *   (the "masked" view). Otherwise an unbound prop would look controlled
 *   after the first internal change (multi sort would turn into single sort,
 *   group rows would stop collapsing on data changes, ...)
 * - every model is an allowed controlled override: an internal change
 *   always reaches the state, even when the parent bound the value one-way
 *   and doesn't take the change (Angular has no "locked" prop)
 * - the grid's own write coming back (`[(x)]`) is not diffed again; a value
 *   the parent pushes later goes through the normal prop diff, including
 *   `undefined` (resets the state, as React's defined -> undefined)
 */
import { DestroyRef, Signal, computed, effect, inject, signal, untracked } from '@angular/core';

import {
  applyPropsDiff,
  createGeneratedActions,
  ForwardPropsToStateFnResult,
  initManagedState,
  managedComponentReducer,
  ManagedComponentConfig,
  notifyChange,
} from './managedComponentState';
import type { AngularPropsMeta } from './angularPropsMeta';
import { ComponentStateActions } from './types';

export type AngularManagedComponentContextValue<COMPONENT_STATE, ACTIONS_TYPE> =
  {
    /** tracked read: a computed / effect / template reading it re-runs on every state change */
    state: Signal<COMPONENT_STATE>;
    componentActions: ACTIONS_TYPE;
    /** untracked read */
    getComponentState: () => COMPONENT_STATE;
    replaceState: (state: COMPONENT_STATE) => void;
    assignState: (state: Partial<COMPONENT_STATE>) => void;
    /** the current state, untracked (the React contextValue shape) */
    readonly componentState: COMPONENT_STATE;
  };

/**
 * The state of the parent managed component (InfiniteTable's DataSource).
 */
export type ManagedParentState<T_PARENT_STATE> = {
  state: Signal<T_PARENT_STATE>;
  getState: () => T_PARENT_STATE;
};

export type AngularManagedComponentConfig<
  T_PROPS,
  COMPONENT_MAPPED_STATE,
  COMPONENT_SETUP_STATE = {},
  COMPONENT_DERIVED_STATE = {},
  T_PARENT_STATE = {},
> = ManagedComponentConfig<
  T_PROPS,
  COMPONENT_MAPPED_STATE,
  COMPONENT_SETUP_STATE,
  COMPONENT_DERIVED_STATE,
  T_PARENT_STATE
> & {
  /**
   * Called in the constructor (an injection context): the parent state, if
   * any.
   */
  getParentState?: () => ManagedParentState<T_PARENT_STATE> | null;
  /**
   * Values the snapshot uses for props that are not specified (inputs can't
   * have defaults: `undefined` means "not specified").
   */
  defaults?: Partial<T_PROPS>;
};

export type AngularManagedComponent<COMPONENT_STATE, ACTIONS_TYPE> = {
  /** in ngOnInit */
  init: () => void;
  /** after init */
  readonly context: AngularManagedComponentContextValue<
    COMPONENT_STATE,
    ACTIONS_TYPE
  >;
  /** whether init() ran */
  isReady: () => boolean;
  /** the props snapshot the shared code reads (untracked) */
  getProps: () => any;
};

export function buildManagedAngularComponent<
  T_PROPS extends object,
  COMPONENT_MAPPED_STATE extends object,
  COMPONENT_SETUP_STATE extends object = {},
  COMPONENT_DERIVED_STATE extends object = {},
  T_PARENT_STATE = {},
>(
  config: AngularManagedComponentConfig<
    T_PROPS,
    COMPONENT_MAPPED_STATE,
    COMPONENT_SETUP_STATE,
    COMPONENT_DERIVED_STATE,
    T_PARENT_STATE
  >,
) {
  type COMPONENT_STATE = COMPONENT_MAPPED_STATE &
    COMPONENT_DERIVED_STATE &
    COMPONENT_SETUP_STATE;
  type ACTIONS_TYPE = ComponentStateActions<COMPONENT_STATE>;

  /**
   * Call in the constructor of the component.
   *
   * @param host the component, with the generated input/model/output members
   * @param meta the generated metadata of those members
   * @param extraProps props that don't come from a member (eg columns with
   * the template directives merged in) - read in a reactive context, so they
   * may read signals
   */
  return function injectManagedComponent(
    host: any,
    meta: AngularPropsMeta,
    extraProps?: () => Partial<T_PROPS>,
  ): AngularManagedComponent<COMPONENT_STATE, ACTIONS_TYPE> {
    const parent = config.getParentState ? config.getParentState() : null;
    const destroyRef = inject(DestroyRef);

    const models = meta.models;

    /**
     * Whether the parent drives a model: its value goes into the snapshot.
     */
    const parentDriven: Record<string, boolean> = {};
    let parentDrivenVersion = 0;
    /**
     * The last value the grid wrote into each model, until the prop-diff
     * effect has seen it.
     */
    const ownWrites = new Map<string, unknown>();

    // the props as the members hold them, including the models' local values
    const realProps = computed(() => {
      const props: any = {};
      for (const name of meta.inputs) {
        const value = host[name]();
        if (value !== undefined) {
          props[name] = value;
        }
      }
      for (const name of models) {
        const value = host[name]();
        if (value !== undefined) {
          props[name] = value;
        }
      }
      if (extraProps) {
        const extra = extraProps();
        for (const name in extra) {
          if (extra[name] !== undefined) {
            props[name] = extra[name];
          }
        }
      }
      return props;
    });

    const callbacks: Record<string, (...args: any[]) => void> = {};

    let snapshotCache: {
      real: any;
      version: number;
      props: T_PROPS;
    } | null = null;

    const getProps = (): T_PROPS => {
      const real = untracked(realProps);
      if (
        snapshotCache &&
        snapshotCache.real === real &&
        snapshotCache.version === parentDrivenVersion
      ) {
        return snapshotCache.props;
      }
      const props: any = { ...real };
      for (const name of models) {
        if (!parentDriven[name]) {
          delete props[name];
        }
      }
      const defaults = config.defaults as any;
      if (defaults) {
        for (const name in defaults) {
          if (props[name] === undefined) {
            props[name] = defaults[name];
          }
        }
      }
      for (const name in callbacks) {
        props[name] = callbacks[name];
      }
      snapshotCache = { real, version: parentDrivenVersion, props };
      return props;
    };

    // the props of the last prop diff
    let prevProps: T_PROPS = {} as T_PROPS;
    let prevRealProps: any = {};
    let prevParentState: T_PARENT_STATE | null = null;

    for (const name in meta.callbacks) {
      const info = meta.callbacks[name];
      callbacks[name] = (...args: any[]) => {
        if ('model' in info) {
          const modelName = info.model;
          const value = args[0];
          ownWrites.set(modelName, value);
          if (parentDriven[modelName]) {
            // the next diff must not see the grid's own change as a props
            // change (a new object: the previous one is still in use)
            prevProps = { ...prevProps, [modelName]: value };
          }
          host[modelName].set(value);
        } else {
          const output = host[info.output];
          output.emit(
            info.pack === 'none'
              ? undefined
              : info.pack === 'merge-event'
              ? { ...args[0], event: args[1] }
              : args[0],
          );
        }
        if (info.fn) {
          const fn = untracked(host[name]) as Function | undefined;
          if (typeof fn === 'function') {
            fn(...args);
          }
        }
      };
    }

    const readParentState = (): T_PARENT_STATE | null =>
      parent ? parent.getState() ?? null : null;

    let ready = false;
    let rawState: COMPONENT_STATE = undefined as any as COMPONENT_STATE;
    // equal: () => false - the same state object dispatched again is a real
    // update (same-value setter calls are not skipped)
    const state = signal<COMPONENT_STATE>(rawState, { equal: () => false });

    let propsToForward: Partial<
      ForwardPropsToStateFnResult<
        T_PROPS,
        COMPONENT_MAPPED_STATE,
        COMPONENT_SETUP_STATE
      >
    > = {};
    const propsToStateSet = new Set<string>();
    let actions: ACTIONS_TYPE = undefined as any as ACTIONS_TYPE;

    const dispatch = (action: any) => {
      rawState = managedComponentReducer<
        T_PROPS,
        COMPONENT_STATE,
        T_PARENT_STATE
      >(rawState, action, {
        getProps,
        getParentState: readParentState,
        mapPropsToState: config.mapPropsToState as any,
        concludeReducer: config.concludeReducer as any,
        propsToStateSet,
      });
      state.set(rawState);
    };

    const getComponentState = () => rawState;

    // ONE effect for the prop diff and the parent state: a parent dispatch
    // only happens when the same run didn't already dispatch a props update
    // (whose reducer run read the latest parent state anyway)
    effect(() => {
      const real = realProps();
      const parentState = parent ? parent.state() : null;

      untracked(() => {
        if (!ready) {
          return;
        }

        const prevForDiff: any = { ...prevProps };

        for (const name of models) {
          const current = real[name];
          const previous = prevRealProps[name];
          if (current === previous) {
            continue;
          }
          if (ownWrites.has(name) && ownWrites.get(name) === current) {
            // the grid's own write
            continue;
          }
          // the parent pushed a value
          const nowDriven = current !== undefined;
          if (!nowDriven && previous !== undefined) {
            // defined -> undefined: the diff must see the transition, so the
            // state is reset like in React
            prevForDiff[name] = previous;
          }
          if (!!parentDriven[name] !== nowDriven) {
            parentDriven[name] = nowDriven;
            parentDrivenVersion++;
          }
        }
        ownWrites.clear();

        const currentProps = getProps();
        prevProps = currentProps;
        prevRealProps = real;

        const dispatchedPropsUpdate = applyPropsDiff<
          T_PROPS,
          COMPONENT_MAPPED_STATE
        >({
          currentProps,
          prevProps: prevForDiff,
          state: rawState,
          propsToForward,
          propsToStateSet,
          dispatch,
          actions,
          onPropChange: config.onPropChange,
          onPropsChange: config.onPropsChange,
        });

        if (
          parentState != null &&
          parentState !== prevParentState &&
          !dispatchedPropsUpdate
        ) {
          dispatch({ type: 'PARENT_STATE_CHANGE', payload: {} });
        }
        prevParentState = parentState;
      });
    });

    destroyRef.onDestroy(() => {
      if (ready) {
        config.cleanup?.(rawState);
      }
    });

    const context: AngularManagedComponentContextValue<
      COMPONENT_STATE,
      ACTIONS_TYPE
    > = {
      state: state.asReadonly(),
      get componentActions() {
        return actions;
      },
      getComponentState,
      replaceState: (newState: COMPONENT_STATE) => {
        dispatch({ type: 'REPLACE_STATE', payload: newState });
      },
      assignState: (newState: Partial<COMPONENT_STATE>) => {
        dispatch({ type: 'ASSIGN_STATE', payload: newState });
      },
      get componentState() {
        return rawState;
      },
    };

    const init = () => {
      if (ready) {
        return;
      }
      const real = untracked(realProps);
      for (const name of models) {
        parentDriven[name] = real[name] !== undefined;
      }
      parentDrivenVersion++;

      const props = getProps();

      const initialSetupState: COMPONENT_SETUP_STATE = config.initSetupState
        ? config.initSetupState(props)
        : ({} as COMPONENT_SETUP_STATE);

      propsToForward = config.forwardProps
        ? config.forwardProps(initialSetupState, props)
        : {};

      rawState = initManagedState<
        T_PROPS,
        COMPONENT_MAPPED_STATE,
        COMPONENT_SETUP_STATE,
        COMPONENT_DERIVED_STATE,
        T_PARENT_STATE
      >({
        props,
        initialSetupState,
        propsToForward,
        parentState: readParentState(),
        mapPropsToState: config.mapPropsToState as any,
        propsToStateSet,
      });
      state.set(rawState);

      const allowedControlledPropOverrides: Record<string, boolean> = {
        ...(config.allowedControlledPropOverrides as any),
      };
      for (const name of models) {
        allowedControlledPropOverrides[name] = true;
      }

      actions = createGeneratedActions<COMPONENT_STATE, T_PROPS>({
        dispatch,
        getState: getComponentState,
        getProps,
        propsToForward: propsToForward as ForwardPropsToStateFnResult<
          T_PROPS,
          COMPONENT_STATE,
          COMPONENT_SETUP_STATE
        >,
        allowedControlledPropOverrides:
          allowedControlledPropOverrides as Record<keyof T_PROPS, boolean>,
        interceptedActions: config.interceptActions,
        mappedCallbacks: config.mappedCallbacks,
        notify: notifyChange,
      }) as ACTIONS_TYPE;

      prevProps = props;
      prevRealProps = real;
      prevParentState = parent ? untracked(parent.state) : null;
      ready = true;
    };

    return {
      init,
      context,
      isReady: () => ready,
      getProps,
    };
  };
}
