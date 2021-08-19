import { useEffect } from 'react';
import type { InfiniteTableColumn } from '../types';
import { useRerender } from '../../hooks/useRerender';
import { interceptMap } from '../../hooks/useInterceptedMap';

export const useColumnRerenderOnKeyChange = <T extends unknown>(
  columns: Map<string, InfiniteTableColumn<T>>,
) => {
  const [renderId, rerender] = useRerender();

  useEffect(() => {
    return interceptMap(columns, {
      set: rerender,
      clear: rerender,
      delete: rerender,
    });
  }, [columns]);

  return renderId;
};
