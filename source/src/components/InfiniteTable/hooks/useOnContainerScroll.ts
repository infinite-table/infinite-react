import { useCallback, useEffect, useRef } from 'react';
import { useDataSourceContextValue } from '../../DataSource/publicHooks/useDataSource';

import type { ScrollPosition } from '../../types/ScrollPosition';
import { VirtualBrain } from '../../VirtualBrain';
import { InfiniteClsScrolling } from '../InfiniteCls.css';
import { internalProps } from '../internalProps';
import { ScrollStopInfo } from '../types/InfiniteTableProps';
import { useInfiniteTable } from './useInfiniteTable';

const TableClassName = internalProps.rootClassName;

const TableClassName__Scrolling = `${TableClassName}--scrolling`;

const SCROLL_BOTTOM_OFFSET = 1;

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
      scrollStopDelay,
      scrollerDOMRef,
      domRef,
      scrollToBottomOffset,
      onScrollToBottom,
      onScrollToTop,
      onScrollStop: onScrollStopFromProps,
      bodySize,
    },
  } = useInfiniteTable<T>();

  const {
    componentActions: dataSourceActions,
    getState: getDataSourceState,
    componentState: { notifyScrollStop },
  } = useDataSourceContextValue();

  const onScrollStop = useCallback<(param: ScrollStopInfo) => void>(
    (param) => {
      onScrollStopFromProps?.(param);
      notifyScrollStop(param);
    },
    [onScrollStopFromProps, notifyScrollStop],
  );

  const timeoutIdRef = useRef<number>(0);
  const scrollingRef = useRef<boolean>(false);

  const scrollTopMaxRef = useRef<number>(0);

  useEffect(() => {
    const { current: node } = scrollerDOMRef;
    scrollTopMaxRef.current = node!.scrollHeight - node!.clientHeight;
  }, [reservedContentHeight, bodySize.height]); //dont remove bodySize.height
  // as it basically used as a proxy for resizing and node.scrollHeight
  // is dependent on resizing

  const setScrolling = useCallback(
    (scrolling: boolean) => {
      const prevScrolling = scrollingRef.current;
      scrollingRef.current = scrolling;

      if (scrolling) {
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
        }
        timeoutIdRef.current = setTimeout(() => {
          setScrolling(false);
          timeoutIdRef.current = 0;
        }, scrollStopDelay) as any as number;
      }
      if (prevScrolling !== scrolling) {
        if (!scrolling) {
          const range = verticalVirtualBrain.getRenderRange();

          onScrollStop({
            scrollTop: scrollPositionRef.current.scrollTop,
            firstVisibleRowIndex: range.renderStartIndex,
            lastVisibleRowIndex: range.renderEndIndex,
          });
        }
        const classList = domRef.current?.classList;
        if (!classList) {
          return;
        }
        if (scrolling) {
          classList.add(InfiniteClsScrolling, TableClassName__Scrolling);
        } else {
          classList.remove(InfiniteClsScrolling, TableClassName__Scrolling);
        }
      }
    },
    [scrollStopDelay, onScrollStop],
  );

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

        if (getDataSourceState().livePagination) {
          dataSourceActions.cursorId = Date.now();
        }
      }
    },
    [onContainerScroll, scrollToBottomOffset, onScrollToBottom, onScrollToTop],
  );

  return {
    applyScrollHorizontal,
    applyScrollVertical,
  };
};
