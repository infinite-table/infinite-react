export const rafFn = (fn: () => void) => {
  let rafId: number = 0;

  return () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      fn();
    });
  };
};
