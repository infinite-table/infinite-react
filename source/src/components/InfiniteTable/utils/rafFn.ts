export const rafFn = (fn: VoidFunction) => {
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
