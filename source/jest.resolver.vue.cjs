/**
 * Jest resolver for the Vue test project: mirrors the TypeScript
 * `moduleSuffixes: ['.vue', '']` / esbuild framework-resolve-plugin
 * semantics - relative imports prefer a `.vue.ts/.vue.tsx` sibling when one
 * exists, so shared files (eg `./createRenderer`) resolve to their Vue
 * implementation exactly like in the real Vue build.
 */
module.exports = (request, options) => {
  const { defaultResolver } = options;

  if (
    (request.startsWith('.') || request.startsWith('/')) &&
    !request.endsWith('.vue') &&
    !request.endsWith('.css')
  ) {
    try {
      return defaultResolver(`${request}.vue`, options);
    } catch (err) {
      // no .vue sibling - fall through to the default resolution
    }
  }

  return defaultResolver(request, options);
};
