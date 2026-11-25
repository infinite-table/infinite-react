// A PostCSS plugin that does nothing, for postcss.config.json next to it.
//
// Without a PostCSS configuration of its own, the Angular builder finds the
// Next.js app's tailwind.config.ts in examples/ and loads `tailwindcss` as a
// (Tailwind 3) PostCSS plugin, which fails with Tailwind 4. A configuration
// in the Angular project root (angular.json "root": "src/angular-app") turns
// that off - but Angular ignores a configuration without plugins.
const noop = () => ({ postcssPlugin: 'infinite-examples-noop' });
noop.postcss = true;
module.exports = noop;
