export function composeFunctions<F extends (...args: any) => void>(
  ...fns: (F | undefined)[]
) {
  //@ts-ignore
  const f: F = (...args) => {
    fns.forEach((fn) => {
      if (typeof fn === 'function') {
        fn(...args);
      }
    });
  };

  return f;
}
