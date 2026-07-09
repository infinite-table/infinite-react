/**
 * Framework-neutral core of the managed component state system.
 *
 * This module contains NO framework imports. It holds the pure logic behind
 * buildManagedComponent: state initialization from props (controlled /
 * uncontrolled resolution), the reducer body, the generated action setters
 * (with auto-fired callbacks) and the prop-diff algorithm.
 *
 * Each framework adapter (React today: ./index.tsx) owns scheduling —
 * dispatch/batching timing, effects, context — and delegates the logic to
 * the functions in this file. The semantics contract these functions
 * implement is pinned by buildManagedComponent.jestspec.tsx.
 */
import { proxyFn } from '../../../utils/proxyFnCall';
import { toUpperFirst } from '../../../utils/toUpperFirst';

import { isControlled } from '../../utils/isControlled';
import {
  ComponentInterceptedActions,
  ComponentMappedCallbacks,
  ComponentStateGeneratedActions,
} from './types';

export type ManagedComponentDispatch = (action: any) => void;

/**
 * Per-framework strategy: how a change notification is delivered to the
 * component consumer. React calls the `on${Prop}Change` function prop; other
 * frameworks (Vue emits, Svelte bindable writeback, Angular model signals)
 * will supply their own implementation.
 */
export type NotifyChangeFn = (
  props: any,
  callbackPropName: string,
  values: any[],
) => void;

export const notifyChange: NotifyChangeFn = (
  props: any,
  callbackPropName: string,
  values: any[],
) => {
  const callbackProp = props[callbackPropName] as Function;

  if (typeof callbackProp === 'function') {
    callbackProp(...values);
  }
};

export type ForwardPropsToStateFnResult<
  TYPE_PROPS,
  TYPE_RESULT,
  COMPONENT_SETUP_STATE,
> = {
  [propName in keyof TYPE_PROPS & keyof TYPE_RESULT]:
    | 1
    | ((
        value: TYPE_PROPS[propName],
        setupState: COMPONENT_SETUP_STATE,
      ) => TYPE_RESULT[propName]);
};

export function forwardProps<T_PROPS, T_RESULT, COMPONENT_SETUP_STATE>(
  propsToForward: Partial<
    ForwardPropsToStateFnResult<T_PROPS, T_RESULT, COMPONENT_SETUP_STATE>
  >,
  props: T_PROPS,
  setupState: COMPONENT_SETUP_STATE,
): T_RESULT {
  const mappedState = {} as T_RESULT;
  for (let k in propsToForward)
    if (propsToForward.hasOwnProperty(k)) {
      const forwardFn = propsToForward[k as keyof typeof propsToForward];
      let propValue = isControlled(k as keyof T_PROPS, props)
        ? props[k as keyof T_PROPS]
        : props[`default${toUpperFirst(k)}` as keyof T_PROPS];

      if (typeof forwardFn === 'function') {
        //@ts-ignore
        propValue = forwardFn(propValue, setupState);
      }
      //@ts-ignore
      mappedState[k as any as keyof T_RESULT] = propValue;
    }

  return mappedState;
}

export type MapPropsToStateFn<T_PROPS, T_STATE, T_DERIVED, T_PARENT_STATE> =
  (params: {
    props: T_PROPS;
    state: T_STATE;
    oldState: null | T_STATE;
    parentState: T_PARENT_STATE | null;
  }) => T_DERIVED;

/**
 * Runs mapPropsToState with the props wrapped in a tracking Proxy, recording
 * every prop read into `propsToStateSet` (accumulating across runs) — this is
 * how later changes to those props (even ones not in forwardProps) trigger
 * re-derivation.
 */
