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

export type ComponentStateActions<
  T_DYNAMIC_STATE,
  T_READ_ONLY_STATE,
  T_ACTIONS = {},
> = ComponentStateGeneratedActions<T_DYNAMIC_STATE & T_READ_ONLY_STATE> &
  T_ACTIONS;

function getReducerActions<T_STATE, T_SETUP_STATE extends object, T_PROPS>(
  dispatch: React.Dispatch<any>,
  state: T_STATE,
  initialSetupState: T_SETUP_STATE,
  getProps: () => T_PROPS,
): ComponentStateGeneratedActions<T_STATE> {
  return Object.keys(state).reduce((actions, stateKey) => {
    if (initialSetupState.hasOwnProperty(stateKey)) {
      return actions;
    }
    const key = stateKey as keyof T_STATE;

    const setter = (value: T_STATE[typeof key]) => {
      const props = getProps();
      if (stateKey === 'headerHeight') {
        debugger;
      }
      notifyChange(props, stateKey, value);

      if (isControlled(stateKey as keyof T_PROPS, props)) {
        return;
      }
      dispatch({
        statePropertyName: stateKey,
        payload: value,
      });
    };

    Object.defineProperty(actions, stateKey, {
      set: setter,
    });

    return actions;
  }, {} as ComponentStateGeneratedActions<T_STATE>);
}

type ComponentStateRootConfig<
  T_PROPS,
  COMPONENT_DYNAMIC_STATE,
  COMPONENT_SETUP_STATE = {},
  COMPONENT_DERIVED_STATE = {},
  T_ACTIONS = {},
  T_PARENT_STATE = {},
