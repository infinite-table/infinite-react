import {
  getComponentStateRoot,
  useComponentState,
} from '@src/components/hooks/useComponentState';

import { Ref, useRef } from 'react';
import * as React from 'react';

type CounterProps<_T> = {
  value?: number;
  defaultValue?: number;
  onValueChange?: (v: number) => void;
};

type CounterState<_T> = {
  value: number;
  ref: Ref<number>;
};

function getInitialState<T>({
  props,
}: {
  props: CounterProps<T>;
}): CounterState<T> {
  return {
    ref: React.createRef(),
    value: props.value ?? props.defaultValue ?? 0,
  };
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
  deriveReadOnlyState: <T extends any>({
    state,
  }: {
    state: CounterState<T>;
  }) => {
    return {
      derivedValue: state.value * 10,
    };
  },
});

(globalThis as any).refs = [];
const TheActualCounter = React.memo(function TheActualCounter<T>() {
  const renderCountRef = useRef(0);
  const { componentState: state, componentActions: actions } =
    useComponentState<CounterState<T>, { derivedValue: number }>();

  console.log(state.ref);
  (globalThis as any).refs.push(state.ref);
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
