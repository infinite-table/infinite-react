import { useEffect } from 'react';
import type { InfiniteTablePropColumnVisibility } from '../types';
import { useRerender } from '../../hooks/useRerender';
import { interceptMap } from '../../hooks/useInterceptedMap';

export const useColumnVisibilityRerenderOnKeyChange = (
  columnVisibility: InfiniteTablePropColumnVisibility,
) => {
  const [renderId, rerender] = useRerender();

  useEffect(() => {
    return interceptMap(columnVisibility, {
      set: rerender,
      clear: rerender,
      delete: rerender,
    });
  }, [columnVisibility]);

  return renderId;
};
