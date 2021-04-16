import { useEffect } from 'react';
import type { TablePropColumnVisibility } from '../types';
import { useRerender } from '../../hooks/useRerender';

export const useColumnVisibilityRerenderOnKeyChange = (
  columnVisibility: TablePropColumnVisibility,
) => {
  const [renderId, rerender] = useRerender();

  useEffect(() => {
    const set = columnVisibility.set.bind(columnVisibility);
    const deleteKey = columnVisibility.delete.bind(columnVisibility);
    const clear = columnVisibility.clear.bind(columnVisibility);

    columnVisibility.set = (key: any, visible: false) => {
      const result = set(key, visible);
      rerender();
      return result;
    };
    columnVisibility.delete = (key: any) => {
      const removed = deleteKey(key);
      rerender();
      return removed;
    };
    columnVisibility.clear = () => {
      clear();
      rerender();
    };

    return () => {
      columnVisibility.set = set;
      columnVisibility.delete = deleteKey;
      columnVisibility.clear = clear;
    };
  }, [columnVisibility]);

  return renderId;
};
