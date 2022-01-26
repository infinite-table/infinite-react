export function once<ReturnType>(fn: () => ReturnType): () => ReturnType {
  let called = false;
  let result: ReturnType | null = null;

  const onceFn = () => {
    if (called) {
      return result!;
    }
    called = true;
    result = fn();

    return result;
  };

  return onceFn;
}
