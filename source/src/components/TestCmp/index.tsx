import * as React from 'react';
import {
  buildManagedComponent,
  useManagedComponentState,
} from '../hooks/useComponentState';
import { ManagedComponentStateContextValue } from '../hooks/useComponentState/types';

const forwardProps = () => {
  return {
    checked: 1,
  };
};
type TestCmpState = {
  checked: boolean;
  works: boolean;
};

const TestCmpContext = React.createContext<
  ManagedComponentStateContextValue<TestCmpState, any>
>(null as any as ManagedComponentStateContextValue<TestCmpState, any>);

const { ManagedComponentContextProvider: TestCmpRoot } = buildManagedComponent({
  initSetupState: () => {
    return {
      works: true,
    };
  },
  forwardProps,
  // @ts-ignore
  mapPropsToState: (params) => {
    return {};
  },
  layoutEffect: true,
  // @ts-ignore
  Context: TestCmpContext,
});

export function TestCmp(props: {
  checked?: boolean;
  defaultChecked?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <TestCmpRoot {...props}>
      <Cmp />
      {props.children}
    </TestCmpRoot>
  );
}

function Cmp() {
  const { componentState, componentActions } =
    useManagedComponentState<TestCmpState>(TestCmpContext);
  return (
    <div>
      <p>Works - checked {`${componentState.checked}`}</p>
      <button
        onClick={() => {
          componentActions.checked = !componentState.checked;
        }}
      >
        toggle
      </button>
    </div>
  );
}