export function runMapPropsToState<T_PROPS, T_STATE, T_DERIVED, T_PARENT_STATE>(
  mapPropsToState: MapPropsToStateFn<
    T_PROPS,
    T_STATE,
    T_DERIVED,
    T_PARENT_STATE
  >,
  params: {
    props: T_PROPS;
    state: T_STATE;
    oldState: null | T_STATE;
    parentState: T_PARENT_STATE | null;
  },
  propsToStateSet: Set<string>,
): T_DERIVED {
  const { fn: proxiedMapPropsToState, propertyReads } = proxyFn(
    mapPropsToState,
    {
      getProxyTargetFromArgs: (initialArg) => initialArg.props,
      putProxyToArgs: (props: T_PROPS, initialArg) => {
        return [{ ...initialArg, props }];
      },
    },
  );

  const stateFromProps = proxiedMapPropsToState(params);

  propertyReads.forEach((propName) => propsToStateSet.add(propName));

  return stateFromProps as T_DERIVED;
}

export function initManagedState<
  T_PROPS,
  COMPONENT_MAPPED_STATE,
  COMPONENT_SETUP_STATE,
  COMPONENT_DERIVED_STATE,
  T_PARENT_STATE,
>(params: {
  props: T_PROPS;
  initialSetupState: COMPONENT_SETUP_STATE;
  propsToForward: Partial<
    ForwardPropsToStateFnResult<
      T_PROPS,
      COMPONENT_MAPPED_STATE,
      COMPONENT_SETUP_STATE
    >
  >;
  parentState: T_PARENT_STATE | null;
  mapPropsToState?: MapPropsToStateFn<
    T_PROPS,
    COMPONENT_MAPPED_STATE &
      COMPONENT_SETUP_STATE &
      Partial<COMPONENT_DERIVED_STATE>,
    COMPONENT_DERIVED_STATE,
    T_PARENT_STATE
  >;
  propsToStateSet: Set<string>;
}): COMPONENT_MAPPED_STATE & COMPONENT_DERIVED_STATE & COMPONENT_SETUP_STATE {
  const {
    props,
    initialSetupState,
    propsToForward,
    parentState,
    mapPropsToState,
    propsToStateSet,
  } = params;

  let mappedState = {} as COMPONENT_MAPPED_STATE;

  if (propsToForward) {
    mappedState = forwardProps<
      T_PROPS,
      COMPONENT_MAPPED_STATE,
      COMPONENT_SETUP_STATE
    >(propsToForward, props, initialSetupState);
  }

  const state = { ...initialSetupState, ...mappedState };

  if (mapPropsToState) {
    const stateFromProps = runMapPropsToState(
      mapPropsToState,
      {
        props,
        state: state as any,
        oldState: null,
        parentState,
      },
      propsToStateSet,
    );

    return {
      ...state,
      ...stateFromProps,
    } as COMPONENT_MAPPED_STATE &
      COMPONENT_DERIVED_STATE &
      COMPONENT_SETUP_STATE;
  }

  return state as COMPONENT_MAPPED_STATE &
    COMPONENT_DERIVED_STATE &
    COMPONENT_SETUP_STATE;
}

export type ConcludeReducerFn<T_PROPS, COMPONENT_STATE, T_PARENT_STATE> =
  (params: {
    previousState: COMPONENT_STATE;
    state: COMPONENT_STATE;
    updatedProps: Partial<T_PROPS> | null;
    parentState: T_PARENT_STATE | null;
  }) => COMPONENT_STATE;

/**
 * The framework-neutral reducer body. Action shapes (unchanged):
 * - { type: 'REPLACE_STATE', payload: newState }
 * - { type: 'ASSIGN_STATE', payload: partialState }
 * - { payload: { mappedState, updatedPropsToState } } — regular updates
 */
export function managedComponentReducer<
  T_PROPS,
  COMPONENT_STATE extends object,
  T_PARENT_STATE,
