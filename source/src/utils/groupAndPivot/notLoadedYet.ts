export const NOT_LOADED_YET_KEY_PREFIX = '____not_loaded_yet____';

export function isNotLoadedYetKey(key: unknown) {
  return typeof key === 'string' && key.startsWith(NOT_LOADED_YET_KEY_PREFIX);
}
