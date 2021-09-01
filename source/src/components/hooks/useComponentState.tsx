import * as React from 'react';
import { useReducer, createContext, useMemo, useEffect, useState } from 'react';
import { dbg } from '../../utils/debug';

import { isControlled } from '../utils/isControlled';
import { useLatest } from './useLatest';
import { usePrevious } from './usePrevious';
import { notifyChange } from './useProperty';

const debug = dbg('rerender');

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
  updateStateProperty: <T extends keyof T_STATE>(
    propertyName: T,
    propertyValue: T_STATE[T],
  ) => void;
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
  deriveReadOnlyState?: (
    props: T_PROPS,
    state: T_STATE,
    updated: Partial<T_STATE> | null,
  ) => T_READONLY_STATE;

  onControlledPropertyChange?: (
    name: string,
    newValue: any,
    oldValue: any,
  ) => void | ((value: any, oldValue: any) => any);
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
        const readOnlyState = config.deriveReadOnlyState(
          props,
          initialState,
          null,
        );
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
      let newState: Partial<T_STATE> | null = null;
      if (action.propertyName) {
        newState = {
          [action.propertyName as keyof T_STATE]: action.payload,
        } as Partial<T_STATE>;
      }

      if (action.newControlledProps) {
        newState = action.payload;
      }

      if (newState !== null) {
        state = {
          ...state,
          ...newState,
        };
      }

      if (config.deriveReadOnlyState) {
        const derivedState = config.deriveReadOnlyState(
          getProps(),
          state,
          newState,
        );
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

    const getComponentState = useLatest(state);

    const contextValue = useMemo(
      () => ({
        componentState: state,
        componentActions: actions,
        getComponentState,
        updateStateProperty: <T extends keyof T_STATE>(
          propertyName: T,
          propertyValue: T_STATE[T],
        ) => {
          dispatch({
            propertyName,
            payload: propertyValue,
          });
        },
      }),
      [state, actions, getComponentState],
    );

    const prevProps = usePrevious(props);

    useEffect(() => {
      const currentProps = props;
      const updatedStateFromProps: Partial<T_PROPS> = {};
      let updatedCount = 0;
      for (var k in wholeState) {
        const key = k as string as keyof T_PROPS;
        if (wholeState.hasOwnProperty(k) && isControlled(key, props)) {
          const oldValue = prevProps[key];
          let newValue = currentProps[key];

          if (oldValue !== newValue) {
            if (config.onControlledPropertyChange) {
              const modifier = config.onControlledPropertyChange(
                k,
                newValue,
                oldValue,
              );

              if (typeof modifier === 'function') {
                newValue = modifier(newValue, oldValue);
              }
            }
            updatedStateFromProps[key] = newValue;
            updatedCount++;
          }
        }
      }

      if (updatedCount > 0) {
        debug(
          'Triggered by new values for the following props',
          updatedStateFromProps,
        );
        dispatch({
          newControlledProps: true,
          payload: updatedStateFromProps,
        });
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
