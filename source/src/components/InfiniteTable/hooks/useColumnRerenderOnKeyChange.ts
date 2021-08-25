import { useEffect } from 'react';
import type { InfiniteTableColumn } from '../types';
import { useRerender } from '../../hooks/useRerender';
import { interceptMap } from '../../hooks/useInterceptedMap';

export const useColumnRerenderOnKeyChange = <T extends unknown>(
  columns: Map<string, InfiniteTableColumn<T>>,
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
    return interceptMap(columns, {
      set: update,
      clear: update,
      delete: update,
    });
  }, [columns]);

  return renderId;
};
