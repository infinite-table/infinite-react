import { useCallback, useEffect } from 'react';
import { ScrollPosition } from '../../types/ScrollPosition';
import { useInfiniteTableSelector } from './useInfiniteTableSelector';

export function useGridScroll(
  onScroll: (scrollPosition: ScrollPosition) => void,
  deps: any[],
) {
  const { brain } = useInfiniteTableSelector((ctx) => {
    return {
      brain: ctx.state.brain,
    };
  });

  const memoizedOnScroll = useCallback(onScroll, deps);

  useEffect(() => {
    const removeOnScroll = brain.onScroll(memoizedOnScroll);

    return removeOnScroll;
  }, [brain, memoizedOnScroll]);
}
