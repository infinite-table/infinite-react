import { InfiniteTableColumnApi } from '../types';
import { useInfiniteTableSelector } from './useInfiniteTableSelector';

export function useInfiniteColumnApi<T = unknown>(
  columnId: string,
): InfiniteTableColumnApi<T> | null {
  return useInfiniteTableSelector((ctx) => ctx.api.getColumnApi(columnId));
}
