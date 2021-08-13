import * as React from 'react';
import { useReducer, createContext, useMemo, useEffect, useState } from 'react';

import { isControlled } from '../utils/isControlled';
import { useLatest } from './useLatest';
import { usePrevious } from './usePrevious';
import { notifyChange } from './useProperty';

let ComponentContext: any;

export function getComponentStateContext<T>(): React.Context<T> {
  if (ComponentContext as React.Context<T>) {
    return ComponentContext;
  }

  return (ComponentContext = createContext<T>(null as any as T));
}

type ComponentStateContext<T_STATE, T_ACTIONS> = {
  componentState: T_STATE;
  componentActions: T_ACTIONS;
};

type ComponentStateGeneratedActions<T_STATE> = {
  [k in keyof T_STATE]: T_STATE[k] | React.SetStateAction<T_STATE[k]>;
};

export type ComponentStateActions<
  T_STATE,
  T_ACTIONS = {},
> = ComponentStateGeneratedActions<T_STATE> & T_ACTIONS;

function getReducerActions<T_STATE, T_PROPS>(
  dispatch: React.Dispatch<any>,
  state: T_STATE,
  getProps: () => T_PROPS,
): ComponentStateGeneratedActions<T_STATE> {
  return Object.keys(state).reduce((actions, stateKey) => {
    const key = stateKey as keyof T_STATE;

    const setter = (value: T_STATE[typeof key]) => {
      const props = getProps();
      notifyChange(props, stateKey, value);
      if (isControlled(stateKey as keyof T_PROPS, props)) {
        return;
      }
      dispatch({
        propertyName: stateKey,
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
  T_STATE,
  T_READONLY_STATE = {},
  T_ACTIONS = {},
> = {
  getInitialState: (props: T_PROPS) => T_STATE;
  reducer?: React.Reducer<T_STATE, any>;
  getReducerActions?: (dispatch: React.Dispatch<any>) => T_ACTIONS;
  deriveReadOnlyState?: (props: T_PROPS, state: T_STATE) => T_READONLY_STATE;
};

export function getComponentStateRoot<
  T_PROPS,
  T_STATE extends object,
  T_READONLY_STATE extends object = {},
  T_ACTIONS = {},
>(
  config: ComponentStateRootConfig<
    T_PROPS,
    T_STATE,
    T_READONLY_STATE,
    T_ACTIONS
  >,
) {
  /**
   * since config is passed outside the cmp, we can skip it inside useMemo deps list
   */
  return React.memo(function ComponentStateRoot(
    props: T_PROPS & { children: React.ReactNode },
  ) {
    const [{ state: wholeState, initialState }] = useState<{
      state: T_STATE & T_READONLY_STATE;
      initialState: T_STATE;
      readOnlyState: T_READONLY_STATE;
    }>(() => {
      let initialState = config.getInitialState(props);

      if (config.deriveReadOnlyState) {
        const readOnlyState = config.deriveReadOnlyState(props, initialState);
        return {
          state: {
            ...initialState,
            ...readOnlyState,
          },
          initialState,
          readOnlyState: readOnlyState,
        };
      }

      return {
        initialState,
        readOnlyState: {} as T_READONLY_STATE,
        state: initialState as T_STATE & T_READONLY_STATE,
      };
    });

    const getProps = useLatest(props);

    const theReducer = (state: T_STATE, action: any) => {
      if (action.propertyName) {
        state = {
          ...state,
          [action.propertyName as keyof T_STATE]: action.payload,
        };
      }
      if (config.deriveReadOnlyState) {
        const derivedState = config.deriveReadOnlyState(getProps(), state);
        state = {
          ...state,
          ...derivedState,
        };
      }
      const result = config.reducer ? config.reducer(state, action) : state;

      return result as T_STATE & T_READONLY_STATE;
    };

    const [state, dispatch] = useReducer<
      React.Reducer<T_STATE & T_READONLY_STATE, any>
    >(theReducer, wholeState);

    type ACTIONS_TYPE = ComponentStateActions<T_STATE, T_ACTIONS>;

    const userDefinedActions = useMemo(() => {
      return config.getReducerActions?.(dispatch) ?? {};
    }, [dispatch]) as T_ACTIONS;

    const actions = useMemo(() => {
      const generatedActions = getReducerActions(
        dispatch,
        initialState,
        getProps,
      );

      return Object.assign(generatedActions, userDefinedActions);
    }, [dispatch, userDefinedActions]) as ACTIONS_TYPE;

    const Context =
      getComponentStateContext<ComponentStateContext<T_STATE, ACTIONS_TYPE>>();

    const contextValue = useMemo(
      () => ({ componentState: state, componentActions: actions }),
      [state, actions],
    );

    const prevProps = usePrevious(props);

    useEffect(() => {
      const currentProps = props;
      for (var k in initialState)
        if (
          initialState.hasOwnProperty(k) &&
          isControlled(k as string as keyof T_PROPS, props)
        ) {
          const oldValue = prevProps[k as string as keyof T_PROPS];
          const newValue = currentProps[k as string as keyof T_PROPS];

          if (oldValue !== newValue) {
            dispatch({
              propertyName: k,
              payload: newValue,
            });
          }
        }
    });

    return (
      <Context.Provider value={contextValue}>{props.children}</Context.Provider>
    );
  });
}

export function useComponentState<
  T_STATE,
  T_READONLY_STATE = {},
  T_ACTIONS = {},
>() {
  type ACTIONS_TYPE = ComponentStateActions<T_STATE, T_ACTIONS>;
  const Context =
    getComponentStateContext<
      ComponentStateContext<T_STATE & T_READONLY_STATE, ACTIONS_TYPE>
    >();
  return React.useContext(Context);
}
