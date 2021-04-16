import { MutableRefObject, useLayoutEffect } from 'react';
import { setupResizeObserver } from '../../../ResizeObserver';
import { OnResizeFn } from '../../../types/Size';
import { VoidFn } from '../../../types/VoidFn';

export const useHeaderOnResize = (
  domRef: MutableRefObject<HTMLDivElement | null>,
  onResize?: OnResizeFn,
) => {
  useLayoutEffect(() => {
    if (!onResize) {
      return;
    }
    const setup = (callback: (cleanup: VoidFn) => void) => {
      const getTargetElement = () => {
        return domRef.current?.firstChild as HTMLElement;
      };

      const target = getTargetElement();

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
