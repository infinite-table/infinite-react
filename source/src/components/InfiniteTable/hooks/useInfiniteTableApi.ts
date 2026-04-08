import { InfiniteTableApi } from '../types';
import { useInfiniteTableSelector } from './useInfiniteTableSelector';

export function useInfiniteTableApi<T>(): InfiniteTableApi<T> {
  return useInfiniteTableSelector((ctx) => ctx.api);
}
