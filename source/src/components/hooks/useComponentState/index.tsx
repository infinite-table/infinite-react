/**
 * React adapter for the managed component state system.
 *
 * All framework-free logic (controlled/uncontrolled resolution, reducer body,
 * generated action setters, prop-diff) lives in ./managedComponentState.ts.
 * This file owns React scheduling: useState/useReducer, effects, context.
 * Its behavior is pinned by buildManagedComponent.jestspec.tsx.
 */
import * as React from 'react';
import {
  useReducer,
  createContext,
  useMemo,
  useEffect,
  useState,
  useRef,
  useLayoutEffect,
} from 'react';

import { dbg } from '../../../utils/debugLoggers';

import { notNullable, UPDATED_VALUES } from '../../InfiniteTable/types/Utility';

import { useEffectOnce } from '../useEffectOnceWithProperUnmount';
import { useLatest } from '../useLatest';
import { usePrevious } from '../usePrevious';
import {
  ComponentInterceptedActions,
  ComponentMappedCallbacks,
  ComponentStateActions,
  ManagedComponentStateContextValue,
  ComponentStateGeneratedActions,
} from './types';
import { getMarker } from '../../../utils/devTools';

import {
  notifyChange,
  initManagedState,
  managedComponentReducer,
  createGeneratedActions,
  computePropsDiff,
  ForwardPropsToStateFnResult,
} from './managedComponentState';

export { notifyChange };
export type { ForwardPropsToStateFnResult };

let ComponentContext: any;

export function getComponentStateContext<T>(): React.Context<T> {
  if (ComponentContext as React.Context<T>) {
    return ComponentContext;
  }

  return (ComponentContext = createContext<T>(null as any as T));
}

type UPDATED_PROPS<T> = UPDATED_VALUES<T>;
type ComponentStateRootConfig<
  T_PROPS,
  COMPONENT_MAPPED_STATE,
  COMPONENT_SETUP_STATE = {},
  COMPONENT_DERIVED_STATE = {},
  T_ACTIONS = {},
  T_PARENT_STATE = {},
