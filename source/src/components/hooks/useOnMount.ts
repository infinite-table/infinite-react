import { RefObject, useEffect } from 'react';

export type OnMountProps = {
  onMount?: (node: HTMLElement) => void;
  onUnmount?: (node: HTMLElement) => void;
};
export function useOnMount(
  domRef: RefObject<HTMLElement>,
  props: OnMountProps,
) {
  useEffect(() => {
    const { onMount, onUnmount } = props;

    const node = domRef?.current;
    onMount?.(node!);

    return () => {
      onUnmount?.(node!);
    };
  }, []);
}
