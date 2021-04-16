import { MutableRefObject, useCallback, useRef } from 'react';

import type { ScrollPosition } from '../../types/ScrollPosition';
import { VirtualBrain } from '../../VirtualBrain';
import { internalProps } from '../internalProps';

const DELAY = 200;

const TableClassName = internalProps.rootClassName;

const TableClassName__Scrolling = `${TableClassName}--scrolling`;

export const useOnContainerScroll = ({
  verticalVirtualBrain,
  horizontalVirtualBrain,
  domRef,
}: {
  verticalVirtualBrain: VirtualBrain;
  horizontalVirtualBrain: VirtualBrain;
  domRef: MutableRefObject<HTMLDivElement | null>;
}) => {
  const timeoutIdRef = useRef<number>(0);
  const scrollingRef = useRef<boolean>(false);

  const setScrolling = useCallback((scrolling: boolean) => {
    const prevScrolling = scrollingRef.current;
    scrollingRef.current = scrolling;

    if (scrolling) {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      timeoutIdRef.current = (setTimeout(() => {
        setScrolling(false);
        timeoutIdRef.current = 0;
      }, DELAY) as any) as number;
    }
    if (prevScrolling !== scrolling) {
      const classList = domRef.current?.classList;
      if (!classList) {
        return;
      }
      if (scrolling) {
        classList.add(TableClassName__Scrolling);
      } else {
        classList.remove(TableClassName__Scrolling);
      }
    }
  }, []);

  const onContainerScroll = useCallback(
    (scrollInfo: ScrollPosition) => {
      verticalVirtualBrain.setScrollPosition(scrollInfo);
      horizontalVirtualBrain.setScrollPosition(scrollInfo);

      setScrolling(true);
    },
    [
      horizontalVirtualBrain,
      verticalVirtualBrain,
      domRef.current,
      setScrolling,
    ],
  );

  const scrollPositionRef = useRef<ScrollPosition>({
    scrollLeft: 0,
    scrollTop: 0,
  });
  const applyScrollHorizontal = useCallback(
    ({ scrollLeft }: { scrollLeft: number }) => {
      scrollPositionRef.current.scrollLeft = scrollLeft;
      onContainerScroll(scrollPositionRef.current);
    },
    [onContainerScroll],
  );

  const applyScrollVertical = useCallback(
    ({ scrollTop }: { scrollTop: number }) => {
      scrollPositionRef.current.scrollTop = scrollTop;
      onContainerScroll(scrollPositionRef.current);
    },
    [onContainerScroll],
  );

  return {
    applyScrollHorizontal,
    applyScrollVertical,
    scrollPositionRef,
  };
};
