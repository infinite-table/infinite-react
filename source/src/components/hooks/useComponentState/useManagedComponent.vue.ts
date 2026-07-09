/**
 * Vue adapter for the managed component state system.
 *
 * All framework-free logic (controlled/uncontrolled resolution, reducer body,
 * generated action setters, prop-diff) lives in ./managedComponentState.ts —
 * the exact same functions the React adapter (./index.tsx) delegates to.
 * This file owns Vue scheduling: shallowRef state, watch-based prop diffing,
 * provide/inject context.
 *
 * Semantics contract (kept in sync with the React adapter, pinned by
 * buildManagedComponent.jestspec.tsx / buildManagedComponentVue.jestspec.ts):
 * - a prop is controlled iff present (value !== undefined); uncontrolled
 *   reads `default${Prop}` at init
 * - setters on controlled props skip the state write but still fire the
 *   callback; interceptActions can veto the callback; mappedCallbacks remap
 *   name and params; the callback receives the RAW value, state receives the
 *   forwardFn-transformed value
 * - same-value setter calls are NOT skipped
 * - props read inside mapPropsToState are tracked; changing them re-derives
 * - prop-diff iterates the union of prev+current keys (defined -> undefined
 *   transitions detected), skips `children`, fires onPropChange/onPropsChange
 *   after the dispatch
 * - parent-state changes re-run the reducer, guarded against double dispatch
 *   when the same flush already dispatched a prop update
 */
import {
  getCurrentInstance,
  inject,
  isRef,
  onBeforeUnmount,
  provide,
  shallowRef,
  unref,
  watch,
} from 'vue';
import type { InjectionKey, ShallowRef } from 'vue';

import {
  initManagedState,
  managedComponentReducer,
  createGeneratedActions,
  computePropsDiff,
  notifyChange as defaultNotifyChange,
  ForwardPropsToStateFnResult,
  NotifyChangeFn,
} from './managedComponentState';

import {
  ComponentInterceptedActions,
  ComponentMappedCallbacks,
  ComponentStateActions,
} from './types';

export type VueManagedComponentContextValue<COMPONENT_STATE, ACTIONS_TYPE> = {
  /** reactive handle — .value swaps on every state change */
  state: ShallowRef<COMPONENT_STATE>;
  componentActions: ACTIONS_TYPE;
  getComponentState: () => COMPONENT_STATE;
  replaceState: (state: COMPONENT_STATE) => void;
  assignState: (state: Partial<COMPONENT_STATE>) => void;
  /** convenience accessor mirroring the React contextValue shape */
  readonly componentState: COMPONENT_STATE;
};

export type VueManagedComponentConfig<
  T_PROPS,
  COMPONENT_MAPPED_STATE,
  COMPONENT_SETUP_STATE = {},
  COMPONENT_DERIVED_STATE = {},
  T_PARENT_STATE = {},
> = {
  debugName?: string | ((props: T_PROPS) => string);
  initSetupState?: (props: T_PROPS) => COMPONENT_SETUP_STATE;

  injectionKey?: InjectionKey<any>;

  forwardProps?: (
    setupState: COMPONENT_SETUP_STATE,
    props: T_PROPS,
  ) => ForwardPropsToStateFnResult<
    T_PROPS,
    COMPONENT_MAPPED_STATE,
    COMPONENT_SETUP_STATE
  >;
  allowedControlledPropOverrides?: Record<keyof T_PROPS, true>;
  interceptActions?: ComponentInterceptedActions<any>;
  mappedCallbacks?: ComponentMappedCallbacks<any>;
  onPropChange?: (
    params: { name: keyof T_PROPS; oldValue: any; newValue: any },
    props: T_PROPS,
    actions: any,
    state: any,
  ) => void;
  onPropsChange?: (
    newPropValues: {
      [k in keyof T_PROPS]?: { newValue: T_PROPS[k]; oldValue: T_PROPS[k] };
    },
    props: T_PROPS,
    actions: any,
    state: any,
  ) => void;
  mapPropsToState?: (params: {
    props: T_PROPS;
    state: any;
    oldState: any;
    parentState: T_PARENT_STATE | null;
  }) => COMPONENT_DERIVED_STATE;
  concludeReducer?: (params: {
    previousState: any;
    state: any;
    updatedProps: Partial<T_PROPS> | null;
    parentState: T_PARENT_STATE | null;
  }) => any;

  /**
   * Called inside setup; may use inject(). May return a plain value, a Ref,
   * or a getter — refs and getters make parent-state changes observable.
   */
  getParentState?: () => any;

  cleanup?: (state: any) => void;
};