>(
  previousState: COMPONENT_STATE,
  action: any,
  context: {
    getProps: () => T_PROPS;
    getParentState: () => T_PARENT_STATE | null;
    mapPropsToState?: MapPropsToStateFn<
      T_PROPS,
      COMPONENT_STATE,
      any,
      T_PARENT_STATE
    >;
    concludeReducer?: ConcludeReducerFn<
      T_PROPS,
      COMPONENT_STATE,
      T_PARENT_STATE
    >;
    propsToStateSet: Set<string>;
  },
): COMPONENT_STATE {
  const {
    getProps,
    getParentState,
    mapPropsToState,
    concludeReducer,
    propsToStateSet,
  } = context;

  if (action.type === 'REPLACE_STATE') {
    return action.payload;
  }

  const parentState = getParentState?.() ?? null;

  const mappedState: Partial<COMPONENT_STATE> | null =
    action.payload.mappedState;
  const updatedProps: Partial<T_PROPS> | null =
    action.payload.updatedPropsToState;

  const newState: COMPONENT_STATE = { ...previousState };

  if (mappedState) {
    Object.assign(newState, mappedState);
  }

  if (mapPropsToState) {
    const stateFromProps = runMapPropsToState(
      mapPropsToState,
      {
        props: getProps(),
        state: newState,
        oldState: previousState,
        parentState,
      },
      propsToStateSet,
    );

    Object.assign(newState as any, stateFromProps);
  }

  if (action.type === 'ASSIGN_STATE') {
    Object.assign(newState as any, action.payload);
  }

  const result = concludeReducer
    ? concludeReducer({
        previousState,
        state: newState,
        updatedProps,
        parentState,
      })
    : newState;

  return result;
}

/**
 * Builds the generated actions object: one property setter per state key.
 * Setter pipeline (order is part of the semantics contract):
 * interceptActions veto -> callback with the RAW value (name possibly remapped
 * by mappedCallbacks) -> forwardFn transform -> controlled check -> dispatch.
 *
 * Note: same-value setter calls are intentionally NOT skipped
 * (#samevaluecheckfailswhennotflushed) — with batched updates the committed
 * value can differ from a not-yet-flushed pending value.
 */
export function createGeneratedActions<T_STATE, T_PROPS>(params: {
  dispatch: ManagedComponentDispatch;
  getState: () => T_STATE;
  getProps: () => T_PROPS;
  propsToForward: ForwardPropsToStateFnResult<T_PROPS, T_STATE, any>;
  allowedControlledPropOverrides?: Record<keyof T_PROPS, boolean>;
  interceptedActions?: ComponentInterceptedActions<T_STATE>;
  mappedCallbacks?: ComponentMappedCallbacks<T_STATE>;
  notify?: NotifyChangeFn;
}): ComponentStateGeneratedActions<T_STATE> {
  const {
    dispatch,
    getState,
    getProps,
    propsToForward,
    allowedControlledPropOverrides,
    interceptedActions,
    mappedCallbacks,
    notify = notifyChange,
  } = params;

  const state = getState();
  //@ts-ignore
  return Object.keys(state).reduce((actions, stateKey) => {
    const key = stateKey as any as keyof T_STATE;

    const setter = (value: T_STATE[typeof key]) => {
      const props = getProps();
      const state = getState();

      let notifyTheChange = true;

      if (interceptedActions && typeof interceptedActions[key] === 'function') {
        if (interceptedActions[key]!(value, { actions, state }) === false) {
          notifyTheChange = false;
        }
      }

      // it's important that we notify with the value that we receive
      // directly from the setter (and not with the modified value
      // from the forwardFn below)
      if (notifyTheChange) {
        let callbackParams = [value];
        let callbackName = `on${toUpperFirst(stateKey)}Change` as string;

        if (mappedCallbacks && mappedCallbacks[key]) {
          const res = mappedCallbacks[key](value, state);
          callbackName = res.callbackName || callbackName;
          callbackParams = res.callbackParams;
        }

        notify(props, callbackName, callbackParams);
      }

      //@ts-ignore
      const forwardFn = propsToForward[key];

      if (typeof forwardFn === 'function') {
        value = forwardFn(value);
      }

      const allowControlled =
        !!allowedControlledPropOverrides?.[key as any as keyof T_PROPS];

      if (isControlled(stateKey as keyof T_PROPS, props) && !allowControlled) {
        return;
      }

      dispatch({
        payload: {
          updatedProps: null,
          mappedState: {
            [stateKey]: value,
          },
        },
      });
    };

    Object.defineProperty(actions, stateKey, {
      set: setter,
    });

    return actions;
  }, {} as ComponentStateGeneratedActions<T_STATE>);
}

