import { MutableRefObject, useLayoutEffect } from 'react';
import { setupResizeObserver } from '../../../ResizeObserver';
import { OnResizeFn } from '../../../types/Size';
import { VoidFn } from '../../../types/VoidFn';

const DEFAULT_getTargetElement = (
  domRef: MutableRefObject<HTMLDivElement | null>,
) => {
  return domRef.current?.firstChild as HTMLElement;
};

export const useHeaderOnResize = (
  domRef: MutableRefObject<HTMLDivElement | null>,
  onResize?: OnResizeFn,
  getTargetElement?: (
    domRef: MutableRefObject<HTMLDivElement | null>,
  ) => HTMLElement,
) => {
  useLayoutEffect(() => {
    if (!onResize) {
      return;
    }
    const setup = (callback: (cleanup: VoidFn) => void) => {
      const target = (getTargetElement || DEFAULT_getTargetElement)(domRef);

      if (!target) {
        requestAnimationFrame(() => {
          setup(callback);
        });
        return;
      }

      onResize(target.getBoundingClientRect());
      callback(setupResizeObserver(target, onResize));
    };

    let cleanupFn: VoidFn;
    setup((cleanup) => {
      cleanupFn = cleanup;
    });

    return () => {
      cleanupFn?.();
    };
  }, [onResize]);
};
