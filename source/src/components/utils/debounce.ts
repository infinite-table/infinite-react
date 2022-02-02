export function debounce(fn: Function, { wait }: { wait: number }) {
  let timeout: number | null = null;

  return function (...args: any[]) {
    //@ts-ignore
    const context = this;

    if (timeout !== null) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      fn.apply(context, args);
    }, wait) as any as number;
  };
}
