import { useEffect } from 'react';
import type { TablePropColumnPinning } from '../types';
import { useRerender } from '../../hooks/useRerender';

export const useColumnPinningRerenderOnKeyChange = (
  columnPinning: TablePropColumnPinning,
) => {
  const [renderId, rerender] = useRerender();

  useEffect(() => {
    const set = columnPinning.set.bind(columnPinning);
    const deleteKey = columnPinning.delete.bind(columnPinning);
    const clear = columnPinning.clear.bind(columnPinning);

    columnPinning.set = (key: any, pinned: true | 'start' | 'end') => {
      const result = set(key, pinned);
      rerender();
      return result;
    };
    columnPinning.delete = (key: any) => {
      const removed = deleteKey(key);
      rerender();
      return removed;
    };
    columnPinning.clear = () => {
      clear();
      rerender();
    };

    return () => {
      columnPinning.set = set;
      columnPinning.delete = deleteKey;
      columnPinning.clear = clear;
    };
  }, [columnPinning]);

  return renderId;
};
