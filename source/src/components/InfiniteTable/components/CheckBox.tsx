import * as React from 'react';
import {
  ForwardPropsToStateFnResult,
  getComponentStateRoot,
  useComponentState,
} from '../../hooks/useComponentState';
import { NonUndefined } from '../../types/NonUndefined';

export type InfiniteCheckBoxPropChecked = true | false | null;
export type InfiniteCheckBoxProps = {
  checked?: InfiniteCheckBoxPropChecked;
  defaultChecked?: InfiniteCheckBoxPropChecked;
  onChange?: (checked: InfiniteCheckBoxPropChecked) => void;
  domProps?: React.HTMLProps<HTMLElement>;
};

export type InfiniteCheckBoxMappedState = {
  checked: NonUndefined<InfiniteCheckBoxProps['checked']>;
};

function forwardProps(): ForwardPropsToStateFnResult<
  InfiniteCheckBoxProps,
  InfiniteCheckBoxMappedState
> {
  return {
    checked: 1,
  };
}

export interface InfiniteCheckBoxState extends InfiniteCheckBoxMappedState {}

const InfiniteCheckBoxRoot = getComponentStateRoot({
  // @ts-ignore
  forwardProps,
  // @ts-ignore
  mapPropsToState,
  // @ts-ignore
  cleanup: cleanupState,
  // @ts-ignore

  debugName: 'InfiniteCheckBox',
});

function InfiniteCheckBoxComponent() {
  const { componentState } = useComponentState<InfiniteCheckBoxState>();
  return (
    <input
      type="checkbox"
      checked={!!componentState.checked}
      onChange={() => {}}
    />
  );
}

export function InfiniteCheckBox(props: InfiniteCheckBoxProps) {
  return (
    <InfiniteCheckBoxRoot {...props}>
      <InfiniteCheckBoxComponent />
    </InfiniteCheckBoxRoot>
  );
}
