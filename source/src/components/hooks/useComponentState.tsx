import * as React from 'react';
import {
  useReducer,
  createContext,
  useMemo,
  useEffect,
  useState,
  useRef,
} from 'react';

import { dbg } from '../../utils/debug';
import { proxyFn } from '../../utils/proxyFnCall';
import { toUpperFirst } from '../../utils/toUpperFirst';

import { isControlled } from '../utils/isControlled';
import { useLatest } from './useLatest';
import { usePrevious } from './usePrevious';

export const notifyChange = (props: any, propName: string, newValue: any) => {
  const upperPropName = toUpperFirst(propName);
  const callbackPropName = `on${upperPropName}Change` as string;
  const callbackProp = props[callbackPropName] as Function;

  if (typeof callbackProp === 'function') {
    callbackProp(newValue);
  }
};

const debug = dbg('rerender');

/**
 * PLEASE READ THIS BEFORE PROCEEDING WITH ANY CHANGES:
 *
 * This is the architecture of the state management behind InfiniteTable (and related components):
 *
 * A component should only read from component state (called CS), not from props.
 * The CS is initialized when first rendering, by calling `getInitialState`.
 * Properties from CS are computed based on controlled props, initial values in uncontrolled props or defaults - or, when none of those is passed, defaults are used.
 *
 * CS can be changed via component actions (called CA) or via controlled props being updated. Uncontrolled props will not trigger CS changes.
 *
 * CS can also have a subset of properties - component state derived properties - which are
 * not modified via component actions internally, but are only updated in response to controlled props updates.
 * In addition, CS can also have a subset of properties which are only set at setup time (by the setupState call) = component setup state (CSS)
 * CSS should not depend on props and will generally contain refs, etc
 *
 * The component actions object has a setter for each property in CS that is not read-only and not part of component setup state.
 *
 * So, CS =
 *  + component setup state (CSS)
 *  + component dynamic state (which have corresponding component actions) (CDS)
 *  + component derived/readonly state (CRoS)
 *
 * CSS  - created by `setupState`
 * CDS  - created by `getInitialState`
 * CRoS - created by `mapPropsToState`
 *
 * setupState() => CSS
 * ===================
 *  - called on component mount, just once, with no params. is the first method to be called. it's optional
 *
 * getInitialState({props}) => CDS
 * ===============================
 *  - called on component mount, just once, with the props, and after setupState is called.
 *  - the returned state object will be used to generate the component actions object, so the shape of CDS will be the shape of component actions object
 *
 * mapPropsToState({ props, state, updatedState, updatedProps }) => CRoS
 * ==================================================
 *  - called after every render if a controlled prop (that has been used in getInitialState or a previous mapPropsToState call) has changed
 *  - also called on mount, with updated being null
 *  - when controlled props are changed, and they have been used to compute the CDS in getInitialState,
 *  they end up in the `updated` property of the single argument passed to this function
 *
 */

let ComponentContext: any;

export function getComponentStateContext<T>(): React.Context<T> {
  if (ComponentContext as React.Context<T>) {
    return ComponentContext;
  }

  return (ComponentContext = createContext<T>(null as any as T));
}

type ComponentStateContext<T_STATE, T_ACTIONS> = {
  getComponentState: () => T_STATE;
  componentState: T_STATE;
  componentActions: T_ACTIONS;
};

type ComponentStateGeneratedActions<T_STATE> = {
  [k in keyof T_STATE]: T_STATE[k] | React.SetStateAction<T_STATE[k]>;
};

export type ComponentStateActions<T_STATE> =
  ComponentStateGeneratedActions<T_STATE>;

