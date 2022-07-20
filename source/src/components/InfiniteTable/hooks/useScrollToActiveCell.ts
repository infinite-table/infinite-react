import { useRef, useEffect } from 'react';
import { cancelRaf, raf } from '../../../utils/raf';

import { InfiniteTableImperativeApi } from '../types';

const RETRIES = 10;

export function useScrollToActiveCell<T>(
  activeCellIndex: [number, number] | null | undefined,
  dataCount: number,
  imperativeApi: InfiniteTableImperativeApi<T>,
) {
  const didScrollRef = useRef<boolean>(false);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    if (activeCellIndex != null) {
      didScrollRef.current = false;
      cancelRaf(rafId.current!);
    }
  }, [activeCellIndex]);
  useEffect(() => {
    if (activeCellIndex != null && !didScrollRef.current) {
      function tryScroll(times = 0) {
        times++;
        cancelRaf(rafId.current!);
        rafId.current = raf(() => {
          didScrollRef.current = imperativeApi.scrollCellIntoView(
            activeCellIndex![0],
            activeCellIndex![1],
            {
              offset: 30,
            },
          );
          if (!didScrollRef.current && times < RETRIES) {
            tryScroll(times);
          }
        });
      }

      tryScroll();
    }

    return () => {
      cancelRaf(rafId.current!);
    };
  }, [activeCellIndex, dataCount]);
}
