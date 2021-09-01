import { useEffect } from 'react';
import { useRerender } from '../../hooks/useRerender';
import { interceptMap } from '../../hooks/useInterceptedMap';
import { rafFn } from '../utils/rafFn';

export const useRerenderOnKeyChange = <K extends unknown, V extends unknown>(
  map: Map<K, V>,
) => {
  const [renderId, rerender] = useRerender();

  useEffect(() => {
    const update = rafFn(rerender);
    return interceptMap(map, {
      set: update,
      clear: update,
      delete: update,
    });
  }, [map]);

  return renderId;
};
