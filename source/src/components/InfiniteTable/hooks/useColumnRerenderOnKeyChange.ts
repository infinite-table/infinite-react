import { useEffect } from 'react';
import type { InfiniteTableColumn } from '../types';
import { useRerender } from '../../hooks/useRerender';

export const useColumnRerenderOnKeyChange = <T extends unknown>(
  columns: Map<string, InfiniteTableColumn<T>>,
) => {
  const [renderId, rerender] = useRerender();
  useEffect(() => {
    const set = columns.set.bind(columns);
    const deleteKey = columns.delete.bind(columns);
    const clear = columns.clear.bind(columns);

    columns.set = (key: any, value: InfiniteTableColumn<T>) => {
      const result = set(key, value);
      rerender();
      return result;
    };
    columns.delete = (key: any) => {
      const removed = deleteKey(key);
      rerender();
      return removed;
    };
    columns.clear = () => {
      clear();
      rerender();
    };

    return () => {
      columns.set = set;
      columns.delete = deleteKey;
      columns.clear = clear;
    };
  }, [columns]);

  return renderId;
};
