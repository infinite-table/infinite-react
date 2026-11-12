/**
 * Vue sibling of the InfiniteTable barrel (index.tsx).
 *
 * Shared, framework-neutral modules import types from `../InfiniteTable`.
 * In a Vue build that import resolves here, so those modules never reach the
 * React component and hooks of index.tsx.
 *
 * The Vue component itself lives in InfiniteTableForVue.vue.ts and is
 * exported from the package entry (src/index.vue.tsx).
 */
import { internalProps } from './internalProps';

export const InfiniteTableClassName = internalProps.rootClassName;

export type * from './types';
