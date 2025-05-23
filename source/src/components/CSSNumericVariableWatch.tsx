import * as React from 'react';
import { useRef } from 'react';
import { dbg, err } from '../utils/debugLoggers';

import { useResizeObserver } from './ResizeObserver';

const error = err('CSSVariableWatch');
const debug = dbg('CSSVariableWatch');

type CSSVariableWatcherProps = {
  varName: string;
  onChange: (value: number) => void;
  allowInts?: boolean;
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

    if (value) {
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
      style={WRAPPER_STYLE}
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
