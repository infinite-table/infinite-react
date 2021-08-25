import { useEffect } from 'react';
import type { InfiniteTablePropColumnPinning } from '../types';
import { useRerender } from '../../hooks/useRerender';
import { interceptMap } from '../../hooks/useInterceptedMap';

export const useColumnPinningRerenderOnKeyChange = (
  columnPinning: InfiniteTablePropColumnPinning,
) => {
  const [renderId, rerender] = useRerender();

  useEffect(() => {
    let rafId: number = 0;
    const update = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        rerender();
      });
    };
    return interceptMap(columnPinning, {
      set: update,
      clear: update,
      delete: update,
    });
  }, [columnPinning]);

  return renderId;
};
