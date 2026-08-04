import * as React from 'react';
import { useRef } from 'react';

import { useResizeObserver } from '../ResizeObserver';
import { error, debug, WRAPPER_STYLE } from './shared';

type CSSVariableWatcherProps = {
  varName: string;
  onChange: (value: number) => void;
  allowInts?: boolean;
};

export const useCSSVariableWatch = (
  params: CSSVariableWatcherProps & {
    ref: React.MutableRefObject<HTMLElement | null>;
  },
) => {
  const lastValueRef = useRef<number>(0);
  const onResize = React.useCallback(
    ({ height }: { height: number }) => {
      if (height != null && height !== lastValueRef.current) {
        lastValueRef.current = height;
        params.onChange(height);
      }
    },
    [params.onChange],
  );
  useResizeObserver(params.ref, onResize, { earlyAttach: true });

  React.useLayoutEffect(() => {
    const value = params.ref.current!.getBoundingClientRect().height;

    if (value != null) {
      lastValueRef.current = value;

      debug(`Variable ${params.varName} found and equals ${value}.`);
      return params.onChange(value);
    } else {
      error(
        `Specified variable ${params.varName} not found or does not have a numeric value.`,
      );
    }
  }, []);
};

export const CSSNumericVariableWatch = (props: CSSVariableWatcherProps) => {
  const domRef = useRef<HTMLDivElement>(null);

  useCSSVariableWatch({
    ...props,
    ref: domRef,
  });

  const height = props.varName.startsWith('var(')
    ? props.varName
    : `var(${props.varName})`;

  const { allowInts = false } = props;

  return (
    <div
      data-name="css-variable-watcher"
      data-var={props.varName}
      style={WRAPPER_STYLE as React.CSSProperties}
    >
      <div
        ref={domRef}
        style={{
          height: allowInts ? `calc(1px * ${height})` : height, // we do multiplication in order to support integer (without px) values as well
        }}
      ></div>
    </div>
  );
};