export type PropsDiffResult<T_PROPS, COMPONENT_MAPPED_STATE> = {
  newMappedState: Partial<COMPONENT_MAPPED_STATE>;
  newMappedStateCount: number;
  updatedPropsToState: Partial<T_PROPS>;
  updatedPropsToStateCount: number;
  rawUpdatedProps: {
    [k in keyof T_PROPS]?: { newValue: T_PROPS[k]; oldValue: T_PROPS[k] };
  };
  rawUpdatedPropsCount: number;
};

/**
 * The prop-diff algorithm run by the adapter whenever props change.
 * Iterates the UNION of previous+current keys (so defined -> undefined
 * transitions are detected), skips `children`, and only syncs a change into
 * state when the prop is controlled on either the old or the new props.
 * Changed props land in:
 * - newMappedState: props present in propsToForward (forwardFn applied)
 * - updatedPropsToState: props recorded by mapPropsToState read-tracking
 * - rawUpdatedProps: every changed prop (for onPropChange/onPropsChange)
 */
export function computePropsDiff<
  T_PROPS extends object,
  COMPONENT_MAPPED_STATE,
>(params: {
  currentProps: T_PROPS;
  prevProps: T_PROPS;
  state: any;
  propsToForward: Partial<
    ForwardPropsToStateFnResult<T_PROPS, COMPONENT_MAPPED_STATE, any>
  >;
  propsToStateSet: Set<string>;
}): PropsDiffResult<T_PROPS, COMPONENT_MAPPED_STATE> {
  const { currentProps, prevProps, state, propsToForward, propsToStateSet } =
    params;

  const newMappedState: Partial<COMPONENT_MAPPED_STATE> = {};
  let newMappedStateCount = 0;

  const updatedPropsToState: Partial<T_PROPS> = {};
  let updatedPropsToStateCount = 0;

  const rawUpdatedProps: PropsDiffResult<
    T_PROPS,
    COMPONENT_MAPPED_STATE
  >['rawUpdatedProps'] = {};
  let rawUpdatedPropsCount = 0;

  // when values go undefined (are not passed), they are not in the props
  // object, so we can't detect a value going from defined to undefined by
  // iterating only the current props — iterate both current and prev keys
  const allKeys = new Set([
    ...Object.keys(currentProps),
    ...Object.keys(prevProps),
  ]);

  allKeys.forEach((k) => {
    const key = k as keyof T_PROPS;
    const oldValue = prevProps[key];
    const newValue = currentProps[key];

    if (key === 'children') {
      return;
    }
    if (oldValue === newValue) {
      return;
    }
    rawUpdatedProps[key] = { newValue, oldValue };
    rawUpdatedPropsCount++;

    if (isControlled(key, currentProps) || isControlled(key, prevProps)) {
      if (propsToForward.hasOwnProperty(k)) {
        let valueToSet = newValue;
        const forwardFn = propsToForward[k as keyof typeof propsToForward];
        if (typeof forwardFn === 'function') {
          //@ts-ignore
          valueToSet = forwardFn(newValue);
        }
        if (state[key] !== valueToSet) {
          //@ts-ignore
          newMappedState[key] = valueToSet;
          newMappedStateCount++;
        }

        // or even if there is not, but props from propsToStateSet have changed
      } else if (propsToStateSet.has(k)) {
        updatedPropsToState[key] = currentProps[key];
        updatedPropsToStateCount++;
      }
    }
  });

  return {
    newMappedState,
    newMappedStateCount,
    updatedPropsToState,
    updatedPropsToStateCount,
    rawUpdatedProps,
    rawUpdatedPropsCount,
  };
}
