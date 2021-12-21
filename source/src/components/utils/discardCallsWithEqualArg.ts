import { shallowEqualObjects } from '../../utils/shallowEqualObjects';

const map = new WeakMap<Function, { lastCallTime: number; lastCallArg: any }>();

const getCompareDefault = (a: any) => a;

export function discardCallsWithEqualArg<T = any>(
  fn: (arg: T) => void,
  timeframe = 50,
  getCompareObject?: (arg: T) => any,
): (arg: T) => void {
  map.set(fn, {
    lastCallTime: 0,
    lastCallArg: null,
  });

  const getCompare = getCompareObject ?? getCompareDefault;

  return (arg: T) => {
    const { lastCallTime, lastCallArg } = map.get(fn) || {
      lastCallTime: 0,
      lastCallArg: null,
    };
    const now = Date.now();
    const diff = now - lastCallTime;
    const objectsEqual = shallowEqualObjects(
      getCompare(lastCallArg),
      getCompare(arg),
    );

    if (diff < timeframe && objectsEqual) {
      return;
    }

    map.set(fn, {
      lastCallTime: now,
      lastCallArg: arg,
    });

    fn(arg);
  };
}
