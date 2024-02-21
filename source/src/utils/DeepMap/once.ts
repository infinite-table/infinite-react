export function once<Args extends any[], ReturnType>(
  fn: (...args: Args) => ReturnType,
): (...args: Args) => ReturnType {
  let called = false;
  let result: ReturnType | null = null;

  const onceFn = (...args: Args) => {
    if (called) {
      return result!;
    }
    called = true;
    result = fn(...args);

    return result;
  };

  return onceFn;
}
