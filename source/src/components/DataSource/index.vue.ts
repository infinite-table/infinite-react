/**
 * Vue sibling of the DataSource barrel (index.tsx).
 *
 * Shared, framework-neutral modules import types and the state classes
 * from `../DataSource`. In a Vue build that import resolves here, so those
 * modules never reach the React component and hooks of index.tsx.
 *
 * The Vue component itself lives in DataSourceForVue.vue.ts and is exported
 * from the package entry (src/index.vue.tsx) - not from here, so shared
 * modules can't accidentally depend on it.
 */
export { GroupRowsState } from './GroupRowsState';
export { RowSelectionState } from './RowSelectionState';
export { CellSelectionState } from './CellSelectionState';
export { RowDisabledState } from './RowDisabledState';

export type * from './types';
