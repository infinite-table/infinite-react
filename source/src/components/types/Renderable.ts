import * as React from 'react';

/**
 * The type of a UI node the grid can render.
 *
 * NOTE (multi-framework): this file is the single intentional React type leak
 * in the shared tree. When the first non-React framework lands (Phase 2 of the
 * multi-framework plan), this gains framework siblings (Renderable.vue.ts, ...)
 * resolved via `moduleSuffixes` (see tsconfig.react.json / tsconfig.vue.json)
 * and the esbuild framework-resolve-plugin. Shared code must only treat
 * Renderable as an opaque value to pass around — never inspect it.
 */
export type Renderable = React.ReactNode | React.JSX.Element;
