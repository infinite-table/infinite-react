import { useCallback, useEffect, useRef } from 'react';

export function useMounted() {
  let mountedRef = useRef<boolean>(true);

  useEffect(() => {
    // because React StrictMode (in >=18.0.0) will call useEffect twice
    // we need to make sure that we set this back to true in useEffect
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const isMounted = useCallback(() => mountedRef.current, []);

  return isMounted;
}
