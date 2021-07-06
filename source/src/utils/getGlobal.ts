export function getGlobal<T extends Window>() {
  return globalThis as any as T;
}
