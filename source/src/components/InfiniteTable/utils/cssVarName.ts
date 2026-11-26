/**
 * `var(--x)` => `--x` - for declaring a custom property by name (in nested
 * selector blocks, which don't support `vars`, or in inline styles)
 */
export const cssVarName = (value: string) =>
  value.replace(/^var\((--[^,)]+)\)$/, '$1');
