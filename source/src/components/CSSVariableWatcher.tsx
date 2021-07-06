import * as React from 'react';
import { useRef } from 'react';

import { useResizeObserver } from './ResizeObserver';

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
  const onResize = React.useCallback(
    ({ height }) => {
      params.onChange(height);
    },
    [params.onChange],
  );
  useResizeObserver(params.ref, onResize, { earlyAttach: true });
};

export const CSSVariableWatcher = (props: CSSVariableWatcherProps) => {
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
