import { useEffect } from 'react';

export const useRowHover = (
  ref: React.MutableRefObject<HTMLElement | null>,
) => {
  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    // const onMouseEnter = (event) => {
    //   console.log(event);
    // };
    // node.addEventListener('mouseover', onMouseEnter);
    return () => {};
  }, [ref.current]);
};