> = {
  debugName?: string | ((props: T_PROPS) => string);
  initSetupState?: (props: T_PROPS) => COMPONENT_SETUP_STATE;

  Context?: React.Context<
    ManagedComponentStateContextValue<
      COMPONENT_MAPPED_STATE & COMPONENT_DERIVED_STATE & COMPONENT_SETUP_STATE,
      ComponentStateGeneratedActions<
        COMPONENT_MAPPED_STATE & COMPONENT_DERIVED_STATE & COMPONENT_SETUP_STATE
      >
    >
  >;

  layoutEffect?: boolean;

  forwardProps?: (
    setupState: COMPONENT_SETUP_STATE,
    props: T_PROPS,
  ) => ForwardPropsToStateFnResult<
    T_PROPS,
    COMPONENT_MAPPED_STATE,
    COMPONENT_SETUP_STATE
  >;
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
    state: COMPONENT_MAPPED_STATE &
      COMPONENT_SETUP_STATE &
      Partial<COMPONENT_DERIVED_STATE>,
  ) => void;
  onPropsChange?: (
    newPropValues: {
      [k in keyof T_PROPS]?: {
        newValue: T_PROPS[k];
        oldValue: T_PROPS[k];
      };
    },
    props: T_PROPS,
    actions: ComponentStateActions<
      COMPONENT_MAPPED_STATE & COMPONENT_DERIVED_STATE & COMPONENT_SETUP_STATE
    >,
    state: COMPONENT_MAPPED_STATE &
      COMPONENT_SETUP_STATE &
      Partial<COMPONENT_DERIVED_STATE>,
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

export function buildManagedComponent<
  T_PROPS extends object,
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
  const useParentStateFn = config.getParentState || (() => null);
  /**
   * since config is passed outside the cmp, we can skip it inside useMemo deps list
   */
  function useManagedComponent(props: T_PROPS) {
    const [initialSetupState] = useState<COMPONENT_SETUP_STATE>(() => {
      return config.initSetupState
        ? config.initSetupState(props)
        : ({} as COMPONENT_SETUP_STATE);
    });
    const propsToStateSetRef = useRef<Set<string>>(new Set());
    const propsToForward = useMemo<
      Partial<
        ForwardPropsToStateFnResult<
          T_PROPS,
          COMPONENT_MAPPED_STATE,
          COMPONENT_SETUP_STATE
        >
      >
    >(
      () =>
        config.forwardProps
          ? config.forwardProps(initialSetupState, props)
          : {},
      [initialSetupState],
    );

    type COMPONENT_STATE = COMPONENT_MAPPED_STATE &
      COMPONENT_DERIVED_STATE &
      COMPONENT_SETUP_STATE;

    const parentState = useParentStateFn();
    const getParentState = useLatest(parentState);

    function initStateOnce() {
      return initManagedState<
        T_PROPS,
        COMPONENT_MAPPED_STATE,
        COMPONENT_SETUP_STATE,
        COMPONENT_DERIVED_STATE,
        T_PARENT_STATE
      >({
        props,
        initialSetupState,
        propsToForward,
        parentState,
        mapPropsToState: config.mapPropsToState,
        propsToStateSet: propsToStateSetRef.current,
      });
    }
    const [wholeState] = useState<COMPONENT_STATE>(initStateOnce);

    const getProps = useLatest(props);

    const theReducer: React.Reducer<COMPONENT_STATE, any> = (
      previousState: COMPONENT_STATE,
      action: any,
    ) => {
      return managedComponentReducer<T_PROPS, COMPONENT_STATE, T_PARENT_STATE>(
        previousState,
        action,
        {
          getProps,
          getParentState: () => getParentState?.() ?? null,
          mapPropsToState: config.mapPropsToState as any,
          concludeReducer: config.concludeReducer as any,
          propsToStateSet: propsToStateSetRef.current,
        },
      );
    };

    const [state, dispatch] = useReducer(theReducer, wholeState);

    const getComponentState = useLatest(state);

    type ACTIONS_TYPE = ComponentStateActions<COMPONENT_STATE>;

    const { allowedControlledPropOverrides } = config;

    const actions = useMemo(() => {
      const generatedActions = createGeneratedActions<COMPONENT_STATE, T_PROPS>(
        {
          dispatch,
          getState: getComponentState,
          getProps,
          propsToForward: propsToForward as ForwardPropsToStateFnResult<
            T_PROPS,
            COMPONENT_STATE,
            COMPONENT_SETUP_STATE
          >,
          allowedControlledPropOverrides,
          interceptedActions: config.interceptActions,
          mappedCallbacks: config.mappedCallbacks,
        },
      );

      return generatedActions;
    }, [
      dispatch,
      propsToForward,
      allowedControlledPropOverrides,
    ]) as ACTIONS_TYPE;

    const Context =
      config.Context ??
      getComponentStateContext<
        ManagedComponentStateContextValue<COMPONENT_STATE, ACTIONS_TYPE>
      >();

    const contextValue = useMemo(
      () => ({
        componentState: state,
        componentActions: actions,
        getComponentState,
        replaceState: (newState: COMPONENT_STATE) => {
          dispatch({
            type: 'REPLACE_STATE',
            payload: newState,
          });
        },
        assignState: (newState: Partial<COMPONENT_STATE>) => {
          dispatch({
            type: 'ASSIGN_STATE',
            payload: newState,
          });
        },
      }),
      [state, actions, getComponentState],
    );

    const prevProps = usePrevious(props);

    const skipTriggerParentStateChangeRef = useRef(false);
    skipTriggerParentStateChangeRef.current = false;

    const effectFn = config.layoutEffect ? useLayoutEffect : useEffect;
    effectFn(() => {
      const currentProps = props;

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
        state,
        propsToForward,
        propsToStateSet: propsToStateSetRef.current,
      });

      if (updatedPropsToStateCount > 0 || newMappedStateCount > 0) {
        const debugId = (state as any).debugId as string | undefined;

        const marker = debugId
          ? getMarker(debugId).track.ComponentState.label.PropUpdate.start()
          : undefined;

        const debugChannelName = config.debugName
          ? typeof config.debugName === 'function'
            ? `${config.debugName(currentProps)}:rerender`
            : `${config.debugName}:rerender`
          : 'rerender';
        const logger = dbg(debugChannelName);

        logger(
          'Triggered by new values for the following props',
          ...[
            ...Object.keys(newMappedState ?? {}),
            ...Object.keys(updatedPropsToState ?? {}),
          ],
        );

        if (marker) {
          marker.end({
            label: debugChannelName,
            details: [
              newMappedStateCount > 0
                ? {
                    name: 'Updated properties',
                    value: Object.keys(newMappedState).join(', '),
                  }
                : undefined,
              updatedPropsToStateCount > 0
                ? {
                    name: 'Updated props',
                    value: Object.keys(updatedPropsToState).join(', '),
                  }
                : undefined,
              updatedPropsToStateCount > 0 || updatedPropsToState
                ? {
                    name: 'Details',
                    value:
                      'The time for this marker is not accurate. The marker is only displayed so you can easily identify the props that triggered the rerender.',
                  }
                : undefined,
            ].filter(notNullable),
          });
        }
        const action = {
          payload: {
            mappedState: newMappedStateCount ? newMappedState : null,
            updatedPropsToState: updatedPropsToStateCount
              ? updatedPropsToState
              : null,
          },
        };

        skipTriggerParentStateChangeRef.current = true;
        dispatch(action);

        if (config.onPropChange) {
          for (var prop in rawUpdatedProps)
            if (rawUpdatedProps.hasOwnProperty(prop)) {
              const { newValue, oldValue } =
                rawUpdatedProps[prop as keyof T_PROPS]!;
              config.onPropChange(
                { name: prop as keyof T_PROPS, newValue, oldValue },
                props,
                actions,
                state,
              );
            }
        }
        if (config.onPropsChange && rawUpdatedPropsCount) {
          config.onPropsChange(
            rawUpdatedProps as UPDATED_PROPS<T_PROPS>,
            props,
            actions,
            state,
          );
        }
      }
    });

    effectFn(() => {
      if (parentState != null && !skipTriggerParentStateChangeRef.current) {
        dispatch({
          type: 'PARENT_STATE_CHANGE',
          payload: {},
        });
      }
    }, [parentState]);

    useEffectOnce(() => {
      return () => {
        config.cleanup?.(getComponentState());
      };
    });

    return { contextValue, ContextComponent: Context };
  }

  const ManagedComponentContextProvider = React.memo(function CSR(
    props: T_PROPS & { children?: React.ReactNode },
  ) {
    const { contextValue, ContextComponent } = useManagedComponent(props);
    return (
      <ContextComponent.Provider value={contextValue}>
        {props.children}
      </ContextComponent.Provider>
    );
  });
  return {
    ManagedComponentContextProvider,
    useManagedComponent,
  };
}

export function useManagedComponentState<COMPONENT_STATE>(
  Context?: React.Context<
    ManagedComponentStateContextValue<
      COMPONENT_STATE,
      ComponentStateActions<COMPONENT_STATE>
    >
  >,
) {
  type ACTIONS_TYPE = ComponentStateActions<COMPONENT_STATE>;
  Context =
    Context ??
    getComponentStateContext<
      ManagedComponentStateContextValue<COMPONENT_STATE, ACTIONS_TYPE>
    >();
  return React.useContext(Context);
}
