import * as React from 'react';
import { useRef } from 'react';
import { err } from '../utils/debug';

import { useResizeObserver } from './ResizeObserver';

const error = err('CSSVariableWatch');

type CSSVariableWatcherProps = {
  varName: string;
  onChange: (value: number) => void;
};

const WRAPPER_STYLE: React.CSSProperties = {
  position: 'absolute',
  pointerEvents: 'none',
  width: 0,
  height: 0,
  lineHeight: 0,
  fontSize: 0,
  overflow: 'hidden',
};

export const useCSSVariableWatch = (
  params: CSSVariableWatcherProps & {
    ref: React.MutableRefObject<HTMLElement | null>;
  },
) => {
  const lastValueRef = useRef<number>(0);
  const onResize = React.useCallback(
    ({ height }) => {
      if (height && height !== lastValueRef.current) {
        lastValueRef.current = height;
        params.onChange(height);
      }
    },
    [params.onChange],
  );
  useResizeObserver(params.ref, onResize, { earlyAttach: true });

  React.useLayoutEffect(() => {
    const value = params.ref.current!.getBoundingClientRect().height;

    if (value) {
      lastValueRef.current = value;
      params.onChange(value);
    } else {
      error(
        `Specified variable ${params.varName} not found or does not have a numeric value.`,
      );
    }
  }, []);
};

export const CSSVariableWatch = (props: CSSVariableWatcherProps) => {
  const domRef = useRef<HTMLDivElement>(null);

  useCSSVariableWatch({
    ...props,
    ref: domRef,
  });

  return (
    <div data-name="css-variable-watcher" style={WRAPPER_STYLE}>
      <div
        ref={domRef}
        style={{
          height: `var(${props.varName})`,
        }}
      ></div>
    </div>
  );
};
