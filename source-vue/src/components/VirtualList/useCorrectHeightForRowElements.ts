import { useEffect, MutableRefObject } from 'react';

const useCorrectHeightForRowElements = (
  domElements: MutableRefObject<HTMLDivElement[]>,
  rowHeight: number,
) => {
  useEffect(() => {
    domElements.current.forEach((el) => {
      el.style.height = `${rowHeight}px`;
    });
  }, [rowHeight]);
};

export default useCorrectHeightForRowElements;
