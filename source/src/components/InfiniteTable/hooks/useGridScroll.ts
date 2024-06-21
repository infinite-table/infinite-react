import { useCallback, useEffect } from 'react';
import { ScrollPosition } from '../../types/ScrollPosition';
import { useInfiniteTable } from './useInfiniteTable';

export function useGridScroll(
  onScroll: (scrollPosition: ScrollPosition) => void,
  deps: any[],
) {
  const {
    state: { brain },
  } = useInfiniteTable<any>();

  const memoizedOnScroll = useCallback(onScroll, deps);

  useEffect(() => {
    const removeOnScroll = brain.onScroll(memoizedOnScroll);

    return removeOnScroll;
  }, [brain, memoizedOnScroll]);
}
