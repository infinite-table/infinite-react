import * as React from 'react';
import {
  useReducer,
  createContext,
  useMemo,
  useEffect,
  useState,
  useRef,
} from 'react';

import { dbg } from '../../../utils/debug';
import { proxyFn } from '../../../utils/proxyFnCall';
import { toUpperFirst } from '../../../utils/toUpperFirst';

import { isControlled } from '../../utils/isControlled';
import { useLatest } from '../useLatest';
import { usePrevious } from '../usePrevious';
import {
  ComponentInterceptedActions,
  ComponentMappedCallbacks,
  ComponentStateActions,
  ComponentStateContext,
  ComponentStateGeneratedActions,
} from './types';

export const notifyChange = (
  props: any,
  callbackPropName: string,
  values: any[],
) => {
  const callbackProp = props[callbackPropName] as Function;

  if (typeof callbackProp === 'function') {
    callbackProp(...values);
  }
};

const debug = dbg('rerender');

let ComponentContext: any;

export function getComponentStateContext<T>(): React.Context<T> {
  if (ComponentContext as React.Context<T>) {
    return ComponentContext;
  }

  return (ComponentContext = createContext<T>(null as any as T));
}

function getReducerGeneratedActions<T_STATE, T_PROPS>(
  dispatch: React.Dispatch<any>,
  getState: () => T_STATE,
  getProps: () => T_PROPS,
  propsToForward: ForwardPropsToStateFnResult<T_PROPS, T_STATE>,
  allowedControlledPropOverrides?: Record<keyof T_PROPS, boolean>,
  interceptedActions?: ComponentInterceptedActions<T_STATE>,
  mappedCallbacks?: ComponentMappedCallbacks<T_STATE>,
): ComponentStateGeneratedActions<T_STATE> {
  const state = getState();
  return Object.keys(state).reduce((actions, stateKey) => {
    const key = stateKey as keyof T_STATE;

    const setter = (value: T_STATE[typeof key]) => {
      const props = getProps();
      const state = getState();
      const currentValue = state[key];
      if (currentValue === value) {
        // early exit, as no change detected
        return;
      }

      let notifyTheChange = true;

      if (interceptedActions && typeof interceptedActions[key] === 'function') {
        if (interceptedActions[key]!(value, { actions, state }) === false) {
          notifyTheChange = false;
        }
      }

      // it's important that we notify with the value that we receive
      // directly from the setter (see continuation below)
      if (notifyTheChange) {
        let callbackParams = [value];
        let callbackName = `on${toUpperFirst(stateKey)}Change` as string;

        if (mappedCallbacks && mappedCallbacks[key]) {
          const res = mappedCallbacks[key](value, state);
          callbackName = res.callbackName || callbackName;
          callbackParams = res.callbackParams;
        }

        notifyChange(props, callbackName, callbackParams);
      }

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

export type ForwardPropsToStateFnResult<TYPE_PROPS, TYPE_RESULT> = {
  [propName in keyof TYPE_PROPS & keyof TYPE_RESULT]:
    | 1
    | ((value: TYPE_PROPS[propName]) => TYPE_RESULT[propName]);
};

function forwardProps<T_PROPS, T_RESULT>(
  propsToForward: Partial<ForwardPropsToStateFnResult<T_PROPS, T_RESULT>>,
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
  debugName?: string;
  initSetupState?: () => COMPONENT_SETUP_STATE;

  forwardProps?: (
    setupState: COMPONENT_SETUP_STATE,
  ) => ForwardPropsToStateFnResult<T_PROPS, COMPONENT_MAPPED_STATE>;
  allowedControlledPropOverrides?: Record<keyof T_PROPS, true>;
  interceptActions?: ComponentInterceptedActions<
    COMPONENT_MAPPED_STATE & COMPONENT_DERIVED_STATE & COMPONENT_SETUP_STATE
  >;
  mappedCallbacks?: ComponentMappedCallbacks<
    COMPONENT_MAPPED_STATE & COMPONENT_DERIVED_STATE & COMPONENT_SETUP_STATE
  >;
  onPropChange?: (
    params: {
      name: keyof T_PROPS;
      oldValue: any;
      newValue: any;
    },
    props: T_PROPS,
    actions: ComponentStateActions<
      COMPONENT_MAPPED_STATE & COMPONENT_DERIVED_STATE & COMPONENT_SETUP_STATE
    >,
  ) => void;
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
    getState: () => COMPONENT_MAPPED_STATE &
      COMPONENT_SETUP_STATE &
      COMPONENT_DERIVED_STATE;
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

  cleanup?: (
    state: COMPONENT_MAPPED_STATE &
      COMPONENT_SETUP_STATE &
      COMPONENT_DERIVED_STATE,
  ) => void;

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
    const [initialSetupState] = useState<COMPONENT_SETUP_STATE>(() => {
      return config.initSetupState
        ? config.initSetupState()
        : ({} as COMPONENT_SETUP_STATE);
    });
    const propsToStateSetRef = useRef<Set<string>>(new Set());
    const propsToForward = useMemo<
      Partial<ForwardPropsToStateFnResult<T_PROPS, COMPONENT_MAPPED_STATE>>
    >(
      () => (config.forwardProps ? config.forwardProps(initialSetupState) : {}),
      [initialSetupState],
    );

    type COMPONENT_STATE = COMPONENT_MAPPED_STATE &
      COMPONENT_DERIVED_STATE &
      COMPONENT_SETUP_STATE;

    const parentState = config.getParentState?.() ?? null;
    const getParentState = useLatest(parentState);

    const [wholeState] = useState<COMPONENT_STATE>(() => {
      // STEP 1: call setupState

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
        const stateFromProps = mapPropsToState({
          props,
          state,
          oldState: null,
          parentState,
          getState: getComponentState,
        });

        propsToStateSetRef.current = new Set([
          ...propsToStateSetRef.current,
          ...propertyReads,
        ]);
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
      if (action.type === 'REPLACE_STATE') {
        return action.payload;
      }

      const parentState = getParentState?.() ?? null;
      const mappedState: Partial<COMPONENT_MAPPED_STATE> | null =
        action.payload.mappedState;
      const updatedProps: Partial<T_PROPS> | null =
        action.payload.updatedPropsToState;

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

        const stateFromProps = mapPropsToState({
          props: getProps(),
          state: newState,
          oldState: previousState,
          parentState,
          getState: getComponentState,
        });

        propsToStateSetRef.current = new Set([
          ...propsToStateSetRef.current,
          ...propertyReads,
        ]);

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

    const getComponentState = useLatest(state);

    type ACTIONS_TYPE = ComponentStateActions<COMPONENT_STATE>;

    const { allowedControlledPropOverrides } = config;

    const actions = useMemo(() => {
      const generatedActions = getReducerGeneratedActions<
        COMPONENT_STATE,
        T_PROPS
      >(
        dispatch,
        getComponentState,
        getProps,
        propsToForward as ForwardPropsToStateFnResult<T_PROPS, COMPONENT_STATE>,
        allowedControlledPropOverrides,
        config.interceptActions,
        config.mappedCallbacks,
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

      const updatedPropsToState: Partial<T_PROPS> = {};
      let updatedPropsToStateCount = 0;

      type UPDATED_PROPS = {
        [key in keyof T_PROPS]?: {
          newValue: T_PROPS[key];
          oldValue: T_PROPS[key];
        };
      };
      const rawUpdatedProps: UPDATED_PROPS = {};

      for (var k in props) {
        const key = k as string as keyof T_PROPS;
        const oldValue = prevProps[key];
        const newValue = currentProps[key];

        if (key === 'children') {
          continue;
        }
        if (oldValue === newValue) {
          continue;
        }
        rawUpdatedProps[key] = { newValue, oldValue };

        if (isControlled(key, props) || isControlled(key, prevProps)) {
          if (propsToForward.hasOwnProperty(k)) {
            let valueToSet = newValue;
            const forwardFn = propsToForward[k as keyof typeof propsToForward];
            if (typeof forwardFn === 'function') {
              //@ts-ignore
              valueToSet = forwardFn(newValue);
            }
            //@ts-ignore
            if (state[key] !== valueToSet) {
              //@ts-ignore
              newMappedState[key] = valueToSet;
              newMappedStateCount++;
            }

            // or even if there is not, but props from propsToStateSet have changed
          } else if (propsToStateSetRef.current.has(k)) {
            updatedPropsToState[key] = currentProps[key];
            updatedPropsToStateCount++;
          }
        }
      }

      if (updatedPropsToStateCount > 0 || newMappedStateCount > 0) {
        debug(
          'Triggered by new values for the following props',
          ...[
            ...Object.keys(newMappedState ?? {}),
            ...Object.keys(updatedPropsToState ?? {}),
          ],
        );
        const action = {
          payload: {
            mappedState: newMappedStateCount ? newMappedState : null,
            updatedPropsToState: updatedPropsToStateCount
              ? updatedPropsToState
              : null,
          },
        };

        // const newState = theReducer(state, action);

        dispatch(action);

        if (config.onPropChange) {
          for (var prop in rawUpdatedProps)
            if (rawUpdatedProps.hasOwnProperty(prop)) {
              const { newValue, oldValue } = rawUpdatedProps[prop]!;
              config.onPropChange(
                { name: prop, newValue, oldValue },
                props,
                actions,
              );
            }
        }
        // config.onPropChange?.(
        //   { name: key, oldValue, newValue },

        //   actions as ACTIONS_TYPE,
        // );
        // dispatch({
        //   type: 'REPLACE_STATE',
        //   payload: newState,
        // });
      }
    });

    useEffect(() => {
      return () => {
        config.cleanup?.(getComponentState());
      };
    }, []);

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