> = {
  setupState?: () => COMPONENT_SETUP_STATE;
  getInitialState: (params: {
    props: T_PROPS;
    parentState: T_PARENT_STATE | null;
  }) => COMPONENT_DYNAMIC_STATE;
  mapPropsToState?: (params: {
    props: T_PROPS;
    state: COMPONENT_DYNAMIC_STATE;
    updatedProps: Partial<T_PROPS> | null;
    updatedState: Partial<COMPONENT_DYNAMIC_STATE> | null;
    parentState: T_PARENT_STATE | null;
  }) => COMPONENT_DERIVED_STATE;
  concludeReducer?: (params: {
    previousState: COMPONENT_DYNAMIC_STATE;
    state: COMPONENT_DYNAMIC_STATE;
    updatedState: Partial<COMPONENT_DYNAMIC_STATE> | null;
    updatedProps: Partial<T_PROPS> | null;
    parentState: T_PARENT_STATE | null;
  }) => COMPONENT_DYNAMIC_STATE;
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
  COMPONENT_DYNAMIC_STATE extends object,
  COMPONENT_SETUP_STATE extends object = {},
  COMPONENT_DERIVED_STATE extends object = {},
  T_ACTIONS = {},
  T_PARENT_STATE = {},
>(
  config: ComponentStateRootConfig<
    T_PROPS,
    COMPONENT_DYNAMIC_STATE,
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
    const getParentState = config.getParentState;
    const parentState = getParentState?.() ?? null;
    const [
      {
        state: wholeState,
        initialDynamicState: initialState,
        initialSetupState,
      },
    ] = useState<{
      state: COMPONENT_SETUP_STATE &
        COMPONENT_DYNAMIC_STATE &
        COMPONENT_DERIVED_STATE;
      initialDynamicState: COMPONENT_DYNAMIC_STATE;
      derivedState: COMPONENT_DERIVED_STATE;
      initialSetupState: COMPONENT_SETUP_STATE;
    }>(() => {
      // STEP 1: call setupState
      const initialSetupState = config.setupState
        ? config.setupState()
        : ({} as COMPONENT_SETUP_STATE);

      // STEP 2: call getInitialState, but via a proxy
      // so we can intercept all property reads from props
      const { fn: getInitialState, propertyReads: propsToStateSet } = proxyFn(
        config.getInitialState,
        {
          getProxyTargetFromArgs: (initialArg) => initialArg.props,
          putProxyToArgs: (props: T_PROPS, initialArg) => {
            return [{ ...initialArg, props }];
          },
        },
      );

      // get the result
      let initialDynamicState = getInitialState({
        props,
        parentState,
      });

      // and set those property reads into the corresponding ref
      // basically in this way we know what properties from props
      // the state depends on
      propsToStateSetRef.current = new Set(propsToStateSet);

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
          state: initialDynamicState,
          updatedState: null,
          updatedProps: null,
          parentState,
        });

        propsToStateSetRef.current = new Set([
          ...propsToStateSetRef.current,
          ...propertyReads,
        ]);

        return {
          initialDynamicState,
          initialSetupState,
          derivedState: stateFromProps,
          state: {
            ...initialSetupState,
            ...initialDynamicState,
            ...stateFromProps,
          },
        };
      }

      return {
        initialSetupState,
        initialDynamicState,
        // this is set by mapStateToProps, but at this point
        // mapPropsToState is not defined, so derivedState is an empty object
        derivedState: {} as COMPONENT_DERIVED_STATE,
        state: {
          ...initialSetupState,
          ...initialDynamicState,
        } as COMPONENT_DYNAMIC_STATE &
          COMPONENT_DERIVED_STATE &
          COMPONENT_SETUP_STATE,
      };
    });

    const getProps = useLatest(props);

    const theReducer = (state: COMPONENT_DYNAMIC_STATE, action: any) => {
      const previousState = state;
      let newState: Partial<COMPONENT_DYNAMIC_STATE> | null = null;
      let newProps: Partial<T_PROPS> | null = null;
      if (action.statePropertyName) {
        newState = {
          [action.statePropertyName as keyof COMPONENT_DYNAMIC_STATE]:
            action.payload,
        } as Partial<COMPONENT_DYNAMIC_STATE>;
      }

      if (action.newControlledProps) {
        newProps = action.payload;
      }

      if (newState !== null) {
        state = {
          ...state,
          ...newState,
        };
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
          state,
          updatedProps: newProps,
          updatedState: newState,
          parentState,
        });

        state = {
          ...state,
          ...stateFromProps,
        };
      }

      const result = config.concludeReducer
        ? config.concludeReducer({
            previousState,
            state,
            updatedState: newState,
            updatedProps: newProps,
            parentState,
          })
        : state;

      return result as COMPONENT_DYNAMIC_STATE & COMPONENT_DERIVED_STATE;
    };

    const [state, dispatch] = useReducer<
      React.Reducer<COMPONENT_DYNAMIC_STATE & COMPONENT_DERIVED_STATE, any>
    >(theReducer, wholeState);

    type ACTIONS_TYPE = ComponentStateActions<
      COMPONENT_DYNAMIC_STATE,
      COMPONENT_DERIVED_STATE,
      T_ACTIONS
    >;

    const userDefinedActions = useMemo(() => {
      return config.getReducerActions?.(dispatch) ?? {};
    }, [dispatch]) as T_ACTIONS;

    const actions = useMemo(() => {
      const generatedActions = getReducerActions(
        dispatch,
        wholeState,
        initialSetupState,
        getProps,
      );

      return Object.assign(generatedActions, userDefinedActions);
    }, [dispatch, userDefinedActions]) as ACTIONS_TYPE;

    const Context =
      getComponentStateContext<
        ComponentStateContext<COMPONENT_DYNAMIC_STATE, ACTIONS_TYPE>
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
      const updatedProps: Partial<T_PROPS> = {};
      let updatedCount = 0;
      const { current: propsToStateSet } = propsToStateSetRef;
      for (var k in props) {
        const key = k as string as keyof T_PROPS;
        if (isControlled(key, props) && propsToStateSet.has(k)) {
          const oldValue = prevProps[key];
          const newValue = currentProps[key];

          if (oldValue !== newValue) {
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
            updatedProps[key] = newValue;
            updatedCount++;
          }
        }
      }

      if (updatedCount > 0) {
        debug('Triggered by new values for the following props', updatedProps);
        dispatch({
          newControlledProps: true,
          payload: updatedProps,
        });
      }
    });

    return (
      <Context.Provider value={contextValue}>{props.children}</Context.Provider>
    );
  });
}

export function useComponentState<
  T_DYNAMIC_STATE,
  T_DERIVED_STATE = {},
  T_SETUP_STATE = {},
  T_ACTIONS = {},
>() {
  type ACTIONS_TYPE = ComponentStateActions<
    T_DYNAMIC_STATE,
    T_DERIVED_STATE,
    T_ACTIONS
  >;
  const Context =
    getComponentStateContext<
      ComponentStateContext<
        T_DYNAMIC_STATE & T_DERIVED_STATE & T_SETUP_STATE,
        ACTIONS_TYPE
      >
    >();
  return React.useContext(Context);
}
