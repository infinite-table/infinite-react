import { useRef } from 'react';

const useImmutableRef = <T>(value: T) => {
  return useRef<T>(value).current;
};

export default useImmutableRef;
