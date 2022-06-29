import { useRef, useEffect } from 'react';
import { InfiniteTableImperativeApi } from '../types';

const RETRIES = 10;

export function useScrollToActiveRow<T>(
  activeRowIndex: number | null | undefined,
  dataCount: number,
  imperativeApi: InfiniteTableImperativeApi<T>,
) {
  const didScrollRef = useRef<boolean>(false);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    if (activeRowIndex != null) {
      didScrollRef.current = false;
      cancelAnimationFrame(rafId.current!);
    }
  }, [activeRowIndex]);

  useEffect(() => {
    if (activeRowIndex != null && !didScrollRef.current) {
      function tryScroll(times = 0) {
        times++;
        rafId.current = requestAnimationFrame(() => {
          didScrollRef.current = imperativeApi.scrollRowIntoView(
            activeRowIndex!,
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
      cancelAnimationFrame(rafId.current!);
    };
  }, [activeRowIndex, dataCount]);
}
