import { useRef } from 'react';
import { shallowEqualObjects } from '../../utils/shallowEqualObjects';

export function useMemoShallowObjectMerge<T1 extends object, T2 extends object>(
  a: T1,
  b: T2,
  merger?: (a: T1, b: T2) => T1 & T2,
) {
  const result = merger ? merger(a, b) : { ...a, ...b };
  const ref = useRef(result);

  if (!shallowEqualObjects(result, ref.current)) {
    ref.current = result;
  }
  return ref.current;
}
