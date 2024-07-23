import {
  buildManagedComponent,
  useManagedComponentState,
} from '@src/components/hooks/useComponentState';

import { Ref, useRef } from 'react';
import * as React from 'react';

type CounterProps<_T> = {
  value?: number;
  defaultValue?: number;
  onValueChange?: (v: number) => void;
};

type CounterSetupState = {
  ref: Ref<number>;
};
type CounterMappedState = {
  value: number;
};
type CounterDerivedState = {
  derivedValue: number;
};
type CounterState = CounterSetupState &
  CounterMappedState &
  CounterDerivedState;

function initSetupState(): CounterSetupState {
  return {
    ref: React.createRef(),
  };
}

function forwardProps() {
  return {
    value: (value: number) => value ?? 0,
  };
}

const { ManagedComponentContextProvider: CounterComponentStateRoot } =
  buildManagedComponent({
    initSetupState,
    forwardProps,

    //@ts-ignore
    mapPropsToState: ({ state }: { state: CounterState }) => {
      return {
        derivedValue: state.value * 10,
      };
    },
  });

(globalThis as any).refs = [];
const TheActualCounter = React.memo(function TheActualCounter() {
  const renderCountRef = useRef(0);
  const { componentState: state, componentActions: actions } =
    useManagedComponentState<CounterState>();

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