function getReducerActions<T_STATE, T_PROPS>(
  dispatch: React.Dispatch<any>,
  state: T_STATE,
  getProps: () => T_PROPS,
  propsToForward: ForwardPropsToStateFnResult<T_PROPS, T_STATE>,
  allowedControlledPropOverrides?: Record<keyof T_PROPS, boolean>,
): ComponentStateGeneratedActions<T_STATE> {
  return Object.keys(state).reduce((actions, stateKey) => {
    const key = stateKey as keyof T_STATE;

    const setter = (value: T_STATE[typeof key]) => {
      const props = getProps();

      // it's important that we notify with the value that we receive
      notifyChange(props, stateKey, value);

      //@ts-ignore
      const forwardFn = propsToForward[key];

      if (typeof forwardFn === 'function') {
        // and not with the modified value from the forwardFn
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

export type ForwardPropsToStateFnResult<TYPE_PROPS, TYPE_RESULT> = Partial<{
  [propName in keyof TYPE_PROPS & keyof TYPE_RESULT]:
    | 1
    | ((value: TYPE_PROPS[propName]) => TYPE_RESULT[propName]);
}>;

function forwardProps<T_PROPS, T_RESULT>(
  propsToForward: ForwardPropsToStateFnResult<T_PROPS, T_RESULT>,
  props: T_PROPS,
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
        propValue = forwardFn(propValue);
      }
      //@ts-ignore
      mappedState[k as any as keyof T_RESULT] = propValue;
    }

  return mappedState;
}

type ComponentStateRootConfig<
  T_PROPS,
  COMPONENT_MAPPED_STATE,
  COMPONENT_SETUP_STATE = {},
  COMPONENT_DERIVED_STATE = {},
  T_ACTIONS = {},
  T_PARENT_STATE = {},
> = {
  initSetupState?: () => COMPONENT_SETUP_STATE;

  forwardProps?: () => ForwardPropsToStateFnResult<
    T_PROPS,
    COMPONENT_MAPPED_STATE
  >;
  allowedControlledPropOverrides?: Record<keyof T_PROPS, true>;
  mapPropsToState?: (params: {
    props: T_PROPS;
    state: COMPONENT_MAPPED_STATE &
      COMPONENT_SETUP_STATE &
      Partial<COMPONENT_DERIVED_STATE>;
    oldState:
      | null
      | (COMPONENT_MAPPED_STATE &
          COMPONENT_SETUP_STATE &
          Partial<COMPONENT_DERIVED_STATE>);
    parentState: T_PARENT_STATE | null;
  }) => COMPONENT_DERIVED_STATE;
  concludeReducer?: (params: {
    previousState: COMPONENT_MAPPED_STATE &
      COMPONENT_SETUP_STATE &
      COMPONENT_DERIVED_STATE;
    state: COMPONENT_MAPPED_STATE &
      COMPONENT_SETUP_STATE &
      COMPONENT_DERIVED_STATE;
    updatedProps: Partial<T_PROPS> | null;
    parentState: T_PARENT_STATE | null;
  }) => COMPONENT_MAPPED_STATE &
    COMPONENT_SETUP_STATE &
    COMPONENT_DERIVED_STATE;
  getReducerActions?: (dispatch: React.Dispatch<any>) => T_ACTIONS;

  getParentState?: () => T_PARENT_STATE;

  onControlledPropertyChange?: (
    name: string,
    newValue: any,
    oldValue: any,
  ) => void | ((value: any, oldValue: any) => any);
};

export function getComponentStateRoot<
  T_PROPS,
  COMPONENT_MAPPED_STATE extends object,
  COMPONENT_SETUP_STATE extends object = {},
  COMPONENT_DERIVED_STATE extends object = {},
  T_ACTIONS = {},
  T_PARENT_STATE = {},
>(
  config: ComponentStateRootConfig<
    T_PROPS,
    COMPONENT_MAPPED_STATE,
    COMPONENT_SETUP_STATE,
    COMPONENT_DERIVED_STATE,
    T_ACTIONS,
    T_PARENT_STATE
  >,
) {
  /**
   * since config is passed outside the cmp, we can skip it inside useMemo deps list
   */
  return React.memo(function ComponentStateRoot(
    props: T_PROPS & { children: React.ReactNode },
  ) {
    const propsToStateSetRef = useRef<Set<string>>(new Set());
    const propsToForward = useMemo<
      ForwardPropsToStateFnResult<T_PROPS, COMPONENT_MAPPED_STATE>
    >(() => (config.forwardProps ? config.forwardProps() : {}), []);

    type COMPONENT_STATE = COMPONENT_MAPPED_STATE &
      COMPONENT_DERIVED_STATE &
      COMPONENT_SETUP_STATE;

    const getParentState = config.getParentState;
    const parentState = getParentState?.() ?? null;
    const [wholeState] = useState<COMPONENT_STATE>(() => {
      // STEP 1: call setupState
      const initialSetupState = config.initSetupState
        ? config.initSetupState()
        : ({} as COMPONENT_SETUP_STATE);

      let mappedState = {} as COMPONENT_MAPPED_STATE;

      if (propsToForward) {
        mappedState = forwardProps<T_PROPS, COMPONENT_MAPPED_STATE>(
          propsToForward,
          props,
        );
      }

      const state = { ...initialSetupState, ...mappedState };

      if (config.mapPropsToState) {
        const { fn: mapPropsToState, propertyReads } = proxyFn(
          config.mapPropsToState,
          {
            getProxyTargetFromArgs: (initialArg) => initialArg.props,
            putProxyToArgs: (props: T_PROPS, initialArg) => {
              return [{ ...initialArg, props }];
            },
          },
        );
        propsToStateSetRef.current = new Set([
          ...propsToStateSetRef.current,
          ...propertyReads,
        ]);
        const stateFromProps = mapPropsToState({
          props,
          state,
          oldState: null,
          parentState,
        });

        return {
          ...state,
          ...stateFromProps,
        };
      }

      return state as COMPONENT_MAPPED_STATE &
        COMPONENT_DERIVED_STATE &
        COMPONENT_SETUP_STATE;
    });

    const getProps = useLatest(props);

    const theReducer: React.Reducer<COMPONENT_STATE, any> = (
      previousState: COMPONENT_STATE,
      action: any,
    ) => {
      const mappedState: Partial<COMPONENT_MAPPED_STATE> | null =
        action.payload.mappedState;
      const updatedProps: Partial<T_PROPS> | null = action.payload.updatedProps;

      const newState: COMPONENT_STATE = Object.assign({}, previousState);

      if (mappedState) {
        Object.assign(newState, mappedState);
      }

      if (config.mapPropsToState) {
        const { fn: mapPropsToState, propertyReads } = proxyFn(
          config.mapPropsToState,
          {
            getProxyTargetFromArgs: (initialArg) => initialArg.props,
            putProxyToArgs: (props: T_PROPS, initialArg) => {
              return [{ ...initialArg, props }];
            },
          },
        );
        propsToStateSetRef.current = new Set([
          ...propsToStateSetRef.current,
          ...propertyReads,
        ]);

        const stateFromProps = mapPropsToState({
          props: getProps(),
          state: newState,
          oldState: previousState,
          parentState,
        });

        Object.assign(newState, stateFromProps);
      }

      const result = config.concludeReducer
        ? config.concludeReducer({
            previousState,
            state: newState,
            updatedProps,
            parentState,
          })
        : newState;

      return result;
    };

    const [state, dispatch] = useReducer<React.Reducer<COMPONENT_STATE, any>>(
      theReducer,
      wholeState,
    );

    type ACTIONS_TYPE = ComponentStateActions<COMPONENT_STATE>;

    const { allowedControlledPropOverrides } = config;

    const actions = useMemo(() => {
      const generatedActions = getReducerActions(
        dispatch,
        wholeState,
        getProps,
        propsToForward,
        allowedControlledPropOverrides,
      );

      return generatedActions;
    }, [
      dispatch,
      propsToForward,
      allowedControlledPropOverrides,
    ]) as ACTIONS_TYPE;

    const Context =
      getComponentStateContext<
        ComponentStateContext<COMPONENT_STATE, ACTIONS_TYPE>
      >();

    const getComponentState = useLatest(state);

    const contextValue = useMemo(
      () => ({
        componentState: state,
        componentActions: actions,
        getComponentState,
      }),
      [state, actions, getComponentState],
    );

    const prevProps = usePrevious(props);

    useEffect(() => {
      const currentProps = props;
      const newMappedState: Partial<COMPONENT_MAPPED_STATE> = {};
      let newMappedStateCount = 0;

      const updatedProps: Partial<T_PROPS> = {};
      let updatedPropsCount = 0;

      for (var k in props) {
        const key = k as string as keyof T_PROPS;
        if (isControlled(key, props)) {
          if (propsToForward.hasOwnProperty(k)) {
            const oldValue = prevProps[key];
            const newValue = currentProps[key];

            if (oldValue !== newValue) {
              let valueToSet = newValue;
              const forwardFn =
                propsToForward[k as keyof typeof propsToForward];
              if (typeof forwardFn === 'function') {
                //@ts-ignore
                valueToSet = forwardFn(newValue);
              }
              //@ts-ignore
              if (state[key] !== valueToSet) {
                // if (config.onControlledPropertyChange) {
                //   const modifier = config.onControlledPropertyChange(
                //     k,
                //     newValue,
                //     oldValue,
                //   );

                //   if (typeof modifier === 'function') {
                //     newValue = modifier(newValue, oldValue);
                //   }
                // }

                // if there is any updated state, we need to call dispatch
                //@ts-ignore
                newMappedState[key] = valueToSet;
                newMappedStateCount++;
              }
            }

            // or even if there is not, but props from propsToStateSet have changed
          } else if (propsToStateSetRef.current.has(k)) {
            updatedProps[key] = currentProps[key];
            updatedPropsCount++;
          }
        }
      }

      if (updatedPropsCount > 0 || newMappedStateCount > 0) {
        debug(
          'Triggered by new values for the following props',
          ...[
            ...Object.keys(newMappedState ?? {}),
            ...Object.keys(updatedProps ?? {}),
          ],
        );
        dispatch({
          payload: {
            mappedState: newMappedStateCount ? newMappedState : null,
            updatedProps: updatedPropsCount ? updatedProps : null,
          },
        });
      }
    });

    return (
      <Context.Provider value={contextValue}>{props.children}</Context.Provider>
    );
  });
}

export function useComponentState<COMPONENT_STATE>() {
  type ACTIONS_TYPE = ComponentStateActions<COMPONENT_STATE>;
  const Context =
    getComponentStateContext<
      ComponentStateContext<COMPONENT_STATE, ACTIONS_TYPE>
    >();
  return React.useContext(Context);
}
