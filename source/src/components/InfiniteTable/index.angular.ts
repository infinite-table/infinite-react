/**
 * Angular sibling of the InfiniteTable barrel (index.tsx).
 *
 * Shared, framework-neutral modules import types from `../InfiniteTable`.
 * In an Angular build that import resolves here, so those modules never reach the
 * React component and hooks of index.tsx.
 *
 * The Angular component itself lives in InfiniteTableForAngular.angular.ts and is
 * exported from the package entry (src/index.angular.ts).
 */
import { internalProps } from './internalProps';

export const InfiniteTableClassName = internalProps.rootClassName;

export type * from './types';
