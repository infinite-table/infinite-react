const join = (...args: (string | number | void | null)[]): string =>
  args.filter((x) => !!`${x}`).join(' ');

export { join };