/**
 * Vue notification strategy: fires the `on${Prop}Change` function prop (same
 * as React), and ALSO emits `update:${prop}` on the current component
 * instance when the callback follows the standard naming — which makes
 * `v-model:prop` work out of the box.
 */
export function createVueNotifyChange(
  emit?: (event: string, ...args: any[]) => void,
): NotifyChangeFn {
  return (props, callbackPropName, values) => {
    defaultNotifyChange(props, callbackPropName, values);

    if (emit) {
      const match = /^on([A-Z].*)Change$/.exec(callbackPropName);
      if (match) {
        const propName = match[1].charAt(0).toLowerCase() + match[1].slice(1);
        emit(`update:${propName}`, values[0]);
      }
    }
  };
}

export function buildManagedVueComponent<
  T_PROPS extends object,
  COMPONENT_MAPPED_STATE extends object,
  COMPONENT_SETUP_STATE extends object = {},
  COMPONENT_DERIVED_STATE extends object = {},
  T_PARENT_STATE = {},
>(
  config: VueManagedComponentConfig<
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

  const injectionKey: InjectionKey<
    VueManagedComponentContextValue<COMPONENT_STATE, ACTIONS_TYPE>
  > = config.injectionKey ?? Symbol('managed-component-state');

  /**
   * Call from a component's setup(), passing the (reactive) props object.
   */
  function useManagedComponent(props: T_PROPS) {
    const instance = getCurrentInstance();

    // snapshot props: keeps everything downstream working on raw values and
    // gives the prop-diff stable prev/current objects to compare
    const snapshotProps = (): T_PROPS => ({ ...props });

    const initialSetupState: COMPONENT_SETUP_STATE = config.initSetupState
      ? config.initSetupState(snapshotProps())
      : ({} as COMPONENT_SETUP_STATE);

    const propsToStateSet = new Set<string>();

    const propsToForward: Partial<
      ForwardPropsToStateFnResult<
        T_PROPS,
        COMPONENT_MAPPED_STATE,
        COMPONENT_SETUP_STATE
      >
    > = config.forwardProps
      ? config.forwardProps(initialSetupState, snapshotProps())
      : {};

    const parentStateSource = config.getParentState
      ? config.getParentState()
      : null;

    const readParentState = (): T_PARENT_STATE | null => {
      if (parentStateSource == null) {
        return null;
      }
      if (isRef(parentStateSource)) {
        return (unref(parentStateSource) as T_PARENT_STATE | null) ?? null;
      }
      if (typeof parentStateSource === 'function') {
        return parentStateSource() ?? null;
      }
      return parentStateSource;
    };

    // annotated explicitly: shallowRef's overloads otherwise widen the
    // generic object type
    const state: ShallowRef<COMPONENT_STATE> = shallowRef(
      initManagedState<
        T_PROPS,
        COMPONENT_MAPPED_STATE,
        COMPONENT_SETUP_STATE,
        COMPONENT_DERIVED_STATE,
        T_PARENT_STATE
      >({
        props: snapshotProps(),
        initialSetupState,
        propsToForward,
        parentState: readParentState(),
        mapPropsToState: config.mapPropsToState as any,
        propsToStateSet,
      }),
    );

    const getComponentState = () => state.value;
    const getProps = snapshotProps;

    const dispatch = (action: any) => {
      state.value = managedComponentReducer<
        T_PROPS,
        COMPONENT_STATE,
        T_PARENT_STATE
      >(state.value, action, {
        getProps,
        getParentState: readParentState,
        mapPropsToState: config.mapPropsToState as any,
        concludeReducer: config.concludeReducer as any,
        propsToStateSet,
      });
    };

    const notify = createVueNotifyChange(
      instance ? (event, ...args) => instance.emit(event, ...args) : undefined,
    );

    const actions = createGeneratedActions<COMPONENT_STATE, T_PROPS>({
      dispatch,
      getState: getComponentState,
      getProps,
      propsToForward: propsToForward as ForwardPropsToStateFnResult<
        T_PROPS,
        COMPONENT_STATE,
        COMPONENT_SETUP_STATE
      >,
      allowedControlledPropOverrides: config.allowedControlledPropOverrides as
        | Record<keyof T_PROPS, boolean>
        | undefined,
      interceptedActions: config.interceptActions,
      mappedCallbacks: config.mappedCallbacks,
      notify,
    }) as ACTIONS_TYPE;

    // A SINGLE watcher handles both the prop-diff and parent-state changes.
    // In React, effect declaration order guarantees the prop-diff effect runs
    // before the parent-state effect, letting a ref-based guard prevent a
    // double dispatch. Vue post-flush callbacks do NOT guarantee that order
    // (the parent watcher can be queued before the re-render queues the
    // props watcher), so the guard is expressed structurally instead: a
    // parent-state dispatch only happens when the same flush did not already
    // dispatch a prop update (whose reducer run reads the latest parentState
    // anyway).
    watch(
      () => ({ props: snapshotProps(), parentState: readParentState() }),
      (current, prev) => {
        const currentProps = current.props;
        const prevProps = prev.props;
        const parentStateChanged = current.parentState !== prev.parentState;

        const {
          newMappedState,
          newMappedStateCount,
          updatedPropsToState,
          updatedPropsToStateCount,
          rawUpdatedProps,
          rawUpdatedPropsCount,
        } = computePropsDiff<T_PROPS, COMPONENT_MAPPED_STATE>({
          currentProps,
          prevProps,
          state: state.value,
          propsToForward,
          propsToStateSet,
        });

        let dispatchedPropsUpdate = false;

        if (updatedPropsToStateCount > 0 || newMappedStateCount > 0) {
          const action = {
            payload: {
              mappedState: newMappedStateCount ? newMappedState : null,
              updatedPropsToState: updatedPropsToStateCount
                ? updatedPropsToState
                : null,
            },
          };

          const stateBeforeDispatch = state.value;
          dispatch(action);
          dispatchedPropsUpdate = true;

          if (config.onPropChange) {
            for (const prop in rawUpdatedProps) {
              if (rawUpdatedProps.hasOwnProperty(prop)) {
                const { newValue, oldValue } =
                  rawUpdatedProps[prop as keyof T_PROPS]!;
                config.onPropChange(
                  { name: prop as keyof T_PROPS, newValue, oldValue },
                  currentProps,
                  actions,
                  stateBeforeDispatch,
                );
              }
            }
          }
          if (config.onPropsChange && rawUpdatedPropsCount) {
            config.onPropsChange(
              rawUpdatedProps,
              currentProps,
              actions,
              stateBeforeDispatch,
            );
          }
        }

        if (
          parentStateChanged &&
          current.parentState != null &&
          !dispatchedPropsUpdate
        ) {
          dispatch({
            type: 'PARENT_STATE_CHANGE',
            payload: {},
          });
        }
      },
      { flush: 'post' },
    );

    onBeforeUnmount(() => {
      config.cleanup?.(getComponentState());
    });

    const contextValue: VueManagedComponentContextValue<
      COMPONENT_STATE,
      ACTIONS_TYPE
    > = {
      state,
      componentActions: actions,
      getComponentState,
      replaceState: (newState: COMPONENT_STATE) => {
        dispatch({ type: 'REPLACE_STATE', payload: newState });
      },
      assignState: (newState: Partial<COMPONENT_STATE>) => {
        dispatch({ type: 'ASSIGN_STATE', payload: newState });
      },
      get componentState() {
        return state.value;
      },
    };

    return { contextValue, injectionKey };
  }

  /**
   * setup() helper for the root managed component: wires the state and
   * provides the context for descendants (useManagedComponentState below).
   */
  function provideManagedComponent(props: T_PROPS) {
    const result = useManagedComponent(props);
    provide(injectionKey, result.contextValue);
    return result;
  }

  function useManagedComponentState() {
    return inject(injectionKey)!;
  }

  return {
    useManagedComponent,
    provideManagedComponent,
    useManagedComponentState,
    injectionKey,
  };
}
