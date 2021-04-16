import { RefObject, useEffect } from 'react';

type OnScroll = (scrollPosition: {
  scrollTop: number;
  scrollLeft: number;
}) => void;

export const useOnScroll = (
  domRef: RefObject<HTMLElement>,
  onScroll: OnScroll | undefined,
) => {
  useEffect(() => {
    const domNode = domRef?.current;

    const scrollFn = (event: Event) => {
      const node = event.target as HTMLElement;

      onScroll?.({
        scrollTop: node.scrollTop,
        scrollLeft: node.scrollLeft,
      });
    };

    const options: AddEventListenerOptions = {
      passive: false,
    };

    domNode?.addEventListener('scroll', scrollFn, options);

    return () => {
      domNode?.removeEventListener('scroll', scrollFn);
    };
  }, [onScroll, domRef?.current]);
};
