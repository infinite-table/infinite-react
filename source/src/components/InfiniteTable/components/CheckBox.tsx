import * as React from 'react';
import { useEffect, useRef } from 'react';
import { join } from '../../../utils/join';
import {
  ForwardPropsToStateFnResult,
  getComponentStateRoot,
  useComponentState,
} from '../../hooks/useComponentState';
import { NonUndefined } from '../../types/NonUndefined';
import { CheckBoxCls } from './CheckBox.css';

export type InfiniteCheckBoxPropChecked = true | false | null;
export type InfiniteCheckBoxProps = {
  checked?: InfiniteCheckBoxPropChecked;
  defaultChecked?: InfiniteCheckBoxPropChecked;
  onChange?: (checked: InfiniteCheckBoxPropChecked) => void;
  domProps?: React.HTMLProps<HTMLElement>;
};

export type InfiniteCheckBoxMappedState = {
  checked: NonUndefined<InfiniteCheckBoxProps['checked']>;
  domProps: InfiniteCheckBoxProps['domProps'];
};

function forwardProps(): ForwardPropsToStateFnResult<
  InfiniteCheckBoxProps,
  InfiniteCheckBoxMappedState
> {
  return {
    checked: 1,
    domProps: 1,
  };
}

export interface InfiniteCheckBoxState extends InfiniteCheckBoxMappedState {}

const InfiniteCheckBoxRoot = getComponentStateRoot({
  // @ts-ignore
  forwardProps,
  // @ts-ignore
  // mapPropsToState,
  // @ts-ignore
  // cleanup: cleanupState,
  // @ts-ignore,
  mappedCallbacks: {
    checked: (checked) => {
      return {
        callbackName: 'onChange',
        callbackParams: [checked],
      };
    },
  },

  debugName: 'InfiniteCheckBox',
});

function InfiniteCheckBoxComponent() {
  const { componentState, componentActions } =
    useComponentState<InfiniteCheckBoxState>();

  const { checked, domProps } = componentState;

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current!.indeterminate = checked == null;
  }, [checked]);

  return (
    <input
      {...domProps}
      className={join(CheckBoxCls, domProps?.className)}
      type="checkbox"
      ref={inputRef}
      checked={!!checked}
      onChange={() => {
        componentActions.checked = !checked;
      }}
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
