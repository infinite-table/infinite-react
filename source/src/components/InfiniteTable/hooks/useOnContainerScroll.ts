import { MutableRefObject, useCallback, useEffect, useRef } from 'react';

import type { ScrollPosition } from '../../types/ScrollPosition';
import { VirtualBrain } from '../../VirtualBrain';
import { internalProps } from '../internalProps';
import { useInfiniteTable } from './useInfiniteTable';

const DELAY = 200;

const TableClassName = internalProps.rootClassName;

const TableClassName__Scrolling = `${TableClassName}--scrolling`;

const SCROLL_BOTTOM_OFFSET = 0;

export const useOnContainerScroll = <T>({
  verticalVirtualBrain,
  horizontalVirtualBrain,
  reservedContentHeight,
}: {
  verticalVirtualBrain: VirtualBrain;
  horizontalVirtualBrain: VirtualBrain;
  reservedContentHeight: number;
}) => {
  const {
    componentState: {
      scrollerDOMRef,
      domRef,
      scrollToBottomOffset,
      onScrollToBottom,
      onScrollToTop,
      bodySize,
    },
  } = useInfiniteTable<T>();

  const timeoutIdRef = useRef<number>(0);
  const scrollingRef = useRef<boolean>(false);

  const scrollTopMaxRef = useRef<number>(0);

  useEffect(() => {
    const { current: node } = scrollerDOMRef;
    scrollTopMaxRef.current = node!.scrollHeight - node!.clientHeight;
  }, [reservedContentHeight, bodySize.height]); //dont remove bodySize.height
  // as it basically used as a proxy for resizing and node.scrollHeight
  // is dependent on resizing

  const setScrolling = useCallback((scrolling: boolean) => {
    const prevScrolling = scrollingRef.current;
    scrollingRef.current = scrolling;

    if (scrolling) {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      timeoutIdRef.current = setTimeout(() => {
        setScrolling(false);
        timeoutIdRef.current = 0;
      }, DELAY) as any as number;
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

      if (scrollTop === 0) {
        onScrollToTop?.();
      }

      const offset = scrollToBottomOffset ?? SCROLL_BOTTOM_OFFSET;
      const isScrollBottom = scrollTop + offset >= scrollTopMaxRef.current;

      if (isScrollBottom) {
        onScrollToBottom?.();
      }
    },
    [onContainerScroll, scrollToBottomOffset, onScrollToBottom, onScrollToTop],
  );

  return {
    applyScrollHorizontal,
    applyScrollVertical,
  };
};
