import { useEffect } from 'react';
import type { InfiniteTablePropColumnPinning } from '../types';
import { useRerender } from '../../hooks/useRerender';
import { interceptMap } from '../../hooks/useInterceptedMap';

export const useColumnPinningRerenderOnKeyChange = (
  columnPinning: InfiniteTablePropColumnPinning,
) => {
  const [renderId, rerender] = useRerender();

  useEffect(() => {
    return interceptMap(columnPinning, {
      set: rerender,
      clear: rerender,
      delete: rerender,
    });
  }, [columnPinning]);

  return renderId;
};
