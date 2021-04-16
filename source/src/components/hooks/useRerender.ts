import { useCallback, useState } from 'react';

export const useRerender = (): [number, () => void] => {
  const [state, setState] = useState(0);

  return [
    state,
    useCallback(() => {
      setState((state) => state + 1);
    }, [setState]),
  ];
};
