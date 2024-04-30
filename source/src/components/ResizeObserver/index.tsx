import * as React from 'react';
import {
  useMemo,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
} from 'react';

import { Size, OnResizeFn } from '../types/Size';
import { debounce } from '../utils/debounce';

interface ResizeObserverProps {
  /**
   * Specifies whether to call onResize after the initial render (on mount)
   *
   * @default true
   */
  notifyOnMount?: boolean;

  /**
   * If set to true, it will be attached using useLayoutEffect. If false, will be attached using useEffect
   * @default false
   */
  earlyAttach?: boolean;

  onResize: OnResizeFn;
}

export const setupResizeObserver = (
  node: HTMLElement,
  callback: OnResizeFn,
  config: { debounce?: number } = { debounce: 0 },
): (() => void) => {
  const debounceTime = config.debounce ?? 0;
  const RO = (window as any).ResizeObserver;

  const onResizeCallback = debounceTime
    ? debounce(callback, { wait: debounceTime })
    : callback;

  const observer = new RO((entries: any[]) => {
    const entry = entries[0];

    let { width, height } = entry.contentRect;

    if (entry.borderBoxSize?.[0]) {
      height = entry.borderBoxSize[0].blockSize;
      width = entry.borderBoxSize[0].inlineSize;
    } else {
      // this is needed for Safari and other browsers that don't have borderBoxSize on the entry object
      const rect = node.getBoundingClientRect();
      height = rect.height;
      width = rect.width;
    }

    onResizeCallback({ width, height });
  });

  observer.observe(node);

  return () => {
    observer.disconnect();
  };
};

/**
 * A hook that notifies you when a certain DOM element has changed it's size
 *
 * @param ref A React ref to a DOM element
 * @param callback The function to be called when the element is resized.
 */
export const useResizeObserver = (
  ref: React.MutableRefObject<HTMLElement | null>,
  callback: OnResizeFn,
  config: { earlyAttach: boolean; debounce?: number } = {
    earlyAttach: false,
    debounce: 0,
  },
) => {
  const sizeRef = useRef<Size>({
    width: 0,
    height: 0,
  });

  const effectFn = (callback: OnResizeFn) => {
    let disconnect: () => void;
    if (ref.current) {
      disconnect = setupResizeObserver(
        ref.current,
        (size) => {
          size = {
            width: Math.round(size.width),
            height: Math.round(size.height),
          };
          const prevSize = sizeRef.current;
          if (
            prevSize.width !== size.width ||
            prevSize.height !== size.height
          ) {
            sizeRef.current = size;

            callback(size);
          }
        },
        { debounce: config.debounce },
      );
    }
    return () => {
      if (disconnect) {
        disconnect();
      }
    };
  };

  useEffect(() => {
    if (!config.earlyAttach) {
      return effectFn(callback);
    }
    return () => {};
  }, [ref.current, callback, config.earlyAttach, config.debounce]);

  useLayoutEffect(() => {
    if (config.earlyAttach) {
      return effectFn(callback);
    }
    return () => {};
  }, [ref.current, callback, config.earlyAttach]);
};

const ReactResizeObserver = (props: ResizeObserverProps) => {
  const style = useMemo(
    () => ({
      position: 'absolute' as 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      boxSizing: 'border-box' as 'border-box',
    }),
    [],
  );

  const notifyOnMount = props.notifyOnMount ?? true;
  const earlyAttach = props.earlyAttach ?? false;

  const firstTime = useRef(true);
  const ref = useRef<HTMLDivElement>(null);

  const onResize = useCallback(
    (size: Size) => {
      if (firstTime.current && !notifyOnMount) {
        firstTime.current = false;
        return;
      }
      props.onResize(size);
    },
    [props.onResize],
  );

  useResizeObserver(ref, onResize, { earlyAttach: earlyAttach || false });

  return <div ref={ref} style={style}></div>;
};

export default ReactResizeObserver;
