/**
 * Showcase kit: product-agnostic building blocks for live, scripted
 * marketing demos — a fake cursor toolkit, the automated "take over" shell,
 * and a poster-first lazy loader.
 *
 * BOUNDARY RULE: nothing in this folder may import grid/product code
 * (`@infinite-table/*`, `@www/*`, `../hero/*`…) — only React and sibling
 * files. `npm run check:showcase` enforces it. This keeps the folder
 * movable into a shared package as-is.
 */
export * from './scripted';
export * from './hooks';
export { AutomatedDemo } from './AutomatedDemo';
export type {
  AutomatedDemoProps,
  AutomatedDemoStatus,
  ShowcaseScriptContext,
} from './AutomatedDemo';
export { LazyShowcase } from './LazyShowcase';
export type {
  LazyShowcaseProps,
  LazyShowcaseLoadedProps,
} from './LazyShowcase';
