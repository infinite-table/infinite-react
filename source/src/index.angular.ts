/**
 * Public API entry for @infinite-table/infinite-angular.
 *
 * The Angular sibling of src/index.tsx and src/index.vue.tsx. Compiled by
 * ngc (tsconfig.angular.json, `moduleSuffixes: [".angular", ""]`) and bundled
 * by tsup.angular.config.ts with the framework resolve plugin, so relative
 * imports inside the graph prefer `.angular.ts` siblings.
 */
export { debounce } from './components/utils/debounce';

export { group, flatten } from './utils/groupAndPivot';
export { DeepMap } from './utils/DeepMap';
export { debug, type DebugLogger } from './utils/debugPackage';

export { keyboardShortcuts } from './components/InfiniteTable/eventHandlers/keyboardShortcuts';
export {
  defaultFilterFunction,
  defaultTreeFilterFunction,
} from './components/DataSource/defaultFilterFunction';
export { multisort, multisortNested } from './utils/multisort';

// framework-neutral state classes, same as the React entry
export { RowSelectionState } from './components/DataSource/RowSelectionState';
export { CellSelectionState } from './components/DataSource/CellSelectionState';
export { RowDetailState } from './components/DataSource/RowDetailState';
export { TreeExpandState } from './components/DataSource/TreeExpandState';
export { TreeSelectionState } from './components/DataSource/TreeSelectionState';
export { GroupRowsState } from './components/DataSource/GroupRowsState';

export type {
  CSSProperties,
  HTMLAttributes,
  HTMLProps,
  Renderable,
  TemplateRenderable,
  ComponentRenderable,
  ComponentType,
  ComponentOverride,
} from './components/types/FrameworkTypes';

// type-only star export: the types barrel has runtime imports that reach
// framework-specific modules, so it must be fully erased from the bundle
export type * from './components/InfiniteTable/types';
export type * from './components/DataSource/types';

export {
  InfiniteRender,
  renderTemplate,
  renderComponent,
} from './components/RawList/InfiniteRenderForAngular.angular';
