import { useRef, useLayoutEffect } from 'react';
export const usePrevious = <T>(value: T, initialValue?: T): T => {
  const ref = useRef(initialValue === undefined ? value : initialValue);
  useLayoutEffect(() => {
    ref.current = value;
  });
  return ref.current;
};
