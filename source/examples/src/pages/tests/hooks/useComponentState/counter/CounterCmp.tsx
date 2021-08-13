import {
  getComponentStateRoot,
  useComponentState,
} from '@src/components/hooks/useComponentState';

import { useRef } from 'react';
import * as React from 'react';

type CounterProps<T> = {
  value?: number;
  defaultValue?: number;
  onValueChange?: (v: number) => void;
  t: T;
};

type CounterState<T> = {
  value: number;

  t: T;
};

function getInitialState<T>(props: CounterProps<T>): CounterState<T> {
  return {
    value: props.value ?? props.defaultValue ?? 0,
    t: props.t,
  };
}

function reducer<T>(
  state: CounterState<T>,
  action: CounterAction,
): CounterState<T> {
  if (action.type === CounterActionType.DEC) {
    return { ...state, value: state.value - 1 };
  }
  if (action.type === CounterActionType.INC) {
    return { ...state, value: state.value + 1 };
  }

  return state;
}

enum CounterActionType {
  INC,
  DEC,
  SET,
}

type CounterAction = {
  type: CounterActionType;
  payload?: number;
};

type CounterActions = {
  increment: VoidFunction;
  decrement: VoidFunction;
};

export const getReducerActions = (
  dispatch: React.Dispatch<CounterAction>,
): CounterActions => {
  const increment = () => {
    dispatch({
      type: CounterActionType.INC,
    });
  };
  const decrement = () => {
    dispatch({
      type: CounterActionType.DEC,
    });
  };

  return {
    increment,
    decrement,
  };
};

const CounterComponentStateRoot = getComponentStateRoot({
  //@ts-ignore
  getInitialState,
  // reducer,
  // getReducerActions,
  //@ts-ignore
  deriveReadOnlyState: <T extends any>(
    props: CounterProps<T>,
    state: CounterState<T>,
  ) => {
    return {
      derivedValue: state.value * 10,
    };
  },
});

const TheActualCounter = React.memo(function TheActualCounter<T>() {
  const renderCountRef = useRef(0);
  const { componentState: state, componentActions: actions } =
    useComponentState<CounterState<T>, { derivedValue: number }>();

  renderCountRef.current++;

  console.log(`Actual component rendered ${renderCountRef.current} times`);

  return (
    <div>
      current value is <span id="value">{state.value}</span>. Derived value is{' '}
      {state.derivedValue}.
      <div>
        <button id="innerinc" onClick={() => (actions.value = state.value + 1)}>
          inside cmp: INC
        </button>
        <button id="innerdec" onClick={() => (actions.value = state.value - 1)}>
          inside cmp: DEC
        </button>
      </div>
    </div>
  );
});

export function Counter<T>(props: CounterProps<T>) {
  return (
    <CounterComponentStateRoot {...props}>
      <TheActualCounter />
    </CounterComponentStateRoot>
  );
}
