export const rafFn = (fn: (...args: any[]) => void) => {
  let rafId: number = 0;

  return (...args: any[]) => {
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      fn(...args);
    });
  };
};
